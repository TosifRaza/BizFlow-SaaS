const platformSettingsService = require('../services/platformSettingsService');
const { successResponse } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const settings = await platformSettingsService.getAll();
    successResponse(res, settings);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const settings = await platformSettingsService.update(req.body);
    successResponse(res, settings, 'Settings updated');
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, update };
