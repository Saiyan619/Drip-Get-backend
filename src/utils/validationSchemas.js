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
  body('name').notEmpty().withMessage('Name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('salePrice').optional().isFloat({ min: 0 }).withMessage('Sale price must be a positive number'),
  body('variants').isArray({ min: 1 }).withMessage('At least one variant is required'),
  body('variants.*.size').notEmpty().withMessage('Size is required for each variant'),
  body('variants.*.color').notEmpty().withMessage('Color is required for each variant'),
  body('variants.*.inventory').isInt({ min: 0 }).withMessage('Inventory must be a non-negative integer'),
  body('variants.*.sku').notEmpty().withMessage('SKU is required for each variant'),
  body('images').optional().isArray().withMessage('Images must be an array of strings'),
];

const updateProductSchema = [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('description').optional().notEmpty().withMessage('Description cannot be empty'),
  body('category').optional().notEmpty().withMessage('Category cannot be empty'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('salePrice').optional().isFloat({ min: 0 }).withMessage('Sale price must be a positive number'),
  body('variants').optional().isArray({ min: 1 }).withMessage('At least one variant is required'),
  body('variants.*.size').optional().notEmpty().withMessage('Size cannot be empty'),
  body('variants.*.color').optional().notEmpty().withMessage('Color cannot be empty'),
  body('variants.*.inventory').optional().isInt({ min: 0 }).withMessage('Inventory must be a non-negative integer'),
  body('variants.*.sku').optional().notEmpty().withMessage('SKU cannot be empty'),
  body('images').optional().isArray().withMessage('Images must be an array of strings'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

module.exports = { registerSchema, loginSchema, createProductSchema, updateProductSchema };