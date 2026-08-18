const notificationService = require('../services/notificationService');
const { successResponse, paginateResponse } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const result = await notificationService.getAll(req.user._id, req.businessId, req.query);
    paginateResponse(res, result.data, result.page, result.limit, result.total);
  } catch (error) {
    next(error);
  }
};

const markRead = async (req, res, next) => {
  try {
    const notification = await notificationService.markRead(req.params.id, req.user._id);
    successResponse(res, notification, 'Marked as read');
  } catch (error) {
    next(error);
  }
};

const markAllRead = async (req, res, next) => {
  try {
    const result = await notificationService.markAllRead(req.user._id, req.businessId);
    successResponse(res, result, 'All marked as read');
  } catch (error) {
    next(error);
  }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const result = await notificationService.getUnreadCount(req.user._id, req.businessId);
    successResponse(res, result);
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, markRead, markAllRead, getUnreadCount };
