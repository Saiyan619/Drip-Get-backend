const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Clerk ID
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    size: { type: String, required: true },
    color: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
  }],
}, { timestamps: { createdAt: 'createdAt', updatedAt: false } });

cartSchema.index({ userId: 1 }); // For user lookups

module.exports = mongoose.model('Cart', cartSchema);