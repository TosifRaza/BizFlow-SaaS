const customerService = require('../services/customerService');
const { successResponse, paginateResponse } = require('../utils/response');

const create = async (req, res, next) => {
  try {
    const customer = await customerService.create(req.businessId, req.body, req.user._id);
    successResponse(res, customer, 'Customer created', 201);
  } catch (error) {
    next(error);
  }
};

const getAll = async (req, res, next) => {
  try {
    const result = await customerService.getAll(req.businessId, req.query);
    paginateResponse(res, result.data, result.page, result.limit, result.total);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const customer = await customerService.getById(req.params.id, req.businessId);
    successResponse(res, customer);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const customer = await customerService.update(req.params.id, req.businessId, req.body);
    successResponse(res, customer, 'Customer updated');
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await customerService.delete(req.params.id, req.businessId);
    successResponse(res, null, 'Customer deleted');
  } catch (error) {
    next(error);
  }
};

const getLedger = async (req, res, next) => {
  try {
    const result = await customerService.getLedger(req.params.id, req.businessId, req.query);
    successResponse(res, result);
  } catch (error) {
    next(error);
  }
};

const recordPayment = async (req, res, next) => {
  try {
    const customer = await customerService.recordPayment(req.params.id, req.businessId, req.body, req.user._id);
    successResponse(res, customer, 'Payment recorded');
  } catch (error) {
    next(error);
  }
};

const getStats = async (req, res, next) => {
  try {
    const stats = await customerService.getStats(req.businessId);
    successResponse(res, stats);
  } catch (error) {
    next(error);
  }
};

module.exports = { create, getAll, getById, update, delete: remove, getLedger, recordPayment, getStats };
