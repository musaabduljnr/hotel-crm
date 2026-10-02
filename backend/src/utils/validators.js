function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function isValidPhone(phone) {
  return typeof phone === 'string' && phone.trim().length >= 7 && /^[+()\-\d\s]+$/.test(phone.trim());
}

function normalizeRole(role) {
  const allowed = ['admin', 'manager', 'receptionist', 'staff'];
  const candidate = String(role || 'staff').trim().toLowerCase();
  return allowed.includes(candidate) ? candidate : 'staff';
}

function validateRegistration(data) {
  const { full_name, email, password, role } = data || {};

  if (!full_name || typeof full_name !== 'string' || full_name.trim().length < 2) {
    return 'Full name is required and must be at least 2 characters.';
  }

  if (!isValidEmail(email)) {
    return 'A valid email address is required.';
  }

  if (typeof password !== 'string' || password.length < 6) {
    return 'Password must be at least 6 characters.';
  }

  const normalizedRole = normalizeRole(role);
  if (!['admin', 'manager', 'receptionist', 'staff'].includes(normalizedRole)) {
    return 'Invalid role selected.';
  }

  return null;
}

function validateLogin(data) {
  const { email, password } = data || {};

  if (!isValidEmail(email)) {
    return 'A valid email address is required.';
  }

  if (typeof password !== 'string' || password.length < 6) {
    return 'Password must be at least 6 characters.';
  }

  return null;
}

function validateGuestInput(data) {
  const { full_name, phone, email } = data || {};

  if (!full_name || typeof full_name !== 'string' || full_name.trim().length < 2) {
    return 'Guest full name is required.';
  }

  if (!phone || !isValidPhone(phone)) {
    return 'A valid phone number is required.';
  }

  if (email && !isValidEmail(email)) {
    return 'Guest email is invalid.';
  }

  return null;
}

function validateBookingInput(data) {
  const { guest_id, room_id, check_in, check_out } = data || {};

  if (!guest_id || !room_id) {
    return 'Guest and room are required.';
  }

  if (!check_in || !check_out) {
    return 'Check-in and check-out dates are required.';
  }

  const start = new Date(check_in);
  const end = new Date(check_out);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 'Check-in and check-out must be valid dates.';
  }

  if (end <= start) {
    return 'Check-out date must be after check-in date.';
  }

  return null;
}

function validateComplaintInput(data) {
  const { guest_id, subject, description } = data || {};

  if (!guest_id) {
    return 'Guest is required.';
  }

  if (!subject || typeof subject !== 'string' || subject.trim().length < 3) {
    return 'Complaint subject is required.';
  }

  if (!description || typeof description !== 'string' || description.trim().length < 10) {
    return 'Complaint description must be at least 10 characters.';
  }

  return null;
}

function validateFeedbackInput(data) {
  const { guest_id, rating } = data || {};

  if (!guest_id) {
    return 'Guest is required.';
  }

  const numericRating = Number(rating);
  if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
    return 'Rating must be an integer between 1 and 5.';
  }

  return null;
}

function validateMaintenanceInput(data) {
  const { room_id, issue, priority, description } = data || {};

  if (!room_id) {
    return 'Room is required.';
  }

  if (!issue || typeof issue !== 'string' || issue.trim().length < 3) {
    return 'Issue title is required and must be at least 3 characters.';
  }

  if (!priority || !['low', 'medium', 'high', 'urgent'].includes(String(priority).trim().toLowerCase())) {
    return 'Priority must be one of: low, medium, high, urgent.';
  }

  if (description && typeof description === 'string' && description.trim().length > 0 && description.trim().length < 10) {
    return 'Maintenance description must be at least 10 characters when provided.';
  }

  return null;
}

module.exports = {
  isValidEmail,
  isValidPhone,
  normalizeRole,
  validateRegistration,
  validateLogin,
  validateGuestInput,
  validateBookingInput,
  validateComplaintInput,
  validateFeedbackInput,
  validateMaintenanceInput,
};
