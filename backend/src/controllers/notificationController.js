const pool = require('../config/db');
const { errorResponse, successResponse } = require('../utils/apiResponse');

async function getNotifications(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM notifications WHERE user_id = ? OR user_id IS NULL ORDER BY created_at DESC LIMIT 20',
      [req.user?.id || null]
    );
    return successResponse(res, 200, { notifications: rows });
  } catch (err) {
    console.error(err);
    return errorResponse(res, 500, 'NOTIFICATIONS_FETCH_FAILED', 'Could not fetch notifications.');
  }
}

async function createNotification(req, res) {
  try {
    const { user_id, type, title, message } = req.body;

    if (!type || !title || !message) {
      return errorResponse(res, 400, 'VALIDATION_ERROR', 'Type, title, and message are required.');
    }

    const [result] = await pool.query(
      'INSERT INTO notifications (user_id, type, title, message) VALUES (?, ?, ?, ?)',
      [user_id || null, type.trim(), title.trim(), message.trim()]
    );

    return successResponse(res, 201, { message: 'Notification created successfully.', id: result.insertId });
  } catch (err) {
    console.error(err);
    return errorResponse(res, 500, 'NOTIFICATION_CREATE_FAILED', 'Could not create notification.');
  }
}

module.exports = { getNotifications, createNotification };
