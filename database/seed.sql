-- ============================================================
-- Haven CRM - Seed SQL Data
-- 10 Guests, Bookings, Complaints, Payments & Feedback
-- Compatible with Supabase (PostgreSQL) and schema.sql
-- Safe to re-run (idempotent / ON CONFLICT handled)
-- ============================================================

-- ------------------------------------------------------------
-- 1. Ensure Room Types Exist
-- ------------------------------------------------------------
INSERT INTO public.room_types (name, description, base_price)
VALUES
    ('Standard', 'Standard room with queen bed and garden view', 15000.00),
    ('Deluxe', 'Spacious deluxe room with king bed and city view', 25000.00),
    ('Suite', 'Luxury suite with private lounge and kitchenette', 45000.00),
    ('Executive', 'Executive penthouse suite with balcony and jacuzzi', 60000.00)
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    base_price = EXCLUDED.base_price;

-- ------------------------------------------------------------
-- 2. Ensure Rooms Exist
-- ------------------------------------------------------------
INSERT INTO public.rooms (room_number, room_type_id, price_per_night, status, housekeeping_status, description)
SELECT s.room_number, rt.id, s.price_per_night, s.status::public.room_status, s.housekeeping_status::public.housekeeping_status, s.description
FROM (
    VALUES
        ('101', 'Standard', 15000.00, 'occupied', 'clean', 'Cozy standard room with garden view'),
        ('102', 'Standard', 15000.00, 'occupied', 'clean', 'Cozy standard room with garden view'),
        ('201', 'Deluxe', 25000.00, 'occupied', 'clean', 'Spacious deluxe room with city view'),
        ('202', 'Deluxe', 25000.00, 'available', 'clean', 'Spacious deluxe room with city view'),
        ('301', 'Suite', 45000.00, 'occupied', 'clean', 'Luxury suite with lounge area'),
        ('401', 'Executive', 60000.00, 'available', 'clean', 'Executive suite with private balcony')
) AS s(room_number, room_type_name, price_per_night, status, housekeeping_status, description)
JOIN public.room_types rt ON rt.name = s.room_type_name
ON CONFLICT (room_number) DO UPDATE SET
    room_type_id = EXCLUDED.room_type_id,
    price_per_night = EXCLUDED.price_per_night,
    status = EXCLUDED.status,
    housekeeping_status = EXCLUDED.housekeeping_status,
    description = EXCLUDED.description;

-- ------------------------------------------------------------
-- 3. Seed 10 Realistic Guests
-- ------------------------------------------------------------
INSERT INTO public.guests (
    full_name, email, phone, address, id_type, id_number, preferences, notes, loyalty_points, total_visits, total_spending
) VALUES
    (
        'Amara Okonkwo',
        'amara.okonkwo@gmail.com',
        '+2348031234567',
        '14 Adeola Odeku St, Victoria Island, Lagos',
        'Passport',
        'A08492014',
        'High floor, extra pillows, vegetarian breakfast',
        'VIP corporate guest from TechBridge Capital',
        350,
        5,
        270000.00
    ),
    (
        'David Ibrahim',
        'david.ibrahim@yahoo.com',
        '+2348029876543',
        '8 Aguiyi Ironsi Way, Maitama, Abuja',
        'National ID',
        'NIN7382910482',
        'Quiet room away from elevator, feather-free pillows',
        'Prefers express check-in and digital invoice',
        180,
        3,
        125000.00
    ),
    (
        'Fatima Bello',
        'fatima.bello@outlook.com',
        '+2348145551212',
        '22 Shehu Shagari Way, Central Business District, Abuja',
        'Driver License',
        'DL92837461',
        'Non-smoking room, sparkling water on arrival',
        'Frequent business traveller with Federal Ministry',
        90,
        2,
        60000.00
    ),
    (
        'Emeka Nwosu',
        'emeka.nwosu@techcorp.ng',
        '+2348091122334',
        '4 Admiralty Way, Lekki Phase 1, Lagos',
        'Passport',
        'A12938475',
        'Late check-in, king bed preferred, fast Wi-Fi',
        'Attending quarterly tech conference',
        140,
        2,
        100000.00
    ),
    (
        'Sarah Jenkins',
        'sarah.jenkins@globaladvisors.com',
        '+14155552671',
        '550 Montgomery St, Financial District, San Francisco, CA',
        'Passport',
        'USA98273615',
        'Corner room, morning wake-up call at 06:30, airport shuttle',
        'International consultant on a 2-week engagement',
        420,
        4,
        450000.00
    ),
    (
        'Tunde Bakare',
        'tunde.bakare@zenithgroup.com',
        '+2348056789012',
        '18 Isaac John St, GRA Ikeja, Lagos',
        'National ID',
        'NIN8472910384',
        'Suite only, balcony view, late check-out requested',
        'Loyal patron who hosts quarterly boardroom meetings',
        520,
        7,
        420000.00
    ),
    (
        'Zainab Al-Hassan',
        'zainab.alhassan@kanotrade.org',
        '+2348064433221',
        '12 Bompai Road, Nassarawa, Kano',
        'Driver License',
        'DL10293847',
        'Extra bath towels, ground floor or close to lift',
        'Commodities trader; visits twice per quarter',
        75,
        1,
        45000.00
    ),
    (
        'Chinedu Eze',
        'chinedu.eze@innovate.ng',
        '+2348187766554',
        '5 Ogui Road, Independence Layout, Enugu',
        'Passport',
        'A56473829',
        'Ergonomic desk chair, strong bedside lighting',
        'Software engineer working remotely during stays',
        110,
        2,
        75000.00
    ),
    (
        'Amina Mohammed',
        'amina.m@unicef.org',
        '+2348073322110',
        '3 Yakubu Gowon Crescent, Asokoro, Abuja',
        'Passport',
        'DIP098231',
        'Hypoallergenic bedding, green tea in room, quiet zone',
        'Development officer; international NGO rate applied',
        210,
        3,
        90000.00
    ),
    (
        'Michael Adeyemi',
        'michael.adeyemi@capitaltrust.ng',
        '+2348023344556',
        '9 Queens Drive, Ikoyi, Lagos',
        'National ID',
        'NIN6152438901',
        'Daily newspaper (BusinessDay), express laundry service',
        'Investment banker; usually books Executive Suite',
        160,
        2,
        120000.00
    )
ON CONFLICT (phone) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    address = EXCLUDED.address,
    id_type = EXCLUDED.id_type,
    id_number = EXCLUDED.id_number,
    preferences = EXCLUDED.preferences,
    notes = EXCLUDED.notes,
    loyalty_points = EXCLUDED.loyalty_points,
    total_visits = EXCLUDED.total_visits,
    total_spending = EXCLUDED.total_spending,
    updated_at = NOW();

-- ------------------------------------------------------------
-- 4. Seed Bookings
-- ------------------------------------------------------------
INSERT INTO public.bookings (
    booking_reference, guest_id, room_id, check_in, check_out, status, total_amount, number_of_guests, booking_source, notes
) VALUES
    (
        'BK-2026-001',
        (SELECT id FROM public.guests WHERE phone = '+2348031234567'),
        (SELECT id FROM public.rooms WHERE room_number = '301'),
        NOW() - INTERVAL '1 day',
        NOW() + INTERVAL '2 days',
        'checked_in',
        135000.00,
        2,
        'direct',
        'Suite stay with anniversary setup requested'
    ),
    (
        'BK-2026-002',
        (SELECT id FROM public.guests WHERE phone = '+2348029876543'),
        (SELECT id FROM public.rooms WHERE room_number = '201'),
        NOW() - INTERVAL '2 days',
        NOW() + INTERVAL '1 day',
        'checked_in',
        75000.00,
        1,
        'corporate',
        'Corporate billing directly to client company'
    ),
    (
        'BK-2026-003',
        (SELECT id FROM public.guests WHERE phone = '+2348145551212'),
        (SELECT id FROM public.rooms WHERE room_number = '101'),
        NOW() + INTERVAL '3 days',
        NOW() + INTERVAL '6 days',
        'confirmed',
        45000.00,
        1,
        'website',
        'Arriving on afternoon flight from Kano'
    ),
    (
        'BK-2026-004',
        (SELECT id FROM public.guests WHERE phone = '+2348091122334'),
        (SELECT id FROM public.rooms WHERE room_number = '202'),
        NOW() + INTERVAL '1 day',
        NOW() + INTERVAL '4 days',
        'confirmed',
        75000.00,
        2,
        'booking.com',
        'Requested room on 2nd floor near stairs'
    ),
    (
        'BK-2026-005',
        (SELECT id FROM public.guests WHERE phone = '+14155552671'),
        (SELECT id FROM public.rooms WHERE room_number = '401'),
        NOW() + INTERVAL '5 days',
        NOW() + INTERVAL '10 days',
        'confirmed',
        300000.00,
        1,
        'corporate',
        'Airport pickup requested at terminal 2'
    ),
    (
        'BK-2026-006',
        (SELECT id FROM public.guests WHERE phone = '+2348056789012'),
        (SELECT id FROM public.rooms WHERE room_number = '301'),
        NOW() - INTERVAL '8 days',
        NOW() - INTERVAL '5 days',
        'checked_out',
        135000.00,
        2,
        'direct',
        'Completed 3-night executive retreat'
    ),
    (
        'BK-2026-007',
        (SELECT id FROM public.guests WHERE phone = '+2348064433221'),
        (SELECT id FROM public.rooms WHERE room_number = '102'),
        NOW() - INTERVAL '1 day',
        NOW() + INTERVAL '1 day',
        'checked_in',
        30000.00,
        1,
        'walk_in',
        'Walk-in booking paid upfront via POS'
    ),
    (
        'BK-2026-008',
        (SELECT id FROM public.guests WHERE phone = '+2348187766554'),
        (SELECT id FROM public.rooms WHERE room_number = '201'),
        NOW() - INTERVAL '14 days',
        NOW() - INTERVAL '11 days',
        'checked_out',
        75000.00,
        1,
        'website',
        'Smooth checkout, left 5-star review'
    ),
    (
        'BK-2026-009',
        (SELECT id FROM public.guests WHERE phone = '+2348073322110'),
        (SELECT id FROM public.rooms WHERE room_number = '101'),
        NOW() - INTERVAL '20 days',
        NOW() - INTERVAL '17 days',
        'checked_out',
        45000.00,
        1,
        'corporate',
        'NGO retreat, late departure at 14:00'
    ),
    (
        'BK-2026-010',
        (SELECT id FROM public.guests WHERE phone = '+2348023344556'),
        (SELECT id FROM public.rooms WHERE room_number = '401'),
        NOW() + INTERVAL '2 days',
        NOW() + INTERVAL '4 days',
        'cancelled',
        120000.00,
        1,
        'direct',
        'Trip rescheduled due to overseas board meeting'
    )
ON CONFLICT (booking_reference) DO UPDATE SET
    check_in = EXCLUDED.check_in,
    check_out = EXCLUDED.check_out,
    status = EXCLUDED.status,
    total_amount = EXCLUDED.total_amount,
    notes = EXCLUDED.notes,
    updated_at = NOW();

-- ------------------------------------------------------------
-- 5. Seed Complaints
-- ------------------------------------------------------------
INSERT INTO public.complaints (
    guest_id, subject, description, status, priority, admin_response, created_at, updated_at
)
SELECT
    g.id,
    c.subject,
    c.description,
    c.status::public.complaint_status,
    c.priority::public.complaint_priority,
    c.admin_response,
    c.created_at,
    NOW()
FROM (
    VALUES
        (
            '+2348031234567',
            'Air Conditioning thermostat not regulating temperature',
            'The AC in Suite 301 stays at 26C even when set to 18C. The room feels too warm in the afternoon.',
            'in_progress',
            'high',
            'HVAC maintenance technician dispatched with replacement digital control thermostat.',
            NOW() - INTERVAL '18 hours'
        ),
        (
            '+2348029876543',
            'Early morning corridor noise',
            'Housekeeping team was speaking loudly and moving laundry carts outside Room 201 around 06:15 AM.',
            'resolved',
            'medium',
            'Supervisor spoke to morning staff; quiet zone guidelines reinforced. Complimentary fruit basket provided.',
            NOW() - INTERVAL '2 days'
        ),
        (
            '+2348064433221',
            'Intermittent Wi-Fi disconnections',
            'Experiencing frequent Wi-Fi drops in Room 102 during video conferencing calls.',
            'open',
            'medium',
            'IT department notified to reset floor access point and verify signal repeater strength.',
            NOW() - INTERVAL '6 hours'
        ),
        (
            '+2348056789012',
            'Room service delivery delay',
            'Dinner order took 80 minutes to arrive on Friday evening instead of the quoted 35 minutes.',
            'closed',
            'low',
            'Executive Chef issued apology and a 20% discount was credited on the final dining invoice.',
            NOW() - INTERVAL '6 days'
        ),
        (
            '+2348023344556',
            'Deposit refund confirmation inquiry',
            'Reservation BK-2026-010 was cancelled 48 hours ago; need official receipt of credit card refund reversal.',
            'resolved',
            'urgent',
            'Finance reversed payment via Paystack portal (Ref: PY-REV-8839201). Receipt emailed to guest.',
            NOW() - INTERVAL '1 day'
        ),
        (
            '+2348187766554',
            'Hot water pressure in shower',
            'Water pressure fluctuates significantly between hot and cold water during morning peak hours.',
            'resolved',
            'medium',
            'Plumbing team adjusted pressure balance valve on floor 2 boiler circuit.',
            NOW() - INTERVAL '12 days'
        )
) AS c(guest_phone, subject, description, status, priority, admin_response, created_at)
JOIN public.guests g ON g.phone = c.guest_phone
WHERE NOT EXISTS (
    SELECT 1 FROM public.complaints existing
    WHERE existing.guest_id = g.id AND existing.subject = c.subject
);

-- ------------------------------------------------------------
-- 6. Seed Payments (Linked to Bookings)
-- ------------------------------------------------------------
INSERT INTO public.payments (
    booking_id, guest_id, amount, payment_method, payment_status, reference_number, notes
)
SELECT
    b.id,
    b.guest_id,
    p.amount,
    p.payment_method,
    p.payment_status::public.payment_status,
    p.reference_number,
    p.notes
FROM (
    VALUES
        ('BK-2026-001', 135000.00, 'credit_card', 'paid', 'PAY-TX-001', 'Full payment settled via Mastercard'),
        ('BK-2026-002', 75000.00, 'bank_transfer', 'paid', 'PAY-TX-002', 'Corporate wire transfer confirmed'),
        ('BK-2026-003', 20000.00, 'credit_card', 'partially_paid', 'PAY-TX-003', 'Deposit paid online at reservation time'),
        ('BK-2026-006', 135000.00, 'credit_card', 'paid', 'PAY-TX-004', 'Settled on checkout with folio receipt'),
        ('BK-2026-007', 30000.00, 'pos', 'paid', 'PAY-TX-005', 'Walk-in paid with debit card on POS terminal'),
        ('BK-2026-008', 75000.00, 'credit_card', 'paid', 'PAY-TX-006', 'Online payment completed via payment gateway'),
        ('BK-2026-010', 120000.00, 'credit_card', 'refunded', 'PAY-TX-007', 'Full refund issued upon early cancellation')
) AS p(booking_ref, amount, payment_method, payment_status, reference_number, notes)
JOIN public.bookings b ON b.booking_reference = p.booking_ref
WHERE NOT EXISTS (
    SELECT 1 FROM public.payments existing
    WHERE existing.reference_number = p.reference_number
);

-- ------------------------------------------------------------
-- 7. Seed Guest Feedback
-- ------------------------------------------------------------
INSERT INTO public.feedback (guest_id, rating, comment, created_at)
SELECT
    g.id,
    f.rating,
    f.comment,
    f.created_at
FROM (
    VALUES
        ('+2348056789012', 5, 'Exceptional experience in Suite 301. The staff went above and beyond during our corporate retreat.', NOW() - INTERVAL '5 days'),
        ('+2348187766554', 5, 'Great Wi-Fi speeds and quiet work environment. Will definitely book again on my next Enugu-Lagos trip.', NOW() - INTERVAL '10 days'),
        ('+2348073322110', 4, 'Very comfortable standard room and delicious breakfast buffet. Minor wait at front desk during peak check-in.', NOW() - INTERVAL '16 days'),
        ('+2348031234567', 4, 'Lovely property and ambiance. The front-desk team responded very quickly when we called about the room.', NOW() - INTERVAL '1 day')
) AS f(guest_phone, rating, comment, created_at)
JOIN public.guests g ON g.phone = f.guest_phone
WHERE NOT EXISTS (
    SELECT 1 FROM public.feedback existing
    WHERE existing.guest_id = g.id AND existing.comment = f.comment
);

-- ============================================================
-- Verification Summary
-- ============================================================
DO $$
DECLARE
    guest_cnt INT;
    booking_cnt INT;
    complaint_cnt INT;
    payment_cnt INT;
    feedback_cnt INT;
BEGIN
    SELECT COUNT(*) INTO guest_cnt FROM public.guests;
    SELECT COUNT(*) INTO booking_cnt FROM public.bookings;
    SELECT COUNT(*) INTO complaint_cnt FROM public.complaints;
    SELECT COUNT(*) INTO payment_cnt FROM public.payments;
    SELECT COUNT(*) INTO feedback_cnt FROM public.feedback;

    RAISE NOTICE 'Seed successful: % guests, % bookings, % complaints, % payments, % feedback records.',
        guest_cnt, booking_cnt, complaint_cnt, payment_cnt, feedback_cnt;
END $$;
