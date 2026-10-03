const http = require('http');
const app = require('./app');
const { env } = require('./config/env');
const { testConnection } = require('./config/db');

const PORT = Number(env.PORT) || 5000;

const server = http.createServer(app);

async function startServer() {
  try {
    await testConnection();
    console.log('Database connection check passed.');
  } catch (error) {
    console.warn('Database startup check warning:', error.message);
    console.warn('The API server will continue running so health checks and web service remain live, but database queries require DATABASE_URL configured.');
  }

  server.listen(PORT, () => {
    console.log(`Hotel CRM API running on http://localhost:${PORT}`);
  });
}


startServer();

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully.');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully.');
  server.close(() => process.exit(0));
});
