const express = require('express');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productControllers');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { validateCreateProduct, validateUpdateProduct } = require('../middleware/validateMiddleware');

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);


// Admin routes
router.post('/admin/products', authMiddleware, adminMiddleware, validateCreateProduct, createProduct);
router.put('/admin/products/:id', authMiddleware, adminMiddleware, validateUpdateProduct, updateProduct);
router.delete('/admin/products/:id', authMiddleware, adminMiddleware, deleteProduct);


module.exports = router;