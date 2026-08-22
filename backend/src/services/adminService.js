// const Business = require('../models/Business');
// const User = require('../models/User');
// const Plan = require('../models/Plan');
// const Subscription = require('../models/Subscription');
// const Payment = require('../models/Payment');
// const AuditLog = require('../models/AuditLog');
// const config = require('../config');

// class AdminError extends Error {
//   constructor(message, statusCode) { super(message); this.statusCode = statusCode; }
// }

// const getDashboard = async () => {
//   const now = new Date();
//   const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
//   const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
//   const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

//   // --- Basic counts ---
//   const [
//     totalBusinesses,
//     activeBusinesses,
//     trialBusinesses,
//     paidBusinesses,
//     expiredBusinesses,
//     totalUsers,
//     totalPlans,
//     totalRevenueResult,
//     recentBusinesses,
//     // Trend data via aggregations
//     thisMonthNewBiz,
//     lastMonthNewBiz,
//     thisMonthActiveSubs,
//     lastMonthActiveSubs,
//     thisMonthTrialBiz,
//     lastMonthTrialBiz,
//     thisMonthPaidBiz,
//     lastMonthPaidBiz,
//     thisMonthExpiredBiz,
//     lastMonthExpiredBiz,
//     thisMonthRevenue,
//     lastMonthRevenue,
//     thisMonthNewUsers,
//     lastMonthNewUsers,
//     // Chart data
//     businessesOverTime,
//     subscriptionGrowthRaw,
//     revenueTrendRaw,
//     planDistributionRaw,
//     // MRR
//     mrrResult,
//   ] = await Promise.all([
//     // Basic counts
//     Business.countDocuments(),
//     Business.countDocuments({ status: 'active', subscriptionStatus: 'active' }),
//     Business.countDocuments({ subscriptionStatus: 'trial' }),
//     Business.countDocuments({ subscriptionStatus: 'active', planId: { $ne: null } }),
//     Business.countDocuments({ subscriptionStatus: 'expired' }),
//     User.countDocuments({ role: { $ne: 'super_admin' } }),
//     Plan.countDocuments(),
//     Payment.aggregate([{ $match: { status: 'completed' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
//     Business.find().sort('-createdAt').limit(5).select('name type subscriptionStatus createdAt').lean(),
//     // Trend calculations
//     Business.countDocuments({ createdAt: { $gte: thisMonthStart, $lt: now } }),
//     Business.countDocuments({ createdAt: { $gte: lastMonthStart, $lt: thisMonthStart } }),
//     Business.countDocuments({ subscriptionStatus: 'active', createdAt: { $gte: thisMonthStart, $lt: now } }),
//     Business.countDocuments({ subscriptionStatus: 'active', createdAt: { $gte: lastMonthStart, $lt: thisMonthStart } }),
//     Business.countDocuments({ subscriptionStatus: 'trial', createdAt: { $gte: thisMonthStart, $lt: now } }),
//     Business.countDocuments({ subscriptionStatus: 'trial', createdAt: { $gte: lastMonthStart, $lt: thisMonthStart } }),
//     Business.countDocuments({ subscriptionStatus: 'active', planId: { $ne: null }, createdAt: { $gte: thisMonthStart, $lt: now } }),
//     Business.countDocuments({ subscriptionStatus: 'active', planId: { $ne: null }, createdAt: { $gte: lastMonthStart, $lt: thisMonthStart } }),
//     Business.countDocuments({ subscriptionStatus: 'expired', createdAt: { $gte: thisMonthStart, $lt: now } }),
//     Business.countDocuments({ subscriptionStatus: 'expired', createdAt: { $gte: lastMonthStart, $lt: thisMonthStart } }),
//     Payment.aggregate([
//       { $match: { status: 'completed', createdAt: { $gte: thisMonthStart, $lt: now } } },
//       { $group: { _id: null, total: { $sum: '$amount' } } },
//     ]),
//     Payment.aggregate([
//       { $match: { status: 'completed', createdAt: { $gte: lastMonthStart, $lt: thisMonthStart } } },
//       { $group: { _id: null, total: { $sum: '$amount' } } },
//     ]),
//     User.countDocuments({ role: { $ne: 'super_admin' }, createdAt: { $gte: thisMonthStart, $lt: now } }),
//     User.countDocuments({ role: { $ne: 'super_admin' }, createdAt: { $gte: lastMonthStart, $lt: thisMonthStart } }),
//     // Chart data
//     Business.aggregate([
//       { $match: { createdAt: { $gte: twelveMonthsAgo } } },
//       { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
//       { $sort: { _id: 1 } },
//     ]),
//     Subscription.aggregate([
//       { $group: { _id: '$planId', count: { $sum: 1 } } },
//     ]).then(async (subs) => {
//       const plans = await Plan.find().lean();
//       return subs.map((s) => {
//         const plan = plans.find((p) => p._id.toString() === s._id.toString());
//         return { plan: plan?.name || 'Unknown', count: s.count };
//       });
//     }),
//     Payment.aggregate([
//       { $match: { status: 'completed', createdAt: { $gte: twelveMonthsAgo } } },
//       { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, revenue: { $sum: '$amount' } } },
//       { $sort: { _id: 1 } },
//     ]),
//     Business.aggregate([
//       { $group: { _id: '$planId', count: { $sum: 1 } } },
//     ]).then(async (bizPlans) => {
//       const plans = await Plan.find().lean();
//       return bizPlans.map((bp) => {
//         const plan = plans.find((p) => p._id.toString() === bp._id.toString());
//         return { plan: plan?.name || 'Unknown', count: bp.count };
//       });
//     }),
//     // MRR: sum of active subscription plan prices
//     Subscription.aggregate([
//       { $match: { status: { $in: ['active', 'trial'] } } },
//       { $lookup: { from: 'plans', localField: 'planId', foreignField: '_id', as: 'plan' } },
//       { $unwind: { path: '$plan', preserveNullAndEmptyArrays: true } },
//       { $group: { _id: null, total: { $sum: '$plan.price' } } },
//     ]),
//   ]);

//   // Helper: compute percentage trend
//   const pctChange = (current, previous) => {
//     if (previous === 0) return current > 0 ? 100 : 0;
//     return Math.round(((current - previous) / previous) * 100);
//   };
//   const trendDir = (pct) => (pct > 0 ? 'up' : pct < 0 ? 'down' : 'neutral');

//   const totalRevenue = totalRevenueResult[0]?.total || 0;
//   const mrr = mrrResult[0]?.total || 0;

//   // Revenue trends
//   const thisMonthRev = thisMonthRevenue[0]?.total || 0;
//   const lastMonthRev = lastMonthRevenue[0]?.total || 0;

//   // Determine MRR trend direction by comparing active subscription counts
//   const mrrTrendDir = thisMonthActiveSubs >= lastMonthActiveSubs ? 'up' : 'down';
//   const mrrTrend = pctChange(thisMonthActiveSubs, lastMonthActiveSubs);

//   const stats = {
//     totalBusinesses,
//     totalBusinessesTrend: pctChange(thisMonthNewBiz, lastMonthNewBiz),
//     totalBusinessesTrendDir: trendDir(pctChange(thisMonthNewBiz, lastMonthNewBiz)),
//     activeBusinesses,
//     activeBusinessesTrend: pctChange(thisMonthActiveSubs, lastMonthActiveSubs),
//     activeBusinessesTrendDir: trendDir(pctChange(thisMonthActiveSubs, lastMonthActiveSubs)),
//     trialBusinesses,
//     trialBusinessesTrend: pctChange(thisMonthTrialBiz, lastMonthTrialBiz),
//     trialBusinessesTrendDir: trendDir(pctChange(thisMonthTrialBiz, lastMonthTrialBiz)),
//     paidBusinesses,
//     paidBusinessesTrend: pctChange(thisMonthPaidBiz, lastMonthPaidBiz),
//     paidBusinessesTrendDir: trendDir(pctChange(thisMonthPaidBiz, lastMonthPaidBiz)),
//     expiredBusinesses,
//     expiredBusinessesTrend: pctChange(thisMonthExpiredBiz, lastMonthExpiredBiz),
//     expiredBusinessesTrendDir: trendDir(pctChange(thisMonthExpiredBiz, lastMonthExpiredBiz)),
//     monthlyRecurringRevenue: mrr,
//     mrrTrend,
//     mrrTrendDir,
//     totalRevenue,
//     totalRevenueTrend: pctChange(thisMonthRev, lastMonthRev),
//     totalRevenueTrendDir: trendDir(pctChange(thisMonthRev, lastMonthRev)),
//     newThisMonth: thisMonthNewBiz,
//     newThisMonthTrend: pctChange(thisMonthNewBiz, lastMonthNewBiz),
//     newThisMonthTrendDir: trendDir(pctChange(thisMonthNewBiz, lastMonthNewBiz)),
//     totalUsers,
//     totalUsersTrend: pctChange(thisMonthNewUsers, lastMonthNewUsers),
//     totalUsersTrendDir: trendDir(pctChange(thisMonthNewUsers, lastMonthNewUsers)),
//     totalPlans,
//   };

//   return {
//     stats,
//     businessesOverTime: businessesOverTime.map((b) => ({ month: b._id, count: b.count })),
//     subscriptionGrowth: subscriptionGrowthRaw,
//     revenueTrend: revenueTrendRaw.map((r) => ({ month: r._id, revenue: r.revenue })),
//     planDistribution: planDistributionRaw,
//     recentBusinesses,
//   };
// };

// const getBusinesses = async (query) => {
//   const page = parseInt(query.page) || config.pagination.defaultPage;
//   const limit = Math.min(parseInt(query.limit) || config.pagination.defaultLimit, config.pagination.maxLimit);
//   const skip = (page - 1) * limit;
//   const filter = {};
//   if (query.status) filter.status = query.status;
//   if (query.subscriptionStatus) filter.subscriptionStatus = query.subscriptionStatus;
//   if (query.search) filter.name = { $regex: query.search, $options: 'i' };

//   const [data, total] = await Promise.all([
//     Business.find(filter).populate('planId', 'name price').sort('-createdAt').skip(skip).limit(limit).lean(),
//     Business.countDocuments(filter),
//   ]);
//   return { data, page, limit, total };
// };

// const getBusinessById = async (id) => {
//   const business = await Business.findById(id).populate('planId').populate('createdBy', 'name email').lean();
//   if (!business) throw new AdminError('Business not found', 404);
//   const userCount = await User.countDocuments({ businessId: id });
//   const productCount = await require('../models/Product').countDocuments({ businessId: id });
//   return { ...business, userCount, productCount };
// };

// const activateBusiness = async (id, userId) => {
//   const business = await Business.findByIdAndUpdate(id, { status: 'active', subscriptionStatus: 'active' }, { new: true });
//   if (!business) throw new AdminError('Business not found', 404);
//   await AuditLog.create({
//     userId,
//     businessId: business._id,
//     action: 'business_activated',
//     resource: 'business',
//     resourceId: business._id,
//     metadata: { businessName: business.name },
//   });
//   return business;
// };

// const suspendBusiness = async (id, userId) => {
//   const business = await Business.findByIdAndUpdate(id, { status: 'suspended', subscriptionStatus: 'suspended' }, { new: true });
//   if (!business) throw new AdminError('Business not found', 404);
//   await User.updateMany({ businessId: id }, { status: 'suspended' });
//   await AuditLog.create({
//     userId,
//     businessId: business._id,
//     action: 'business_suspended',
//     resource: 'business',
//     resourceId: business._id,
//     metadata: { businessName: business.name },
//   });
//   return business;
// };

// const getPlans = async () => {
//   return await Plan.find().sort('price').lean();
// };

// const createPlan = async (data) => {
//   const plan = await Plan.create(data);
//   return plan;
// };

// const updatePlan = async (id, data) => {
//   const plan = await Plan.findByIdAndUpdate(id, data, { new: true, runValidators: true });
//   if (!plan) throw new AdminError('Plan not found', 404);
//   return plan;
// };

// const getSubscriptions = async (query) => {
//   const page = parseInt(query.page) || config.pagination.defaultPage;
//   const limit = Math.min(parseInt(query.limit) || config.pagination.defaultLimit, config.pagination.maxLimit);
//   const skip = (page - 1) * limit;
//   const filter = {};
//   if (query.status) filter.status = query.status;

//   const [data, total] = await Promise.all([
//     Subscription.find(filter).populate('businessId', 'name email').populate('planId', 'name price').sort('-createdAt').skip(skip).limit(limit).lean(),
//     Subscription.countDocuments(filter),
//   ]);
//   return { data, page, limit, total };
// };

// const getPayments = async (query) => {
//   const page = parseInt(query.page) || config.pagination.defaultPage;
//   const limit = Math.min(parseInt(query.limit) || config.pagination.defaultLimit, config.pagination.maxLimit);
//   const skip = (page - 1) * limit;
//   const filter = {};
//   if (query.status) filter.status = query.status;

//   const [data, total] = await Promise.all([
//     Payment.find(filter).populate('businessId', 'name').populate('planId', 'name').sort('-createdAt').skip(skip).limit(limit).lean(),
//     Payment.countDocuments(filter),
//   ]);
//   return { data, page, limit, total };
// };

// const getAuditLogs = async (query) => {
//   const page = parseInt(query.page) || config.pagination.defaultPage;
//   const limit = Math.min(parseInt(query.limit) || config.pagination.defaultLimit, config.pagination.maxLimit);
//   const skip = (page - 1) * limit;
//   const filter = {};
//   if (query.businessId) filter.businessId = query.businessId;
//   if (query.userId) filter.userId = query.userId;
//   if (query.resource) filter.resource = query.resource;

//   const [data, total] = await Promise.all([
//     AuditLog.find(filter).populate('userId', 'name email').populate('businessId', 'name').sort('-createdAt').skip(skip).limit(limit).lean(),
//     AuditLog.countDocuments(filter),
//   ]);
//   return { data, page, limit, total };
// };

// const getUsers = async (query) => {
//   const page = parseInt(query.page) || config.pagination.defaultPage;
//   const limit = Math.min(parseInt(query.limit) || config.pagination.defaultLimit, config.pagination.maxLimit);
//   const skip = (page - 1) * limit;
//   const filter = { role: { $ne: 'super_admin' } };
//   if (query.search) filter.$or = [
//     { name: { $regex: query.search, $options: 'i' } },
//     { email: { $regex: query.search, $options: 'i' } },
//   ];
//   if (query.status) filter.status = query.status;
//   if (query.role) filter.role = query.role;
//   const [data, total] = await Promise.all([
//     User.find(filter).select('-password').populate('businessId', 'name type').sort('-createdAt').skip(skip).limit(limit).lean(),
//     User.countDocuments(filter),
//   ]);
//   return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
// };

// const getRevenue = async (query) => {
//   const match = { status: 'completed' };
//   if (query.startDate && query.endDate) {
//     match.createdAt = { $gte: new Date(query.startDate), $lte: new Date(query.endDate) };
//   }

//   const [totalRevenue, monthlyRevenue] = await Promise.all([
//     Payment.aggregate([{ $match: match }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
//     Payment.aggregate([
//       { $match: match },
//       { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, total: { $sum: '$amount' }, count: { $sum: 1 } } },
//       { $sort: { _id: 1 } },
//     ]),
//   ]);

//   return { totalRevenue: totalRevenue[0]?.total || 0, monthlyRevenue };
// };

// module.exports = { getDashboard, getBusinesses, getBusinessById, activateBusiness, suspendBusiness, getPlans, createPlan, updatePlan, getSubscriptions, getPayments, getAuditLogs, getRevenue, getUsers };

const Business = require('../models/Business');
const User = require('../models/User');
const Plan = require('../models/Plan');
const Product = require('../models/Product');
const Subscription = require('../models/Subscription');
const Payment = require('../models/Payment');
const AuditLog = require('../models/AuditLog');
const config = require('../config');

class AdminError extends Error {
  constructor(message, statusCode) { super(message); this.statusCode = statusCode; }
}

const getDashboard = async () => {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  const [
    totalBusinesses,
    activeBusinesses,
    trialBusinesses,
    paidBusinesses,
    expiredBusinesses,
    totalUsers,
    totalPlans,
    totalRevenueResult,
    recentBusinesses,
    thisMonthNewBiz,
    lastMonthNewBiz,
    thisMonthActiveSubs,
    lastMonthActiveSubs,
    thisMonthTrialBiz,
    lastMonthTrialBiz,
    thisMonthPaidBiz,
    lastMonthPaidBiz,
    thisMonthExpiredBiz,
    lastMonthExpiredBiz,
    thisMonthRevenue,
    lastMonthRevenue,
    thisMonthNewUsers,
    lastMonthNewUsers,
    businessesOverTime,
    subscriptionGrowthRaw,
    revenueTrendRaw,
    planDistributionRaw,
    mrrResult,
  ] = await Promise.all([
    Business.countDocuments(),
    Business.countDocuments({ status: 'active', subscriptionStatus: 'active' }),
    Business.countDocuments({ subscriptionStatus: 'trial' }),
    Business.countDocuments({ subscriptionStatus: 'active', planId: { $ne: null } }),
    Business.countDocuments({ subscriptionStatus: 'expired' }),
    User.countDocuments({ role: { $ne: 'super_admin' } }),
    Plan.countDocuments(),
    Payment.aggregate([{ $match: { status: 'completed' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Business.find().sort('-createdAt').limit(5).select('name type subscriptionStatus createdAt').lean(),
    Business.countDocuments({ createdAt: { $gte: thisMonthStart, $lt: now } }),
    Business.countDocuments({ createdAt: { $gte: lastMonthStart, $lt: thisMonthStart } }),
    Business.countDocuments({ subscriptionStatus: 'active', createdAt: { $gte: thisMonthStart, $lt: now } }),
    Business.countDocuments({ subscriptionStatus: 'active', createdAt: { $gte: lastMonthStart, $lt: thisMonthStart } }),
    Business.countDocuments({ subscriptionStatus: 'trial', createdAt: { $gte: thisMonthStart, $lt: now } }),
    Business.countDocuments({ subscriptionStatus: 'trial', createdAt: { $gte: lastMonthStart, $lt: thisMonthStart } }),
    Business.countDocuments({ subscriptionStatus: 'active', planId: { $ne: null }, createdAt: { $gte: thisMonthStart, $lt: now } }),
    Business.countDocuments({ subscriptionStatus: 'active', planId: { $ne: null }, createdAt: { $gte: lastMonthStart, $lt: thisMonthStart } }),
    Business.countDocuments({ subscriptionStatus: 'expired', createdAt: { $gte: thisMonthStart, $lt: now } }),
    Business.countDocuments({ subscriptionStatus: 'expired', createdAt: { $gte: lastMonthStart, $lt: thisMonthStart } }),
    Payment.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: thisMonthStart, $lt: now } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Payment.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: lastMonthStart, $lt: thisMonthStart } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    User.countDocuments({ role: { $ne: 'super_admin' }, createdAt: { $gte: thisMonthStart, $lt: now } }),
    User.countDocuments({ role: { $ne: 'super_admin' }, createdAt: { $gte: lastMonthStart, $lt: thisMonthStart } }),
    Business.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Subscription.aggregate([
      { $group: { _id: '$planId', count: { $sum: 1 } } },
    ]).then(async (subs) => {
      const plans = await Plan.find().lean();
      return subs.map((s) => {
        const plan = plans.find((p) => p._id.toString() === s._id.toString());
        return { plan: plan?.name || 'Unknown', count: s.count };
      });
    }),
    Payment.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: twelveMonthsAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, revenue: { $sum: '$amount' } } },
      { $sort: { _id: 1 } },
    ]),
    Business.aggregate([
      { $group: { _id: '$planId', count: { $sum: 1 } } },
    ]).then(async (bizPlans) => {
      const plans = await Plan.find().lean();
      return bizPlans.map((bp) => {
        const plan = plans.find((p) => p._id.toString() === bp._id.toString());
        return { plan: plan?.name || 'Unknown', count: bp.count };
      });
    }),
    Subscription.aggregate([
      { $match: { status: { $in: ['active', 'trial'] } } },
      { $lookup: { from: 'plans', localField: 'planId', foreignField: '_id', as: 'plan' } },
      { $unwind: { path: '$plan', preserveNullAndEmptyArrays: true } },
      { $group: { _id: null, total: { $sum: '$plan.price' } } },
    ]),
  ]);

  const pctChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };
  const trendDir = (pct) => (pct > 0 ? 'up' : pct < 0 ? 'down' : 'neutral');

  const totalRevenue = totalRevenueResult[0]?.total || 0;
  const mrr = mrrResult[0]?.total || 0;
  const thisMonthRev = thisMonthRevenue[0]?.total || 0;
  const lastMonthRev = lastMonthRevenue[0]?.total || 0;
  const mrrTrendDir = thisMonthActiveSubs >= lastMonthActiveSubs ? 'up' : 'down';
  const mrrTrend = pctChange(thisMonthActiveSubs, lastMonthActiveSubs);

  const stats = {
    totalBusinesses,
    totalBusinessesTrend: pctChange(thisMonthNewBiz, lastMonthNewBiz),
    totalBusinessesTrendDir: trendDir(pctChange(thisMonthNewBiz, lastMonthNewBiz)),
    activeBusinesses,
    activeBusinessesTrend: pctChange(thisMonthActiveSubs, lastMonthActiveSubs),
    activeBusinessesTrendDir: trendDir(pctChange(thisMonthActiveSubs, lastMonthActiveSubs)),
    trialBusinesses,
    trialBusinessesTrend: pctChange(thisMonthTrialBiz, lastMonthTrialBiz),
    trialBusinessesTrendDir: trendDir(pctChange(thisMonthTrialBiz, lastMonthTrialBiz)),
    paidBusinesses,
    paidBusinessesTrend: pctChange(thisMonthPaidBiz, lastMonthPaidBiz),
    paidBusinessesTrendDir: trendDir(pctChange(thisMonthPaidBiz, lastMonthPaidBiz)),
    expiredBusinesses,
    expiredBusinessesTrend: pctChange(thisMonthExpiredBiz, lastMonthExpiredBiz),
    expiredBusinessesTrendDir: trendDir(pctChange(thisMonthExpiredBiz, lastMonthExpiredBiz)),
    monthlyRecurringRevenue: mrr,
    mrrTrend,
    mrrTrendDir,
    totalRevenue,
    totalRevenueTrend: pctChange(thisMonthRev, lastMonthRev),
    totalRevenueTrendDir: trendDir(pctChange(thisMonthRev, lastMonthRev)),
    newThisMonth: thisMonthNewBiz,
    newThisMonthTrend: pctChange(thisMonthNewBiz, lastMonthNewBiz),
    newThisMonthTrendDir: trendDir(pctChange(thisMonthNewBiz, lastMonthNewBiz)),
    totalUsers,
    totalUsersTrend: pctChange(thisMonthNewUsers, lastMonthNewUsers),
    totalUsersTrendDir: trendDir(pctChange(thisMonthNewUsers, lastMonthNewUsers)),
    totalPlans,
  };

  return {
    stats,
    businessesOverTime: businessesOverTime.map((b) => ({ month: b._id, count: b.count })),
    subscriptionGrowth: subscriptionGrowthRaw,
    revenueTrend: revenueTrendRaw.map((r) => ({ month: r._id, revenue: r.revenue })),
    planDistribution: planDistributionRaw,
    recentBusinesses,
  };
};

// ──────────────────────────────────────────────────
// FIX: getBusinesses — populate owner, plan, counts
// ──────────────────────────────────────────────────
const getBusinesses = async (query) => {
  const page = parseInt(query.page) || config.pagination.defaultPage;
  const limit = Math.min(parseInt(query.limit) || config.pagination.defaultLimit, config.pagination.maxLimit);
  const skip = (page - 1) * limit;
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.subscriptionStatus) filter.subscriptionStatus = query.subscriptionStatus;
  if (query.plan) filter.planId = query.plan;
  if (query.search) filter.name = { $regex: query.search, $options: 'i' };
  if (query.dateFrom || query.dateTo) {
    filter.createdAt = {};
    if (query.dateFrom) filter.createdAt.$gte = new Date(query.dateFrom);
    if (query.dateTo) filter.createdAt.$lte = new Date(query.dateTo);
  }

  const [data, total, productCounts, userCounts] = await Promise.all([
    Business.find(filter)
      .populate('planId', 'name price')
      .populate('createdBy', 'name email')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .lean(),
    Business.countDocuments(filter),
    Product.aggregate([
      { $group: { _id: '$businessId', count: { $sum: 1 } } },
    ]),
    User.aggregate([
      { $match: { role: { $ne: 'super_admin' } } },
      { $group: { _id: '$businessId', count: { $sum: 1 } } },
    ]),
  ]);

  const productMap = Object.fromEntries(productCounts.map(c => [c._id.toString(), c.count]));
  const userMap = Object.fromEntries(userCounts.map(c => [c._id.toString(), c.count]));

  const mappedData = data.map(b => ({
    ...b,
    id: b._id.toString(),
    owner: b.createdBy?.name || '',
    ownerEmail: b.createdBy?.email || '',
    plan: b.planId?.name || '',
    productsCount: productMap[b._id.toString()] || 0,
    usersCount: userMap[b._id.toString()] || 0,
  }));

  return { data: mappedData, page, limit, total };
};

// ──────────────────────────────────────────────────
// FIX: getBusinessById — map field names to match frontend
// ──────────────────────────────────────────────────
const getBusinessById = async (id) => {
  const business = await Business.findById(id)
    .populate('planId', 'name price')
    .populate('createdBy', 'name email')
    .lean();
  if (!business) throw new AdminError('Business not found', 404);

  const userCount = await User.countDocuments({ businessId: id });
  const productCount = await Product.countDocuments({ businessId: id });

  return {
    ...business,
    id: business._id.toString(),
    owner: business.createdBy?.name || '',
    ownerEmail: business.createdBy?.email || '',
    plan: business.planId?.name || '',
    productsCount: productCount,
    usersCount: userCount,
  };
};

// const activateBusiness = async (id, userId) => {
//   const business = await Business.findByIdAndUpdate(id, { status: 'active', subscriptionStatus: 'active' }, { new: true });
//   if (!business) throw new AdminError('Business not found', 404);
//   await AuditLog.create({
//     userId,
//     businessId: business._id,
//     action: 'business_activated',
//     resource: 'business',
//     resourceId: business._id,
//     metadata: { businessName: business.name },
//   });
//   return business;
// };
const activateBusiness = async (id, userId) => {
  const business = await Business.findByIdAndUpdate(id, { status: 'active', subscriptionStatus: 'active' }, { new: true });
  if (!business) throw new AdminError('Business not found', 404);
  await User.updateMany({ businessId: id }, { status: 'active' });
  await AuditLog.create({
    userId,
    businessId: business._id,
    action: 'business_activated',
    resource: 'business',
    resourceId: business._id,
    metadata: { businessName: business.name },
  });
  return business;
};
const suspendBusiness = async (id, userId) => {
  const business = await Business.findByIdAndUpdate(id, { status: 'suspended', subscriptionStatus: 'suspended' }, { new: true });
  if (!business) throw new AdminError('Business not found', 404);
  await User.updateMany({ businessId: id }, { status: 'suspended' });
  await AuditLog.create({
    userId,
    businessId: business._id,
    action: 'business_suspended',
    resource: 'business',
    resourceId: business._id,
    metadata: { businessName: business.name },
  });
  return business;
};

const getPlans = async () => {
  return await Plan.find().sort('price').lean();
};

const createPlan = async (data) => {
  const plan = await Plan.create(data);
  return plan;
};

const updatePlan = async (id, data) => {
  const plan = await Plan.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!plan) throw new AdminError('Plan not found', 404);
  return plan;
};

const getSubscriptions = async (query) => {
  const page = parseInt(query.page) || config.pagination.defaultPage;
  const limit = Math.min(parseInt(query.limit) || config.pagination.defaultLimit, config.pagination.maxLimit);
  const skip = (page - 1) * limit;
  const filter = {};
  if (query.status) filter.status = query.status;

  const [data, total] = await Promise.all([
    Subscription.find(filter).populate('businessId', 'name email').populate('planId', 'name price').sort('-createdAt').skip(skip).limit(limit).lean(),
    Subscription.countDocuments(filter),
  ]);
  return { data, page, limit, total };
};

const getPayments = async (query) => {
  const page = parseInt(query.page) || config.pagination.defaultPage;
  const limit = Math.min(parseInt(query.limit) || config.pagination.defaultLimit, config.pagination.maxLimit);
  const skip = (page - 1) * limit;
  const filter = {};
  if (query.status) filter.status = query.status;

  const [data, total] = await Promise.all([
    Payment.find(filter).populate('businessId', 'name').populate('planId', 'name').sort('-createdAt').skip(skip).limit(limit).lean(),
    Payment.countDocuments(filter),
  ]);
  return { data, page, limit, total };
};

const getAuditLogs = async (query) => {
  const page = parseInt(query.page) || config.pagination.defaultPage;
  const limit = Math.min(parseInt(query.limit) || config.pagination.defaultLimit, config.pagination.maxLimit);
  const skip = (page - 1) * limit;
  const filter = {};
  if (query.businessId) filter.businessId = query.businessId;
  if (query.userId) filter.userId = query.userId;
  if (query.resource) filter.resource = query.resource;

  const [data, total] = await Promise.all([
    AuditLog.find(filter).populate('userId', 'name email').populate('businessId', 'name').sort('-createdAt').skip(skip).limit(limit).lean(),
    AuditLog.countDocuments(filter),
  ]);
  return { data, page, limit, total };
};

const getUsers = async (query) => {
  const page = parseInt(query.page) || config.pagination.defaultPage;
  const limit = Math.min(parseInt(query.limit) || config.pagination.defaultLimit, config.pagination.maxLimit);
  const skip = (page - 1) * limit;
  const filter = { role: { $ne: 'super_admin' } };
  if (query.search) filter.$or = [
    { name: { $regex: query.search, $options: 'i' } },
    { email: { $regex: query.search, $options: 'i' } },
  ];
  if (query.status) filter.status = query.status;
  if (query.role) filter.role = query.role;
  const [data, total] = await Promise.all([
    User.find(filter).select('-password').populate('businessId', 'name type').sort('-createdAt').skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);
  return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
};

const getRevenue = async (query) => {
  const match = { status: 'completed' };
  if (query.startDate && query.endDate) {
    match.createdAt = { $gte: new Date(query.startDate), $lte: new Date(query.endDate) };
  }

  const [totalRevenue, monthlyRevenue] = await Promise.all([
    Payment.aggregate([{ $match: match }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Payment.aggregate([
      { $match: match },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
  ]);

  return { totalRevenue: totalRevenue[0]?.total || 0, monthlyRevenue };
};

module.exports = { getDashboard, getBusinesses, getBusinessById, activateBusiness, suspendBusiness, getPlans, createPlan, updatePlan, getSubscriptions, getPayments, getAuditLogs, getRevenue, getUsers };