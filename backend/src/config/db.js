const { env } = require('./env');
const { isSupabaseConfigured, supabase } = require('./supabase');

const databaseUri = env.DATABASE_URL || env.MYSQL_URL;
const isPostgres = Boolean(databaseUri && (databaseUri.startsWith('postgres://') || databaseUri.startsWith('postgresql://')));
const sslConfig = env.DB_SSL === 'false' || env.DB_SSL === '0' ? false : { rejectUnauthorized: false };

let pool;

if (isPostgres) {
  const { Pool } = require('pg');
  const pgPool = new Pool({
    connectionString: databaseUri,
    ssl: sslConfig,
  });

  pool = {
    async query(sql, params = []) {
      let i = 0;
      let pgSql = sql.replace(/\?/g, () => `$${++i}`);
      if (/^\s*INSERT\s+INTO/i.test(pgSql) && !/RETURNING/i.test(pgSql)) {
        pgSql += ' RETURNING id';
      }
      const res = await pgPool.query(pgSql, params);
      const insertId = res.rows[0]?.id;
      const resultObj = {
        insertId,
        affectedRows: res.rowCount,
      };
      return [res.rows, resultObj];
    },
    async execute(sql, params = []) {
      return this.query(sql, params);
    },
    async getConnection() {
      const client = await pgPool.connect();
      return {
        async ping() {
          await client.query('SELECT 1');
        },
        release() {
          client.release();
        },
      };
    },
  };
} else {
  const mysql = require('mysql2/promise');
  const poolConfig = databaseUri
    ? {
        uri: databaseUri,
        waitForConnections: true,
        connectionLimit: Number(env.DB_POOL_LIMIT) || 10,
        queueLimit: 0,
        charset: 'utf8mb4',
        ...(env.DB_SSL === 'true' || env.DB_SSL === '1' ? { ssl: { rejectUnauthorized: false } } : {}),
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
        ...(env.DB_SSL === 'true' || env.DB_SSL === '1' ? { ssl: { rejectUnauthorized: false } } : {}),
      };

  pool = mysql.createPool(poolConfig);
}

async function testConnection() {
  if (isSupabaseConfigured && !databaseUri && supabase) {
    try {
      const { error } = await supabase.from('rooms').select('id').limit(1);
      if (error && error.code !== 'PGRST116') {
        console.warn('Supabase HTTP check notice:', error.message);
      }
      return true;
    } catch (err) {
      console.warn('Supabase ping check notice:', err.message);
      return true;
    }
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.ping();
    return true;
  } catch (error) {
    const message = error?.message || 'Unknown database error';
    const hint = 'Database is not reachable. On Render, set DATABASE_URL (either PostgreSQL/Supabase URI or MySQL URI) in your Environment Variables.';
    throw new Error(`${message}. ${hint}`);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

module.exports = pool;
module.exports.testConnection = testConnection;

