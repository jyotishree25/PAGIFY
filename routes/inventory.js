const express = require('express');
const auth = require('../middleware/auth');
const controller = require('../controllers/inventoryController');

const router = express.Router();

router.use(auth);

router.get('/wishlist', controller.getWishlist);
router.post('/wishlist', controller.addToWishlist);
router.delete('/wishlist/:productId', controller.removeFromWishlist);
router.get('/wishlist/count', controller.getWishlistCount);

router.get('/cart', controller.getCart);
router.post('/cart/add', controller.addToCart);
router.patch('/cart', controller.updateCartItem);
router.delete('/cart/:productId', controller.removeFromCart);
router.get('/cart/count', controller.getCartCount);

module.exports = router;
