const { createClient } = require('@supabase/supabase-js');
const { env } = require('./env');

function resolveSupabaseConfig(configEnv = env) {
  const url = configEnv.SUPABASE_URL;
  const anonKey = configEnv.SUPABASE_ANON_KEY;
  const serviceKey = configEnv.SUPABASE_SERVICE_ROLE_KEY;
  const explicitlyEnabled = ['true', '1', 'yes', 'on'].includes(String(configEnv.USE_SUPABASE_AUTH || '').trim().toLowerCase());
  const hasCredentials = Boolean(url && anonKey);
  const isConfigured = explicitlyEnabled && hasCredentials;

  return {
    isConfigured,
    supabaseUrl: url,
    supabaseAnonKey: anonKey,
    supabaseServiceKey: serviceKey,
  };
}

const { isConfigured: isSupabaseConfigured, supabaseUrl, supabaseAnonKey, supabaseServiceKey } = resolveSupabaseConfig(env);

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
  resolveSupabaseConfig,
};

