const express = require('express');
const { createOrder, getUserOrders, getOrderById, getAllOrders, updateOrderStatus } = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { validateCreateOrder, validateUpdateOrderStatus } = require('../middleware/validateMiddleware');

const router = express.Router();

// User routes (authenticated)
router.post('/create', authMiddleware, validateCreateOrder, createOrder);
router.get('/', authMiddleware, getUserOrders);
router.get('/:id', authMiddleware, getOrderById);


// Admin routes
router.get('/admin/orders', authMiddleware, adminMiddleware, getAllOrders);
router.put('/admin/orders/:id/status', authMiddleware, adminMiddleware, validateUpdateOrderStatus, updateOrderStatus);

module.exports = router;