const express = require('express');
const statsController = require('../controllers/statsController');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.get('/summary', asyncHandler(statsController.getSummary));
router.get('/bookings', asyncHandler(statsController.getBookings));
router.get('/earnings-breakdown', asyncHandler(statsController.getEarningsBreakdown));
router.get('/vendor-earnings', asyncHandler(statsController.getVendorEarnings));
router.get('/top-vendors', asyncHandler(statsController.getTopVendors));
router.get('/upcoming-bookings', asyncHandler(statsController.getUpcomingBookings));
router.get('/earnings-comparison', asyncHandler(statsController.getEarningsComparison));
router.get('/customer-funnels', asyncHandler(statsController.getCustomerFunnels));
router.get('/revenue-by-type', asyncHandler(statsController.getRevenueByBookingType));
router.get('/unassigned-rides', asyncHandler(statsController.getUnassignedRides));
router.get('/accept-assigned-ratio', asyncHandler(statsController.getAcceptAssignedRatio));

module.exports = router;
