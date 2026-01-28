require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function updateSettings() {
    const client = await pool.connect();
    try {
        const token = process.env.WHATSAPP_API_TOKEN;
        const phoneId = process.env.WHATSAPP_PHONE_ID;
        const wabaId = process.env.WHATSAPP_WABA_ID;
        const phoneInfo = "+971567351760";

        console.log('Updating DB with:');
        console.log('Token:', token.substring(0, 15) + '...');
        console.log('Phone ID:', phoneId);
        console.log('WABA ID:', wabaId);

        const updates = [
            { key: 'whatsapp_access_token', value: token },
            { key: 'whatsapp_phone_number_id', value: phoneId },
            { key: 'whatsapp_waba_id', value: wabaId },
            { key: 'whatsapp_provider', value: 'meta' },
            { key: 'whatsapp_phone_number', value: phoneInfo }
        ];

        for (const u of updates) {
            const query = `
            INSERT INTO settings (setting_key, setting_value, category, updated_at)
            VALUES ($1, $2, 'whatsapp', NOW())
            ON CONFLICT (setting_key) 
            DO UPDATE SET setting_value = $2, updated_at = NOW()
        `;
            await client.query(query, [u.key, u.value]);
            console.log(`Updated ${u.key}`);
        }
        console.log('All Knowledge Updated.');
    } catch (err) {
        console.error('Error updating DB:', err);
    } finally {
        client.release();
        pool.end();
    }
}

updateSettings();
