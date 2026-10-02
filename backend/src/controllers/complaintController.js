const pool = require('../config/db');
const { validateComplaintInput } = require('../utils/validators');
const { errorResponse, successResponse } = require('../utils/apiResponse');

async function getComplaints(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT c.*, g.full_name AS guest_name
       FROM complaints c
       JOIN guests g ON c.guest_id = g.id
       ORDER BY c.created_at DESC`
    );
    return successResponse(res, 200, { complaints: rows });
  } catch (err) {
    console.error(err);
    return errorResponse(res, 500, 'COMPLAINTS_FETCH_FAILED', 'Could not fetch complaints.');
  }
}

async function createComplaint(req, res) {
  try {
    const validationError = validateComplaintInput(req.body);
    if (validationError) {
      return errorResponse(res, 400, 'VALIDATION_ERROR', validationError);
    }

    const { guest_id, subject, description } = req.body;

    const [result] = await pool.query(
      'INSERT INTO complaints (guest_id, subject, description) VALUES (?, ?, ?)',
      [guest_id, subject.trim(), description.trim()]
    );

    return successResponse(res, 201, {
      message: 'Complaint submitted successfully. Our team will respond shortly.',
      id: result.insertId,
    });
  } catch (err) {
    console.error(err);
    return errorResponse(res, 500, 'COMPLAINT_CREATE_FAILED', 'Could not submit complaint.');
  }
}

async function respondToComplaint(req, res) {
  try {
    const { id } = req.params;
    const { status, admin_response } = req.body;

    const validStatuses = ['open', 'assigned', 'in_progress', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return errorResponse(res, 400, 'INVALID_STATUS', 'Invalid complaint status.');
    }

    const [result] = await pool.query(
      'UPDATE complaints SET status = ?, admin_response = ?, resolved_by = ? WHERE id = ?',
      [status, admin_response || null, req.user.id, id]
    );

    if (result.affectedRows === 0) {
      return errorResponse(res, 404, 'COMPLAINT_NOT_FOUND', 'Complaint not found.');
    }

    return successResponse(res, 200, { message: `Complaint marked as ${status.replace('_', ' ')}.` });
  } catch (err) {
    console.error(err);
    return errorResponse(res, 500, 'COMPLAINT_UPDATE_FAILED', 'Could not update complaint.');
  }
}

module.exports = { getComplaints, createComplaint, respondToComplaint };
