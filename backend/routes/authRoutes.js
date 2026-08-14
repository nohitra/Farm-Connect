const express = require('express');
const router = express.Router();
const { register, login, googleAuth, forgotPassword, resetPassword, checkEmail, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public auth routes
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/check-email', checkEmail);

// Protected user route
router.get('/me', protect, getMe);

module.exports = router;
