// backend/routes/cart.js
const express = require('express');
const auth = require('../middleware/auth');
const cartController = require('../controllers/cartController');

const router = express.Router();

// Public routes (no auth required for getting product details)
router.post('/', cartController.getCart);
router.post('/validate', cartController.validateCart);
router.get('/product/:productId', cartController.getProductDetails);

// Protected routes (auth required)
router.use(auth);
router.post('/add', cartController.addToCart);
router.delete('/:productId', cartController.removeFromCart);

module.exports = router;
