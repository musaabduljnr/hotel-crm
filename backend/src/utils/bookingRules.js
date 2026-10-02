const BOOKING_STATUSES = ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show'];
const ROOM_STATUSES = ['available', 'reserved', 'occupied', 'cleaning', 'maintenance', 'out_of_service'];

function normalizeBookingStatus(status) {
  const normalized = String(status || '').trim().toLowerCase().replace(/\s+/g, '_');
  return BOOKING_STATUSES.includes(normalized) ? normalized : null;
}

function normalizeRoomStatus(status) {
  const normalized = String(status || '').trim().toLowerCase().replace(/\s+/g, '_');
  return ROOM_STATUSES.includes(normalized) ? normalized : null;
}

function buildBookingReference() {
  const prefix = 'HCV';
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${random}`;
}

function canTransitionTo(currentStatus, nextStatus) {
  const allowedTransitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['checked_in', 'cancelled', 'no_show'],
    checked_in: ['checked_out', 'cancelled'],
    checked_out: [],
    cancelled: [],
    no_show: [],
  };

  if (!currentStatus || !nextStatus) {
    return false;
  }

  return allowedTransitions[currentStatus]?.includes(nextStatus) || false;
}

module.exports = {
  BOOKING_STATUSES,
  ROOM_STATUSES,
  normalizeBookingStatus,
  normalizeRoomStatus,
  buildBookingReference,
  canTransitionTo,
};
