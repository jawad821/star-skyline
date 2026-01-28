require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function readSettings() {
    const client = await pool.connect();
    try {
        const res = await client.query("SELECT setting_key, setting_value FROM settings WHERE category = 'whatsapp'");
        console.log('Current DB Settings:');
        res.rows.forEach(r => {
            console.log(`${r.setting_key}: ${r.setting_value}`);
        });
    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        pool.end();
    }
}

readSettings();
