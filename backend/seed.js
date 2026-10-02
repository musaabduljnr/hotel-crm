// Run with: npm run seed
// Creates the default admin account defined in .env. When Supabase is configured,
// the admin user is created through the Supabase admin API so the app can log in
// immediately. If Supabase is not configured, we gracefully fall back to the legacy
// MySQL users table for local database-only setups.

require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./config/db');
const { supabaseAdmin, isSupabaseConfigured } = require('./src/config/supabase');

async function seedSupabaseAdmin(name, email, password) {
  if (!isSupabaseConfigured || !supabaseAdmin) {
    return false;
  }

  const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  if (listError) {
    throw listError;
  }

  const existing = usersData.users.find((user) => user.email && user.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    console.log(`Admin account already exists for ${email}. Nothing to do.`);
    return true;
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: name,
      role: 'admin',
    },
  });

  if (error) {
    throw error;
  }

  console.log('Admin account created successfully:');
  console.log(`  Email:    ${email}`);
  console.log(`  Password: ${password}`);
  console.log('You can log in with these credentials, then change the password.');
  console.log(`  Supabase user id: ${data?.user?.id || 'n/a'}`);
  return true;
}

async function seedLegacyAdmin(name, email, password) {
  const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);

  if (existing.length > 0) {
    console.log(`Admin account already exists for ${email}. Nothing to do.`);
    return true;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await pool.query(
    'INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    [name, email, passwordHash, 'admin']
  );

  console.log('Admin account created successfully:');
  console.log(`  Email:    ${email}`);
  console.log(`  Password: ${password}`);
  console.log('You can log in with these credentials, then change the password.');
  return true;
}

async function seed() {
  const name = process.env.ADMIN_NAME || 'System Administrator';
  const email = process.env.ADMIN_EMAIL || 'admin@hotelcrm.com';
  const password = process.env.ADMIN_PASSWORD || 'Admin@123';

  try {
    if (isSupabaseConfigured && supabaseAdmin) {
      const created = await seedSupabaseAdmin(name, email, password);
      if (created) {
        process.exit(0);
      }
    }

    await seedLegacyAdmin(name, email, password);
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err.message || err);
    process.exit(1);
  }
}

seed();
