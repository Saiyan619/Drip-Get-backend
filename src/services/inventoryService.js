const Product = require('../models/Product');

const checkInventory = async (productId, size, color, quantity) => {
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    return false;
  }
  const variant = product.variants.find(v => v.size === size && v.color === color);
  if (!variant || variant.inventory < quantity) {
    return false;
  }
  return true;
};

const updateInventory = async (productId, size, color, quantity) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new Error('Product not found');
  }
  const variant = product.variants.find(v => v.size === size && v.color === color);
  if (!variant) {
    throw new Error('Variant not found');
  }
  variant.inventory -= quantity;
  await product.save();
};

module.exports = { checkInventory, updateInventory };