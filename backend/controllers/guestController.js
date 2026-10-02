const pool = require('../config/db');

// Module 4.3.2 - Guest Data Management

// GET /api/guests
async function getGuests(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM guests ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not fetch guests.' });
  }
}

// GET /api/guests/:id  (includes booking history)
async function getGuestById(req, res) {
  try {
    const { id } = req.params;
    const [guestRows] = await pool.query('SELECT * FROM guests WHERE id = ?', [id]);
    if (guestRows.length === 0) {
      return res.status(404).json({ message: 'Guest not found.' });
    }

    const [bookings] = await pool.query(
      `SELECT b.*, r.room_number, r.room_type
       FROM bookings b JOIN rooms r ON b.room_id = r.id
       WHERE b.guest_id = ? ORDER BY b.check_in DESC`,
      [id]
    );

    res.json({ ...guestRows[0], bookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not fetch guest details.' });
  }
}

// POST /api/guests
async function createGuest(req, res) {
  try {
    const { full_name, email, phone, address, id_type, id_number, preferences } = req.body;

    if (!full_name || !phone) {
      return res.status(400).json({ message: 'Guest name and phone number are required.' });
    }

    const [result] = await pool.query(
      `INSERT INTO guests (full_name, email, phone, address, id_type, id_number, preferences, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [full_name, email || null, phone, address || null, id_type || null, id_number || null, preferences || null, req.user.id]
    );

    res.status(201).json({ message: 'Guest registered successfully.', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not register guest.' });
  }
}

// PUT /api/guests/:id
async function updateGuest(req, res) {
  try {
    const { id } = req.params;
    const { full_name, email, phone, address, id_type, id_number, preferences } = req.body;

    const [result] = await pool.query(
      `UPDATE guests SET full_name = ?, email = ?, phone = ?, address = ?, id_type = ?, id_number = ?, preferences = ?
       WHERE id = ?`,
      [full_name, email, phone, address, id_type, id_number, preferences, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Guest not found.' });
    }

    res.json({ message: 'Guest record updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not update guest.' });
  }
}

// DELETE /api/guests/:id
async function deleteGuest(req, res) {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM guests WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Guest not found.' });
    }

    res.json({ message: 'Guest record deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not delete guest.' });
  }
}

module.exports = { getGuests, getGuestById, createGuest, updateGuest, deleteGuest };
