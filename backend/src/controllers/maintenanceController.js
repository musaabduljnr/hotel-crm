const pool = require('../config/db');
const { validateMaintenanceInput } = require('../utils/validators');
const { normalizeMaintenancePriority, normalizeMaintenanceStatus } = require('../utils/roomOperations');
const { errorResponse, successResponse } = require('../utils/apiResponse');

async function getMaintenanceTickets(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT mt.*, r.room_number
       FROM maintenance_tickets mt
       JOIN rooms r ON mt.room_id = r.id
       ORDER BY mt.created_at DESC`
    );
    return successResponse(res, 200, { tickets: rows });
  } catch (err) {
    console.error(err);
    return errorResponse(res, 500, 'MAINTENANCE_FETCH_FAILED', 'Could not fetch maintenance tickets.');
  }
}

async function createMaintenanceTicket(req, res) {
  try {
    const validationError = validateMaintenanceInput(req.body);
    if (validationError) {
      return errorResponse(res, 400, 'VALIDATION_ERROR', validationError);
    }

    const { room_id, issue, priority, description } = req.body;
    const normalizedPriority = normalizeMaintenancePriority(priority);

    if (!normalizedPriority) {
      return errorResponse(res, 400, 'INVALID_PRIORITY', 'Priority must be one of: low, medium, high, urgent.');
    }

    const [result] = await pool.query(
      `INSERT INTO maintenance_tickets (room_id, issue, description, priority, status, created_by)
       VALUES (?, ?, ?, ?, 'open', ?)`,
      [room_id, issue.trim(), description ? description.trim() : null, normalizedPriority, req.user?.id || null]
    );

    return successResponse(res, 201, {
      message: 'Maintenance ticket created successfully.',
      ticket: { id: result.insertId, status: 'open', priority: normalizedPriority },
    });
  } catch (err) {
    console.error(err);
    return errorResponse(res, 500, 'MAINTENANCE_CREATE_FAILED', 'Could not create maintenance ticket.');
  }
}

async function updateMaintenanceTicket(req, res) {
  try {
    const { id } = req.params;
    const { status, priority, assigned_to } = req.body;
    const normalizedStatus = status ? normalizeMaintenanceStatus(status) : null;
    const normalizedPriority = priority ? normalizeMaintenancePriority(priority) : null;

    if (status && !normalizedStatus) {
      return errorResponse(res, 400, 'INVALID_STATUS', 'Invalid maintenance status.');
    }

    if (priority && !normalizedPriority) {
      return errorResponse(res, 400, 'INVALID_PRIORITY', 'Invalid maintenance priority.');
    }

    const updates = [];
    const values = [];

    if (normalizedStatus) {
      updates.push('status = ?');
      values.push(normalizedStatus);
    }

    if (normalizedPriority) {
      updates.push('priority = ?');
      values.push(normalizedPriority);
    }

    if (assigned_to !== undefined) {
      updates.push('assigned_to = ?');
      values.push(assigned_to || null);
    }

    if (updates.length === 0) {
      return errorResponse(res, 400, 'NO_CHANGES', 'No valid maintenance updates were provided.');
    }

    values.push(id);
    const [result] = await pool.query(
      `UPDATE maintenance_tickets SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return errorResponse(res, 404, 'TICKET_NOT_FOUND', 'Maintenance ticket not found.');
    }

    return successResponse(res, 200, { message: 'Maintenance ticket updated successfully.' });
  } catch (err) {
    console.error(err);
    return errorResponse(res, 500, 'MAINTENANCE_UPDATE_FAILED', 'Could not update maintenance ticket.');
  }
}

module.exports = { getMaintenanceTickets, createMaintenanceTicket, updateMaintenanceTicket };
