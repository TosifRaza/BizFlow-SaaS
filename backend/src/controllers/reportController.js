const reportService = require('../services/reportService');
const { successResponse } = require('../utils/response');

const salesReport = async (req, res, next) => {
  try {
    const report = await reportService.salesReport(req.businessId, req.query);
    successResponse(res, report);
  } catch (error) {
    next(error);
  }
};

const inventoryReport = async (req, res, next) => {
  try {
    const report = await reportService.inventoryReport(req.businessId);
    successResponse(res, report);
  } catch (error) {
    next(error);
  }
};

const customerReport = async (req, res, next) => {
  try {
    const report = await reportService.customerReport(req.businessId, req.query);
    successResponse(res, report);
  } catch (error) {
    next(error);
  }
};

const supplierReport = async (req, res, next) => {
  try {
    const report = await reportService.supplierReport(req.businessId, req.query);
    successResponse(res, report);
  } catch (error) {
    next(error);
  }
};

const expenseReport = async (req, res, next) => {
  try {
    const report = await reportService.expenseReport(req.businessId, req.query);
    successResponse(res, report);
  } catch (error) {
    next(error);
  }
};

const profitLossReport = async (req, res, next) => {
  try {
    const report = await reportService.profitLossReport(req.businessId, req.query);
    successResponse(res, report);
  } catch (error) {
    next(error);
  }
};

module.exports = { salesReport, inventoryReport, customerReport, supplierReport, expenseReport, profitLossReport };
