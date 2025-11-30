const express = require('express');
const statsController = require('../controllers/statsController');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.get('/summary', asyncHandler(statsController.getSummary));
router.get('/bookings', asyncHandler(statsController.getBookings));
router.get('/earnings-breakdown', asyncHandler(statsController.getEarningsBreakdown));
router.get('/vendor-earnings', asyncHandler(statsController.getVendorEarnings));
router.get('/top-vendors', asyncHandler(statsController.getTopVendors));

module.exports = router;
