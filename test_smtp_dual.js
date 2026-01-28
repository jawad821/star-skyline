require('dotenv').config();
const nodemailer = require('nodemailer');
const { query } = require('./config/db');

async function testSimpleSmtp() {
    console.log("Starting Simple SMTP Test (Dual Port)...");

    // 1. Get Config
    let baseConfig = {
        host: process.env.SMTP_HOST || 'booking.digitalmindsdemo.com',
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
        from: process.env.SMTP_FROM
    };

    if (!baseConfig.pass) {
        console.log("Fetching password from DB...");
        try {
            const res = await query("SELECT setting_value FROM settings WHERE setting_key = 'smtp_password'");
            if (res.rows.length > 0) baseConfig.pass = res.rows[0].setting_value;
        } catch (e) { }
    }

    const ports = [
        { port: 465, secure: true },
        { port: 587, secure: false }
    ];

    for (const p of ports) {
        console.log(`\nTesting Port ${p.port} (secure: ${p.secure})...`);
        try {
            const transporter = nodemailer.createTransport({
                host: baseConfig.host,
                port: p.port,
                secure: p.secure,
                auth: { user: baseConfig.user, pass: baseConfig.pass }
            });

            await transporter.verify();
            console.log(`✅ Connection Verified on Port ${p.port}!`);

            const info = await transporter.sendMail({
                from: baseConfig.from,
                to: 'aizaz.dmp@gmail.com',
                subject: `SMTP Test Port ${p.port}`,
                text: 'This is a test email.'
            });
            console.log(`✅ Email Sent on Port ${p.port}! ID: ${info.messageId}`);
            process.exit(0); // Exit on first success
        } catch (err) {
            console.error(`❌ Failed on Port ${p.port}: ${err.code || err.message}`);
            if (err.response) console.error("Server Response:", err.response);
        }
    }
    console.log("All attempts failed.");
    process.exit(1);
}

testSimpleSmtp();
