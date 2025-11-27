const { Pool } = require('pg');
const { DATABASE_URL } = require('./env');

const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 45000,
  connectionTimeoutMillis: 10000,
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
