const Order = require('../models/order');
const User = require('../models/user');

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const { items, totalAmount, paymentMethod, customerDetails } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ status: 'fail', message: 'No items in order' });
    }

    const newOrder = await Order.create({
      user: req.user.id,
      items,
      totalAmount,
      paymentMethod,
      customerDetails,
    });

    // Clear user's cart after successful order
    await User.findByIdAndUpdate(req.user.id, { $set: { cart: [] } });

    res.status(201).json({
      status: 'success',
      order: newOrder,
    });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ status: 'fail', message: 'Server error' });
  }
};

// Get orders for the logged-in user
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product')
      .sort({ createdAt: -1 });
    res.status(200).json({
      status: 'success',
      results: orders.length,
      orders,
    });
  } catch (err) {
    console.error('Get my orders error:', err);
    res.status(500).json({ status: 'fail', message: 'Server error' });
  }
};

// Get all orders (for admin)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.status(200).json({
      status: 'success',
      results: orders.length,
      orders,
    });
  } catch (err) {
    console.error('Get all orders error:', err);
    res.status(500).json({ status: 'fail', message: 'Server error' });
  }
};

// Get admin dashboard stats
exports.getAdminStats = async (req, res) => {
  try {
    const Product = require('../models/product');
    const User = require('../models/user');
    const Seller = require('../models/seller');

    // 1. Total Books (all products in DB)
    const totalBooks = await Product.countDocuments();

    // 2. Total Sales (sum of all order totalAmount)
    const salesData = await Order.aggregate([
      { $group: { _id: null, totalSales: { $sum: "$totalAmount" } } }
    ]);
    const totalSales = salesData.length > 0 ? salesData[0].totalSales : 0;

    // 3. Total Orders (count of all orders)
    const totalOrders = await Order.countDocuments();

    // 4. Total Customers (sum of all users and sellers)
    const userCount = await User.countDocuments();
    const sellerCount = await Seller.countDocuments();
    const totalCustomers = userCount + sellerCount;

    res.status(200).json({
      status: 'success',
      stats: {
        totalBooks,
        totalSales,
        totalOrders,
        totalCustomers
      }
    });
  } catch (err) {
    console.error('Get admin stats error:', err);
    res.status(500).json({ status: 'fail', message: 'Server error' });
  }
};
