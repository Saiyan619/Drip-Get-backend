const express = require('express');
const { createPaymentIntent, handleWebhook } = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateCreatePaymentIntent } = require('../middleware/validateMiddleware');

const router = express.Router();

// Create payment intent (authenticated)
router.post('/create-intent', authMiddleware, validateCreatePaymentIntent, createPaymentIntent);

// Handle Stripe webhook (public, secured by Stripe signature)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

module.exports = router;