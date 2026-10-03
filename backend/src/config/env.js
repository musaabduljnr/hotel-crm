const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

const requiredEnv = ['JWT_SECRET'];
const legacyDbRequired = ['DB_HOST', 'DB_USER', 'DB_NAME'];
const hasSupabaseCredentials = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);
const explicitSupabaseFlag = process.env.USE_SUPABASE_AUTH;
const useSupabaseAuth = explicitSupabaseFlag === undefined
  ? hasSupabaseCredentials
  : ['true', '1', 'yes', 'on'].includes(String(explicitSupabaseFlag).trim().toLowerCase());

const missing = requiredEnv.filter((key) => !process.env[key] || process.env[key].includes('replace_this_with_a_long_random_secret_key'));
const hasDatabaseUrl = Boolean(process.env.DATABASE_URL || process.env.MYSQL_URL);
const legacyDbMissing = hasDatabaseUrl ? [] : legacyDbRequired.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.warn(`Missing or placeholder environment values for: ${missing.join(', ')}. Set them before production deployment.`);
}

if (hasSupabaseCredentials && !useSupabaseAuth) {
  console.info('Supabase credentials were detected, but auth is disabled. Local MySQL auth remains active unless USE_SUPABASE_AUTH=true.');
}

if (useSupabaseAuth && !hasSupabaseCredentials) {
  throw new Error('USE_SUPABASE_AUTH=true requires SUPABASE_URL and SUPABASE_ANON_KEY to be configured.');
}

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.includes('replace_this_with_a_long_random_secret_key')) {
  throw new Error('JWT_SECRET must be set to a real secret in the environment before starting the application.');
}

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  env: process.env,
  isProduction,
  requiredEnv,
  missing,
  legacyDbRequired,
  legacyDbMissing,
  useSupabaseAuth,
};
