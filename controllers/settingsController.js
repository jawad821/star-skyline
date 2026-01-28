const { query } = require('../config/db');
const bcrypt = require('bcrypt');
const notificationService = require('../services/notificationService');

// Get all settings
exports.getSettings = async (req, res) => {
    try {
        const result = await query('SELECT * FROM settings ORDER BY category, setting_key');

        // Group settings by category
        const settings = result.rows.reduce((acc, row) => {
            if (!acc[row.category]) {
                acc[row.category] = {};
            }
            acc[row.category][row.setting_key] = row.setting_value;
            return acc;
        }, {});

        res.json({ success: true, data: settings });
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ success: false, message: 'Error fetching settings' });
    }
};

// Update company settings
exports.updateCompanySettings = async (req, res) => {
    try {
        const { company_name, company_email, company_phone, company_address } = req.body;
        const userId = req.user?.id || req.user?.email || 'admin';

        const updates = [
            { key: 'company_name', value: company_name },
            { key: 'company_email', value: company_email },
            { key: 'company_phone', value: company_phone },
            { key: 'company_address', value: company_address }
        ];

        for (const update of updates) {
            if (update.value !== undefined) {
                await query(`
          INSERT INTO settings (setting_key, setting_value, category, updated_by, updated_at)
          VALUES ($1, $2, 'company', $3, NOW())
          ON CONFLICT (setting_key) 
          DO UPDATE SET setting_value = $2, updated_by = $3, updated_at = NOW()
        `, [update.key, update.value, userId]);
            }
        }

        res.json({ success: true, message: 'Company settings updated successfully' });
    } catch (error) {
        console.error('Error updating company settings:', error);
        res.status(500).json({ success: false, message: 'Error updating company settings' });
    }
};

// Update app settings
exports.updateAppSettings = async (req, res) => {
    try {
        const { default_currency, timezone, google_maps_api_key } = req.body;
        const userId = req.user?.id || req.user?.email || 'admin';

        const updates = [
            { key: 'default_currency', value: default_currency, category: 'app' },
            { key: 'timezone', value: timezone, category: 'app' },
            { key: 'google_maps_api_key', value: google_maps_api_key, category: 'api' }
        ];

        for (const update of updates) {
            if (update.value !== undefined) {
                await query(`
          INSERT INTO settings (setting_key, setting_value, category, updated_by, updated_at)
          VALUES ($1, $2, $3, $4, NOW())
          ON CONFLICT (setting_key) 
          DO UPDATE SET setting_value = $2, category = $3, updated_by = $4, updated_at = NOW()
        `, [update.key, update.value, update.category, userId]);
            }
        }

        res.json({ success: true, message: 'App settings updated successfully' });
    } catch (error) {
        console.error('Error updating app settings:', error);
        res.status(500).json({ success: false, message: 'Error updating app settings' });
    }
};

// Update user password
exports.updateUserPassword = async (req, res) => {
    try {
        const { current_password, new_password, confirm_password } = req.body;
        const userId = req.user?.id || req.user?.email;

        if (!current_password || !new_password || !confirm_password) {
            return res.status(400).json({ success: false, message: 'All password fields are required' });
        }

        if (new_password !== confirm_password) {
            return res.status(400).json({ success: false, message: 'New passwords do not match' });
        }

        if (new_password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        }

        // Get current user
        const userResult = await query('SELECT * FROM users WHERE email = $1 OR id = $1', [userId]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const user = userResult.rows[0];

        // Verify current password
        const validPassword = await bcrypt.compare(current_password, user.password);
        if (!validPassword) {
            return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(new_password, 10);

        // Update password
        await query('UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2', [hashedPassword, user.id]);

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ success: false, message: 'Error updating password' });
    }
};

// Get system info
exports.getSystemInfo = async (req, res) => {
    try {
        const versionResult = await query("SELECT setting_value FROM settings WHERE setting_key = 'dashboard_version'");
        const version = versionResult.rows[0]?.setting_value || '2.1.0';

        const userResult = await query('SELECT COUNT(*) FROM users');
        const driverResult = await query('SELECT COUNT(*) FROM drivers');
        const vehicleResult = await query('SELECT COUNT(*) FROM vehicles');
        const bookingResult = await query('SELECT COUNT(*) FROM bookings');

        res.json({
            success: true,
            data: {
                version,
                totalUsers: userResult.rows[0].count,
                totalDrivers: driverResult.rows[0].count,
                totalVehicles: vehicleResult.rows[0].count,
                totalBookings: bookingResult.rows[0].count,
                currentUser: req.user?.email || 'Unknown',
                serverTime: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error fetching system info:', error);
        res.status(500).json({ success: false, message: 'Error fetching system info' });
    }
};

// Update WhatsApp settings
exports.updateWhatsAppSettings = async (req, res) => {
    try {
        const {
            whatsapp_provider,
            whatsapp_phone_number,
            whatsapp_webhook_url,
            whatsapp_access_token,
            whatsapp_waba_id,
            whatsapp_phone_number_id,
            whatsapp_api_key
        } = req.body;
        const userId = req.user?.id || req.user?.email || 'admin';

        const updates = [
            { key: 'whatsapp_provider', value: whatsapp_provider },
            { key: 'whatsapp_phone_number', value: whatsapp_phone_number },
            { key: 'whatsapp_webhook_url', value: whatsapp_webhook_url }
        ];

        // Add Meta-specific fields if provider is Meta
        if (whatsapp_provider === 'meta') {
            updates.push(
                { key: 'whatsapp_access_token', value: whatsapp_access_token },
                { key: 'whatsapp_waba_id', value: whatsapp_waba_id },
                { key: 'whatsapp_phone_number_id', value: whatsapp_phone_number_id }
            );
        } else {
            // Add generic API key for other providers
            updates.push({ key: 'whatsapp_api_key', value: whatsapp_api_key });
        }

        for (const update of updates) {
            if (update.value !== undefined && update.value !== null) {
                await query(`
          INSERT INTO settings (setting_key, setting_value, category, updated_by, updated_at)
          VALUES ($1, $2, 'whatsapp', $3, NOW())
          ON CONFLICT (setting_key) 
          DO UPDATE SET setting_value = $2, updated_by = $3, updated_at = NOW()
        `, [update.key, update.value, userId]);
            }
        }

        res.json({ success: true, message: 'WhatsApp settings updated successfully' });
    } catch (error) {
        console.error('Error updating WhatsApp settings:', error);
        res.status(500).json({ success: false, message: 'Error updating WhatsApp settings' });
    }
};

// Update WhatsApp templates
exports.updateWhatsAppTemplates = async (req, res) => {
    try {
        const { whatsapp_booking_template, whatsapp_driver_template, whatsapp_completed_template } = req.body;
        const userId = req.user?.id || req.user?.email || 'admin';

        const updates = [
            { key: 'whatsapp_booking_template', value: whatsapp_booking_template },
            { key: 'whatsapp_driver_template', value: whatsapp_driver_template },
            { key: 'whatsapp_completed_template', value: whatsapp_completed_template }
        ];

        for (const update of updates) {
            if (update.value !== undefined) {
                await query(`
          INSERT INTO settings (setting_key, setting_value, category, updated_by, updated_at)
          VALUES ($1, $2, 'whatsapp', $3, NOW())
          ON CONFLICT (setting_key) 
          DO UPDATE SET setting_value = $2, updated_by = $3, updated_at = NOW()
        `, [update.key, update.value, userId]);
            }
        }

        res.json({ success: true, message: 'WhatsApp templates updated successfully' });
    } catch (error) {
        console.error('Error updating WhatsApp templates:', error);
        res.status(500).json({ success: false, message: 'Error updating WhatsApp templates' });
    }
};

// Test WhatsApp connection
exports.testWhatsAppConnection = async (req, res) => {
    try {
        // Get WhatsApp settings from database
        const settingsResult = await query(
            "SELECT setting_key, setting_value FROM settings WHERE category = 'whatsapp'"
        );

        const settings = {};
        settingsResult.rows.forEach(row => {
            settings[row.setting_key] = row.setting_value;
        });

        const provider = settings.whatsapp_provider;

        if (provider === 'meta') {
            // Test Meta/Facebook WhatsApp Cloud API
            const accessToken = settings.whatsapp_access_token;
            const wabaId = settings.whatsapp_waba_id;
            const phoneNumberId = settings.whatsapp_phone_number_id;

            if (!accessToken || !phoneNumberId) {
                return res.json({
                    success: false,
                    message: 'Please configure Access Token and Phone Number ID first'
                });
            }

            // Test by fetching phone number info from Meta Graph API
            const https = require('https');

            const testConnection = () => {
                return new Promise((resolve, reject) => {
                    const options = {
                        hostname: 'graph.facebook.com',
                        path: `/v22.0/${phoneNumberId}?fields=id,display_phone_number,verified_name,quality_rating`,
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${accessToken}`
                        }
                    };

                    const req = https.request(options, (response) => {
                        let data = '';
                        response.on('data', (chunk) => data += chunk);
                        response.on('end', () => {
                            try {
                                resolve(JSON.parse(data));
                            } catch (e) {
                                reject(e);
                            }
                        });
                    });

                    req.on('error', reject);
                    req.end();
                });
            };

            const result = await testConnection();

            if (result.error) {
                return res.json({
                    success: false,
                    message: `Connection failed: ${result.error.message}`
                });
            }

            res.json({
                success: true,
                message: `âœ… Connected successfully! Phone: ${result.display_phone_number}, Name: ${result.verified_name}`
            });
        } else if (provider) {
            // Other providers - simple check that settings exist
            res.json({
                success: true,
                message: `Settings configured for ${provider}. Please test manually using your provider's dashboard.`
            });
        } else {
            res.json({
                success: false,
                message: 'Please select a provider and configure your settings first'
            });
        }
    } catch (error) {
        console.error('Error testing WhatsApp connection:', error);
        res.status(500).json({ success: false, message: 'Error testing WhatsApp connection: ' + error.message });
    }
};

// Test WhatsApp Template
exports.testWhatsAppTemplate = async (req, res) => {
    try {
        const { phone, templateName, components } = req.body;

        if (!phone || !templateName) {
            return res.status(400).json({ success: false, message: 'Phone number and template name are required' });
        }

        const result = await notificationService.sendWhatsAppTemplate(phone, templateName, 'en_US', components);

        if (result.success) {
            res.json({ success: true, message: 'Template sent successfully', data: result });
        } else {
            res.status(500).json({ success: false, message: 'Failed to send template: ' + result.error });
        }
    } catch (error) {
        console.error('Error sending WhatsApp template:', error);
        res.status(500).json({ success: false, message: 'Error sending WhatsApp template' });
    }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
    try {
        const { username, email } = req.body;
        const userId = req.user?.id || req.user?.email;

        if (!username && !email) {
            return res.status(400).json({ success: false, message: 'Username or email is required' });
        }

        // Get current user
        const userResult = await query('SELECT * FROM users WHERE email = $1 OR id = $1', [userId]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const user = userResult.rows[0];

        // Check if email already exists for another user
        if (email && email !== user.email) {
            const emailCheck = await query('SELECT * FROM users WHERE email = $1 AND id != $2', [email, user.id]);
            if (emailCheck.rows.length > 0) {
                return res.status(400).json({ success: false, message: 'Email already exists' });
            }
        }

        // Update user
        await query('UPDATE users SET name = $1, email = $2, updated_at = NOW() WHERE id = $3',
            [username || user.name, email || user.email, user.id]);

        res.json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ success: false, message: 'Error updating profile' });
    }
};


// Update SMTP Email Settings
exports.updateEmailSettings = async (req, res) => {
    try {
        const { smtp_host, smtp_port, smtp_user, smtp_password, smtp_from, smtp_secure } = req.body;
        const userId = req.user?.id || req.user?.email || 'admin';

        const updates = [
            { key: 'smtp_host', value: smtp_host },
            { key: 'smtp_port', value: smtp_port },
            { key: 'smtp_user', value: smtp_user },
            { key: 'smtp_password', value: smtp_password },
            { key: 'smtp_from', value: smtp_from },
            { key: 'smtp_secure', value: smtp_secure }
        ];

        for (const update of updates) {
            if (update.value !== undefined && update.value !== null) {
                await query(`
          INSERT INTO settings (setting_key, setting_value, category, updated_by, updated_at)
          VALUES ($1, $2, 'email', $3, NOW())
          ON CONFLICT (setting_key) 
          DO UPDATE SET setting_value = $2, updated_by = $3, updated_at = NOW()
        `, [update.key, update.value, userId]);
            }
        }

        res.json({ success: true, message: 'SMTP settings updated successfully' });
    } catch (error) {
        console.error('Error updating SMTP settings:', error);
        res.status(500).json({ success: false, message: 'Error updating SMTP settings' });
    }
};

