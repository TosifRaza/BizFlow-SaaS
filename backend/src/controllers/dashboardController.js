const dashboardService = require('../services/dashboardService');
const { successResponse } = require('../utils/response');

const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await dashboardService.getDashboardStats(req.businessId);
    successResponse(res, stats);
  } catch (error) {
    next(error);
  }
};

const getChartData = async (req, res, next) => {
  try {
    const data = await dashboardService.getChartData(req.businessId, req.query);
    successResponse(res, data);
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats, getChartData };
