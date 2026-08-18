const expenseService = require('../services/expenseService');
const uploadService = require('../services/uploadService');
const { successResponse, paginateResponse } = require('../utils/response');

const create = async (req, res, next) => {
  try {
    const expense = await expenseService.create(req.businessId, req.body, req.user._id, req.file);
    successResponse(res, expense, 'Expense created', 201);
  } catch (error) {
    next(error);
  }
};

const getAll = async (req, res, next) => {
  try {
    const result = await expenseService.getAll(req.businessId, req.query);
    paginateResponse(res, result.data, result.page, result.limit, result.total);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const expense = await expenseService.getById(req.params.id, req.businessId);
    successResponse(res, expense);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const expense = await expenseService.update(req.params.id, req.businessId, req.body, req.file);
    successResponse(res, expense, 'Expense updated');
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await expenseService.remove(req.params.id, req.businessId);
    successResponse(res, null, 'Expense deleted');
  } catch (error) {
    next(error);
  }
};

const getStats = async (req, res, next) => {
  try {
    const stats = await expenseService.getStats(req.businessId, req.query);
    successResponse(res, stats);
  } catch (error) {
    next(error);
  }
};

const uploadReceipt = async (req, res, next) => {
  try {
    const expense = await expenseService.getById(req.params.id, req.businessId);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }
    const uploaded = await uploadService.uploadImage(req.file);
    const updated = await expenseService.update(req.params.id, req.businessId, { attachment: uploaded.url });
    successResponse(res, updated, 'Receipt uploaded');
  } catch (error) {
    next(error);
  }
};

const deleteReceipt = async (req, res, next) => {
  try {
    const expense = await expenseService.getById(req.params.id, req.businessId);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }
    if (expense.attachment) {
      const filename = expense.attachment.split('/').pop();
      try {
        await uploadService.deleteImage(filename);
      } catch (err) {
        // File may already be deleted, continue
      }
    }
    const updated = await expenseService.update(req.params.id, req.businessId, { attachment: null });
    successResponse(res, updated, 'Receipt deleted');
  } catch (error) {
    next(error);
  }
};

module.exports = { create, getAll, getById, update, delete: remove, getStats, uploadReceipt, deleteReceipt };
