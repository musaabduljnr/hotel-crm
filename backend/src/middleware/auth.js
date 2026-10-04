const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const { isSupabaseConfigured, supabase } = require('../config/supabase');
const { requireRole, requireAnyRole } = require('./authorize');

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

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: { code: 'AUTH_REQUIRED', message: 'Authentication required. Please log in.' },
    });
  }

  const token = authHeader.split(' ')[1];
  let authenticatedUser = null;

  // 1. First, check if it is a valid application JWT (signed with JWT_SECRET)
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    if (decoded && (decoded.id || decoded.email)) {
      authenticatedUser = {
        id: decoded.id,
        full_name: decoded.full_name || decoded.name || decoded.email,
        email: decoded.email,
        role: decoded.role || 'staff',
      };
    }
  } catch (err) {
    // JWT verification failed, may be a Supabase Auth access token
  }

  // 2. If app JWT was not valid and Supabase is configured, check Supabase Auth
  if (!authenticatedUser && isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.auth.getUser(token);
      if (!error && data?.user) {
        const metadataRole = data.user.user_metadata?.role || data.user.app_metadata?.role;
        authenticatedUser = {
          id: data.user.id,
          full_name: data.user.user_metadata?.full_name || data.user.email,
          email: data.user.email,
          role: metadataRole || 'staff',
        };
      }
    } catch (err) {
      // Supabase verification also failed
    }
  }

  if (!authenticatedUser) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Invalid or expired session. Please log in again.' },
    });
  }

  // 3. Ensure designated admins always have 'admin' role
  if (isDesignatedAdmin(authenticatedUser.email)) {
    authenticatedUser.role = 'admin';
  }

  req.user = authenticatedUser;
  return next();
}

function requireAdmin(req, res, next) {
  return requireRole('admin')(req, res, next);
}

module.exports = { requireAuth, requireAdmin, requireRole, requireAnyRole };

