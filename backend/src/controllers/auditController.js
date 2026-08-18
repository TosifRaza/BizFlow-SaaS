const auditService = require('../services/auditService');
const { successResponse, paginateResponse } = require('../utils/response');

const getLogs = async (req, res, next) => {
  try {
    const result = await auditService.getLogs(req.businessId, req.query);
    paginateResponse(res, result.data, result.page, result.limit, result.total);
  } catch (error) {
    next(error);
  }
};

module.exports = { getLogs };
