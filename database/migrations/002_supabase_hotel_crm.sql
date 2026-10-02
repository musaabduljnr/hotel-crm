BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Enums
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE public.user_role AS ENUM ('admin', 'manager', 'receptionist', 'staff');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'room_status') THEN
    CREATE TYPE public.room_status AS ENUM ('available', 'reserved', 'occupied', 'cleaning', 'maintenance', 'out_of_service');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'housekeeping_status') THEN
    CREATE TYPE public.housekeeping_status AS ENUM ('clean', 'dirty', 'cleaning', 'inspected', 'maintenance');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status') THEN
    CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'complaint_status') THEN
    CREATE TYPE public.complaint_status AS ENUM ('open', 'assigned', 'in_progress', 'resolved', 'closed');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'complaint_priority') THEN
    CREATE TYPE public.complaint_priority AS ENUM ('low', 'medium', 'high', 'urgent');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
    CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'partially_paid', 'refunded', 'failed');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'maintenance_status') THEN
    CREATE TYPE public.maintenance_status AS ENUM ('open', 'assigned', 'in_progress', 'resolved', 'closed');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'maintenance_priority') THEN
    CREATE TYPE public.maintenance_priority AS ENUM ('low', 'medium', 'high', 'urgent');
  END IF;
END $$;

-- Users
CREATE TABLE IF NOT EXISTS public.users (
  id BIGSERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role public.user_role NOT NULL DEFAULT 'staff',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Guests
CREATE TABLE IF NOT EXISTS public.guests (
  id BIGSERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL UNIQUE,
  address TEXT,
  id_type TEXT,
  id_number TEXT,
  preferences TEXT,
  notes TEXT,
  loyalty_points INTEGER NOT NULL DEFAULT 0,
  total_visits INTEGER NOT NULL DEFAULT 0,
  total_spending NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  created_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Room types
CREATE TABLE IF NOT EXISTS public.room_types (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  base_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Rooms
CREATE TABLE IF NOT EXISTS public.rooms (
  id BIGSERIAL PRIMARY KEY,
  room_number TEXT NOT NULL UNIQUE,
  room_type_id INTEGER NOT NULL REFERENCES public.room_types(id) ON DELETE RESTRICT,
  price_per_night NUMERIC(10,2) NOT NULL CHECK (price_per_night >= 0),
  status public.room_status NOT NULL DEFAULT 'available',
  housekeeping_status public.housekeeping_status NOT NULL DEFAULT 'clean',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bookings
CREATE TABLE IF NOT EXISTS public.bookings (
  id BIGSERIAL PRIMARY KEY,
  booking_reference TEXT NOT NULL UNIQUE DEFAULT gen_random_uuid()::TEXT,
  guest_id BIGINT NOT NULL REFERENCES public.guests(id) ON DELETE RESTRICT,
  room_id BIGINT NOT NULL REFERENCES public.rooms(id) ON DELETE RESTRICT,
  check_in TIMESTAMPTZ NOT NULL,
  check_out TIMESTAMPTZ NOT NULL,
  status public.booking_status NOT NULL DEFAULT 'pending',
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  number_of_guests INTEGER NOT NULL DEFAULT 1,
  booking_source TEXT NOT NULL DEFAULT 'direct',
  notes TEXT,
  created_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (check_out > check_in),
  CHECK (number_of_guests >= 1)
);

-- Complaints
CREATE TABLE IF NOT EXISTS public.complaints (
  id BIGSERIAL PRIMARY KEY,
  guest_id BIGINT NOT NULL REFERENCES public.guests(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status public.complaint_status NOT NULL DEFAULT 'open',
  priority public.complaint_priority NOT NULL DEFAULT 'medium',
  admin_response TEXT,
  resolved_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Feedback
CREATE TABLE IF NOT EXISTS public.feedback (
  id BIGSERIAL PRIMARY KEY,
  guest_id BIGINT NOT NULL REFERENCES public.guests(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Payments
CREATE TABLE IF NOT EXISTS public.payments (
  id BIGSERIAL PRIMARY KEY,
  booking_id BIGINT NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  guest_id BIGINT NOT NULL REFERENCES public.guests(id) ON DELETE RESTRICT,
  amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  payment_method TEXT NOT NULL DEFAULT 'cash',
  payment_status public.payment_status NOT NULL DEFAULT 'pending',
  reference_number TEXT,
  notes TEXT,
  created_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Maintenance tickets
CREATE TABLE IF NOT EXISTS public.maintenance_tickets (
  id BIGSERIAL PRIMARY KEY,
  room_id BIGINT NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  issue TEXT NOT NULL,
  description TEXT,
  priority public.maintenance_priority NOT NULL DEFAULT 'medium',
  status public.maintenance_status NOT NULL DEFAULT 'open',
  assigned_to BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
  created_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id BIGSERIAL PRIMARY KEY,
  actor_id BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id BIGINT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_guests_phone ON public.guests(phone);
CREATE INDEX IF NOT EXISTS idx_guests_email ON public.guests(email);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON public.rooms(status);
CREATE INDEX IF NOT EXISTS idx_rooms_housekeeping ON public.rooms(housekeeping_status);
CREATE INDEX IF NOT EXISTS idx_bookings_guest ON public.bookings(guest_id);
CREATE INDEX IF NOT EXISTS idx_bookings_room_dates ON public.bookings(room_id, check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_payments_booking ON public.payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);
CREATE INDEX IF NOT EXISTS idx_feedback_guest ON public.feedback(guest_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON public.audit_logs(entity, entity_id);

-- Seed room types
INSERT INTO public.room_types (name, description, base_price)
VALUES
  ('Standard', 'Standard room', 15000.00),
  ('Deluxe', 'Deluxe room', 25000.00),
  ('Suite', 'Suite room', 45000.00),
  ('Executive', 'Executive room', 60000.00)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  base_price = EXCLUDED.base_price;

-- Compatibility guard for older room tables created before housekeeping_status was added.
ALTER TABLE public.rooms
  ADD COLUMN IF NOT EXISTS room_type_id INTEGER,
  ADD COLUMN IF NOT EXISTS price_per_night NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS status public.room_status DEFAULT 'available',
  ADD COLUMN IF NOT EXISTS housekeeping_status public.housekeeping_status DEFAULT 'clean',
  ADD COLUMN IF NOT EXISTS description TEXT;

-- Seed rooms
INSERT INTO public.rooms (room_number, room_type_id, price_per_night, status, housekeeping_status, description)
SELECT s.room_number, rt.id, s.price_per_night, s.status::public.room_status, s.housekeeping_status::public.housekeeping_status, s.description
FROM (
  VALUES
    ('101', 'Standard', 15000.00, 'available', 'clean', 'Cozy standard room with garden view'),
    ('102', 'Standard', 15000.00, 'available', 'clean', 'Cozy standard room with garden view'),
    ('201', 'Deluxe', 25000.00, 'available', 'clean', 'Spacious deluxe room with city view'),
    ('202', 'Deluxe', 25000.00, 'available', 'clean', 'Spacious deluxe room with city view'),
    ('301', 'Suite', 45000.00, 'available', 'clean', 'Luxury suite with lounge area'),
    ('401', 'Executive', 60000.00, 'available', 'clean', 'Executive suite with private balcony')
) AS s(room_number, room_type_name, price_per_night, status, housekeeping_status, description)
JOIN public.room_types rt ON rt.name = s.room_type_name
ON CONFLICT (room_number) DO UPDATE SET
  room_type_id = EXCLUDED.room_type_id,
  price_per_night = EXCLUDED.price_per_night,
  status = EXCLUDED.status,
  housekeeping_status = EXCLUDED.housekeeping_status,
  description = EXCLUDED.description;

COMMIT;
