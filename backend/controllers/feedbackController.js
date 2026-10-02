const pool = require('../config/db');

// Module 4.3.5 - Customer Feedback

// GET /api/feedback
async function getFeedback(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT f.*, g.full_name AS guest_name
       FROM feedback f JOIN guests g ON f.guest_id = g.id
       ORDER BY f.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not fetch feedback.' });
  }
}

// GET /api/feedback/summary - average rating, used on admin dashboard
async function getFeedbackSummary(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS total, ROUND(AVG(rating), 2) AS average_rating FROM feedback`
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not fetch feedback summary.' });
  }
}

// POST /api/feedback
async function createFeedback(req, res) {
  try {
    const { guest_id, rating, comment } = req.body;

    if (!guest_id || !rating) {
      return res.status(400).json({ message: 'Guest and rating are required.' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
    }

    const [result] = await pool.query(
      'INSERT INTO feedback (guest_id, rating, comment) VALUES (?, ?, ?)',
      [guest_id, rating, comment || null]
    );

    res.status(201).json({ message: 'Thank you for your feedback!', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not submit feedback.' });
  }
}

module.exports = { getFeedback, getFeedbackSummary, createFeedback };
