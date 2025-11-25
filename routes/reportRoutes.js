const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/summary', reportController.getSummary);
router.get('/export/csv', authMiddleware, reportController.exportCSV);
router.get('/export/excel', authMiddleware, reportController.exportExcel);

module.exports = router;
