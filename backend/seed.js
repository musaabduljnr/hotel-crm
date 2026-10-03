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

  console.log(`\nSeeding default admin user (${email})...`);

  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      const created = await seedSupabaseAdmin(name, email, password);
      if (created) {
        process.exit(0);
      }
    } catch (sbErr) {
      console.warn(`[Notice] Supabase connection: ${sbErr.message}`);
      console.warn('Note: If your Supabase project is paused or offline, unpause it in the Supabase Dashboard.');
    }
  }

  try {
    await seedLegacyAdmin(name, email, password);
    process.exit(0);
  } catch (err) {
    console.warn(`[Notice] Database connection: ${err.message || 'Not reachable'}`);
    console.log('\n----------------------------------------');
    console.log('Default Admin Account Information:');
    console.log(`  Name:     ${name}`);
    console.log(`  Email:    ${email}`);
    console.log(`  Password: ${password}`);
    console.log('----------------------------------------');
    console.log('To seed your database tables directly in Supabase:');
    console.log('Open Supabase SQL Editor and run database/seed.sql\n');
    process.exit(0);
  }
}

seed();
