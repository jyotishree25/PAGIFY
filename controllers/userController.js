// backend/controllers/userController.js
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const cloudinary = require('../config/cloudinary');
const stream = require('stream');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'dev-secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '90d',
  });
};

// GET /api/v1/users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).select('-password');
    return res.status(200).json({
      status: 'success',
      results: users.length,
      users,
    });
  } catch (err) {
    return res.status(500).json({
      status: 'fail',
      message: 'Server error',
    });
  }
};

// GET /api/v1/users/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found' });
    }

    return res.status(200).json({
      status: 'success',
      user,
    });
  } catch (err) {
    return res.status(500).json({
      status: 'fail',
      message: 'Server error',
    });
  }
};

// PATCH /api/v1/users/me
exports.updateMe = async (req, res) => {
  try {
    // Only allow profile fields (not password) from your CustomerSettings page
    const allowed = ['name', 'email', 'phone', 'gender', 'address', 'bankAccount', 'ifscCode'];
    const update = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) update[k] = req.body[k];
    }

    if ('password' in req.body || 'currentPassword' in req.body || 'newPassword' in req.body) {
      return res.status(400).json({
        status: 'fail',
        message: 'Use /change-password to update your password',
      });
    }

    const user = await User.findByIdAndUpdate(req.user.id, update, {
      new: true,
      runValidators: true,
      context: 'query',
    }).select('-password');
     const token = signToken(user._id);
    return res.status(200).json({ status: 'success',token, user });
  } catch (err) {
    if (err?.code === 11000 && err?.keyPattern?.email) {
      return res.status(409).json({ status: 'fail', message: 'Email already in use' });
    }
    return res.status(500).json({ status: 'fail', message: 'Server error' });
  }
};

// PATCH /api/v1/users/change-password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ status: 'fail', message: 'All password fields are required' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ status: 'fail', message: 'Passwords do not match' });
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) return res.status(404).json({ status: 'fail', message: 'User not found' });

    const ok = await user.comparePassword(currentPassword);
    if (!ok) return res.status(400).json({ status: 'fail', message: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save();

    const token = signToken(user._id); 

    return res.status(200).json({ status: 'success',token,   message: 'Password updated successfully' });
  } catch (err) {
    return res.status(500).json({ status: 'fail', message: 'Server error' });
  }
};

// POST /api/v1/users/upload-profile-picture
exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'fail', message: 'No file uploaded' });
    }

    // Helper to upload buffer to Cloudinary
    const uploadFromBuffer = (buffer) => {
      return new Promise((resolve, reject) => {
        let cld_upload_stream = cloudinary.uploader.upload_stream(
          { folder: "pagify/users" },
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          }
        );
        stream.Readable.from(buffer).pipe(cld_upload_stream);
      });
    };

    const result = await uploadFromBuffer(req.file.buffer);

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePicture: result.secure_url },
      { new: true }
    ).select('-password');

    return res.status(200).json({
      status: 'success',
      message: 'Profile picture updated successfully',
      user
    });

  } catch (err) {
    console.error('Profile upload error:', err);
    return res.status(500).json({ status: 'fail', message: 'Server error during upload' });
  }
};