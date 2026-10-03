const test = require('node:test');
const assert = require('node:assert/strict');

const { resolveSupabaseConfig } = require('../src/config/supabase');

test('Supabase auth is disabled when not explicitly enabled', () => {
  const result = resolveSupabaseConfig({
    USE_SUPABASE_AUTH: 'false',
    SUPABASE_URL: 'https://example.supabase.co',
    SUPABASE_ANON_KEY: 'test-anon-key',
  });
  assert.equal(result.isConfigured, false);
});

test('Supabase auth is disabled when credentials are missing even if flag is true', () => {
  const result = resolveSupabaseConfig({
    USE_SUPABASE_AUTH: 'true',
  });
  assert.equal(result.isConfigured, false);
});

test('Supabase auth is enabled when explicitly set to true and credentials exist', () => {
  const result = resolveSupabaseConfig({
    USE_SUPABASE_AUTH: 'true',
    SUPABASE_URL: 'https://example.supabase.co',
    SUPABASE_ANON_KEY: 'test-anon-key',
  });
  assert.equal(result.isConfigured, true);
});

