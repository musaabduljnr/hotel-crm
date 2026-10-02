const pool = require('../config/db');
const { validateGuestInput } = require('../utils/validators');
const { errorResponse, successResponse } = require('../utils/apiResponse');

async function getGuests(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM guests ORDER BY created_at DESC');
    return successResponse(res, 200, { guests: rows });
  } catch (err) {
    console.error(err);
    return errorResponse(res, 500, 'GUESTS_FETCH_FAILED', 'Could not fetch guests.');
  }
}

async function getGuestById(req, res) {
  try {
    const { id } = req.params;
    const [guestRows] = await pool.query('SELECT * FROM guests WHERE id = ?', [id]);
    if (guestRows.length === 0) {
      return errorResponse(res, 404, 'GUEST_NOT_FOUND', 'Guest not found.');
    }

    const [bookings] = await pool.query(
      `SELECT b.*, r.room_number, rt.name AS room_type
       FROM bookings b
       JOIN rooms r ON b.room_id = r.id
       JOIN room_types rt ON r.room_type_id = rt.id
       WHERE b.guest_id = ? ORDER BY b.check_in DESC`,
      [id]
    );

    return successResponse(res, 200, { guest: { ...guestRows[0], bookings } });
  } catch (err) {
    console.error(err);
    return errorResponse(res, 500, 'GUEST_FETCH_FAILED', 'Could not fetch guest details.');
  }
}

async function createGuest(req, res) {
  try {
    const validationError = validateGuestInput(req.body);
    if (validationError) {
      return errorResponse(res, 400, 'VALIDATION_ERROR', validationError);
    }

    const { full_name, email, phone, address, id_type, id_number, preferences } = req.body;

    const [result] = await pool.query(
      `INSERT INTO guests (full_name, email, phone, address, id_type, id_number, preferences, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [full_name.trim(), email ? email.trim() : null, phone.trim(), address || null, id_type || null, id_number || null, preferences || null, req.user.id]
    );

    return successResponse(res, 201, { message: 'Guest registered successfully.', id: result.insertId });
  } catch (err) {
    console.error(err);
    return errorResponse(res, 500, 'GUEST_CREATE_FAILED', 'Could not register guest.');
  }
}

async function updateGuest(req, res) {
  try {
    const validationError = validateGuestInput(req.body);
    if (validationError) {
      return errorResponse(res, 400, 'VALIDATION_ERROR', validationError);
    }

    const { id } = req.params;
    const { full_name, email, phone, address, id_type, id_number, preferences } = req.body;

    const [result] = await pool.query(
      `UPDATE guests SET full_name = ?, email = ?, phone = ?, address = ?, id_type = ?, id_number = ?, preferences = ?
       WHERE id = ?`,
      [full_name.trim(), email ? email.trim() : null, phone.trim(), address || null, id_type || null, id_number || null, preferences || null, id]
    );

    if (result.affectedRows === 0) {
      return errorResponse(res, 404, 'GUEST_NOT_FOUND', 'Guest not found.');
    }

    return successResponse(res, 200, { message: 'Guest record updated successfully.' });
  } catch (err) {
    console.error(err);
    return errorResponse(res, 500, 'GUEST_UPDATE_FAILED', 'Could not update guest.');
  }
}

async function deleteGuest(req, res) {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM guests WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return errorResponse(res, 404, 'GUEST_NOT_FOUND', 'Guest not found.');
    }

    return successResponse(res, 200, { message: 'Guest record deleted successfully.' });
  } catch (err) {
    console.error(err);
    return errorResponse(res, 500, 'GUEST_DELETE_FAILED', 'Could not delete guest.');
  }
}

module.exports = { getGuests, getGuestById, createGuest, updateGuest, deleteGuest };
