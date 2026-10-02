const test = require('node:test');
const assert = require('node:assert/strict');

const { normalizeHousekeepingStatus, HOUSEKEEPING_STATUSES } = require('../src/utils/roomOperations');
const { validateMaintenanceInput } = require('../src/utils/validators');

test('housekeeping statuses are normalized to the supported set', () => {
  assert.equal(normalizeHousekeepingStatus('DIRTY'), 'dirty');
  assert.equal(normalizeHousekeepingStatus('cleaning'), 'cleaning');
  assert.equal(normalizeHousekeepingStatus('unknown'), null);
  assert.deepEqual(HOUSEKEEPING_STATUSES, ['clean', 'dirty', 'cleaning', 'inspected', 'maintenance']);
});

test('maintenance validation rejects incomplete requests', () => {
  assert.match(validateMaintenanceInput({ room_id: 1, issue: 'A/C not cooling' }), /priority/i);
  assert.equal(validateMaintenanceInput({ room_id: 1, issue: 'A/C not cooling', priority: 'high', description: 'Needs urgent check' }), null);
});
