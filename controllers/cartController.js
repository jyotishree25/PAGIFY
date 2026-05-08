// backend/controllers/cartController.js
const Product = require('../models/product');

// POST /api/v1/cart - Get cart items (fetch product details from IDs)
exports.getCart = async (req, res) => {
  try {
    const { productIds } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(200).json({
        status: 'success',
        results: 0,
        products: []
      });
    }

    const products = await Product.find({ _id: { $in: productIds } });

    return res.status(200).json({
      status: 'success',
      results: products.length,
      products
    });
  } catch (err) {
    console.error('Cart fetch error:', err);
    return res.status(500).json({
      status: 'fail',
      message: 'Server error'
    });
  }
};

// POST /api/v1/cart/add - Add item to cart (for future backend cart storage)
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({
        status: 'fail',
        message: 'Product ID and quantity are required'
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found'
      });
    }

    if (product.blocked) {
      return res.status(400).json({
        status: 'fail',
        message: 'Product is blocked'
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        status: 'fail',
        message: `Insufficient stock. Available: ${product.stock}`
      });
    }

    // ✅ Increment cartCount for bestseller tracking
    await Product.findByIdAndUpdate(
      productId,
      { $inc: { cartCount: quantity } },
      { new: true }
    );

    return res.status(200).json({
      status: 'success',
      message: 'Product added to cart successfully',
      product
    });
  } catch (err) {
    console.error('Add to cart error:', err);
    return res.status(500).json({
      status: 'fail',
      message: 'Server error'
    });
  }
};

// DELETE /api/v1/cart/:productId - Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Product ID is required'
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Item removed from cart'
    });
  } catch (err) {
    console.error('Remove from cart error:', err);
    return res.status(500).json({
      status: 'fail',
      message: 'Server error'
    });
  }
};

// POST /api/v1/cart/validate - Validate cart items before checkout
exports.validateCart = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Items array is required'
      });
    }

    const productIds = items.map(item => item._id || item.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    const validatedItems = items.map(item => {
      const productId = item._id || item.productId;
      const product = products.find(p => p._id.toString() === productId);
      
      if (!product) {
        return {
          productId,
          valid: false,
          reason: 'Product not found'
        };
      }

      if (product.blocked) {
        return {
          productId,
          valid: false,
          reason: 'Product is blocked'
        };
      }

      if (product.stock < item.quantity) {
        return {
          productId,
          valid: false,
          reason: `Insufficient stock. Available: ${product.stock}, Requested: ${item.quantity}`
        };
      }

      return {
        productId,
        valid: true,
        product
      };
    });

    const allValid = validatedItems.every(item => item.valid);

    return res.status(200).json({
      status: 'success',
      allValid,
      validatedItems
    });
  } catch (err) {
    console.error('Validate cart error:', err);
    return res.status(500).json({
      status: 'fail',
      message: 'Server error'
    });
  }
};

// GET /api/v1/cart/product/:productId - Get single product details
exports.getProductDetails = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found'
      });
    }

    return res.status(200).json({
      status: 'success',
      product
    });
  } catch (err) {
    console.error('Get product details error:', err);
    return res.status(500).json({
      status: 'fail',
      message: 'Server error'
    });
  }
};
