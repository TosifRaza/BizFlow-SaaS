const subscriptionService = require('../services/subscriptionService');
const { successResponse } = require('../utils/response');

const getCurrentPlan = async (req, res, next) => {
  try {
    const subscription = await subscriptionService.getCurrentPlan(req.businessId);
    successResponse(res, subscription);
  } catch (error) {
    next(error);
  }
};

const getPlans = async (req, res, next) => {
  try {
    const plans = await subscriptionService.getPlans();
    successResponse(res, plans);
  } catch (error) {
    next(error);
  }
};

const subscribe = async (req, res, next) => {
  try {
    const subscription = await subscriptionService.subscribe(req.businessId, req.body, req.user._id);
    successResponse(res, subscription, 'Subscription activated');
  } catch (error) {
    next(error);
  }
};

const cancel = async (req, res, next) => {
  try {
    const subscription = await subscriptionService.cancel(req.businessId);
    successResponse(res, subscription, 'Subscription cancelled');
  } catch (error) {
    next(error);
  }
};

const getUsage = async (req, res, next) => {
  try {
    const usage = await subscriptionService.getUsage(req.businessId);
    successResponse(res, usage);
  } catch (error) {
    next(error);
  }
};

const checkLimit = async (req, res, next) => {
  try {
    const result = await subscriptionService.checkLimit(req.businessId, req.params.feature);
    successResponse(res, result);
  } catch (error) {
    next(error);
  }
};

const createPaymentIntent = async (req, res, next) => {
  try {
    const { planId } = req.body;
    const result = await subscriptionService.createPaymentIntent(null, planId);
    successResponse(res, result, 'Payment intent created');
  } catch (error) {
    next(error);
  }
};

const verifyPayment = async (req, res, next) => {
  try {
    const { subscriptionId, ...paymentData } = req.body;
    const result = await subscriptionService.verifyPayment(subscriptionId, paymentData);
    successResponse(res, result, 'Payment verified and subscription activated');
  } catch (error) {
    next(error);
  }
};

module.exports = { getCurrentPlan, getPlans, subscribe, cancel, getUsage, checkLimit, createPaymentIntent, verifyPayment };
