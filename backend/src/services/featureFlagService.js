const FeatureFlag = require('../models/FeatureFlag');
const config = require('../config');

class FeatureFlagError extends Error {
  constructor(message, statusCode) { super(message); this.statusCode = statusCode; }
}

const getAll = async (query) => {
  const page = parseInt(query.page) || config.pagination.defaultPage;
  const limit = Math.min(parseInt(query.limit) || config.pagination.defaultLimit, config.pagination.maxLimit);
  const skip = (page - 1) * limit;
  const filter = {};
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { key: { $regex: query.search, $options: 'i' } },
    ];
  }

  const [data, total] = await Promise.all([
    FeatureFlag.find(filter).populate('enabledForPlans', 'name').sort('-createdAt').skip(skip).limit(limit).lean(),
    FeatureFlag.countDocuments(filter),
  ]);
  return { data, page, limit, total };
};

const create = async (data) => {
  try {
    return await FeatureFlag.create(data);
  } catch (err) {
    if (err.code === 11000) throw new FeatureFlagError('A feature flag with this key already exists', 409);
    throw err;
  }
};

const update = async (id, data) => {
  const flag = await FeatureFlag.findByIdAndUpdate(id, data, { new: true, runValidators: true }).populate('enabledForPlans', 'name').lean();
  if (!flag) throw new FeatureFlagError('Feature flag not found', 404);
  return flag;
};

const deleteFlag = async (id) => {
  const flag = await FeatureFlag.findByIdAndDelete(id);
  if (!flag) throw new FeatureFlagError('Feature flag not found', 404);
  return flag;
};

const toggleFlag = async (id) => {
  const flag = await FeatureFlag.findById(id);
  if (!flag) throw new FeatureFlagError('Feature flag not found', 404);
  flag.enabled = !flag.enabled;
  await flag.save();
  return flag;
};

const isFeatureEnabled = async (key, businessId, planId) => {
  const flag = await FeatureFlag.findOne({ key });
  if (!flag || !flag.enabled) return false;

  // If specific businesses are listed, check if this business is included
  if (flag.enabledForBusinesses && flag.enabledForBusinesses.length > 0) {
    if (!flag.enabledForBusinesses.some((b) => b.toString() === businessId?.toString())) return false;
  }

  // If specific plans are listed, check if this plan is included
  if (flag.enabledForPlans && flag.enabledForPlans.length > 0) {
    if (!flag.enabledForPlans.some((p) => p.toString() === planId?.toString())) return false;
  }

  return true;
};

const getEnabledFeatures = async (businessId, planId) => {
  const flags = await FeatureFlag.find({ enabled: true }).lean();
  return flags.filter((flag) => {
    if (flag.enabledForBusinesses && flag.enabledForBusinesses.length > 0) {
      if (!flag.enabledForBusinesses.some((b) => b.toString() === businessId?.toString())) return false;
    }
    if (flag.enabledForPlans && flag.enabledForPlans.length > 0) {
      if (!flag.enabledForPlans.some((p) => p.toString() === planId?.toString())) return false;
    }
    return true;
  });
};

module.exports = { getAll, create, update, deleteFlag, toggleFlag, isFeatureEnabled, getEnabledFeatures };
