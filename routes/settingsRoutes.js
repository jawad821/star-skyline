const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Get all settings
router.get('/', settingsController.getSettings);

// Update company settings
router.put('/company', settingsController.updateCompanySettings);

// Update app settings
router.put('/app', settingsController.updateAppSettings);

// Update user password
router.put('/password', settingsController.updateUserPassword);

// Get system info
router.get('/system-info', settingsController.getSystemInfo);

// Update WhatsApp settings
router.put('/whatsapp', settingsController.updateWhatsAppSettings);

// Update WhatsApp templates
router.put('/whatsapp-templates', settingsController.updateWhatsAppTemplates);

// Test WhatsApp connection
router.post('/test-whatsapp', settingsController.testWhatsAppConnection);

// Test WhatsApp Template
router.post('/whatsapp/test-template', settingsController.testWhatsAppTemplate);

// Update user profile
router.put('/profile', settingsController.updateUserProfile);

// Update SMTP Email Settings
router.put('/email', settingsController.updateEmailSettings);

module.exports = router;
