const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', vehicleController.getAvailableVehicles);
router.get('/:id', vehicleController.getVehicleById);
router.post('/', authMiddleware, vehicleController.createVehicle);

module.exports = router;
