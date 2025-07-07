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

module.exports = { registerSchema, loginSchema };