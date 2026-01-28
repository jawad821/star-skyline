require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function verify() {
    console.log('--- .ENV FILE SETTINGS ---');
    console.log('WHATSAPP_PHONE_ID:', process.env.WHATSAPP_PHONE_ID);
    console.log('WHATSAPP_WABA_ID:', process.env.WHATSAPP_WABA_ID);
    console.log('WHATSAPP_API_TOKEN_PREFIX:', process.env.WHATSAPP_API_TOKEN ? process.env.WHATSAPP_API_TOKEN.substring(0, 15) + '...' : 'MISSING');

    console.log('\n--- DATABASE SETTINGS (Used by App) ---');
    const client = await pool.connect();
    try {
        const res = await client.query("SELECT setting_key, setting_value FROM settings WHERE category = 'whatsapp'");
        const dbSettings = {};
        res.rows.forEach(r => dbSettings[r.setting_key] = r.setting_value);

        console.log('whatsapp_phone_number_id:', dbSettings.whatsapp_phone_number_id);
        console.log('whatsapp_waba_id:', dbSettings.whatsapp_waba_id);
        console.log('whatsapp_access_token_prefix:', dbSettings.whatsapp_access_token ? dbSettings.whatsapp_access_token.substring(0, 15) + '...' : 'MISSING');
        console.log('whatsapp_phone_number:', dbSettings.whatsapp_phone_number);

    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        pool.end();
    }
}

verify();
