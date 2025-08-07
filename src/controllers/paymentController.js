const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const { sendOrderConfirmation } = require('../services/emailService');

const createPaymentIntent = async (req, res, next) => {
  try {
    const { orderId } = req.body; // Get order ID from frontend
    const userId = req.user.id;
    
    // Find the existing order
    const order = await Order.findOne({ _id: orderId, customerId: userId });
    if (!order) {
      return res.status(400).json({ message: 'Order not found' });
    }
    
    // Create line items from order (not cart)
    const lineItems = order.items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.productName,
          metadata: {
            productId: item.productId.toString(),
            size: item.size,
            color: item.color,
          },
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));
    
    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: 'http://localhost:5173/payment-success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'http://localhost:5173/cancel',
      metadata: { 
        userId,
        orderId: order._id.toString() 
      },
    });
    
    // Update order with Stripe session ID
    order.stripePaymentId = session.id;
    await order.save();
    
    res.status(200).json({
      checkoutUrl: session.url,
      checkoutSessionId: session.id,
    });
  } catch (error) {
    next(error);
  }
};
const handleWebhook = async (req, res, next) => {
  try {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.metadata.userId;
      const orderId = session.metadata.orderId; // Extract orderId from metadata
      console.log('Webhook event:', event);

      console.log(`Processing completed checkout for order: ${orderId}`);
      
      // Find order with matching session ID and orderId
      const order = await Order.findOne({
        _id: orderId,
        customerId: userId, // Also verify the customer
        stripePaymentId: session.id
      });
      
      
      if (order) {
        order.status = 'paid';
        order.paidAt = new Date(); // Add payment timestamp
        await order.save();
        
        console.log(`Order ${order.orderNumber} marked as paid`);
        
        // Clear the user's cart after successful payment
        await Cart.findOneAndDelete({ customerId: userId });
        
        // Send email confirmation
        await sendOrderConfirmation(userId, order);
      } else {
        console.error(`Order not found for session: ${session.id}, orderId: ${orderId}`);
      }
    }
    
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    next(error);
  }
};

module.exports = {
  createPaymentIntent,
  handleWebhook,
}