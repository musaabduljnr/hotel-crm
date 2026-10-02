const test = require('node:test');
const assert = require('node:assert/strict');

const { normalizeGuestSearchTerm, buildGuestSummary } = require('../src/utils/guestCrm');

test('guest search terms are normalized before matching', () => {
  assert.equal(normalizeGuestSearchTerm('  JANE  '), 'jane');
  assert.equal(normalizeGuestSearchTerm('   '), '');
});

test('guest summary builds a useful CRM snapshot', () => {
  const summary = buildGuestSummary({
    full_name: 'Jane Doe',
    loyalty_points: 120,
    total_visits: 3,
    total_spending: 210000,
  }, {
    totalBookings: 3,
    lastStay: '2026-09-01',
    recentStatus: 'checked_in',
  }, {
    openComplaints: 1,
  }, {
    averageRating: 4.5,
  });

  assert.equal(summary.name, 'Jane Doe');
  assert.equal(summary.loyalty_points, 120);
  assert.equal(summary.total_bookings, 3);
  assert.equal(summary.last_stay, '2026-09-01');
  assert.equal(summary.open_complaints, 1);
  assert.equal(summary.average_rating, 4.5);
});
