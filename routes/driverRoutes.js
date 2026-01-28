const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');
const authMiddleware = require('../middleware/authMiddleware');
const { rbacMiddleware } = require('../middleware/rbacMiddleware');

router.get('/', driverController.getAllDrivers);
router.get('/available', driverController.getAvailableDrivers);
router.get('/:id', authMiddleware, driverController.getDriverById);
router.put('/:id', authMiddleware, rbacMiddleware(['admin']), driverController.updateDriver);
router.post('/', authMiddleware, rbacMiddleware(['admin', 'operator']), driverController.createDriver);
router.delete('/:id', authMiddleware, rbacMiddleware(['admin']), driverController.deleteDriver);

module.exports = router;
