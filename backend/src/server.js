const http = require('http');
const app = require('./app');
const { env } = require('./config/env');
const { testConnection } = require('./config/db');

const PORT = Number(env.PORT) || 5000;

const server = http.createServer(app);

async function startServer() {
  try {
    await testConnection();
    server.listen(PORT, () => {
      console.log(`Hotel CRM API running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Database startup check failed.');
    console.error(error.message);
    process.exit(1);
  }
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
