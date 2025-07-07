const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true, required: true },
  email: { type: String, required: true, unique: true, required: true },
  role: { type: String, enum: ['customer', 'admin'] },
  firstName: { type: String },
  lastName: { type: String },
  phone: { type: String},
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
    country: { type: String },
  },
}, { timestamps: { createdAt: 'createdAt', updatedAt: false } });

module.exports = mongoose.model('User', userSchema);