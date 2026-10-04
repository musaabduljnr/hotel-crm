const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { env } = require('../config/env');
const { isSupabaseConfigured, supabase } = require('../config/supabase');
const {
  validateRegistration,
  validateLogin,
  normalizeRole,
} = require('../utils/validators');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const designatedAdmins = new Set([
  'admin@hotelcrm.com',
  'musaabduljnr@gmail.com',
  'abdullahitajuddeen17@gmail.com',
  'ribatech2026@gmail.com',
]);

function isDesignatedAdminEmail(email) {
  if (!email) return false;
  const normalized = String(email).trim().toLowerCase();
  const configured = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  return designatedAdmins.has(normalized) || (configured && normalized === configured);
}

function createAppToken(user) {
  const role = isDesignatedAdminEmail(user.email) ? 'admin' : (user.role || 'staff');
  return jwt.sign(
    { id: user.id, full_name: user.full_name, email: user.email, role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN || '8h' }
  );
}

async function register(req, res) {
  try {
    const validationError = validateRegistration(req.body);
    if (validationError) {
      return errorResponse(res, 400, 'VALIDATION_ERROR', validationError);
    }

    const { full_name, email, password, role } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    const isAdminEmail = isDesignatedAdminEmail(normalizedEmail);
    const safeRole = isAdminEmail ? 'admin' : normalizeRole(role);

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            full_name: full_name.trim(),
            role: safeRole,
          },
        },
      });

      if (error) {
        const message = error.message || 'Registration failed. Please try again.';
        const statusCode = error.status || 400;
        return errorResponse(res, statusCode, 'REGISTRATION_FAILED', message);
      }

      const user = {
        id: data?.user?.id || 'supabase-user',
        full_name: full_name.trim(),
        email: normalizedEmail,
        role: safeRole,
      };
      const token = createAppToken(user);

      return successResponse(res, 201, {
        message: 'Account created successfully.',
        token,
        user,
      });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
    if (existing.length > 0) {
      return errorResponse(res, 409, 'USER_EXISTS', 'An account with this email already exists.');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [full_name.trim(), normalizedEmail, passwordHash, safeRole]
    );

    const token = createAppToken({
      id: result.insertId,
      full_name: full_name.trim(),
      email: normalizedEmail,
      role: safeRole,
    });

    return successResponse(res, 201, {
      message: 'Account created successfully.',
      token,
      user: { id: result.insertId, full_name: full_name.trim(), email: normalizedEmail, role: safeRole },
    });
  } catch (err) {
    console.error(err);
    return errorResponse(res, 500, 'REGISTRATION_FAILED', 'Registration failed. Please try again.');
  }
}

async function login(req, res) {
  try {
    const validationError = validateLogin(req.body);
    if (validationError) {
      return errorResponse(res, 400, 'VALIDATION_ERROR', validationError);
    }

    const { email, password } = req.body;
    const normalizedEmail = String(email).trim().toLowerCase();
    const isAdminEmail = isDesignatedAdminEmail(normalizedEmail);

    let authenticatedUser = null;

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });

      if (!error && data?.user) {
        const metadataRole = data.user.user_metadata?.role || data.user.app_metadata?.role;
        const resolvedRole = isAdminEmail ? 'admin' : normalizeRole(metadataRole || 'staff');

        authenticatedUser = {
          id: data.user.id,
          full_name: data.user.user_metadata?.full_name || data.user.email || normalizedEmail,
          email: data.user.email || normalizedEmail,
          role: resolvedRole,
        };
      }
    }

    if (!authenticatedUser) {
      try {
        const [rows] = await pool.query('SELECT * FROM users WHERE lower(email) = ?', [normalizedEmail]);
        if (rows && rows.length > 0) {
          const user = rows[0];
          let passwordValid = false;
          if (user.password_hash && user.password_hash !== 'supabase-auth-managed') {
            passwordValid = await bcrypt.compare(password, user.password_hash);
          }
          if (passwordValid) {
            const resolvedRole = isAdminEmail ? 'admin' : normalizeRole(user.role);
            authenticatedUser = {
              id: user.id,
              full_name: user.full_name || normalizedEmail,
              email: user.email,
              role: resolvedRole,
            };
          }
        }
      } catch (dbErr) {
        console.warn('Database login check note:', dbErr.message);
      }
    }

    if (!authenticatedUser) {
      return errorResponse(res, 401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
    }

    if (isAdminEmail) {
      authenticatedUser.role = 'admin';
    }

    const token = createAppToken(authenticatedUser);

    return successResponse(res, 200, {
      message: 'Login successful.',
      token,
      user: authenticatedUser,
    });
  } catch (err) {
    console.error('Login error:', err);
    return errorResponse(res, 500, 'LOGIN_FAILED', 'Login failed. Please try again.');
  }
}

function getCurrentUser(req, res) {
  if (!req.user) {
    return errorResponse(res, 401, 'UNAUTHENTICATED', 'No user session.');
  }
  const email = (req.user.email || '').trim().toLowerCase();
  if (isDesignatedAdminEmail(email)) {
    req.user.role = 'admin';
  }
  return successResponse(res, 200, { user: req.user });
}

module.exports = { register, login, getCurrentUser };

