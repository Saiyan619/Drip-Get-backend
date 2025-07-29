const { Resend } = require('resend');
const User = require('../models/User');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOrderConfirmation = async (userId, order) => {
  try {
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      throw new Error('User not found');
    }

    const email = await resend.emails.send({
      from: process.env.SENDER_EMAIL, // e.g., 'no-reply@yourdomain.com'
      to: "arokoyujr10@gmail.com",
      subject: `Order ${order.orderNumber} - ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}`,
      html: `
        <h1>Order ${order.orderNumber}</h1>
        <p>Status: ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</p>
        <h2>Items:</h2>
        <ul>
          ${order.items.map(item => `
            <li>${item.productName} (${item.size}, ${item.color}) - Quantity: ${item.quantity}, Price: $${item.price.toFixed(2)}</li>
          `).join('')}
        </ul>
        <p>Total: $${order.total.toFixed(2)}</p>
        <h2>Shipping Address:</h2>
        <p>${order.shippingAddress.firstName} ${order.shippingAddress.lastName}</p>
        <p>${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}, ${order.shippingAddress.country}</p>
        <p>Phone: ${order.shippingAddress.phone}</p>
      `,
    });


if (email.error) {
  console.error('Resend email error:', email.error); 
  throw new Error(email.error.message);
}

    if (email.error) {
      throw new Error(email.error.message);
    }
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = { sendOrderConfirmation };