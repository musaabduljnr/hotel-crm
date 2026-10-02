const HOUSEKEEPING_STATUSES = ['clean', 'dirty', 'cleaning', 'inspected', 'maintenance'];

function normalizeHousekeepingStatus(status) {
  const normalized = String(status || '').trim().toLowerCase();
  return HOUSEKEEPING_STATUSES.includes(normalized) ? normalized : null;
}

function normalizeMaintenancePriority(priority) {
  const normalized = String(priority || '').trim().toLowerCase();
  const allowed = ['low', 'medium', 'high', 'urgent'];
  return allowed.includes(normalized) ? normalized : null;
}

function normalizeMaintenanceStatus(status) {
  const normalized = String(status || '').trim().toLowerCase();
  const allowed = ['open', 'assigned', 'in_progress', 'resolved', 'closed'];
  return allowed.includes(normalized) ? normalized : null;
}

module.exports = {
  HOUSEKEEPING_STATUSES,
  normalizeHousekeepingStatus,
  normalizeMaintenancePriority,
  normalizeMaintenanceStatus,
};
