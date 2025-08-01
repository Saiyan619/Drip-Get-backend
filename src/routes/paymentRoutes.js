const express = require('express');
const { createPaymentIntent } = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateCreatePaymentIntent } = require('../middleware/validateMiddleware');

const router = express.Router();

// Create payment intent (authenticated)
router.post('/create-intent', authMiddleware, validateCreatePaymentIntent, createPaymentIntent);



module.exports = router;