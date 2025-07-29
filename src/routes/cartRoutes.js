const express = require('express');
const { getCart, addToCart, removeFromCart, updateCartItem } = require('../controllers/cartController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateAddToCart, validateUpdateCartItem } = require('../middleware/validateMiddleware');

const router = express.Router();

// Cart routes (authenticated users only)
router.get('/', authMiddleware, getCart);
router.post('/add', authMiddleware, validateAddToCart, addToCart);
router.put('/add/:itemId', authMiddleware, validateUpdateCartItem, updateCartItem );
router.delete('/:itemId', authMiddleware, removeFromCart);

module.exports = router;