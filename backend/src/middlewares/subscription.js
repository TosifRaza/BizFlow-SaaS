const Subscription = require('../models/Subscription');
const Plan = require('../models/Plan');
const Business = require('../models/Business');

const checkSubscription = async (req, res, next) => {
  try {
    if (!req.businessId || req.user?.role === 'super_admin') return next();
    const sub = await Subscription.findOne({ businessId: req.businessId, status: 'active' }).populate('planId');
    if (!sub) {
      // Check if in trial
      const business = await Business.findById(req.businessId);
      if (business?.trialEndDate && new Date(business.trialEndDate) > new Date()) {
        return next();
      }
      return res.status(403).json({ success: false, message: 'No active subscription. Please subscribe to continue.', errorCode: 'NO_SUBSCRIPTION' });
    }
    if (sub.planId?.maxProducts && req.method !== 'GET') {
      const Product = require('../models/Product');
      const productCount = await Product.countDocuments({ businessId: req.businessId, status: 'active' });
      // This is a soft check - just for awareness
    }
    req.subscription = sub;
    next();
  } catch (error) { next(error); }
};

module.exports = { checkSubscription };
