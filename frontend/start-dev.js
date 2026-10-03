process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';
process.env.BROWSER = 'none';
process.env.PORT = '3000';
process.env.CI = 'true';

console.log('[DevRunner] Starting CRA start script...');
try {
  require('./node_modules/react-scripts/scripts/start.js');
  console.log('[DevRunner] start.js loaded.');
} catch (e) {
  console.error('[DevRunner] Error:', e);
}
