const express = require('express');
const router = express.Router();
const pushController = require('../controllers/pushController');

router.post('/bareerah-event', pushController.bareerahEvent);

module.exports = router;
