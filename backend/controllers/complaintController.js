const pool = require('../config/db');

// Module 4.3.4 - Complaint Handling

// GET /api/complaints
async function getComplaints(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT c.*, g.full_name AS guest_name, g.phone AS guest_phone
       FROM complaints c JOIN guests g ON c.guest_id = g.id
       ORDER BY c.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not fetch complaints.' });
  }
}

// POST /api/complaints
async function createComplaint(req, res) {
  try {
    const { guest_id, subject, description } = req.body;

    if (!guest_id || !subject || !description) {
      return res.status(400).json({ message: 'Guest, subject, and description are required.' });
    }

    const [result] = await pool.query(
      `INSERT INTO complaints (guest_id, subject, description, status) VALUES (?, ?, ?, 'open')`,
      [guest_id, subject, description]
    );

    res.status(201).json({ message: 'Complaint submitted successfully. Our team will respond shortly.', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not submit complaint.' });
  }
}

// PUT /api/complaints/:id/respond - admin/staff responds and updates status
async function respondToComplaint(req, res) {
  try {
    const { id } = req.params;
    const { admin_response, status } = req.body;

    const validStatuses = ['open', 'in_progress', 'resolved'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid complaint status.' });
    }

    const [result] = await pool.query(
      `UPDATE complaints SET admin_response = ?, status = ?, resolved_by = ? WHERE id = ?`,
      [admin_response || null, status || 'in_progress', req.user.id, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    res.json({ message: 'Complaint updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not update complaint.' });
  }
}

module.exports = { getComplaints, createComplaint, respondToComplaint };
