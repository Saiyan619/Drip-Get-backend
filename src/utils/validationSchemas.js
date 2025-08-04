const { body } = require('express-validator');

const registerSchema = [
  body('clerkId').notEmpty().withMessage('Clerk user ID is required'),
   body('firstName').optional().isString(),
  body('lastName').optional().isString(),
  body('phone').optional().isString(),
  body('address.street').optional().isString(),
  body('address.city').optional().isString(),
  body('address.state').optional().isString(),
  body('address.zipCode').optional().isString(),
  body('address.country').optional().isString(),
];

const loginSchema = [];

const createProductSchema = [
   body('name')
    .notEmpty()
    .withMessage('Name is required'),

  body('description')
    .notEmpty()
    .withMessage('Description is required'),

  body('category')
    .notEmpty()
    .withMessage('Category is required'),

  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .bail()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),

  body('salePrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Sale price must be a positive number'),

  body('variants')
    .custom((value) => {
      // Parse if value is a string (sent from multipart/form-data)
      let variants;
      try {
        variants = typeof value === 'string' ? JSON.parse(value) : value;
      } catch {
        throw new Error('Variants must be a valid JSON array');
      }

      if (!Array.isArray(variants) || variants.length === 0) {
        throw new Error('At least one variant is required');
      }

      for (let i = 0; i < variants.length; i++) {
        const variant = variants[i];
        if (!variant.size) throw new Error(`Size is required for variant ${i + 1}`);
        if (!variant.color) throw new Error(`Color is required for variant ${i + 1}`);
        if (variant.inventory === undefined || variant.inventory < 0 || isNaN(variant.inventory)) {
          throw new Error(`Inventory must be a non-negative integer for variant ${i + 1}`);
        }
        if (!variant.sku) throw new Error(`SKU is required for variant ${i + 1}`);
      }

      return true;
    }),

  // Optional: Validate image URLs if passed (not file uploads)
  body('images')
    .optional()
    .custom((value) => {
      const images = typeof value === 'string' ? JSON.parse(value) : value;
      if (!Array.isArray(images)) throw new Error('Images must be an array of strings');
      for (let url of images) {
        if (typeof url !== 'string') throw new Error('Each image must be a string URL');
      }
      return true;
    }),
];

const updateProductSchema = [
   body('name')
    .optional()
    .notEmpty()
    .withMessage('Name cannot be empty'),
  body('description')
    .optional()
    .notEmpty()
    .withMessage('Description cannot be empty'),
  body('category')
    .optional()
    .notEmpty()
    .withMessage('Category cannot be empty'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('salePrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Sale price must be a positive number'),
  body('variants')
    .optional()
    .custom((value) => {
      if (!value) return true;
      let variants;
      try {
        variants = typeof value === 'string' ? JSON.parse(value) : value;
      } catch {
        throw new Error('Variants must be a valid JSON array');
      }
      if (!Array.isArray(variants)) {
        throw new Error('Variants must be an array');
      }
      for (let i = 0; i < variants.length; i++) {
        const variant = variants[i];
        if (variant.size !== undefined && variant.size === '') {
          throw new Error(`Size cannot be empty for variant ${i + 1}`);
        }
        if (variant.color !== undefined && variant.color === '') {
          throw new Error(`Color cannot be empty for variant ${i + 1}`);
        }
        if (
          variant.inventory !== undefined &&
          (isNaN(variant.inventory) || variant.inventory < 0)
        ) {
          throw new Error(`Inventory must be a non-negative integer for variant ${i + 1}`);
        }
        if (variant.sku !== undefined && variant.sku === '') {
          throw new Error(`SKU cannot be empty for variant ${i + 1}`);
        }
      }
      return true;
    }),
  // Updated validation for existing images (URLs only)
  body('existingImages')
    .optional()
    .custom((value) => {
      if (!value) return true;
      let images;
      try {
        images = typeof value === 'string' ? JSON.parse(value) : value;
      } catch {
        throw new Error('Existing images must be a valid JSON array');
      }
      if (!Array.isArray(images)) throw new Error('Existing images must be an array of strings');
      for (const url of images) {
        if (typeof url !== 'string') throw new Error('Each existing image must be a string URL');
      }
      return true;
    }),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];


const addToCartSchema = [
  body('productId').isMongoId().withMessage('Valid product ID is required'),
  body('size').notEmpty().withMessage('Size is required'),
  body('color').notEmpty().withMessage('Color is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
];

const updateCartItemSchema = [
  body('size').notEmpty().withMessage('Size is required'),
  body('color').notEmpty().withMessage('Color is required'),
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
];

const createOrderSchema = [
  body('shippingAddress.firstName').notEmpty().withMessage('First name is required'),
  body('shippingAddress.lastName').notEmpty().withMessage('Last name is required'),
  body('shippingAddress.street').notEmpty().withMessage('Street is required'),
  body('shippingAddress.city').notEmpty().withMessage('City is required'),
  body('shippingAddress.state').notEmpty().withMessage('State is required'),
  body('shippingAddress.zipCode').notEmpty().withMessage('Zip code is required'),
  body('shippingAddress.country').notEmpty().withMessage('Country is required'),
  body('shippingAddress.phone').notEmpty().withMessage('Phone is required'),
  // body('checkoutSessionId').notEmpty().withMessage('Checkout session ID is required'),//Need to add it after payment
];

const updateOrderStatusSchema = [
  body('status').isIn(['pending', 'paid', 'shipped', 'delivered']).withMessage('Invalid status'),
];

const createPaymentIntentSchema = [
  body('orderId').isMongoId().withMessage('Valid order ID is required'),
];

module.exports = {
  registerSchema,
  loginSchema,
  createProductSchema,
  updateProductSchema,
  addToCartSchema,
  updateCartItemSchema,
  createOrderSchema,
  updateOrderStatusSchema,
  createPaymentIntentSchema
};