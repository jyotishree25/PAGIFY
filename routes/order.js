const express = require('express');
const auth = require('../middleware/auth');
const orderController = require('../controllers/orderController');

const router = express.Router();

router.use(auth);

router.post('/', orderController.createOrder);
router.get('/my-orders', orderController.getMyOrders);
router.get('/all', orderController.getAllOrders); // Consider adding admin check middleware here if needed
router.get('/admin-stats', orderController.getAdminStats);

module.exports = router;
