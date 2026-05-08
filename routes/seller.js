const express = require('express');
const sellerController = require('../controllers/sellerController');
const sellerAuth = require('../middleware/sellerAuth');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/signup', upload.single('profilePicture'), sellerController.sellerSignup);
router.post('/login', sellerController.sellerLogin);
router.get('/me', sellerAuth, sellerController.getSellerMe);
router.get('/dashboard-stats', sellerAuth, sellerController.getSellerStats);
router.patch('/me', sellerAuth, sellerController.updateSellerMe);
router.patch('/change-password', sellerAuth, sellerController.changePassword);
router.post('/upload-profile-picture', sellerAuth, upload.single('profilePicture'), sellerController.uploadProfilePicture);

router.get('/', sellerController.getAllSellers);
router.patch('/:id', sellerController.updateSeller);
router.post('/:id/notify', sellerController.notifySeller);

module.exports = router;