const { query } = require('../config/db');
const fs = require('fs');
const path = require('path');

async function runFix() {
    console.log('🚀 Starting Database Fix: Creating "call_sessions" table...');

    const sqlPath = path.join(__dirname, 'fix_missing_call_sessions.sql');
    if (!fs.existsSync(sqlPath)) {
        console.error('❌ Error: fix_missing_call_sessions.sql not found at ' + sqlPath);
        process.exit(1);
    }

    const sql = fs.readFileSync(sqlPath, 'utf8');

    try {
        console.log('📡 Connecting to database...');
        await query(sql);
        console.log('✅ Success: "call_sessions" table created or already exists.');

        // Minor verification
        const check = await query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'call_sessions')");
        if (check.rows[0].exists) {
            console.log('🛡️ Verification: Table "call_sessions" confirmed in database.');
        } else {
            console.log('⚠️ Warning: Query finished but table not found in schema.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Database Error:', error.message);
        process.exit(1);
    }
}

runFix();
