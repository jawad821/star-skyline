const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const authMiddleware = require('../middleware/authMiddleware');
const { rbacMiddleware } = require('../middleware/rbacMiddleware');

router.get('/', vehicleController.getAllVehicles);
router.get('/:id', vehicleController.getVehicleById);
router.post('/', authMiddleware, rbacMiddleware(['admin']), vehicleController.createVehicle);
router.put('/:id', authMiddleware, rbacMiddleware(['admin']), vehicleController.updateVehicle);
router.get('/available', vehicleController.getAvailableVehicles);

module.exports = router;
