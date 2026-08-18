const AuditLog = require('../models/AuditLog');
const config = require('../config');

const getLogs = async (businessId, query) => {
  const page = parseInt(query.page) || config.pagination.defaultPage;
  const limit = Math.min(parseInt(query.limit) || config.pagination.defaultLimit, config.pagination.maxLimit);
  const skip = (page - 1) * limit;
  const filter = { businessId };
  if (query.userId) filter.userId = query.userId;
  if (query.resource) filter.resource = query.resource;
  if (query.action) filter.action = { $regex: query.action, $options: 'i' };
  if (query.startDate && query.endDate) filter.createdAt = { $gte: new Date(query.startDate), $lte: new Date(query.endDate) };

  const [data, total] = await Promise.all([
    AuditLog.find(filter).populate('userId', 'name email').sort('-createdAt').skip(skip).limit(limit).lean(),
    AuditLog.countDocuments(filter),
  ]);
  return { data, page, limit, total };
};

const createLog = async ({ userId, businessId, action, resource, resourceId, metadata, ipAddress, userAgent }) => {
  await AuditLog.create({ userId, businessId, action, resource, resourceId, metadata, ipAddress, userAgent });
};

module.exports = { getLogs, createLog };
