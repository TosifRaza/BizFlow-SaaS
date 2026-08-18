const SupportRequest = require('../models/SupportRequest');
const config = require('../config');

class SupportError extends Error {
  constructor(message, statusCode) { super(message); this.statusCode = statusCode; }
}

const getAll = async (query) => {
  const page = parseInt(query.page) || config.pagination.defaultPage;
  const limit = Math.min(parseInt(query.limit) || config.pagination.defaultLimit, config.pagination.maxLimit);
  const skip = (page - 1) * limit;
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.priority) filter.priority = query.priority;
  if (query.category) filter.category = query.category;
  if (query.search) {
    filter.$or = [
      { subject: { $regex: query.search, $options: 'i' } },
      { description: { $regex: query.search, $options: 'i' } },
    ];
  }

  const [data, total] = await Promise.all([
    SupportRequest.find(filter)
      .populate('businessId', 'name')
      .populate('userId', 'name email')
      .populate('assignedTo', 'name email')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .lean(),
    SupportRequest.countDocuments(filter),
  ]);
  return { data, page, limit, total };
};

const getById = async (id) => {
  const request = await SupportRequest.findById(id)
    .populate('businessId', 'name')
    .populate('userId', 'name email')
    .populate('assignedTo', 'name email')
    .lean();
  if (!request) throw new SupportError('Support request not found', 404);
  return request;
};

const updateStatus = async (id, data) => {
  const updateData = {};
  if (data.status) {
    updateData.status = data.status;
    if (data.status === 'resolved') updateData.resolvedAt = new Date();
    if (data.status === 'closed') updateData.closedAt = new Date();
  }
  if (data.response !== undefined) updateData.response = data.response;
  if (data.assignedTo) updateData.assignedTo = data.assignedTo;

  const request = await SupportRequest.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
    .populate('businessId', 'name')
    .populate('userId', 'name email')
    .populate('assignedTo', 'name email')
    .lean();
  if (!request) throw new SupportError('Support request not found', 404);
  return request;
};

module.exports = { getAll, getById, updateStatus };
