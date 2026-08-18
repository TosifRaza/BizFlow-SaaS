const categoryService = require('../services/categoryService');
const { successResponse, paginateResponse } = require('../utils/response');

const create = async (req, res, next) => {
  try {
    const category = await categoryService.create(req.businessId, req.body, req.user._id);
    successResponse(res, category, 'Category created', 201);
  } catch (error) {
    next(error);
  }
};

const getAll = async (req, res, next) => {
  try {
    const result = await categoryService.getAll(req.businessId, req.query);
    paginateResponse(res, result.data, result.page, result.limit, result.total);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const category = await categoryService.getById(req.params.id, req.businessId);
    successResponse(res, category);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const category = await categoryService.update(req.params.id, req.businessId, req.body);
    successResponse(res, category, 'Category updated');
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await categoryService.remove(req.params.id, req.businessId);
    successResponse(res, null, 'Category deleted');
  } catch (error) {
    next(error);
  }
};

module.exports = { create, getAll, getById, update, delete: remove };
