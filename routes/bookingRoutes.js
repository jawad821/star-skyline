const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const addBookingController = require('../controllers/addBookingController');
const vehicleController = require('../controllers/vehicleController');
const authMiddleware = require('../middleware/authMiddleware');
const { rbacMiddleware, operatorRestrictions } = require('../middleware/rbacMiddleware');

router.get('/', authMiddleware, bookingController.getAllBookings);
router.post('/calculate-fare', bookingController.calculateFare);
router.get('/available-vehicles', vehicleController.getAvailableVehicles);
router.get('/suggest-vehicles', vehicleController.suggestVehicles);
router.get('/:id', authMiddleware, bookingController.getBookingById);
router.put('/:id', authMiddleware, rbacMiddleware(['admin', 'operator']), bookingController.updateBooking);
router.post('/create-booking', authMiddleware, rbacMiddleware(['admin', 'operator']), operatorRestrictions, bookingController.createBooking);
router.post('/create-manual', authMiddleware, rbacMiddleware(['admin']), addBookingController.createManualBooking);
router.post('/assign-vehicle', authMiddleware, rbacMiddleware(['admin', 'operator']), operatorRestrictions, bookingController.assignVehicle);
router.post('/assign-driver', authMiddleware, rbacMiddleware(['admin']), bookingController.assignDriver);
router.post('/assign-vehicle-type', authMiddleware, rbacMiddleware(['admin']), bookingController.assignVehicleType);
router.post('/resend-notifications', authMiddleware, rbacMiddleware(['admin']), bookingController.resendNotifications);
router.post('/create-multi-stop', authMiddleware, rbacMiddleware(['admin', 'operator']), bookingController.createMultiStopBooking);
router.post('/create-round-trip', authMiddleware, rbacMiddleware(['admin', 'operator']), bookingController.createRoundTripBooking);

module.exports = router;
