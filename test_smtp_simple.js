require('dotenv').config();
const nodemailer = require('nodemailer');
const { query } = require('./config/db');

async function testSimpleSmtp() {
    console.log("Starting Simple SMTP Test...");

    // 1. Get Config
    let smtpConfig = {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '465'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS // using env for now as DB password is masked in logs usually
        },
        from: process.env.SMTP_FROM || 'info@booking.digitalmindsdemo.com'
    };

    // Try to get password from DB if env is missing it
    if (!smtpConfig.auth.pass) {
        console.log("Fetching password from DB...");
        try {
            const res = await query("SELECT setting_value FROM settings WHERE setting_key = 'smtp_password'");
            if (res.rows.length > 0) {
                smtpConfig.auth.pass = res.rows[0].setting_value;
            }
        } catch (e) {
            console.error("DB Error:", e);
        }
    }

    console.log("Config:", {
        host: smtpConfig.host,
        port: smtpConfig.port,
        user: smtpConfig.auth.user,
        from: smtpConfig.from,
        hasPass: !!smtpConfig.auth.pass
    });

    try {
        const transporter = nodemailer.createTransport(smtpConfig);

        console.log("Verifying connection...");
        await transporter.verify();
        console.log("Connection Verified!");

        console.log("Sending test mail...");
        const info = await transporter.sendMail({
            from: smtpConfig.from, // Try exact match first
            // to: 'jawaddigitalminds@gmail.com', // Use a known safe email or the admin email
            to: 'aizaz.dmp@gmail.com', // Using one from the screenshot
            subject: 'SMTP Test - Simple Text (Sender Blocked Debug)',
            text: 'This is a plain text test email to check if HTML content is triggering the block, or if the sender is strictly blocked.',
        });

        console.log("Email Sent!", info.messageId);
    } catch (err) {
        console.error("SMTP Test Failed:", err);
    }
    process.exit();
}

testSimpleSmtp();
