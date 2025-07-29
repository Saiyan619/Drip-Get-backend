const { v4: uuidv4 } = require('uuid');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { checkInventory, updateInventory } = require('../services/inventoryService');
const { sendOrderConfirmation } = require('../services/emailService');

const createOrder = async (req, res, next) => {
  try {
    const { shippingAddress } = req.body; // Only need shipping address
    const userId = req.user.id;
    
    // Get user's cart
    const cart = await Cart.findOne({ userId }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }
   
    // Validate inventory
    for (const item of cart.items) {
      const isAvailable = await checkInventory(item.productId._id, item.size, item.color, item.quantity);
      if (!isAvailable) {
        return res.status(400).json({ message: `Insufficient inventory for ${item.productId.name} (${item.size}, ${item.color})` });
      }
    }
    
    // Calculate total
    const total = cart.items.reduce((sum, item) => {
      const price = item.productId.salePrice || item.productId.price;
      return sum + price * item.quantity;
    }, 0);
    
    // Create order WITHOUT stripePaymentId (will be added later)
    const order = await Order.create({
      orderNumber: `ORD-${uuidv4().slice(0, 8)}`,
      customerId: userId,
      status: 'pending',
      items: cart.items.map(item => ({
        productId: item.productId._id,
        productName: item.productId.name,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        price: item.productId.salePrice || item.productId.price,
      })),
      total,
      shippingAddress,
      stripePaymentId: null, // Will be set when creating Stripe session
    });
    
    // Update inventory
    for (const item of cart.items) {
      await updateInventory(item.productId._id, item.size, item.color, item.quantity);
    }
    
    // Clear cart
    await Cart.findOneAndUpdate({ userId }, { items: [] });
    
    // DON'T send email yet - wait for payment confirmation
    
    res.status(201).json({ 
      message: 'Order created successfully', 
      order,
      orderId: order._id // Frontend will use this to create Stripe session
    });
  } catch (error) {
    next(error);
  }
};


const getUserOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ customerId: userId }).select('-__v');
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const order = await Order.findOne({ _id: req.params.id, customerId: userId }).select('-__v');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().select('-__v');
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).select('-__v');


    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Send email notification for status update
    await sendOrderConfirmation(order.customerId, order);

    res.status(200).json({ message: 'Order status updated', order });
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder, getUserOrders, getOrderById, getAllOrders, updateOrderStatus };