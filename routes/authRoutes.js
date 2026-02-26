const express = require('express');
const router = express.Router();
const { register, login, getMe, logout, changePassword } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

// Protected route - only admins can create new users
router.post('/register', protect, authorize('admin'), register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/logout', protect, logout);
router.put('/change-password', protect, changePassword);

module.exports = router;
