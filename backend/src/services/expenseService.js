const Expense = require('../models/Expense');
const config = require('../config');
const fs = require('fs');
const path = require('path');

class ExpenseError extends Error {
  constructor(message, statusCode) { super(message); this.statusCode = statusCode; }
}

const getAll = async (businessId, query) => {
  const page = parseInt(query.page) || config.pagination.defaultPage;
  const limit = Math.min(parseInt(query.limit) || config.pagination.defaultLimit, config.pagination.maxLimit);
  const skip = (page - 1) * limit;
  const filter = { businessId };
  if (query.category) filter.category = query.category;
  if (query.branchId) filter.branchId = query.branchId;
  if (query.startDate && query.endDate) filter.date = { $gte: new Date(query.startDate), $lte: new Date(query.endDate) };
  else if (query.month) {
    const start = new Date(query.month + '-01');
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    filter.date = { $gte: start, $lt: end };
  }

  const [data, total] = await Promise.all([
    Expense.find(filter).populate('createdBy', 'name').sort('-date').skip(skip).limit(limit).lean(),
    Expense.countDocuments(filter),
  ]);
  return { data, page, limit, total };
};

const getById = async (id, businessId) => {
  const expense = await Expense.findOne({ _id: id, businessId }).populate('createdBy', 'name').lean();
  if (!expense) throw new ExpenseError('Expense not found', 404);
  return expense;
};

const create = async (businessId, data, userId, file) => {
  const createData = { ...data, businessId, createdBy: userId };
  if (file) {
    createData.attachment = `/uploads/receipts/${file.filename}`;
  }
  const expense = await Expense.create(createData);
  return expense;
};

const update = async (id, businessId, data, file) => {
  const existing = await Expense.findOne({ _id: id, businessId });
  if (!existing) throw new ExpenseError('Expense not found', 404);

  if (file) {
    // Delete old receipt file if exists
    if (existing.attachment) {
      const oldFilename = existing.attachment.split('/').pop();
      const oldPath = path.join(__dirname, '../../uploads/receipts', oldFilename);
      try { if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath); } catch {}
    }
    data.attachment = `/uploads/receipts/${file.filename}`;
  }

  const expense = await Expense.findOneAndUpdate({ _id: id, businessId }, data, { new: true, runValidators: true });
  return expense;
};

const remove = async (id, businessId) => {
  const expense = await Expense.findOneAndDelete({ _id: id, businessId });
  if (!expense) throw new ExpenseError('Expense not found', 404);
  return { message: 'Expense deleted' };
};

const getStats = async (businessId, query) => {
  const matchStage = { businessId };
  if (query.startDate && query.endDate) matchStage.date = { $gte: new Date(query.startDate), $lte: new Date(query.endDate) };

  const [totalExpenses, byCategory, monthlyTrend] = await Promise.all([
    Expense.aggregate([{ $match: matchStage }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Expense.aggregate([{ $match: matchStage }, { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } }, { $sort: { total: -1 } }]),
    Expense.aggregate([
      { $match: matchStage },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$date' } }, total: { $sum: '$amount' } } },
      { $sort: { _id: 1 } },
    ]),
  ]);

  return {
    totalExpenses: totalExpenses[0]?.total || 0,
    byCategory: byCategory || [],
    monthlyTrend: monthlyTrend || [],
  };
};

module.exports = { getAll, getById, create, update, delete: remove, getStats };
