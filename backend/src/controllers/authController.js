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

function createAppToken(user) {
  return jwt.sign(
    { id: user.id, full_name: user.full_name, email: user.email, role: user.role },
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
    const safeRole = normalizeRole(role);

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name,
            role: safeRole,
          },
        },
      });

      if (error) {
        const message = error.message || 'Registration failed. Please try again.';
        const statusCode = error.status || 400;
        return errorResponse(res, statusCode, 'REGISTRATION_FAILED', message);
      }

      const token = data?.session?.access_token || createAppToken({
        id: data?.user?.id || 'supabase-user',
        full_name,
        email,
        role: safeRole,
      });

      return successResponse(res, 201, {
        message: 'Account created successfully.',
        token,
        user: {
          id: data?.user?.id || 'supabase-user',
          full_name,
          email,
          role: safeRole,
        },
      });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return errorResponse(res, 409, 'USER_EXISTS', 'An account with this email already exists.');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [full_name.trim(), email.trim().toLowerCase(), passwordHash, safeRole]
    );

    const token = createAppToken({
      id: result.insertId,
      full_name: full_name.trim(),
      email: email.trim().toLowerCase(),
      role: safeRole,
    });

    return successResponse(res, 201, {
      message: 'Account created successfully.',
      token,
      user: { id: result.insertId, full_name: full_name.trim(), email: email.trim().toLowerCase(), role: safeRole },
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

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });

      if (error) {
        const statusCode = error.status || 401;
        return errorResponse(res, statusCode, 'INVALID_CREDENTIALS', error.message || 'Invalid email or password.');
      }

      const user = {
        id: data?.user?.id || 'supabase-user',
        full_name: data?.user?.user_metadata?.full_name || data?.user?.email || normalizedEmail,
        email: data?.user?.email || normalizedEmail,
        role: data?.user?.user_metadata?.role || 'staff',
      };

      const token = data?.session?.access_token || createAppToken(user);

      return successResponse(res, 200, {
        message: 'Login successful.',
        token,
        user,
      });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [normalizedEmail]);
    if (rows.length === 0) {
      return errorResponse(res, 401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return errorResponse(res, 401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
    }

    const token = createAppToken({
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
    });

    return successResponse(res, 200, {
      message: 'Login successful.',
      token,
      user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    return errorResponse(res, 500, 'LOGIN_FAILED', 'Login failed. Please try again.');
  }
}

function getCurrentUser(req, res) {
  return successResponse(res, 200, { user: req.user });
}

module.exports = { register, login, getCurrentUser };
