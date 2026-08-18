const Subscription = require('../models/Subscription');
const Plan = require('../models/Plan');
const Business = require('../models/Business');
const Payment = require('../models/Payment');
const notificationService = require('./notificationService');
const { AppError } = require('../middlewares/validation');

class SubscriptionError extends Error {
  constructor(message, statusCode) { super(message); this.statusCode = statusCode; }
}

const getCurrentPlan = async (businessId) => {
  const subscription = await Subscription.findOne({ businessId }).populate('planId').lean();
  if (!subscription) throw new SubscriptionError('No subscription found', 404);
  return subscription;
};

const getPlans = async () => {
  const plans = await Plan.find({ status: 'active' }).sort('price').lean();
  return plans;
};

const subscribe = async (businessId, { planId, paymentMethod }, userId) => {
  const plan = await Plan.findById(planId);
  if (!plan) throw new SubscriptionError('Plan not found', 404);

  const now = new Date();
  let endDate = new Date(now);
  if (plan.interval === 'monthly') {
    endDate.setMonth(endDate.getMonth() + 1);
  } else {
    endDate.setFullYear(endDate.getFullYear() + 1);
  }

  const subscription = await Subscription.findOneAndUpdate(
    { businessId },
    { planId, status: 'active', startDate: now, endDate, paymentMethod },
    { new: true, upsert: true }
  );

  await Business.findByIdAndUpdate(businessId, {
    subscriptionStatus: 'active',
    planId,
  });

  await Payment.create({
    businessId, subscriptionId: subscription._id, planId,
    amount: plan.price, currency: 'INR',
    paymentProvider: 'manual', status: 'completed',
  });

  return subscription.populate('planId');
};

const cancel = async (businessId) => {
  const subscription = await Subscription.findOne({ businessId });
  if (!subscription) throw new SubscriptionError('No subscription found', 404);
  subscription.status = 'cancelled';
  await subscription.save();

  await Business.findByIdAndUpdate(businessId, { subscriptionStatus: 'expired' });
  return subscription;
};

const getUsage = async (businessId) => {
  const business = await Business.findById(businessId).populate('planId').lean();
  if (!business) throw new SubscriptionError('Business not found', 404);

  return {
    products: { used: business.usage.productsUsed, limit: business.planId?.limits?.products || 0 },
    users: { used: business.usage.usersUsed, limit: business.planId?.limits?.users || 0 },
    branches: { used: business.usage.branchesUsed, limit: business.planId?.limits?.branches || 0 },
  };
};

const checkLimit = async (businessId, feature) => {
  const business = await Business.findById(businessId).populate('planId').lean();
  if (!business) throw new SubscriptionError('Business not found', 404);

  const limits = business.planId?.limits || {};
  const usage = business.usage || {};

  const featureMap = { products: 'productsUsed', users: 'usersUsed', branches: 'branchesUsed' };
  const usageKey = featureMap[feature];
  if (!usageKey) return { allowed: true, used: 0, limit: 0 };

  const used = usage[usageKey] || 0;
  const limit = limits[feature] || 0;
  return { allowed: used < limit, used, limit };
};

const checkRenewalReminders = async () => {
  const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const expiringSoon = await Subscription.find({
    status: 'active',
    endDate: { $lte: sevenDaysFromNow, $gt: new Date() },
  }).populate('businessId').populate('planId').lean();

  for (const sub of expiringSoon) {
    const business = sub.businessId;
    if (!business || !business.createdBy) continue;
    const daysLeft = Math.ceil((new Date(sub.endDate) - new Date()) / (1000 * 60 * 60 * 24));
    try {
      await notificationService.create({
        userId: business.createdBy,
        businessId: business._id,
        type: 'subscription',
        title: 'Subscription Expiring Soon',
        message: `Your ${sub.planId?.name || 'subscription'} plan expires in ${daysLeft} day${daysLeft > 1 ? 's' : ''}. Renew to avoid service interruption.`,
        data: { subscriptionId: sub._id, planName: sub.planId?.name, daysLeft, endDate: sub.endDate },
      });
    } catch {}
  }
  return { notified: expiringSoon.length };
};

const createPaymentIntent = async (subscriptionId, planId) => {
  const plan = await Plan.findById(planId);
  if (!plan) throw new AppError('Plan not found', 404);

  const orderId = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  return {
    orderId,
    amount: plan.price,
    currency: 'INR',
    gateway: 'razorpay',
    key: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  };
};

const verifyPayment = async (subscriptionId, paymentData) => {
  const sub = await Subscription.findByIdAndUpdate(
    subscriptionId,
    { status: 'active', startDate: new Date() },
    { new: true }
  );
  if (!sub) throw new AppError('Subscription not found', 404);

  await Payment.create({
    businessId: sub.businessId,
    subscriptionId: sub._id,
    planId: sub.planId,
    amount: paymentData.amount || 0,
    currency: 'INR',
    paymentProvider: 'razorpay',
    paymentId: paymentData.paymentId,
    orderId: paymentData.orderId,
    status: 'completed',
  });

  await Business.findByIdAndUpdate(sub.businessId, {
    subscriptionStatus: 'active',
    planId: sub.planId,
  });

  return sub.populate('planId');
};

module.exports = { getCurrentPlan, getPlans, subscribe, cancel, getUsage, checkLimit, checkRenewalReminders, createPaymentIntent, verifyPayment };
