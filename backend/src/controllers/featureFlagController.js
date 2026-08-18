const featureFlagService = require('../services/featureFlagService');
const { successResponse, paginateResponse } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const result = await featureFlagService.getAll(req.query);
    paginateResponse(res, result.data, result.page, result.limit, result.total);
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const flag = await featureFlagService.create(req.body);
    successResponse(res, flag, 'Feature flag created', 201);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const flag = await featureFlagService.update(req.params.id, req.body);
    successResponse(res, flag, 'Feature flag updated');
  } catch (error) {
    next(error);
  }
};

const toggleFlag = async (req, res, next) => {
  try {
    const flag = await featureFlagService.toggleFlag(req.params.id);
    successResponse(res, flag, 'Feature flag toggled');
  } catch (error) {
    next(error);
  }
};

const deleteFlag = async (req, res, next) => {
  try {
    await featureFlagService.deleteFlag(req.params.id);
    successResponse(res, null, 'Feature flag deleted');
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, create, update, toggleFlag, deleteFlag };
