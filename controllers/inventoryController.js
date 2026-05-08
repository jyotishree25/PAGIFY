const User = require('../models/user');
const Product = require('../models/product');

exports.getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('cart').populate('cart.product');
    if (!user) return res.status(404).json({ status: 'fail', message: 'User not found' });
    
    // Filter out items where product is null (deleted) or blocked
    const validCart = user.cart.filter(item => item.product && !item.product.blocked);
    
    return res.status(200).json({ status: 'success', items: validCart });
  } catch (err) {
    console.error('Get cart error:', err);
    return res.status(500).json({ status: 'fail', message: 'Server error' });
  }
};

exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ status: 'fail', message: 'Product ID required' });
    const exists = await Product.exists({ _id: productId });
    if (!exists) return res.status(404).json({ status: 'fail', message: 'Product not found' });
    
    const user = await User.findById(req.user.id).select('wishlist');
    if (!user.wishlist.includes(productId)) {
      user.wishlist.push(productId);
      await user.save();
    }
    await user.populate('wishlist');

    // Filter out items that are null (deleted products) or blocked
    const validItems = user.wishlist.filter(item => item && !item.blocked);

    return res.status(200).json({ status: 'success', items: validItems });
  } catch (err) {
    console.error('Add to wishlist error:', err);
    return res.status(500).json({ status: 'fail', message: 'Server error' });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!productId) return res.status(400).json({ status: 'fail', message: 'Product ID required' });
    
    const user = await User.findById(req.user.id).select('wishlist');
    user.wishlist = user.wishlist.filter(id => String(id) !== String(productId));
    await user.save();
    await user.populate('wishlist');

    // Filter out items that are null (deleted products) or blocked
    const validItems = user.wishlist.filter(item => item && !item.blocked);

    return res.status(200).json({ status: 'success', items: validItems });
  } catch (err) {
    console.error('Remove from wishlist error:', err);
    return res.status(500).json({ status: 'fail', message: 'Server error' });
  }
};

exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('wishlist').populate('wishlist');
    if (!user) return res.status(404).json({ status: 'fail', message: 'User not found' });
    
    // Filter out items that are null (deleted products) or blocked
    const validItems = user.wishlist.filter(item => item && !item.blocked);
    
    return res.status(200).json({ status: 'success', items: validItems });
  } catch (err) {
    console.error('Get wishlist error:', err);
    return res.status(500).json({ status: 'fail', message: 'Server error' });
  }
};

exports.getWishlistCount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('wishlist').populate('wishlist');
    if (!user) return res.status(404).json({ status: 'fail', message: 'User not found' });
    
    // Only count items that still exist and aren't blocked
    const count = user.wishlist.filter(item => item && !item.blocked).length;
    
    return res.status(200).json({ status: 'success', count });
  } catch (err) {
    console.error('Get wishlist count error:', err);
    return res.status(500).json({ status: 'fail', message: 'Server error' });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId) return res.status(400).json({ status: 'fail', message: 'Product ID required' });
    const qty = Number(quantity) || 1;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ status: 'fail', message: 'Product not found' });
    if (product.blocked) return res.status(400).json({ status: 'fail', message: 'Product is blocked' });
    if (product.stock <= 0) return res.status(400).json({ status: 'fail', message: 'Out of stock' });
    const user = await User.findById(req.user.id).select('cart');
    if (!user) return res.status(404).json({ status: 'fail', message: 'User not found' });
    const idx = user.cart.findIndex(c => String(c.product) === String(productId));
    if (idx >= 0) {
      user.cart[idx].quantity += qty;
    } else {
      user.cart.push({ product: productId, quantity: qty });
    }

    // ✅ Increment cartCount for bestseller tracking
    await Product.findByIdAndUpdate(
      productId,
      { $inc: { cartCount: qty } },
      { new: true }
    );

    await user.save();
    return res.status(200).json({ status: 'success', items: user.cart });
  } catch (err) {
    return res.status(500).json({ status: 'fail', message: 'Server error' });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId || quantity === undefined) return res.status(400).json({ status: 'fail', message: 'Product ID and quantity required' });
    const qty = Number(quantity);
    const user = await User.findById(req.user.id).select('cart');
    if (!user) return res.status(404).json({ status: 'fail', message: 'User not found' });
    const idx = user.cart.findIndex(c => String(c.product) === String(productId));
    if (idx < 0) return res.status(404).json({ status: 'fail', message: 'Item not in cart' });
    if (qty <= 0) {
      user.cart = user.cart.filter(c => String(c.product) !== String(productId));
    } else {
      user.cart[idx].quantity = qty;
    }
    await user.save();
    return res.status(200).json({ status: 'success', items: user.cart });
  } catch (err) {
    return res.status(500).json({ status: 'fail', message: 'Server error' });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!productId) return res.status(400).json({ status: 'fail', message: 'Product ID required' });
    const user = await User.findById(req.user.id).select('cart');
    if (!user) return res.status(404).json({ status: 'fail', message: 'User not found' });
    user.cart = user.cart.filter(c => String(c.product) !== String(productId));
    await user.save();
    return res.status(200).json({ status: 'success', items: user.cart });
  } catch (err) {
    return res.status(500).json({ status: 'fail', message: 'Server error' });
  }
};

exports.getCartCount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('cart').populate('cart.product');
    if (!user) return res.status(404).json({ status: 'fail', message: 'User not found' });
    
    // Only count items where product still exists and isn't blocked
    const count = user.cart
      .filter(item => item.product && !item.product.blocked)
      .reduce((s, item) => s + (item.quantity || 0), 0);
      
    return res.status(200).json({ status: 'success', count });
  } catch (err) {
    console.error('Get cart count error:', err);
    return res.status(500).json({ status: 'fail', message: 'Server error' });
  }
};
