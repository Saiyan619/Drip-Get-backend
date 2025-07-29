const Cart = require('../models/Cart');
const Product = require('../models/Product');

const getCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }

    // Populate product details for items
    await cart.populate('items.productId');
    res.status(200).json(cart);
  } catch (error) {
    next(error);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const { productId, size, color, quantity } = req.body;
    const userId = req.user.id;

    // Validate product and variant
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product not found or inactive' });
    }

    const variant = product.variants.find(
      (v) => v.size === size && v.color === color
    );
    if (!variant) {
      return res.status(400).json({ message: 'Invalid product variant' });
    }
    if (variant.inventory < quantity) {
      return res.status(400).json({ message: 'Insufficient inventory' });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }

    // Check if item already exists in cart
    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId && item.size === size && item.color === color
    );

    if (itemIndex >= 0) {
      // Update quantity if item exists
      cart.items[itemIndex].quantity += quantity;
      if (cart.items[itemIndex].quantity > variant.inventory) {
        return res.status(400).json({ message: 'Total quantity exceeds inventory' });
      }
    } else {
      // Add new item
      cart.items.push({ productId, size, color, quantity });
    }

    await cart.save();
    await cart.populate('items.productId');
    res.status(200).json({ message: 'Item added to cart', cart });
  } catch (error) {
    next(error);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { size, color, quantity } = req.body;
    const userId = req.user.id;

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const item = cart.items.find((item) => item._id.toString() === itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    const product = await Product.findById(item.productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product not found or inactive' });
    }

    const variant = product.variants.find(
      (v) => v.size === size && v.color === color
    );
    if (!variant) {
      return res.status(400).json({ message: 'Invalid variant' });
    }

    if (quantity > variant.inventory) {
      return res.status(400).json({ message: 'Exceeds inventory' });
    }

    item.size = size;
    item.color = color;
    item.quantity = quantity;

    await cart.save();
    await cart.populate('items.productId');

    res.status(200).json({ message: 'Cart item updated', cart });
  } catch (error) {
    next(error);
  }
};


const removeFromCart = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const userId = req.user.id;

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
    await cart.save();
    await cart.populate('items.productId');
    res.status(200).json({ message: 'Item removed from cart', cart });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCart, addToCart, removeFromCart, updateCartItem };