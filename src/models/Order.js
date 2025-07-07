const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  customerId: { type: String, required: true }, // Clerk ID
  status: { type: String, enum: ['pending', 'paid', 'shipped', 'delivered'], required: true, default: 'pending' },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    size: { type: String, required: true },
    color: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
  }],
  total: { type: Number, required: true, min: 0 },
  shippingAddress: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    phone: { type: String, required: true },
  },
  stripePaymentId: { type: String, required: true },
}, { timestamps: { createdAt: 'createdAt', updatedAt: false } });

orderSchema.index({ customerId: 1, orderNumber: 1 }); // For lookups

module.exports = mongoose.model('Order', orderSchema);