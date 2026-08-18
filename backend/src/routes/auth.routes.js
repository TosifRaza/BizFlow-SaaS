const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middlewares/auth');
const { authLimiter } = require('../middlewares/rateLimiter');
const validate = require('../middlewares/validate');

router.post('/register', authLimiter, validate({
  email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Valid email is required' },
  password: { required: true, minLength: 8, message: 'Password must be at least 8 characters' },
  name: { required: true, minLength: 1, message: 'Name is required' },
  businessName: { required: true, minLength: 1, message: 'Business name is required' },
}), authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/change-password', verifyToken, authController.changePassword);
router.get('/profile', verifyToken, authController.getProfile);
router.put('/profile', verifyToken, authController.updateProfile);

module.exports = router;
