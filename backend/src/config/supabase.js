const { createClient } = require('@supabase/supabase-js');
const { env } = require('./env');

const supabaseUrl = env.SUPABASE_URL;
const supabaseAnonKey = env.SUPABASE_ANON_KEY;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseExplicitlyEnabled = ['true', '1', 'yes', 'on'].includes(String(env.USE_SUPABASE_AUTH || '').trim().toLowerCase());
const hasSupabaseCredentials = Boolean(supabaseUrl && supabaseAnonKey);

const isSupabaseConfigured = supabaseExplicitlyEnabled && hasSupabaseCredentials;

const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

const supabaseAdmin = isSupabaseConfigured && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

module.exports = {
  supabase,
  supabaseAdmin,
  isSupabaseConfigured,
};
