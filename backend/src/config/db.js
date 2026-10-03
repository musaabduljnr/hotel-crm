const mysql = require('mysql2/promise');
const { env } = require('./env');

const databaseUri = env.DATABASE_URL || env.MYSQL_URL;
const sslConfig = env.DB_SSL === 'true' || env.DB_SSL === '1' ? { rejectUnauthorized: false } : undefined;

const poolConfig = databaseUri
  ? {
      uri: databaseUri,
      waitForConnections: true,
      connectionLimit: Number(env.DB_POOL_LIMIT) || 10,
      queueLimit: 0,
      charset: 'utf8mb4',
      ...(sslConfig ? { ssl: sslConfig } : {}),
    }
  : {
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
      ...(sslConfig ? { ssl: sslConfig } : {}),
    };

const pool = mysql.createPool(poolConfig);


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
