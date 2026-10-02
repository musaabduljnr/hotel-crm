const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const { isSupabaseConfigured, supabase } = require('../config/supabase');
const { requireRole, requireAnyRole } = require('./authorize');

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: { code: 'AUTH_REQUIRED', message: 'Authentication required. Please log in.' },
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.getUser(token);

      if (error || !data?.user) {
        return res.status(401).json({
          success: false,
          error: { code: 'INVALID_TOKEN', message: 'Invalid or expired session. Please log in again.' },
        });
      }

      req.user = {
        id: data.user.id,
        full_name: data.user.user_metadata?.full_name || data.user.email,
        email: data.user.email,
        role: data.user.user_metadata?.role || 'staff',
      };
      return next();
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Invalid or expired session. Please log in again.' },
    });
  }
}

function requireAdmin(req, res, next) {
  return requireRole('admin')(req, res, next);
}

module.exports = { requireAuth, requireAdmin, requireRole, requireAnyRole };
