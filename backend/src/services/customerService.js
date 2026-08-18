const Customer = require('../models/Customer');
const CustomerTransaction = require('../models/CustomerTransaction');
const Sale = require('../models/Sale');
const config = require('../config');
const notificationService = require('./notificationService');

class CustomerError extends Error {
  constructor(message, statusCode) { super(message); this.statusCode = statusCode; }
}

const buildFilter = (query, businessId) => {
  const filter = { businessId };
  if (query.search) filter.$or = [{ name: { $regex: query.search, $options: 'i' } }, { phone: { $regex: query.search, $options: 'i' } }];
  if (query.status) filter.status = query.status;
  return filter;
};

const getAll = async (businessId, query) => {
  const page = parseInt(query.page) || config.pagination.defaultPage;
  const limit = Math.min(parseInt(query.limit) || config.pagination.defaultLimit, config.pagination.maxLimit);
  const skip = (page - 1) * limit;
  const filter = buildFilter(query, businessId);

  const [data, total] = await Promise.all([
    Customer.find(filter).sort('-createdAt').skip(skip).limit(limit).lean(),
    Customer.countDocuments(filter),
  ]);
  return { data, page, limit, total };
};

const getById = async (id, businessId) => {
  const customer = await Customer.findOne({ _id: id, businessId }).lean();
  if (!customer) throw new CustomerError('Customer not found', 404);
  return customer;
};

const create = async (businessId, data, userId) => {
  if (data.email) {
    const existing = await Customer.findOne({ email: data.email, businessId });
    if (existing) throw new CustomerError('Customer with this email already exists', 409);
  }
  const customer = await Customer.create({ ...data, balance: data.openingBalance || 0, businessId, createdBy: userId });
  if (data.openingBalance && data.openingBalance !== 0) {
    await CustomerTransaction.create({
      customerId: customer._id, type: 'adjustment', amount: Math.abs(data.openingBalance),
      debit: data.openingBalance > 0 ? data.openingBalance : 0,
      credit: data.openingBalance < 0 ? Math.abs(data.openingBalance) : 0,
      balance: customer.balance, referenceType: 'adjustment', notes: 'Opening balance',
      businessId, createdBy: userId,
    });
  }
  return customer;
};

const update = async (id, businessId, data) => {
  const customer = await Customer.findOneAndUpdate({ _id: id, businessId }, data, { new: true, runValidators: true });
  if (!customer) throw new CustomerError('Customer not found', 404);
  return customer;
};

const remove = async (id, businessId) => {
 const customer = await Customer.findOneAndDelete({ _id: id, businessId });
  if (!customer) throw new CustomerError('Customer not found', 404);
  return { message: 'Customer deleted' };
};

const getLedger = async (id, businessId, query) => {
  const customer = await Customer.findOne({ _id: id, businessId });
  if (!customer) throw new CustomerError('Customer not found', 404);

  const page = parseInt(query.page) || config.pagination.defaultPage;
  const limit = Math.min(parseInt(query.limit) || config.pagination.defaultLimit, config.pagination.maxLimit);
  const skip = (page - 1) * limit;
  const filter = { customerId: id, businessId };
  if (query.startDate && query.endDate) filter.createdAt = { $gte: new Date(query.startDate), $lte: new Date(query.endDate) };

  const [data, total] = await Promise.all([
    CustomerTransaction.find(filter).sort('-createdAt').skip(skip).limit(limit).lean(),
    CustomerTransaction.countDocuments(filter),
  ]);
  return { customer, data, page, limit, total };
};

const recordPayment = async (id, businessId, { amount, paymentMethod, notes }, userId) => {
  const customer = await Customer.findOne({ _id: id, businessId });
  if (!customer) throw new CustomerError('Customer not found', 404);
  if (amount <= 0) throw new CustomerError('Amount must be positive', 400);

  const previousBalance = customer.balance;
  customer.balance -= amount;
  if (customer.balance < 0) customer.balance = 0;
  await customer.save();

  await CustomerTransaction.create({
    customerId: id, type: 'payment', amount, debit: 0, credit: amount,
    balance: customer.balance, referenceType: 'payment', notes: notes || 'Payment received',
    businessId, createdBy: userId,
  });

  try {
    await notificationService.create({
      userId, businessId, type: 'payment',
      title: 'Customer Payment Received',
      message: `Payment of ₹${amount.toFixed(2)} received from ${customer.name}`,
      data: { customerId: id, customerName: customer.name, amount },
    });
  } catch {}

  return customer;
};

const getStats = async (businessId) => {
  const [total, active, totalOutstanding] = await Promise.all([
    Customer.countDocuments({ businessId }),
    Customer.countDocuments({ businessId, status: 'active' }),
    Customer.aggregate([{ $match: { businessId, balance: { $gt: 0 } } }, { $group: { _id: null, total: { $sum: '$balance' } } }]),
  ]);
  return { total, active, totalOutstanding: totalOutstanding[0]?.total || 0 };
};

module.exports = { getAll, getById, create, update, delete: remove, getLedger, recordPayment, getStats };
