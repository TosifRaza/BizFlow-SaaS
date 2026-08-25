const supplierService = require('../services/supplierService');
const { successResponse, paginateResponse } = require('../utils/response');

const create = async (req, res, next) => {
  try {
    const supplier = await supplierService.create(req.businessId, req.body, req.user._id);
    successResponse(res, supplier, 'Supplier created', 201);
  } catch (error) {
    next(error);
  }
};

const getAll = async (req, res, next) => {
  try {
    const result = await supplierService.getAll(req.businessId, req.query);
    paginateResponse(res, result.data, result.page, result.limit, result.total);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const supplier = await supplierService.getById(req.params.id, req.businessId);
    successResponse(res, supplier);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const supplier = await supplierService.update(req.params.id, req.businessId, req.body);
    successResponse(res, supplier, 'Supplier updated');
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await supplierService.delete(req.params.id, req.businessId);
    successResponse(res, null, 'Supplier deleted');
  } catch (error) {
    next(error);
  }
};

const getLedger = async (req, res, next) => {
  try {
    const result = await supplierService.getLedger(req.params.id, req.businessId, req.query);
    successResponse(res, result);
  } catch (error) {
    next(error);
  }
};

const recordPayment = async (req, res, next) => {
  try {
    const supplier = await supplierService.recordPayment(req.params.id, req.businessId, req.body, req.user._id);
    successResponse(res, supplier, 'Payment recorded');
  } catch (error) {
    next(error);
  }
};

const getStats = async (req, res, next) => {
  try {
    const stats = await supplierService.getStats(req.businessId);
    successResponse(res, stats);
  } catch (error) {
    next(error);
  }
};

module.exports = { create, getAll, getById, update, delete: remove, getLedger, recordPayment, getStats };
