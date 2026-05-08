const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const sellerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false,
  },
  phone: String,
  location: String,

  companyName: String,
  companyAddress: String,
  gstNumber: String,

  bankName: String,
  accountNumber: String,
  ifsc: String,
  upi: String,

  profilePicture: String,

  isBlocked: { type: Boolean, default: false },
  paymentStatus: { type: String, enum: ['Done', 'Pending'], default: 'Pending' },
  monthsPending: { type: Number, default: 0 },
  lastPaymentDate: { type: Date, default: null },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before save
sellerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
sellerSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

module.exports = mongoose.model('Seller', sellerSchema);