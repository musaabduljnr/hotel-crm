const pool = require('../config/db');

// Module 4.3.3 - Booking and Reservation

// GET /api/bookings/rooms - list rooms with availability
async function getRooms(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM rooms ORDER BY room_number');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not fetch rooms.' });
  }
}

// GET /api/bookings
async function getBookings(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT b.*, g.full_name AS guest_name, g.phone AS guest_phone,
              r.room_number, r.room_type, r.price_per_night
       FROM bookings b
       JOIN guests g ON b.guest_id = g.id
       JOIN rooms r ON b.room_id = r.id
       ORDER BY b.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not fetch bookings.' });
  }
}

// Checks whether a room has any overlapping booking in the given date range.
// This is what prevents the double-booking problem described in Chapter 4.
async function isRoomAvailable(roomId, checkIn, checkOut, excludeBookingId = null) {
  let query = `
    SELECT id FROM bookings
    WHERE room_id = ?
      AND status NOT IN ('cancelled', 'checked_out')
      AND check_in < ? AND check_out > ?`;
  const params = [roomId, checkOut, checkIn];

  if (excludeBookingId) {
    query += ' AND id != ?';
    params.push(excludeBookingId);
  }

  const [rows] = await pool.query(query, params);
  return rows.length === 0;
}

// POST /api/bookings
async function createBooking(req, res) {
  try {
    const { guest_id, room_id, check_in, check_out } = req.body;

    if (!guest_id || !room_id || !check_in || !check_out) {
      return res.status(400).json({ message: 'Guest, room, check-in and check-out dates are required.' });
    }
    if (new Date(check_out) <= new Date(check_in)) {
      return res.status(400).json({ message: 'Check-out date must be after check-in date.' });
    }

    const available = await isRoomAvailable(room_id, check_in, check_out);
    if (!available) {
      return res.status(409).json({ message: 'This room is already booked for the selected dates.' });
    }

    const [roomRows] = await pool.query('SELECT price_per_night FROM rooms WHERE id = ?', [room_id]);
    if (roomRows.length === 0) {
      return res.status(404).json({ message: 'Room not found.' });
    }

    const nights = Math.ceil((new Date(check_out) - new Date(check_in)) / (1000 * 60 * 60 * 24));
    const totalAmount = nights * parseFloat(roomRows[0].price_per_night);

    const [result] = await pool.query(
      `INSERT INTO bookings (guest_id, room_id, check_in, check_out, status, total_amount)
       VALUES (?, ?, ?, ?, 'confirmed', ?)`,
      [guest_id, room_id, check_in, check_out, totalAmount]
    );

    res.status(201).json({
      message: 'Booking confirmed successfully.',
      id: result.insertId,
      total_amount: totalAmount,
      nights
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not create booking.' });
  }
}

// PUT /api/bookings/:id/status
async function updateBookingStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid booking status.' });
    }

    const [result] = await pool.query('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    res.json({ message: `Booking marked as ${status.replace('_', ' ')}.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not update booking.' });
  }
}

module.exports = { getRooms, getBookings, createBooking, updateBookingStatus };
