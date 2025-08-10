const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cardRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const errorHandler = require('./middleware/errorMiddleware');
const { handleWebhook } = require('./controllers/paymentController');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();


// Middleware
// app.use(cors()); // Enable frontend communication

const corsOptions = {
  origin: [
    'http://localhost:5173',
    'https://drip-get-store.vercel.app',
    process.env.FRONTEND_URL,
    'https://drip-get-store-git-main-*.vercel.app'
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Backend API is running!',
    version: '1.0.0',
    endpoints: ['/api/auth', '/api/products', '/api/cart', '/api/orders', '/api/payments']
  });
});

// Handle Stripe webhook (public, secured by Stripe signature)
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), handleWebhook);

app.use(express.json()); // Parse JSON requests

// User authentication routes
app.use('/api/auth', authRoutes); // /api/auth/register, /api/auth/login, /api/auth/profile
app.use('/api/products', productRoutes); // Product routes
app.use('/api/cart', cardRoutes); // Cart routes
app.use('/api/orders', orderRoutes); 
app.use('/api/payments', paymentRoutes); // Payment routes



// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});


// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});