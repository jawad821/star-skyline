const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');
const { rbacMiddleware } = require('../middleware/rbacMiddleware');

router.get('/', authMiddleware, rbacMiddleware(['admin']), notificationController.getNotifications);

module.exports = router;
