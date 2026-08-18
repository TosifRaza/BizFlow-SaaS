const Business = require('../models/Business');
const User = require('../models/User');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Sale = require('../models/Sale');
const Expense = require('../models/Expense');
const fs = require('fs');
const path = require('path');

class BusinessError extends Error {
  constructor(message, statusCode) { super(message); this.statusCode = statusCode; }
}

const getBusiness = async (businessId) => {
  const business = await Business.findById(businessId);
  if (!business) throw new BusinessError('Business not found', 404);
  return business;
};

const updateBusiness = async (businessId, updateData) => {
  const allowed = ['name', 'type', 'address', 'city', 'state', 'pincode', 'phone', 'email', 'gstNumber', 'currency', 'taxEnabled', 'taxRate', 'invoicePrefix', 'invoiceFormat'];
  const filtered = {};
  for (const key of allowed) {
    if (updateData[key] !== undefined) filtered[key] = updateData[key];
  }
  const business = await Business.findByIdAndUpdate(businessId, filtered, { new: true, runValidators: true });
  if (!business) throw new BusinessError('Business not found', 404);
  return business;
};

const updateSettings = async (businessId, settings) => {
  const update = {};
  if (settings.notifications) {
    update['settings.notifications'] = settings.notifications;
  }
  if (settings.security) {
    update['settings.security'] = settings.security;
  }
  const business = await Business.findByIdAndUpdate(businessId, { $set: update }, { new: true });
  if (!business) throw new BusinessError('Business not found', 404);
  return business;
};

const updateLogo = async (businessId, logoPath) => {
  const business = await Business.findById(businessId);
  if (!business) throw new BusinessError('Business not found', 404);
  if (business.logo) {
    const oldPath = path.join(__dirname, '../../uploads', path.basename(business.logo));
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }
  business.logo = logoPath;
  await business.save();
  return business;
};

const getBusinessStats = async (businessId) => {
  const [totalProducts, totalCustomers, totalSales, totalRevenue, totalExpenses, totalUsers] = await Promise.all([
    Product.countDocuments({ businessId, status: 'active' }),
    Customer.countDocuments({ businessId, status: 'active' }),
    Sale.countDocuments({ businessId, status: { $ne: 'voided' } }),
    Sale.aggregate([{ $match: { businessId, status: { $ne: 'voided' } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
    Expense.aggregate([{ $match: { businessId } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    User.countDocuments({ businessId, status: 'active' }),
  ]);
  return {
    totalProducts,
    totalCustomers,
    totalSales,
    totalRevenue: totalRevenue[0]?.total || 0,
    totalExpenses: totalExpenses[0]?.total || 0,
    totalUsers,
  };
};

const deactivateBusiness = async (businessId) => {
  const business = await Business.findByIdAndUpdate(businessId, { status: 'inactive' }, { new: true });
  if (!business) throw new BusinessError('Business not found', 404);
  return business;
};

const deleteBusiness = async (businessId) => {
  await Business.findByIdAndDelete(businessId);
  return { message: 'Business deleted successfully' };
};

module.exports = { getBusiness, updateBusiness, updateSettings, updateLogo, getBusinessStats, deactivateBusiness, deleteBusiness };
