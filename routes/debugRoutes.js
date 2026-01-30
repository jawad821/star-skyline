const express = require('express');
const router = express.Router();
const { RESEND_API_KEY, RESEND_FROM_EMAIL, ADMIN_EMAIL } = require('../config/env');
const { query } = require('../config/db');
let nodemailer;
try {
    nodemailer = require('nodemailer');
} catch (e) {
    nodemailer = null;
}

router.get('/email', async (req, res) => {
    const report = {
        steps: [],
        errors: [],
        config: {
            adminEmail: ADMIN_EMAIL,
            resendKeyPresent: !!RESEND_API_KEY,
            resendFrom: RESEND_FROM_EMAIL,
            timestamp: new Date().toISOString()
        }
    };

    const addStep = (name, status, details = null) => {
        report.steps.push({ name, status, details, time: new Date().toISOString() });
        if (status === 'FAILED') report.errors.push(`${name}: ${JSON.stringify(details)}`);
    };

    // 1. Check Resend
    if (RESEND_API_KEY) {
        addStep('Check Resend Config', 'OK');
        try {
            addStep('Attempt Resend', 'STARTED');
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${RESEND_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from: RESEND_FROM_EMAIL || 'onboarding@resend.dev',
                    to: ADMIN_EMAIL,
                    subject: '[DEBUG] Resend Test',
                    html: '<p>If you see this, Resend is working!</p>'
                })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || data.name || 'Resend Failed');
            }
            addStep('Attempt Resend', 'SUCCESS', { id: data.id });
        } catch (e) {
            addStep('Attempt Resend', 'FAILED', e.message);
        }
    } else {
        addStep('Check Resend Config', 'SKIPPED', 'No API Key');
    }

    // 2. Check SMTP
    let smtpConfig = {};
    try {
        // Fetch from DB
        const result = await query("SELECT setting_key, setting_value FROM settings WHERE category = 'email'");
        result.rows.forEach(row => smtpConfig[row.setting_key] = row.setting_value);

        if (smtpConfig.smtp_host) {
            addStep('Fetch SMTP Config', 'SUCCESS', { host: smtpConfig.smtp_host, port: smtpConfig.smtp_port, user: smtpConfig.smtp_user });
        } else {
            // Fallback env
            smtpConfig = {
                smtp_host: process.env.SMTP_HOST,
                smtp_port: process.env.SMTP_PORT,
                smtp_user: process.env.SMTP_USER,
                smtp_pass: process.env.SMTP_PASS,
                smtp_secure: process.env.SMTP_SECURE
            };
            addStep('Fetch SMTP Config', 'Info', 'Using Environment Variables');
        }

        if (!smtpConfig.smtp_host) {
            addStep('SMTP Check', 'SKIPPED', 'No Host Configured');
        } else {
            if (!nodemailer) {
                addStep('SMTP Check', 'FAILED', 'Nodemailer not installed');
            } else {
                const transporter = nodemailer.createTransport({
                    host: smtpConfig.smtp_host,
                    port: parseInt(smtpConfig.smtp_port || '465'),
                    secure: smtpConfig.smtp_secure === 'true' || smtpConfig.smtp_port === '465',
                    auth: {
                        user: smtpConfig.smtp_user,
                        pass: smtpConfig.smtp_pass || process.env.SMTP_PASS
                    },
                    connectionTimeout: 10000,
                    greetingTimeout: 5000,
                    socketTimeout: 10000,
                    tls: { rejectUnauthorized: false }
                });

                try {
                    addStep('SMTP Verify Handshake', 'STARTED');
                    await transporter.verify();
                    addStep('SMTP Verify Handshake', 'SUCCESS');

                    addStep('SMTP Send Test', 'STARTED');
                    const info = await transporter.sendMail({
                        from: smtpConfig.smtp_from || process.env.SMTP_FROM || 'test@example.com',
                        to: ADMIN_EMAIL,
                        subject: '[DEBUG] SMTP Test',
                        html: '<p>If you see this, SMTP is working!</p>'
                    });
                    addStep('SMTP Send Test', 'SUCCESS', { id: info.messageId });
                } catch (smtpErr) {
                    addStep('SMTP Connection/Send', 'FAILED', smtpErr.message);
                }
            }
        }

    } catch (dbErr) {
        addStep('DB Connection', 'FAILED', dbErr.message);
    }

    res.json(report);
});

module.exports = router;
