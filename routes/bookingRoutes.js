const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const vehicleController = require('../controllers/vehicleController');
const authMiddleware = require('../middleware/authMiddleware');
const { rbacMiddleware, operatorRestrictions } = require('../middleware/rbacMiddleware');

router.post('/calculate-fare', bookingController.calculateFare);
router.get('/available-vehicles', vehicleController.getAvailableVehicles);
router.post('/create-booking', authMiddleware, rbacMiddleware(['admin', 'operator']), operatorRestrictions, bookingController.createBooking);
router.post('/assign-vehicle', authMiddleware, rbacMiddleware(['admin', 'operator']), operatorRestrictions, bookingController.assignVehicle);
router.post('/assign-driver', authMiddleware, rbacMiddleware(['admin']), bookingController.assignDriver);
router.post('/assign-vehicle-type', authMiddleware, rbacMiddleware(['admin']), bookingController.assignVehicleType);
router.post('/resend-notifications', authMiddleware, rbacMiddleware(['admin']), bookingController.resendNotifications);

module.exports = router;
