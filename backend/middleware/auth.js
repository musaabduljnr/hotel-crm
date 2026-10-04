const jwt = require('jsonwebtoken');
require('dotenv').config();

const designatedAdmins = new Set([
  'admin@hotelcrm.com',
  'musaabduljnr@gmail.com',
  'abdullahitajuddeen17@gmail.com',
  'ribatech2026@gmail.com',
]);

function isDesignatedAdmin(email) {
  if (!email) return false;
  const normalized = String(email).trim().toLowerCase();
  const configured = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  return designatedAdmins.has(normalized) || (configured && normalized === configured);
}

// Verifies the JWT sent in the Authorization header and attaches
// the decoded user (id, role) to req.user for downstream handlers.
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided. Please log in.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded && isDesignatedAdmin(decoded.email)) {
      decoded.role = 'admin';
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired session. Please log in again.' });
  }
}

// Restricts a route to admin-only access. Must run after requireAuth.
function requireAdmin(req, res, next) {
  const email = req.user?.email;
  if (isDesignatedAdmin(email)) {
    if (req.user) req.user.role = 'admin';
    return next();
  }
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required for this action.' });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };

