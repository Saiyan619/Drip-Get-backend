const clerk = require('../config/clerk');
const User = require('../models/User');

const register = async (req, res, next) => {
  try {
    const { clerkId, email, role, firstName,lastName,phone,address } = req.body;
    const clerkUser = await clerk.users.getUser(clerkId);

    if (!clerkUser) {
      return res.status(400).json({ message: 'Invalid Clerk user ID' });
    }

    console.log(clerkUser.emailAddresses[0].emailAddress)
    const existingUser = await User.findOne({ clerkId: clerkId });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    

const user = await User.create({
  clerkId,
  email: clerkUser.emailAddresses[0].emailAddress,
  role: 'customer',
  firstName: firstName || '',
  lastName: lastName || '',
  phone: phone || '',
  address: {
    street: address?.street || '',
    city: address?.city || '',
    state: address?.state || '',
    zipCode: address?.zipCode || '',
    country: address?.country || '',
  }
});


    res.status(201).json({ message: 'User registered', user });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    res.status(200).json({ message: 'Login successful, handled by Clerk frontend' });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ clerkId: req.user.id });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({
      id: user.clerkId,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      address: user.address,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getProfile };