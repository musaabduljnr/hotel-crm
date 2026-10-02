const test = require('node:test');
const assert = require('node:assert/strict');

const { normalizePaymentStatus, validatePaymentInput, buildAuditLogEntry } = require('../src/utils/financialOperations');

test('payment status normalization supports supported values', () => {
  assert.equal(normalizePaymentStatus('PAID'), 'paid');
  assert.equal(normalizePaymentStatus('partially_paid'), 'partially_paid');
  assert.equal(normalizePaymentStatus('unknown'), null);
});

test('payment validation rejects invalid payment payloads', () => {
  assert.match(validatePaymentInput({ booking_id: 1, guest_id: 2, amount: 0 }), /amount/i);
  assert.equal(validatePaymentInput({ booking_id: 1, guest_id: 2, amount: 25000, payment_method: 'card' }), null);
});

test('audit log entries are built consistently', () => {
  const entry = buildAuditLogEntry({ actorId: 7, action: 'booking_updated', entity: 'booking', entityId: 11, metadata: { status: 'checked_in' } });

  assert.equal(entry.actor_id, 7);
  assert.equal(entry.action, 'booking_updated');
  assert.equal(entry.entity, 'booking');
  assert.equal(entry.entity_id, 11);
  assert.equal(entry.metadata.status, 'checked_in');
});
