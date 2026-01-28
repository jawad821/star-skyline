const express = require('express');
const router = express.Router();
const driverStatsController = require('../controllers/driverStatsController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/summary', authMiddleware, driverStatsController.getSummary);
router.get('/bookings', authMiddleware, driverStatsController.getBookings);
router.get('/trends', authMiddleware, driverStatsController.getTrends);
router.get('/earnings', authMiddleware, driverStatsController.getEarnings);
router.get('/vehicle', authMiddleware, driverStatsController.getVehicle);
router.post('/update-status', authMiddleware, driverStatsController.updateBookingStatus);

module.exports = router;
