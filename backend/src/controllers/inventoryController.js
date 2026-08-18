const inventoryService = require('../services/inventoryService');
const { successResponse, paginateResponse } = require('../utils/response');

const getStock = async (req, res, next) => {
  try {
    const result = await inventoryService.getStock(req.businessId, req.query);
    paginateResponse(res, result.data, result.page, result.limit, result.total);
  } catch (error) {
    next(error);
  }
};

const getMovements = async (req, res, next) => {
  try {
    const result = await inventoryService.getMovements(req.businessId, req.query, req.branchFilter);
    paginateResponse(res, result.data, result.page, result.limit, result.total);
  } catch (error) {
    next(error);
  }
};

const adjustStock = async (req, res, next) => {
  try {
    const result = await inventoryService.adjustStock(req.businessId, req.body, req.user._id);
    successResponse(res, result, 'Stock adjusted');
  } catch (error) {
    next(error);
  }
};

const getLowStock = async (req, res, next) => {
  try {
    const products = await inventoryService.getLowStock(req.businessId);
    successResponse(res, products);
  } catch (error) {
    next(error);
  }
};

const getStockValue = async (req, res, next) => {
  try {
    const result = await inventoryService.getStockValue(req.businessId);
    successResponse(res, result);
  } catch (error) {
    next(error);
  }
};

const transferStock = async (req, res, next) => {
  try {
    const result = await inventoryService.transferStock(req.businessId, req.body, req.user._id);
    successResponse(res, result, 'Stock transferred');
  } catch (error) {
    next(error);
  }
};

module.exports = { getStock, getMovements, adjustStock, getLowStock, getStockValue, transferStock };
