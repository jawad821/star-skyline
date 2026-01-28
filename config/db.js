const { Pool } = require('pg');
// Corrected: Removed space from PGHOS T, and ensuring all relevant vars are imported
const { PGUSER, PGHOST, PGDATABASE, PGPASSWORD, PGPORT } = require('./env');

// --- ADD THESE LINES FOR DEBUGGING ---
console.log('--- PG Connection Params ---');
console.log('PGUSER:', PGUSER);
console.log('PGHOST:', PGHOST);
console.log('PGDATABASE:', PGDATABASE);
console.log('PGPORT:', PGPORT);
console.log('PGPASSWORD (length):', PGPASSWORD ? PGPASSWORD.length : 'undefined/null');
console.log('PGPASSWORD (first char):', PGPASSWORD ? PGPASSWORD[0] : 'undefined/null');
console.log('PGPASSWORD (type):', typeof PGPASSWORD);
console.log('----------------------------');
// --- END DEBUGGING LINES ---

const pool = new Pool({
  // Corrected: Using individual parameters instead of connectionString
  user: PGUSER,
  host: PGHOST,
  database: PGDATABASE,
  password: PGPASSWORD,
  port: parseInt(PGPORT, 10), // Ensure port is parsed as an integer
  max: 30,
  idleTimeoutMillis: 60000,
  connectionTimeoutMillis: 30000,
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err);
});

async function query(text, params, retries = 1) {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(text, params);
    return result;
  } catch (err) {
    if (retries > 0 && err.code === '53300') {
      if (client) {
        client.release();
        client = null;
      }
      await new Promise(resolve => setTimeout(resolve, 200));
      return query(text, params, retries - 1);
    }
    throw err;
  } finally {
    if (client) {
      client.release();
    }
  }
}

module.exports = { pool, query };