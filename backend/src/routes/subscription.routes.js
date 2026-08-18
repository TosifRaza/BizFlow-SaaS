const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { verifyToken } = require('../middlewares/auth');
const { setTenant } = require('../middlewares/tenant');

router.use(verifyToken, setTenant);
router.get('/current', subscriptionController.getCurrentPlan);
router.get('/plans', subscriptionController.getPlans);
router.post('/subscribe', subscriptionController.subscribe);
router.post('/create-payment-intent', subscriptionController.createPaymentIntent);
router.post('/verify-payment', subscriptionController.verifyPayment);
router.post('/cancel', subscriptionController.cancel);
router.get('/usage', subscriptionController.getUsage);
router.get('/check-limit/:feature', subscriptionController.checkLimit);

module.exports = router;