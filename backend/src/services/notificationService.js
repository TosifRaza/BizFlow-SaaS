const Notification = require('../models/Notification');
const config = require('../config');

const getAll = async (userId, businessId, query) => {
  const page = parseInt(query.page) || config.pagination.defaultPage;
  const limit = Math.min(parseInt(query.limit) || config.pagination.defaultLimit, config.pagination.maxLimit);
  const skip = (page - 1) * limit;
  const filter = { userId, businessId };
  if (query.type) filter.type = query.type;
  if (query.read !== undefined) filter.read = query.read === 'true';

  const [data, total] = await Promise.all([
    Notification.find(filter).sort('-createdAt').skip(skip).limit(limit).lean(),
    Notification.countDocuments(filter),
  ]);
  return { data, page, limit, total };
};

const markRead = async (id, userId) => {
  const notification = await Notification.findOneAndUpdate({ _id: id, userId }, { read: true }, { new: true });
  if (!notification) throw new Error('Notification not found');
  return notification;
};

const markAllRead = async (userId, businessId) => {
  const result = await Notification.updateMany({ userId, businessId, read: false }, { read: true });
  return { updated: result.modifiedCount };
};

const getUnreadCount = async (userId, businessId) => {
  const count = await Notification.countDocuments({ userId, businessId, read: false });
  return { count };
};

const create = async ({ userId, businessId, type, title, message, data }) => {
  const notification = await Notification.create({ userId, businessId, type, title, message, data });
  return notification;
};

module.exports = { getAll, markRead, markAllRead, getUnreadCount, create };