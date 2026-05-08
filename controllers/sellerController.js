const jwt = require('jsonwebtoken');
const Seller = require('../models/seller');

const signToken = (id) => {
  return jwt.sign(
    { id, role: 'seller' },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: '1d' }
  );
};

// ✅ SELLER SIGNUP
exports.sellerSignup = async (req, res) => {
  try {
    const existingSeller = await Seller.findOne({ email: req.body.email });

    if (existingSeller) {
      return res.status(400).json({
        status: 'fail',
        message: 'Seller already exists. Please login.',
      });
    }

    const payload = { ...req.body };
    if (req.file) {
      const cloudinary = require('../config/cloudinary');
      const result = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
        { folder: "pagify/sellers" }
      );
      payload.profilePicture = result.secure_url;
    }
    const seller = await Seller.create(payload);

    res.status(201).json({
      status: 'success',
      message: 'Signup successful. Please login.',
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// ✅ SELLER LOGIN
exports.sellerLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: 'fail',
      message: 'Email and password required',
    });
  }

  const seller = await Seller.findOne({ email }).select('+password');

  if (!seller || !(await seller.correctPassword(password, seller.password))) {
    return res.status(401).json({
      status: 'fail',
      message: 'Invalid email or password',
    });
  }

  const token = signToken(seller._id);

  res.status(200).json({
    status: 'success',
    token,
    seller: {
      id: seller._id,
      name: seller.name,
      email: seller.email,
    },
  });
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ status: 'fail', message: 'All password fields are required' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ status: 'fail', message: 'Passwords do not match' });
    }
    const seller = await Seller.findById(req.user.id).select('+password');
    if (!seller) return res.status(404).json({ status: 'fail', message: 'Seller not found' });
    const ok = await seller.correctPassword(currentPassword, seller.password);
    if (!ok) return res.status(400).json({ status: 'fail', message: 'Current password is incorrect' });
    seller.password = newPassword;
    await seller.save();
    const token = signToken(seller._id);
    return res.status(200).json({ status: 'success', token, message: 'Password updated successfully' });
  } catch (err) {
    return res.status(500).json({ status: 'fail', message: 'Server error' });
  }
};

exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'fail', message: 'No file uploaded' });
    }
    const cloudinary = require('../config/cloudinary');
    const result = await cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
      { folder: "pagify/sellers" }
    );
    const seller = await Seller.findByIdAndUpdate(
      req.user.id,
      { profilePicture: result.secure_url },
      { new: true }
    ).select('-password');
    return res.status(200).json({ status: 'success', seller });
  } catch (err) {
    return res.status(500).json({ status: 'fail', message: 'Server error during upload' });
  }
};
// ✅ SELLER PROFILE (PROTECTED)
exports.getSellerMe = async (req, res) => {
  const seller = await Seller.findById(req.user.id).select('-password');

  if (!seller) {
    return res.status(404).json({
      status: 'fail',
      message: 'Seller not found',
    });
  }

  res.status(200).json({
    status: 'success',
    seller,
  });
};

exports.updateSellerMe = async (req, res) => {
  try {
    const allowed = [
      'name',
      'email',
      'phone',
      'location',
      'companyName',
      'companyAddress',
      'gstNumber',
      'bankName',
      'accountNumber',
      'ifsc',
      'upi',
    ];

    const body = { ...req.body };
    if (body.bankAccount !== undefined && body.accountNumber === undefined) {
      body.accountNumber = body.bankAccount;
      delete body.bankAccount;
    }
    if (body.address !== undefined && body.companyAddress === undefined) {
      body.companyAddress = body.address;
      delete body.address;
    }

    const update = {};
    for (const k of allowed) {
      if (body[k] !== undefined) update[k] = body[k];
    }

    const seller = await Seller.findByIdAndUpdate(req.user.id, update, {
      new: true,
      runValidators: true,
      context: 'query',
    }).select('-password');

    if (!seller) {
      return res.status(404).json({ status: 'fail', message: 'Seller not found' });
    }

    return res.status(200).json({ status: 'success', seller });
  } catch (err) {
    if (err?.code === 11000 && err?.keyPattern?.email) {
      return res.status(409).json({ status: 'fail', message: 'Email already in use' });
    }
    return res.status(500).json({ status: 'fail', message: 'Server error' });
  }
};

exports.getAllSellers = async (req, res) => {
  try {
    const sellers = await Seller.find().sort({ createdAt: -1 }).select('-password');
    return res.status(200).json({ status: 'success', results: sellers.length, sellers });
  } catch (err) {
    return res.status(500).json({ status: 'fail', message: 'Server error' });
  }
};

exports.updateSeller = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, monthsPending, isBlocked, lastPaymentDate } = req.body;

    const update = {};
    if (paymentStatus !== undefined) update.paymentStatus = paymentStatus;
    if (monthsPending !== undefined) update.monthsPending = monthsPending;
    if (lastPaymentDate !== undefined) update.lastPaymentDate = lastPaymentDate;

    let finalBlocked = isBlocked;
    if (finalBlocked === undefined && paymentStatus !== undefined) {
      finalBlocked = paymentStatus === 'Pending' && (monthsPending || 0) > 0;
    }
    if (finalBlocked !== undefined) update.isBlocked = !!finalBlocked;

    const seller = await Seller.findByIdAndUpdate(id, update, { new: true }).select('-password');
    if (!seller) return res.status(404).json({ status: 'fail', message: 'Seller not found' });

    return res.status(200).json({ status: 'success', seller });
  } catch (err) {
    return res.status(500).json({ status: 'fail', message: 'Server error' });
  }
};

exports.notifySeller = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, message } = req.body;
    if (!subject || !message) {
      return res.status(400).json({ status: 'fail', message: 'Subject and message required' });
    }
    return res.status(200).json({ status: 'success', message: 'Notification queued' });
  } catch (err) {
    return res.status(500).json({ status: 'fail', message: 'Server error' });
  }
};

exports.getSellerStats = async (req, res) => {
  try {
    const Product = require('../models/product');
    const Order = require('../models/order');
    const sellerId = req.user.id;

    // 1. Total Products Listed by this seller
    const totalProducts = await Product.countDocuments({
      createdBy: sellerId,
      createdByModel: 'Seller'
    });

    // 2. Fetch all orders that contain items from this seller
    const sellerOrders = await Order.find({
      'items.sellerId': sellerId
    });

    // 3. Calculate Revenue and Total Orders for this seller
    let totalRevenue = 0;
    const totalOrders = sellerOrders.length;

    sellerOrders.forEach(order => {
      order.items.forEach(item => {
        if (item.sellerId && item.sellerId.toString() === sellerId.toString()) {
          totalRevenue += item.price * item.quantity;
        }
      });
    });

    // 4. Calculate Growth (Monthly)
    const now = new Date();
    const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Current month revenue
    const currentMonthOrders = await Order.find({
      'items.sellerId': sellerId,
      createdAt: { $gte: firstDayCurrentMonth }
    });
    let currentMonthRevenue = 0;
    currentMonthOrders.forEach(order => {
      order.items.forEach(item => {
        if (item.sellerId && item.sellerId.toString() === sellerId.toString()) {
          currentMonthRevenue += item.price * item.quantity;
        }
      });
    });

    // Last month revenue
    const lastMonthOrders = await Order.find({
      'items.sellerId': sellerId,
      createdAt: { $gte: firstDayLastMonth, $lt: firstDayCurrentMonth }
    });
    let lastMonthRevenue = 0;
    lastMonthOrders.forEach(order => {
      order.items.forEach(item => {
        if (item.sellerId && item.sellerId.toString() === sellerId.toString()) {
          lastMonthRevenue += item.price * item.quantity;
        }
      });
    });

    let growth = 0;
    if (lastMonthRevenue > 0) {
      growth = ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
    } else if (currentMonthRevenue > 0) {
      growth = 100;
    }

    res.status(200).json({
      status: 'success',
      stats: {
        totalProducts,
        totalOrders,
        totalRevenue,
        growth: growth.toFixed(2)
      }
    });
  } catch (err) {
    console.error('Get seller stats error:', err);
    res.status(500).json({ status: 'fail', message: 'Server error' });
  }
};