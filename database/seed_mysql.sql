-- ============================================================
-- Haven CRM - Seed SQL Data (MySQL / MariaDB Compatible)
-- 10 Guests, Bookings, Complaints, Payments & Feedback
-- ============================================================

-- 1. Ensure Room Types Exist
INSERT INTO room_types (name, description, base_price)
VALUES
    ('Standard', 'Standard room with queen bed and garden view', 15000.00),
    ('Deluxe', 'Spacious deluxe room with king bed and city view', 25000.00),
    ('Suite', 'Luxury suite with private lounge and kitchenette', 45000.00),
    ('Executive', 'Executive penthouse suite with balcony and jacuzzi', 60000.00)
ON DUPLICATE KEY UPDATE
    description = VALUES(description),
    base_price = VALUES(base_price);

-- 2. Ensure Rooms Exist
INSERT INTO rooms (room_number, room_type_id, price_per_night, status, housekeeping_status, description)
SELECT '101', id, 15000.00, 'occupied', 'clean', 'Cozy standard room with garden view' FROM room_types WHERE name = 'Standard'
UNION ALL
SELECT '102', id, 15000.00, 'occupied', 'clean', 'Cozy standard room with garden view' FROM room_types WHERE name = 'Standard'
UNION ALL
SELECT '201', id, 25000.00, 'occupied', 'clean', 'Spacious deluxe room with city view' FROM room_types WHERE name = 'Deluxe'
UNION ALL
SELECT '202', id, 25000.00, 'available', 'clean', 'Spacious deluxe room with city view' FROM room_types WHERE name = 'Deluxe'
UNION ALL
SELECT '301', id, 45000.00, 'occupied', 'clean', 'Luxury suite with lounge area' FROM room_types WHERE name = 'Suite'
UNION ALL
SELECT '401', id, 60000.00, 'available', 'clean', 'Executive suite with private balcony' FROM room_types WHERE name = 'Executive'
ON DUPLICATE KEY UPDATE
    price_per_night = VALUES(price_per_night),
    status = VALUES(status),
    housekeeping_status = VALUES(housekeeping_status);

-- 3. Seed 10 Guests
INSERT INTO guests (
    full_name, email, phone, address, id_type, id_number, preferences, notes, loyalty_points, total_visits, total_spending
) VALUES
    ('Amara Okonkwo', 'amara.okonkwo@gmail.com', '+2348031234567', '14 Adeola Odeku St, Victoria Island, Lagos', 'Passport', 'A08492014', 'High floor, extra pillows, vegetarian breakfast', 'VIP corporate guest from TechBridge Capital', 350, 5, 270000.00),
    ('David Ibrahim', 'david.ibrahim@yahoo.com', '+2348029876543', '8 Aguiyi Ironsi Way, Maitama, Abuja', 'National ID', 'NIN7382910482', 'Quiet room away from elevator, feather-free pillows', 'Prefers express check-in and digital invoice', 180, 3, 125000.00),
    ('Fatima Bello', 'fatima.bello@outlook.com', '+2348145551212', '22 Shehu Shagari Way, Central Business District, Abuja', 'Driver License', 'DL92837461', 'Non-smoking room, sparkling water on arrival', 'Frequent business traveller with Federal Ministry', 90, 2, 60000.00),
    ('Emeka Nwosu', 'emeka.nwosu@techcorp.ng', '+2348091122334', '4 Admiralty Way, Lekki Phase 1, Lagos', 'Passport', 'A12938475', 'Late check-in, king bed preferred, fast Wi-Fi', 'Attending quarterly tech conference', 140, 2, 100000.00),
    ('Sarah Jenkins', 'sarah.jenkins@globaladvisors.com', '+14155552671', '550 Montgomery St, Financial District, San Francisco, CA', 'Passport', 'USA98273615', 'Corner room, morning wake-up call at 06:30, airport shuttle', 'International consultant on a 2-week engagement', 420, 4, 450000.00),
    ('Tunde Bakare', 'tunde.bakare@zenithgroup.com', '+2348056789012', '18 Isaac John St, GRA Ikeja, Lagos', 'National ID', 'NIN8472910384', 'Suite only, balcony view, late check-out requested', 'Loyal patron who hosts quarterly boardroom meetings', 520, 7, 420000.00),
    ('Zainab Al-Hassan', 'zainab.alhassan@kanotrade.org', '+2348064433221', '12 Bompai Road, Nassarawa, Kano', 'Driver License', 'DL10293847', 'Extra bath towels, ground floor or close to lift', 'Commodities trader; visits twice per quarter', 75, 1, 45000.00),
    ('Chinedu Eze', 'chinedu.eze@innovate.ng', '+2348187766554', '5 Ogui Road, Independence Layout, Enugu', 'Passport', 'A56473829', 'Ergonomic desk chair, strong bedside lighting', 'Software engineer working remotely during stays', 110, 2, 75000.00),
    ('Amina Mohammed', 'amina.m@unicef.org', '+2348073322110', '3 Yakubu Gowon Crescent, Asokoro, Abuja', 'Passport', 'DIP098231', 'Hypoallergenic bedding, green tea in room, quiet zone', 'Development officer; international NGO rate applied', 210, 3, 90000.00),
    ('Michael Adeyemi', 'michael.adeyemi@capitaltrust.ng', '+2348023344556', '9 Queens Drive, Ikoyi, Lagos', 'National ID', 'NIN6152438901', 'Daily newspaper (BusinessDay), express laundry service', 'Investment banker; usually books Executive Suite', 160, 2, 120000.00)
ON DUPLICATE KEY UPDATE
    full_name = VALUES(full_name),
    email = VALUES(email),
    address = VALUES(address),
    id_type = VALUES(id_type),
    id_number = VALUES(id_number),
    preferences = VALUES(preferences),
    notes = VALUES(notes),
    loyalty_points = VALUES(loyalty_points),
    total_visits = VALUES(total_visits),
    total_spending = VALUES(total_spending);

-- 4. Seed Bookings
INSERT INTO bookings (
    booking_reference, guest_id, room_id, check_in, check_out, status, total_amount, number_of_guests, booking_source, notes
)
SELECT 'BK-2026-001', g.id, r.id, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 2 DAY), 'checked_in', 135000.00, 2, 'direct', 'Suite stay with anniversary setup requested'
FROM guests g, rooms r WHERE g.phone = '+2348031234567' AND r.room_number = '301'
UNION ALL
SELECT 'BK-2026-002', g.id, r.id, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 1 DAY), 'checked_in', 75000.00, 1, 'corporate', 'Corporate billing directly to client company'
FROM guests g, rooms r WHERE g.phone = '+2348029876543' AND r.room_number = '201'
UNION ALL
SELECT 'BK-2026-003', g.id, r.id, DATE_ADD(NOW(), INTERVAL 3 DAY), DATE_ADD(NOW(), INTERVAL 6 DAY), 'confirmed', 45000.00, 1, 'website', 'Arriving on afternoon flight from Kano'
FROM guests g, rooms r WHERE g.phone = '+2348145551212' AND r.room_number = '101'
UNION ALL
SELECT 'BK-2026-004', g.id, r.id, DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 4 DAY), 'confirmed', 75000.00, 2, 'booking.com', 'Requested room on 2nd floor near stairs'
FROM guests g, rooms r WHERE g.phone = '+2348091122334' AND r.room_number = '202'
UNION ALL
SELECT 'BK-2026-005', g.id, r.id, DATE_ADD(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 10 DAY), 'confirmed', 300000.00, 1, 'corporate', 'Airport pickup requested at terminal 2'
FROM guests g, rooms r WHERE g.phone = '+14155552671' AND r.room_number = '401'
UNION ALL
SELECT 'BK-2026-006', g.id, r.id, DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY), 'checked_out', 135000.00, 2, 'direct', 'Completed 3-night executive retreat'
FROM guests g, rooms r WHERE g.phone = '+2348056789012' AND r.room_number = '301'
UNION ALL
SELECT 'BK-2026-007', g.id, r.id, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 1 DAY), 'checked_in', 30000.00, 1, 'walk_in', 'Walk-in booking paid upfront via POS'
FROM guests g, rooms r WHERE g.phone = '+2348064433221' AND r.room_number = '102'
UNION ALL
SELECT 'BK-2026-008', g.id, r.id, DATE_SUB(NOW(), INTERVAL 14 DAY), DATE_SUB(NOW(), INTERVAL 11 DAY), 'checked_out', 75000.00, 1, 'website', 'Smooth checkout, left 5-star review'
FROM guests g, rooms r WHERE g.phone = '+2348187766554' AND r.room_number = '201'
UNION ALL
SELECT 'BK-2026-009', g.id, r.id, DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 17 DAY), 'checked_out', 45000.00, 1, 'corporate', 'NGO retreat, late departure at 14:00'
FROM guests g, rooms r WHERE g.phone = '+2348073322110' AND r.room_number = '101'
UNION ALL
SELECT 'BK-2026-010', g.id, r.id, DATE_ADD(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 4 DAY), 'cancelled', 120000.00, 1, 'direct', 'Trip rescheduled due to overseas board meeting'
FROM guests g, rooms r WHERE g.phone = '+2348023344556' AND r.room_number = '401'
ON DUPLICATE KEY UPDATE
    status = VALUES(status),
    total_amount = VALUES(total_amount),
    notes = VALUES(notes);

-- 5. Seed Complaints
INSERT INTO complaints (guest_id, subject, description, status, priority, admin_response, created_at)
SELECT g.id, 'Air Conditioning thermostat not regulating temperature', 'The AC in Suite 301 stays at 26C even when set to 18C. The room feels too warm in the afternoon.', 'in_progress', 'high', 'HVAC maintenance technician dispatched with replacement digital control thermostat.', DATE_SUB(NOW(), INTERVAL 18 HOUR)
FROM guests g WHERE g.phone = '+2348031234567'
UNION ALL
SELECT g.id, 'Early morning corridor noise', 'Housekeeping team was speaking loudly and moving laundry carts outside Room 201 around 06:15 AM.', 'resolved', 'medium', 'Supervisor spoke to morning staff; quiet zone guidelines reinforced. Complimentary fruit basket provided.', DATE_SUB(NOW(), INTERVAL 2 DAY)
FROM guests g WHERE g.phone = '+2348029876543'
UNION ALL
SELECT g.id, 'Intermittent Wi-Fi disconnections', 'Experiencing frequent Wi-Fi drops in Room 102 during video conferencing calls.', 'open', 'medium', 'IT department notified to reset floor access point and verify signal repeater strength.', DATE_SUB(NOW(), INTERVAL 6 HOUR)
FROM guests g WHERE g.phone = '+2348064433221'
UNION ALL
SELECT g.id, 'Room service delivery delay', 'Dinner order took 80 minutes to arrive on Friday evening instead of the quoted 35 minutes.', 'closed', 'low', 'Executive Chef issued apology and a 20% discount was credited on the final dining invoice.', DATE_SUB(NOW(), INTERVAL 6 DAY)
FROM guests g WHERE g.phone = '+2348056789012'
UNION ALL
SELECT g.id, 'Deposit refund confirmation inquiry', 'Reservation BK-2026-010 was cancelled 48 hours ago; need official receipt of credit card refund reversal.', 'resolved', 'urgent', 'Finance reversed payment via Paystack portal (Ref: PY-REV-8839201). Receipt emailed to guest.', DATE_SUB(NOW(), INTERVAL 1 DAY)
FROM guests g WHERE g.phone = '+2348023344556'
UNION ALL
SELECT g.id, 'Hot water pressure in shower', 'Water pressure fluctuates significantly between hot and cold water during morning peak hours.', 'resolved', 'medium', 'Plumbing team adjusted pressure balance valve on floor 2 boiler circuit.', DATE_SUB(NOW(), INTERVAL 12 DAY)
FROM guests g WHERE g.phone = '+2348187766554';
