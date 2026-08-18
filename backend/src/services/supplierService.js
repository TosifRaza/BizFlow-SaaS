const Supplier = require('../models/Supplier');
const SupplierTransaction = require('../models/SupplierTransaction');
const config = require('../config');

class SupplierError extends Error {
  constructor(message, statusCode) { super(message); this.statusCode = statusCode; }
}

const getAll = async (businessId, query) => {
  const page = parseInt(query.page) || config.pagination.defaultPage;
  const limit = Math.min(parseInt(query.limit) || config.pagination.defaultLimit, config.pagination.maxLimit);
  const skip = (page - 1) * limit;
  const filter = { businessId };
  if (query.search) filter.$or = [{ name: { $regex: query.search, $options: 'i' } }, { company: { $regex: query.search, $options: 'i' } }];
  if (query.status) filter.status = query.status;

  const [data, total] = await Promise.all([
    Supplier.find(filter).sort('-createdAt').skip(skip).limit(limit).lean(),
    Supplier.countDocuments(filter),
  ]);
  return { data, page, limit, total };
};

const getById = async (id, businessId) => {
  const supplier = await Supplier.findOne({ _id: id, businessId }).lean();
  if (!supplier) throw new SupplierError('Supplier not found', 404);
  return supplier;
};

const create = async (businessId, data, userId) => {
  const supplier = await Supplier.create({ ...data, businessId, createdBy: userId });
  return supplier;
};

const update = async (id, businessId, data) => {
  const supplier = await Supplier.findOneAndUpdate({ _id: id, businessId }, data, { new: true, runValidators: true });
  if (!supplier) throw new SupplierError('Supplier not found', 404);
  return supplier;
};

const remove = async (id, businessId) => {
  const supplier = await Supplier.findOneAndDelete({ _id: id, businessId });
  if (!supplier) throw new SupplierError('Supplier not found', 404);
  return { message: 'Supplier deleted' };
};

const getLedger = async (id, businessId, query) => {
  const supplier = await Supplier.findOne({ _id: id, businessId });
  if (!supplier) throw new SupplierError('Supplier not found', 404);

  const page = parseInt(query.page) || config.pagination.defaultPage;
  const limit = Math.min(parseInt(query.limit) || config.pagination.defaultLimit, config.pagination.maxLimit);
  const skip = (page - 1) * limit;
  const filter = { supplierId: id, businessId };
  if (query.startDate && query.endDate) filter.createdAt = { $gte: new Date(query.startDate), $lte: new Date(query.endDate) };

  const [data, total] = await Promise.all([
    SupplierTransaction.find(filter).sort('-createdAt').skip(skip).limit(limit).lean(),
    SupplierTransaction.countDocuments(filter),
  ]);
  return { supplier, data, page, limit, total };
};

const recordPayment = async (id, businessId, { amount, paymentMethod, notes }, userId) => {
  const supplier = await Supplier.findOne({ _id: id, businessId });
  if (!supplier) throw new SupplierError('Supplier not found', 404);
  if (amount <= 0) throw new SupplierError('Amount must be positive', 400);

  const previousBalance = supplier.balance;
  supplier.balance -= amount;
  if (supplier.balance < 0) supplier.balance = 0;
  await supplier.save();

  await SupplierTransaction.create({
    supplierId: id, type: 'payment', amount, debit: amount, credit: 0,
    balance: supplier.balance, referenceType: 'payment', notes: notes || 'Payment made',
    businessId, createdBy: userId,
  });

  return supplier;
};

const getStats = async (businessId) => {
  const [total, active, totalPayable] = await Promise.all([
    Supplier.countDocuments({ businessId }),
    Supplier.countDocuments({ businessId, status: 'active' }),
    Supplier.aggregate([{ $match: { businessId, balance: { $gt: 0 } } }, { $group: { _id: null, total: { $sum: '$balance' } } }]),
  ]);
  return { total, active, totalPayable: totalPayable[0]?.total || 0 };
};

module.exports = { getAll, getById, create, update, delete: remove, getLedger, recordPayment, getStats };
