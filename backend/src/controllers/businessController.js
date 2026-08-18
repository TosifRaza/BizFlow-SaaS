const businessService = require('../services/businessService');
const { successResponse } = require('../utils/response');

const getBusiness = async (req, res, next) => {
  try {
    const business = await businessService.getBusiness(req.businessId);
    successResponse(res, business);
  } catch (error) {
    next(error);
  }
};

const updateBusiness = async (req, res, next) => {
  try {
    const business = await businessService.updateBusiness(req.businessId, req.body);
    successResponse(res, business, 'Business updated');
  } catch (error) {
    next(error);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const business = await businessService.updateSettings(req.businessId, req.body);
    successResponse(res, business, 'Settings updated');
  } catch (error) {
    next(error);
  }
};

const updateLogo = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const logoPath = `/uploads/${req.file.filename}`;
    const business = await businessService.updateLogo(req.businessId, logoPath);
    successResponse(res, business, 'Logo updated');
  } catch (error) {
    next(error);
  }
};

const getBusinessStats = async (req, res, next) => {
  try {
    const stats = await businessService.getBusinessStats(req.businessId);
    successResponse(res, stats);
  } catch (error) {
    next(error);
  }
};

const deactivateBusiness = async (req, res, next) => {
  try {
    const business = await businessService.deactivateBusiness(req.businessId);
    successResponse(res, business, 'Business deactivated');
  } catch (error) {
    next(error);
  }
};

const deleteBusiness = async (req, res, next) => {
  try {
    await businessService.deleteBusiness(req.businessId);
    successResponse(res, null, 'Business deleted');
  } catch (error) {
    next(error);
  }
};

module.exports = { getBusiness, updateBusiness, updateSettings, updateLogo, getBusinessStats, deactivateBusiness, deleteBusiness };
