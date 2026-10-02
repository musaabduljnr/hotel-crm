const pool = require('../config/db');
const { isSupabaseConfigured, supabaseAdmin } = require('../config/supabase');

async function query(sql, params = []) {
  if (isSupabaseConfigured && supabaseAdmin) {
    return { rows: [], error: 'Supabase mode is enabled. Use Supabase client queries instead of raw MySQL queries.' };
  }

  const [rows] = await pool.query(sql, params);
  return { rows };
}

module.exports = {
  query,
};
