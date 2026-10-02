const mysql = require('mysql2/promise');
const { env } = require('./env');

const pool = mysql.createPool({
  host: env.DB_HOST || 'localhost',
  port: Number(env.DB_PORT) || 3306,
  user: env.DB_USER || 'root',
  password: env.DB_PASSWORD || '',
  database: env.DB_NAME || 'hotel_crm',
  waitForConnections: true,
  connectionLimit: Number(env.DB_POOL_LIMIT) || 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  multipleStatements: false,
});

async function testConnection() {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.ping();
    return true;
  } catch (error) {
    const message = error?.message || 'Unknown database error';
    const hint = 'MySQL is not reachable. Configure DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, and DB_NAME in the backend .env file before starting the app.';
    throw new Error(`${message}. ${hint}`);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

module.exports = pool;
module.exports.testConnection = testConnection;
