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

// CORS (dynamic origin check)
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL, // main deployed site
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow non-browser tools
    if (allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
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

console.log('FRONTEND_URL from env:', process.env.FRONTEND_URL);

// Stripe webhook route (must be before express.json())
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Parse JSON for all other routes
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cardRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
