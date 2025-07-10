const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  salePrice: { type: Number, min: 0 },
  images: [{ type: String }], // Cloudinary URLs
  variants: [{
    size: { type: String, required: true },
    color: { type: String, required: true },
    inventory: { type: Number, required: true, min: 0 },
    sku: { type: String, required: true },
  }],
  isActive: { type: Boolean, required: true, default: true },
}, { timestamps: { createdAt: 'createdAt', updatedAt: false } });

// ✅ Full-text search index
productSchema.index({ name: 'text', description: 'text' });

// ✅ Optional filter optimization
productSchema.index({ category: 1 });

module.exports = mongoose.model('Product', productSchema);
