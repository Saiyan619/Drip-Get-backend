const express = require('express');
const multer = require('multer');
const path = require('path');
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

// Set up multer to store images locally before uploading to Cloudinary
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // make sure this folder exists
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + file.originalname;
    cb(null, uniqueSuffix);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Invalid file type. Only JPEG, PNG allowed.'));
  },
});

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin routes
// Create product - expects files in 'images' field
router.post('/admin/products', 
  authMiddleware, 
  adminMiddleware, 
  upload.array('images', 5), 
  validateCreateProduct, 
  createProduct
);

// Update product - expects NEW files in 'newImages' field, existing URLs in 'existingImages' field
router.put('/admin/products/:id', 
  authMiddleware, 
  adminMiddleware, 
  upload.array('newImages', 5), // Changed from 'images' to 'newImages'
  validateUpdateProduct, 
  updateProduct
);

router.delete('/admin/products/:id', 
  authMiddleware, 
  adminMiddleware, 
  deleteProduct
);

module.exports = router;