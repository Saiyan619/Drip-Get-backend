const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: { type: String }, // Clerk ID, null for guests
  sessionId: { type: String, required: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    size: { type: String, required: true },
    color: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
  }],
  expiresAt: { type: Date, required: true },
}, { timestamps: { createdAt: 'createdAt', updatedAt: false } });

cartSchema.index({ userId: 1, sessionId: 1 }); // For guest and user lookups

module.exports = mongoose.model('Cart', cartSchema);