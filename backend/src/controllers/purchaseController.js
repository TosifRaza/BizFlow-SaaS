const purchaseService = require('../services/purchaseService');
const { successResponse, paginateResponse } = require('../utils/response');

const create = async (req, res, next) => {
  try {
    const purchase = await purchaseService.create(req.businessId, req.body, req.user._id);
    successResponse(res, purchase, 'Purchase created', 201);
  } catch (error) {
    next(error);
  }
};

const getAll = async (req, res, next) => {
  try {
    const result = await purchaseService.getAll(req.businessId, req.query, req.branchFilter);
    paginateResponse(res, result.data, result.page, result.limit, result.total);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const purchase = await purchaseService.getById(req.params.id, req.businessId);
    successResponse(res, purchase);
  } catch (error) {
    next(error);
  }
};

const recordPayment = async (req, res, next) => {
  try {
    const purchase = await purchaseService.recordPayment(req.params.id, req.businessId, req.body, req.user._id);
    successResponse(res, purchase, 'Payment recorded');
  } catch (error) {
    next(error);
  }
};

module.exports = { create, getAll, getById, recordPayment };
