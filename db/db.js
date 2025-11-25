const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err);
});

async function query(text, params, retries = 1) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } catch (err) {
    if (retries > 0 && err.code === '53300') {
      await new Promise(resolve => setTimeout(resolve, 200));
      return query(text, params, retries - 1);
    }
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { pool, query };
