const pool = require('../config/db');
const { normalizeHousekeepingStatus } = require('../utils/roomOperations');
const { errorResponse, successResponse } = require('../utils/apiResponse');

async function getRoomHousekeeping(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM rooms ORDER BY room_number');
    return successResponse(res, 200, { rooms: rows });
  } catch (err) {
    console.error(err);
    return errorResponse(res, 500, 'HOUSEKEEPING_FETCH_FAILED', 'Could not fetch housekeeping status.');
  }
}

async function updateRoomHousekeeping(req, res) {
  try {
    const { id } = req.params;
    const { housekeeping_status } = req.body;
    const normalized = normalizeHousekeepingStatus(housekeeping_status);

    if (!normalized) {
      return errorResponse(res, 400, 'INVALID_STATUS', 'Invalid housekeeping status.');
    }

    const [result] = await pool.query(
      'UPDATE rooms SET housekeeping_status = ? WHERE id = ?',
      [normalized, id]
    );

    if (result.affectedRows === 0) {
      return errorResponse(res, 404, 'ROOM_NOT_FOUND', 'Room not found.');
    }

    return successResponse(res, 200, { message: `Housekeeping status updated to ${normalized}.` });
  } catch (err) {
    console.error(err);
    return errorResponse(res, 500, 'HOUSEKEEPING_UPDATE_FAILED', 'Could not update housekeeping status.');
  }
}

module.exports = { getRoomHousekeeping, updateRoomHousekeeping };
