// backend/controllers/authController.js
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Helper to build safe user object (no password)
const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  gender: user.gender,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const makeToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'dev-secret';
  const expires = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ id: userId }, secret, { expiresIn: expires });
};

// --------- SIGNUP ----------
exports.signup = async (req, res) => {
  try {
    const { name, email, phone, gender, password, confirmPassword } = req.body;

    if (!name || !email || !phone || !password || !confirmPassword) {
      return res.status(400).json({ status: 'fail', message: 'All fields are required.' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ status: 'fail', message: 'Passwords do not match.' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ status: 'fail', message: 'Email already in use.' });
    }

    const user = await User.create({ name, email, phone, gender, password });

    // keep your frontend expectation: 201 + status: 'success'
    return res.status(201).json({
      status: 'success',
      message: 'User registered successfully.',
      user: sanitizeUser(user),
      token: makeToken(user._id),
    });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ status: 'fail', message: 'Server error during signup.' });
  }
};

// --------- LOGIN ----------
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ status: 'fail', message: 'Email and password are required.' });
    }

    // Get user with password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ status: 'fail', message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ status: 'fail', message: 'Invalid email or password.' });
    }

    // OK
    const safeUser = sanitizeUser(user);
    const token = makeToken(user._id);

    return res.status(200).json({
      status: 'success',
      message: 'Login successful.',
      user: safeUser,
      token,
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ status: 'fail', message: 'Server error during login.' });
  }
};
