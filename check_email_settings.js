require('dotenv').config();
const { query } = require('./config/db');
const fs = require('fs');

async function checkEmailSettings() {
    try {
        const result = await query("SELECT setting_key, setting_value FROM settings WHERE category = 'email'");
        const settings = {};
        result.rows.forEach(row => {
            settings[row.setting_key] = row.setting_value;
        });

        const report = {
            db_settings: settings,
            env_settings: {
                SMTP_HOST: process.env.SMTP_HOST,
                SMTP_USER: process.env.SMTP_USER,
                SMTP_FROM: process.env.SMTP_FROM,
                SMTP_PORT: process.env.SMTP_PORT
            }
        };

        fs.writeFileSync('email_settings_result.json', JSON.stringify(report, null, 2));
        console.log('Report written to email_settings_result.json');
        process.exit(0);
    } catch (err) {
        console.error('Error fetching settings:', err);
        process.exit(1);
    }
}

checkEmailSettings();
