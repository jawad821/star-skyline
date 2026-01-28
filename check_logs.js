const { query } = require('./config/db');
require('dotenv').config();

async function checkLogs() {
    try {
        console.log('Checking audit logs...');
        const res = await query('SELECT COUNT(*) as count FROM audit_logs');
        console.log('Total logs:', res.rows[0].count);

        const recent = await query('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 5');
        console.log('Recent logs:');
        console.log(JSON.stringify(recent.rows, null, 2));
        process.exit(0);
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}

checkLogs();
