const adminService = require('../services/adminService');
const authService = require('../services/authService');
const { successResponse, paginateResponse } = require('../utils/response');

const getDashboard = async (req, res, next) => {
  try {
    const dashboard = await adminService.getDashboard();
    successResponse(res, dashboard);
  } catch (error) {
    next(error);
  }
};

const getBusinesses = async (req, res, next) => {
  try {
    const result = await adminService.getBusinesses(req.query);
    paginateResponse(res, result.data, result.page, result.limit, result.total);
  } catch (error) {
    next(error);
  }
};

const getBusinessById = async (req, res, next) => {
  try {
    const business = await adminService.getBusinessById(req.params.id);
    successResponse(res, business);
  } catch (error) {
    next(error);
  }
};

const activateBusiness = async (req, res, next) => {
  try {
    const business = await adminService.activateBusiness(req.params.id, req.user.id);
    successResponse(res, business, 'Business activated');
  } catch (error) {
    next(error);
  }
};

const suspendBusiness = async (req, res, next) => {
  try {
    const business = await adminService.suspendBusiness(req.params.id, req.user.id);
    successResponse(res, business, 'Business suspended');
  } catch (error) {
    next(error);
  }
};

const getPlans = async (req, res, next) => {
  try {
    const plans = await adminService.getPlans();
    successResponse(res, plans);
  } catch (error) {
    next(error);
  }
};

const createPlan = async (req, res, next) => {
  try {
    const plan = await adminService.createPlan(req.body);
    successResponse(res, plan, 'Plan created', 201);
  } catch (error) {
    next(error);
  }
};

const updatePlan = async (req, res, next) => {
  try {
    const plan = await adminService.updatePlan(req.params.id, req.body);
    successResponse(res, plan, 'Plan updated');
  } catch (error) {
    next(error);
  }
};

const getSubscriptions = async (req, res, next) => {
  try {
    const result = await adminService.getSubscriptions(req.query);
    paginateResponse(res, result.data, result.page, result.limit, result.total);
  } catch (error) {
    next(error);
  }
};

const getPayments = async (req, res, next) => {
  try {
    const result = await adminService.getPayments(req.query);
    paginateResponse(res, result.data, result.page, result.limit, result.total);
  } catch (error) {
    next(error);
  }
};

const getAuditLogs = async (req, res, next) => {
  try {
    const result = await adminService.getAuditLogs(req.query);
    paginateResponse(res, result.data, result.page, result.limit, result.total);
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const result = await adminService.getUsers(req.query);
    paginateResponse(res, result.data, result.page, result.limit, result.total);
  } catch (error) {
    next(error);
  }
};

const getRevenue = async (req, res, next) => {
  try {
    const revenue = await adminService.getRevenue(req.query);
    successResponse(res, revenue);
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard, getBusinesses, getBusinessById, activateBusiness, suspendBusiness, getPlans, createPlan, updatePlan, getSubscriptions, getPayments, getAuditLogs, getRevenue, getUsers };
