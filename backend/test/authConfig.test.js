const test = require('node:test');
const assert = require('node:assert/strict');

const { isSupabaseConfigured } = require('../src/config/supabase');

test('Supabase auth is not enabled when a local DB is configured unless explicitly requested', () => {
  assert.equal(isSupabaseConfigured, false);
});
