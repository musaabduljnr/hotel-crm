const pool = require('../config/db');
const { validateBookingInput } = require('../utils/validators');
const { errorResponse, successResponse } = require('../utils/apiResponse');
const { normalizeBookingStatus, buildBookingReference, canTransitionTo } = require('../utils/bookingRules');

async function getRooms(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM rooms ORDER BY room_number');
    return successResponse(res, 200, { rooms: rows });
  } catch (err) {
    console.error(err);
    return errorResponse(res, 500, 'ROOMS_FETCH_FAILED', 'Could not fetch rooms.');
  }
}

async function getBookings(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT b.*, g.full_name AS guest_name, g.phone AS guest_phone,
              r.room_number, rt.name AS room_type, r.price_per_night
       FROM bookings b
       JOIN guests g ON b.guest_id = g.id
       JOIN rooms r ON b.room_id = r.id
       JOIN room_types rt ON r.room_type_id = rt.id
       ORDER BY b.created_at DESC`
    );
    return successResponse(res, 200, { bookings: rows });
  } catch (err) {
    console.error(err);
    return errorResponse(res, 500, 'BOOKINGS_FETCH_FAILED', 'Could not fetch bookings.');
  }
}

async function isRoomAvailable(roomId, checkIn, checkOut, excludeBookingId = null) {
  let query = `
    SELECT id FROM bookings
    WHERE room_id = ?
      AND status NOT IN ('cancelled', 'checked_out', 'no_show')
      AND check_in < ? AND check_out > ?`;
  const params = [roomId, checkOut, checkIn];

  if (excludeBookingId) {
    query += ' AND id != ?';
    params.push(excludeBookingId);
  }

  const [rows] = await pool.query(query, params);
  return rows.length === 0;
}

async function createBooking(req, res) {
  try {
    const validationError = validateBookingInput(req.body);
    if (validationError) {
      return errorResponse(res, 400, 'VALIDATION_ERROR', validationError);
    }

    const { guest_id, room_id, check_in, check_out, number_of_guests, booking_source, notes } = req.body;

    const [roomRows] = await pool.query(
      'SELECT id, price_per_night, status FROM rooms WHERE id = ?',
      [room_id]
    );
    if (roomRows.length === 0) {
      return errorResponse(res, 404, 'ROOM_NOT_FOUND', 'Room not found.');
    }

    if (['maintenance', 'out_of_service'].includes(roomRows[0].status)) {
      return errorResponse(res, 409, 'ROOM_UNAVAILABLE', 'The selected room is not available for booking.');
    }

    const available = await isRoomAvailable(room_id, check_in, check_out);
    if (!available) {
      return errorResponse(res, 409, 'ROOM_UNAVAILABLE', 'This room is already booked for the selected dates.');
    }

    const start = new Date(check_in);
    const end = new Date(check_out);
    const nights = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    const totalAmount = nights * parseFloat(roomRows[0].price_per_night);

    const bookingReference = buildBookingReference();

    const [result] = await pool.query(
      `INSERT INTO bookings (booking_reference, guest_id, room_id, check_in, check_out, status, total_amount, number_of_guests, booking_source, notes, created_by)
       VALUES (?, ?, ?, ?, ?, 'confirmed', ?, ?, ?, ?, ?)`,
      [
        bookingReference,
        guest_id,
        room_id,
        check_in,
        check_out,
        totalAmount,
        Number(number_of_guests || 1),
        booking_source || 'direct',
        notes || null,
        req.user?.id || null,
      ]
    );

    return successResponse(res, 201, {
      message: 'Booking confirmed successfully.',
      booking: {
        id: result.insertId,
        booking_reference: bookingReference,
        total_amount: totalAmount,
        nights,
      },
    });
  } catch (err) {
    console.error(err);
    return errorResponse(res, 500, 'BOOKING_CREATE_FAILED', 'Could not create booking.');
  }
}

async function updateBookingStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const normalizedStatus = normalizeBookingStatus(status);

    if (!normalizedStatus) {
      return errorResponse(res, 400, 'INVALID_STATUS', 'Invalid booking status.');
    }

    const [existing] = await pool.query('SELECT status FROM bookings WHERE id = ?', [id]);
    if (existing.length === 0) {
      return errorResponse(res, 404, 'BOOKING_NOT_FOUND', 'Booking not found.');
    }

    const currentStatus = existing[0].status;
    if (!canTransitionTo(currentStatus, normalizedStatus)) {
      return errorResponse(res, 409, 'STATUS_TRANSITION_INVALID', `Booking cannot move from ${currentStatus} to ${normalizedStatus}.`);
    }

    const [result] = await pool.query('UPDATE bookings SET status = ? WHERE id = ?', [normalizedStatus, id]);
    if (result.affectedRows === 0) {
      return errorResponse(res, 404, 'BOOKING_NOT_FOUND', 'Booking not found.');
    }

    return successResponse(res, 200, { message: `Booking marked as ${normalizedStatus.replace('_', ' ')}.` });
  } catch (err) {
    console.error(err);
    return errorResponse(res, 500, 'BOOKING_UPDATE_FAILED', 'Could not update booking.');
  }
}

module.exports = { getRooms, getBookings, createBooking, updateBookingStatus, isRoomAvailable };
