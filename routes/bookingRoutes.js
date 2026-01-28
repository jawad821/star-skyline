const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const addBookingController = require('../controllers/addBookingController');
const vehicleController = require('../controllers/vehicleController');
const rentalRulesController = require('../controllers/rentalRulesController');
const wordpressBookingController = require('../controllers/wordpressBookingController');
const formController = require('../controllers/formController');
const authMiddleware = require('../middleware/authMiddleware');
const { rbacMiddleware, operatorRestrictions } = require('../middleware/rbacMiddleware');

// Public WordPress endpoints (no auth required)
router.get('/wordpress-form', formController.getBookingForm);
router.get('/vehicle-details', formController.getVehicleDetails);
router.get('/guest-info', formController.getGuestInfo);
router.get('/billing', formController.getBillingDetails);
router.get('/success', formController.getSuccessPage);
router.get('/status', formController.getBookingStatus);
router.post('/wordpress-booking', wordpressBookingController.createWordPressBooking);
router.post('/wordpress-calculate-fare', wordpressBookingController.calculateWordPressFare);

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
router.delete('/:id', authMiddleware, rbacMiddleware(['admin']), bookingController.deleteBooking);
router.post('/create-multi-stop', authMiddleware, rbacMiddleware(['admin', 'operator']), bookingController.createMultiStopBooking);
router.post('/create-round-trip', authMiddleware, rbacMiddleware(['admin', 'operator']), bookingController.createRoundTripBooking);

// Rental Routes
router.post('/create-hourly-rental', authMiddleware, rbacMiddleware(['admin', 'operator']), addBookingController.createHourlyRentalBooking);
router.get('/rental-rules/all', authMiddleware, rbacMiddleware(['admin']), rentalRulesController.getAllRentalRules);
router.get('/rental-rules/:vehicleType', authMiddleware, rbacMiddleware(['admin']), rentalRulesController.getRentalRule);
router.put('/rental-rules/:vehicleType', authMiddleware, rbacMiddleware(['admin']), rentalRulesController.updateRentalRule);
router.post('/rental-rules/create', authMiddleware, rbacMiddleware(['admin']), rentalRulesController.createRentalRule);
router.post('/rental-rules/calculate-fare', authMiddleware, rentalRulesController.calculateRentalFare);

module.exports = router;
