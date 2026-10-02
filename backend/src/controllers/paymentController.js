const pool = require('../config/db');
const { validatePaymentInput, normalizePaymentStatus, buildAuditLogEntry } = require('../utils/financialOperations');
const { errorResponse, successResponse } = require('../utils/apiResponse');

async function getPayments(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, b.booking_reference, g.full_name AS guest_name
       FROM payments p
       JOIN bookings b ON p.booking_id = b.id
       JOIN guests g ON p.guest_id = g.id
       ORDER BY p.created_at DESC`
    );
    return successResponse(res, 200, { payments: rows });
  } catch (err) {
    console.error(err);
    return errorResponse(res, 500, 'PAYMENTS_FETCH_FAILED', 'Could not fetch payments.');
  }
}

async function createPayment(req, res) {
  try {
    const validationError = validatePaymentInput(req.body);
    if (validationError) {
      return errorResponse(res, 400, 'VALIDATION_ERROR', validationError);
    }

    const { booking_id, guest_id, amount, payment_method, payment_status, reference_number, notes } = req.body;
    const normalizedStatus = normalizePaymentStatus(payment_status || 'pending');

    if (!normalizedStatus) {
      return errorResponse(res, 400, 'INVALID_STATUS', 'Invalid payment status.');
    }

    const [result] = await pool.query(
      `INSERT INTO payments (booking_id, guest_id, amount, payment_method, payment_status, reference_number, notes, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [booking_id, guest_id, Number(amount), payment_method.trim(), normalizedStatus, reference_number || null, notes || null, req.user?.id || null]
    );

    await pool.query(
      `INSERT INTO audit_logs (actor_id, action, entity, entity_id, metadata)
       VALUES (?, 'payment_created', 'payment', ?, ?)`,
      [req.user?.id || null, result.insertId, JSON.stringify({ booking_id, guest_id, amount: Number(amount), status: normalizedStatus })]
    );

    return successResponse(res, 201, { message: 'Payment recorded successfully.', payment: { id: result.insertId, status: normalizedStatus } });
  } catch (err) {
    console.error(err);
    return errorResponse(res, 500, 'PAYMENT_CREATE_FAILED', 'Could not record payment.');
  }
}

async function updatePaymentStatus(req, res) {
  try {
    const { id } = req.params;
    const { payment_status } = req.body;
    const normalizedStatus = normalizePaymentStatus(payment_status);

    if (!normalizedStatus) {
      return errorResponse(res, 400, 'INVALID_STATUS', 'Invalid payment status.');
    }

    const [result] = await pool.query(
      'UPDATE payments SET payment_status = ? WHERE id = ?',
      [normalizedStatus, id]
    );

    if (result.affectedRows === 0) {
      return errorResponse(res, 404, 'PAYMENT_NOT_FOUND', 'Payment not found.');
    }

    await pool.query(
      `INSERT INTO audit_logs (actor_id, action, entity, entity_id, metadata)
       VALUES (?, 'payment_updated', 'payment', ?, ?)`,
      [req.user?.id || null, id, JSON.stringify({ payment_status: normalizedStatus })]
    );

    return successResponse(res, 200, { message: `Payment status updated to ${normalizedStatus}.` });
  } catch (err) {
    console.error(err);
    return errorResponse(res, 500, 'PAYMENT_UPDATE_FAILED', 'Could not update payment status.');
  }
}

module.exports = { getPayments, createPayment, updatePaymentStatus };
