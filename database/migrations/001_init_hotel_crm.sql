CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(40) NOT NULL UNIQUE,
  description VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(30) NOT NULL DEFAULT 'staff',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_users_role CHECK (role IN ('admin','manager','receptionist','staff'))
);

CREATE TABLE IF NOT EXISTS guests (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(120),
  phone VARCHAR(30) NOT NULL,
  address VARCHAR(255),
  id_type VARCHAR(50),
  id_number VARCHAR(80),
  preferences TEXT,
  notes TEXT,
  loyalty_points INT NOT NULL DEFAULT 0,
  total_visits INT NOT NULL DEFAULT 0,
  total_spending DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  created_by BIGINT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_guest_phone (phone),
  CONSTRAINT fk_guests_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS room_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255),
  base_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rooms (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  room_number VARCHAR(20) NOT NULL UNIQUE,
  room_type_id INT NOT NULL,
  price_per_night DECIMAL(10,2) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'available',
  housekeeping_status VARCHAR(30) NOT NULL DEFAULT 'clean',
  description VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_rooms_type FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE RESTRICT,
  CONSTRAINT chk_rooms_status CHECK (status IN ('available','reserved','occupied','cleaning','maintenance','out_of_service')),
  CONSTRAINT chk_rooms_housekeeping CHECK (housekeeping_status IN ('clean','dirty','cleaning','inspected','maintenance'))
);

CREATE TABLE IF NOT EXISTS bookings (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  booking_reference VARCHAR(30) NOT NULL UNIQUE,
  guest_id BIGINT NOT NULL,
  room_id BIGINT NOT NULL,
  check_in DATETIME NOT NULL,
  check_out DATETIME NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  number_of_guests INT NOT NULL DEFAULT 1,
  booking_source VARCHAR(50) NOT NULL DEFAULT 'direct',
  notes TEXT,
  created_by BIGINT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_bookings_guest FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE RESTRICT,
  CONSTRAINT fk_bookings_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE RESTRICT,
  CONSTRAINT fk_bookings_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT chk_booking_status CHECK (status IN ('pending','confirmed','checked_in','checked_out','cancelled','no_show')),
  CONSTRAINT chk_booking_guests CHECK (number_of_guests >= 1),
  CONSTRAINT chk_booking_dates CHECK (check_out > check_in)
);

CREATE TABLE IF NOT EXISTS complaints (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  guest_id BIGINT NOT NULL,
  subject VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'open',
  priority VARCHAR(20) NOT NULL DEFAULT 'medium',
  admin_response TEXT,
  resolved_by BIGINT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_complaints_guest FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE CASCADE,
  CONSTRAINT fk_complaints_resolved_by FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT chk_complaints_status CHECK (status IN ('open','assigned','in_progress','resolved','closed')),
  CONSTRAINT chk_complaints_priority CHECK (priority IN ('low','medium','high','urgent'))
);

CREATE TABLE IF NOT EXISTS feedback (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  guest_id BIGINT NOT NULL,
  rating INT NOT NULL,
  comment TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_feedback_guest FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE CASCADE,
  CONSTRAINT chk_feedback_rating CHECK (rating BETWEEN 1 AND 5)
);

CREATE TABLE IF NOT EXISTS payments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  booking_id BIGINT NOT NULL,
  guest_id BIGINT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL DEFAULT 'cash',
  payment_status VARCHAR(30) NOT NULL DEFAULT 'pending',
  reference_number VARCHAR(80),
  notes TEXT,
  created_by BIGINT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_payments_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  CONSTRAINT fk_payments_guest FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE RESTRICT,
  CONSTRAINT fk_payments_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT chk_payment_status CHECK (payment_status IN ('pending','paid','partially_paid','refunded','failed')),
  CONSTRAINT chk_payment_amount CHECK (amount >= 0)
);

CREATE TABLE IF NOT EXISTS maintenance_tickets (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  room_id BIGINT NOT NULL,
  issue VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(20) NOT NULL DEFAULT 'medium',
  status VARCHAR(30) NOT NULL DEFAULT 'open',
  assigned_to BIGINT,
  created_by BIGINT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_maintenance_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  CONSTRAINT fk_maintenance_assigned FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_maintenance_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT chk_maintenance_priority CHECK (priority IN ('low','medium','high','urgent')),
  CONSTRAINT chk_maintenance_status CHECK (status IN ('open','assigned','in_progress','resolved','closed'))
);

CREATE TABLE IF NOT EXISTS notifications (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(120) NOT NULL,
  message TEXT NOT NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  actor_id BIGINT,
  action VARCHAR(80) NOT NULL,
  entity VARCHAR(80) NOT NULL,
  entity_id BIGINT,
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  metadata JSON,
  CONSTRAINT fk_audit_actor FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_guests_phone ON guests(phone);
CREATE INDEX idx_guests_email ON guests(email);
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_rooms_housekeeping ON rooms(housekeeping_status);
CREATE INDEX idx_bookings_room_dates ON bookings(room_id, check_in, check_out);
CREATE INDEX idx_bookings_guest ON bookings(guest_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_feedback_guest ON feedback(guest_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_audit_entity ON audit_logs(entity, entity_id);

INSERT INTO room_types (name, description, base_price) VALUES
('Standard', 'Standard room', 15000.00),
('Deluxe', 'Deluxe room', 25000.00),
('Suite', 'Suite room', 45000.00),
('Executive', 'Executive room', 60000.00)
ON DUPLICATE KEY UPDATE
  description = VALUES(description),
  base_price = VALUES(base_price);

INSERT INTO rooms (room_number, room_type_id, price_per_night, status, housekeeping_status, description)
SELECT
  s.room_number,
  rt.id,
  s.price_per_night,
  s.status,
  'clean',
  s.description
FROM (
  SELECT '101' AS room_number, 'Standard' AS room_type, 15000.00 AS price_per_night, 'available' AS status, 'Cozy standard room with garden view' AS description
  UNION ALL SELECT '102', 'Standard', 15000.00, 'available', 'Cozy standard room with garden view'
  UNION ALL SELECT '201', 'Deluxe', 25000.00, 'available', 'Spacious deluxe room with city view'
  UNION ALL SELECT '202', 'Deluxe', 25000.00, 'available', 'Spacious deluxe room with city view'
  UNION ALL SELECT '301', 'Suite', 45000.00, 'available', 'Luxury suite with lounge area'
  UNION ALL SELECT '401', 'Executive', 60000.00, 'available', 'Executive suite with private balcony'
) s
JOIN room_types rt ON rt.name = s.room_type
ON DUPLICATE KEY UPDATE
  room_type_id = VALUES(room_type_id),
  price_per_night = VALUES(price_per_night),
  status = VALUES(status),
  description = VALUES(description);
