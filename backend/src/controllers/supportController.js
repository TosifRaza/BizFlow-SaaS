const supportService = require('../services/supportService');
const { successResponse, paginateResponse } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const result = await supportService.getAll(req.query);
    paginateResponse(res, result.data, result.page, result.limit, result.total);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const request = await supportService.getById(req.params.id);
    successResponse(res, request);
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const request = await supportService.updateStatus(req.params.id, req.body);
    successResponse(res, request, 'Support request updated');
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getById, updateStatus };
