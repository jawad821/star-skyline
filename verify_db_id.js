require('dotenv').config();
const https = require('https');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function verify() {
    const client = await pool.connect();
    const res = await client.query("SELECT setting_value FROM settings WHERE setting_key = 'whatsapp_access_token'");
    const token = res.rows[0].setting_value;
    client.release();
    pool.end();

    const phoneId = "981588275037351";

    const options = {
        hostname: 'graph.facebook.com',
        path: `/v17.0/${phoneId}?fields=display_phone_number,name_status`,
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    };

    const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            console.log(data);
        });
    });
    req.end();
}

verify();
