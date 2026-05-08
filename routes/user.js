// backend/routes/user.js
const express = require('express');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { getMe, updateMe, changePassword, getAllUsers, uploadProfilePicture } = require('../controllers/userController');
const userController = require('../controllers/userController');
const router = express.Router();

router.get('/', auth, getAllUsers);
router.get('/me', auth, getMe);
router.patch('/me', auth, updateMe);
router.patch('/change-password', auth, changePassword);
router.post('/upload-profile-picture', auth, upload.single('profilePicture'), uploadProfilePicture);

module.exports = router;