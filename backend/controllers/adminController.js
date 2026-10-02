const pool = require('../config/db');

// Module 4.3.6 - Admin Dashboard
// GET /api/admin/stats - aggregate numbers for the dashboard's overview cards
async function getStats(req, res) {
  try {
    const [[guestCount]] = await pool.query('SELECT COUNT(*) AS count FROM guests');
    const [[bookingCount]] = await pool.query('SELECT COUNT(*) AS count FROM bookings');
    const [[activeBookings]] = await pool.query(
      `SELECT COUNT(*) AS count FROM bookings WHERE status IN ('confirmed', 'checked_in')`
    );
    const [[openComplaints]] = await pool.query(
      `SELECT COUNT(*) AS count FROM complaints WHERE status != 'resolved'`
    );
    const [[revenue]] = await pool.query(
      `SELECT COALESCE(SUM(total_amount), 0) AS total FROM bookings WHERE status != 'cancelled'`
    );
    const [[avgRating]] = await pool.query('SELECT ROUND(AVG(rating), 2) AS average FROM feedback');
    const [roomStatus] = await pool.query(
      `SELECT status, COUNT(*) AS count FROM rooms GROUP BY status`
    );
    const [recentBookings] = await pool.query(
      `SELECT b.id, g.full_name AS guest_name, r.room_number, b.check_in, b.check_out, b.status
       FROM bookings b JOIN guests g ON b.guest_id = g.id JOIN rooms r ON b.room_id = r.id
       ORDER BY b.created_at DESC LIMIT 5`
    );

    res.json({
      guest_count: guestCount.count,
      booking_count: bookingCount.count,
      active_bookings: activeBookings.count,
      open_complaints: openComplaints.count,
      total_revenue: revenue.total,
      average_rating: avgRating.average || 0,
      room_status: roomStatus,
      recent_bookings: recentBookings
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not fetch dashboard statistics.' });
  }
}

module.exports = { getStats };
