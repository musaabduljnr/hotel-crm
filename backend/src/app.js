const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/authRoutes');
const guestRoutes = require('./routes/guestRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const adminRoutes = require('./routes/adminRoutes');
const operationsRoutes = require('./routes/operationsRoutes');
const guestCrmRoutes = require('./routes/guestCrmRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const notFoundHandler = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

const rawClientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
const allowedOrigins = rawClientUrl
  .split(',')
  .map((origin) => origin.trim().replace(/\/+$/, ''))
  .filter(Boolean);

app.disable('x-powered-by');
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    const cleanOrigin = origin.replace(/\/+$/, '');

    if (allowedOrigins.includes('*') || allowedOrigins.includes(cleanOrigin)) {
      return callback(null, true);
    }

    try {
      const parsed = new URL(cleanOrigin);
      if (
        parsed.hostname.endsWith('.vercel.app') ||
        parsed.hostname === 'localhost' ||
        parsed.hostname === '127.0.0.1'
      ) {
        return callback(null, true);
      }
    } catch {
      // ignore URL parsing failures for custom protocols/origins
    }

    return callback(new Error(`CORS policy denied for origin: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.' } },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'AUTH_RATE_LIMITED', message: 'Too many login attempts. Please wait and try again.' } },
});

app.use(['/api', '/'], apiLimiter);
app.use(['/api/auth', '/auth'], authLimiter);

const registerApiRoutes = (prefix = '') => {
  app.get(`${prefix}/health`, (req, res) => {
    res.json({
      status: 'ok',
      message: 'Hotel CRM API is running.',
      timestamp: new Date().toISOString(),
    });
  });

  app.use(`${prefix}/auth`, authRoutes);
  app.use(`${prefix}/guests`, guestRoutes);
  app.use(`${prefix}/bookings`, bookingRoutes);
  app.use(`${prefix}/complaints`, complaintRoutes);
  app.use(`${prefix}/feedback`, feedbackRoutes);
  app.use(`${prefix}/admin`, adminRoutes);
  app.use(`${prefix}/operations`, operationsRoutes);
  app.use(`${prefix}/guests-crm`, guestCrmRoutes);
  app.use(`${prefix}/payments`, paymentRoutes);
  app.use(`${prefix}/notifications`, notificationRoutes);
};

// Support both /api (standard) and root-relative requests (fallback)
registerApiRoutes('/api');
registerApiRoutes('');

// Serve built frontend assets in production / single-service deployments
const candidateBuildPaths = [
  path.resolve(__dirname, '../../frontend/build'),
  path.resolve(process.cwd(), 'frontend/build'),
  path.resolve(process.cwd(), '../frontend/build'),
];
const resolvedBuildPath = candidateBuildPaths.find((dir) => fs.existsSync(dir));

if (resolvedBuildPath) {
  app.use(express.static(resolvedBuildPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(resolvedBuildPath, 'index.html'));
  });
}

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

