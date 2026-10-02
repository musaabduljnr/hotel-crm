const pool = require('../config/db');
const { normalizeGuestSearchTerm, buildGuestSummary } = require('../utils/guestCrm');
const { errorResponse, successResponse } = require('../utils/apiResponse');

async function searchGuests(req, res) {
  try {
    const { q } = req.query;
    const searchTerm = normalizeGuestSearchTerm(q || '');

    if (!searchTerm) {
      return successResponse(res, 200, { guests: [] });
    }

    const [rows] = await pool.query(
      `SELECT * FROM guests
       WHERE LOWER(full_name) LIKE ? OR LOWER(email) LIKE ? OR LOWER(phone) LIKE ?
       ORDER BY full_name ASC LIMIT 20`,
      [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]
    );

    return successResponse(res, 200, { guests: rows });
  } catch (err) {
    console.error(err);
    return errorResponse(res, 500, 'GUEST_SEARCH_FAILED', 'Could not search guests.');
  }
}

async function getGuestDashboard(req, res) {
  try {
    const { id } = req.params;

    const [guestRows] = await pool.query('SELECT * FROM guests WHERE id = ?', [id]);
    if (guestRows.length === 0) {
      return errorResponse(res, 404, 'GUEST_NOT_FOUND', 'Guest not found.');
    }

    const [bookingStats] = await pool.query(
      `SELECT COUNT(*) AS totalBookings,
              MAX(check_in) AS lastStay,
              MAX(CASE WHEN status IN ('confirmed', 'checked_in') THEN status ELSE NULL END) AS recentStatus
       FROM bookings WHERE guest_id = ?`,
      [id]
    );

    const [complaintStats] = await pool.query(
      `SELECT COUNT(*) AS openComplaints FROM complaints WHERE guest_id = ? AND status != 'resolved'`,
      [id]
    );

    const [feedbackStats] = await pool.query(
      `SELECT ROUND(AVG(rating), 2) AS averageRating FROM feedback WHERE guest_id = ?`,
      [id]
    );

    const [recentBookings] = await pool.query(
      `SELECT b.*, r.room_number, rt.name AS room_type
       FROM bookings b
       JOIN rooms r ON b.room_id = r.id
       JOIN room_types rt ON r.room_type_id = rt.id
       WHERE b.guest_id = ?
       ORDER BY b.check_in DESC LIMIT 5`,
      [id]
    );

    const summary = buildGuestSummary(
      guestRows[0],
      bookingStats[0],
      complaintStats[0],
      feedbackStats[0]
    );

    return successResponse(res, 200, {
      guest: guestRows[0],
      summary,
      recentBookings,
    });
  } catch (err) {
    console.error(err);
    return errorResponse(res, 500, 'GUEST_DASHBOARD_FAILED', 'Could not load guest dashboard.');
  }
}

module.exports = { searchGuests, getGuestDashboard };
