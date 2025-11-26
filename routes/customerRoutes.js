const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const authMiddleware = require('../middleware/authMiddleware');
const rbacMiddleware = require('../middleware/rbacMiddleware');
const asyncHandler = require('../middleware/asyncHandler');

router.get('/', authMiddleware, asyncHandler(customerController.getAllCustomers));
router.get('/search', authMiddleware, asyncHandler(customerController.searchCustomers));
router.get('/phone/:phone', authMiddleware, asyncHandler(customerController.getCustomerByPhone));
router.get('/:id', authMiddleware, asyncHandler(customerController.getCustomerById));
router.post('/', authMiddleware, rbacMiddleware(['admin', 'operator']), asyncHandler(customerController.createCustomer));
router.put('/:id', authMiddleware, rbacMiddleware(['admin', 'operator']), asyncHandler(customerController.updateCustomer));
router.delete('/:id', authMiddleware, rbacMiddleware(['admin']), asyncHandler(customerController.deleteCustomer));

module.exports = router;
