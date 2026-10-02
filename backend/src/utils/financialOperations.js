function normalizePaymentStatus(status) {
  const normalized = String(status || '').trim().toLowerCase();
  const allowed = ['pending', 'paid', 'partially_paid', 'refunded', 'failed'];
  return allowed.includes(normalized) ? normalized : null;
}

function validatePaymentInput(data) {
  const { booking_id, guest_id, amount, payment_method } = data || {};

  if (!booking_id) {
    return 'Booking is required.';
  }

  if (!guest_id) {
    return 'Guest is required.';
  }

  if (amount === undefined || amount === null || Number(amount) <= 0) {
    return 'Amount must be greater than zero.';
  }

  if (!payment_method || String(payment_method).trim().length < 2) {
    return 'Payment method is required.';
  }

  return null;
}

function buildAuditLogEntry({ actorId, action, entity, entityId, metadata }) {
  return {
    actor_id: actorId || null,
    action: String(action || '').trim(),
    entity: String(entity || '').trim(),
    entity_id: entityId || null,
    metadata: metadata || {},
  };
}

module.exports = {
  normalizePaymentStatus,
  validatePaymentInput,
  buildAuditLogEntry,
};
