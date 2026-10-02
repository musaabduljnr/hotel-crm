const pool = require('../config/db');
const { validateFeedbackInput } = require('../utils/validators');
const { errorResponse, successResponse } = require('../utils/apiResponse');

async function getFeedback(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT f.*, g.full_name AS guest_name
       FROM feedback f
       JOIN guests g ON f.guest_id = g.id
       ORDER BY f.created_at DESC`
    );
    return successResponse(res, 200, { feedback: rows });
  } catch (err) {
    console.error(err);
    return errorResponse(res, 500, 'FEEDBACK_FETCH_FAILED', 'Could not fetch feedback.');
  }
}

async function getFeedbackSummary(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT AVG(rating) AS avg_rating, COUNT(*) AS total_feedback
       FROM feedback`
    );
    return successResponse(res, 200, { summary: rows[0] });
  } catch (err) {
    console.error(err);
    return errorResponse(res, 500, 'FEEDBACK_SUMMARY_FAILED', 'Could not fetch feedback summary.');
  }
}

async function createFeedback(req, res) {
  try {
    const validationError = validateFeedbackInput(req.body);
    if (validationError) {
      return errorResponse(res, 400, 'VALIDATION_ERROR', validationError);
    }

    const { guest_id, rating, comment } = req.body;

    const [result] = await pool.query(
      'INSERT INTO feedback (guest_id, rating, comment) VALUES (?, ?, ?)',
      [guest_id, Number(rating), comment ? comment.trim() : null]
    );

    return successResponse(res, 201, { message: 'Thank you for your feedback!', id: result.insertId });
  } catch (err) {
    console.error(err);
    return errorResponse(res, 500, 'FEEDBACK_CREATE_FAILED', 'Could not submit feedback.');
  }
}

module.exports = { getFeedback, getFeedbackSummary, createFeedback };
