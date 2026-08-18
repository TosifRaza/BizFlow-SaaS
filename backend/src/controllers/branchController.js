const branchService = require('../services/branchService');
const { successResponse, paginateResponse } = require('../utils/response');

const create = async (req, res, next) => {
  try {
    const branch = await branchService.create(req.businessId, req.body, req.user._id);
    successResponse(res, branch, 'Branch created', 201);
  } catch (error) {
    next(error);
  }
};

const getAll = async (req, res, next) => {
  try {
    const result = await branchService.getAll(req.businessId, req.query);
    paginateResponse(res, result.data, result.page, result.limit, result.total);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const branch = await branchService.getById(req.params.id, req.businessId);
    successResponse(res, branch);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const branch = await branchService.update(req.params.id, req.businessId, req.body);
    successResponse(res, branch, 'Branch updated');
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await branchService.remove(req.params.id, req.businessId);
    successResponse(res, null, 'Branch deleted');
  } catch (error) {
    next(error);
  }
};

const transferStock = async (req, res, next) => {
  try {
    const result = await branchService.transferStock(req.businessId, req.body, req.user._id);
    successResponse(res, result, 'Stock transferred');
  } catch (error) {
    next(error);
  }
};

module.exports = { create, getAll, getById, update, delete: remove, transferStock };
