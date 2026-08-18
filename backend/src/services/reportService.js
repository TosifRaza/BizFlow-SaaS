const Sale = require('../models/Sale');
const Purchase = require('../models/Purchase');
const Expense = require('../models/Expense');
const Customer = require('../models/Customer');
const Supplier = require('../models/Supplier');
const Product = require('../models/Product');

class ReportError extends Error {
  constructor(message, statusCode) { super(message); this.statusCode = statusCode; }
}

const getDateRange = (query) => {
  const now = new Date();
  let startDate, endDate;
  if (query.startDate && query.endDate) {
    startDate = new Date(query.startDate);
    endDate = new Date(query.endDate);
  } else if (query.period === 'today') {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    endDate = new Date(startDate); endDate.setDate(endDate.getDate() + 1);
  } else if (query.period === 'week') {
    startDate = new Date(now); startDate.setDate(startDate.getDate() - 7);
    endDate = now;
  } else if (query.period === 'month') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = now;
  } else if (query.period === 'year') {
    startDate = new Date(now.getFullYear(), 0, 1);
    endDate = now;
  } else {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = now;
  }
  return { startDate, endDate };
};

const salesReport = async (businessId, query) => {
  const { startDate, endDate } = getDateRange(query);
  const match = { businessId, status: { $ne: 'voided' }, createdAt: { $gte: startDate, $lte: endDate } };

  const [summary, dailySales, topProducts, byPaymentMethod] = await Promise.all([
    Sale.aggregate([
      { $match: match },
      { $group: { _id: null, totalSales: { $sum: 1 }, totalRevenue: { $sum: '$total' }, totalTax: { $sum: '$taxAmount' }, avgOrderValue: { $avg: '$total' } } },
    ]),
    Sale.aggregate([
      { $match: match },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 }, revenue: { $sum: '$total' } } },
      { $sort: { _id: 1 } },
    ]),
    Sale.aggregate([
      { $match: match },
      { $unwind: '$items' },
      { $group: { _id: '$items.productId', name: { $first: '$items.productName' }, quantity: { $sum: '$items.quantity' }, revenue: { $sum: '$items.total' } } },
      { $sort: { revenue: -1 } }, { $limit: 10 },
    ]),
    Sale.aggregate([
      { $match: match },
      { $group: { _id: '$paymentMethod', count: { $sum: 1 }, total: { $sum: '$total' } } },
    ]),
  ]);

  return {
    period: { startDate, endDate },
    summary: summary[0] || { totalSales: 0, totalRevenue: 0, totalTax: 0, avgOrderValue: 0 },
    dailySales, topProducts, byPaymentMethod,
  };
};

const inventoryReport = async (businessId) => {
  const [totalProducts, lowStock, stockValue, byCategory] = await Promise.all([
    Product.countDocuments({ businessId }),
    Product.find({ businessId, currentStock: { $lte: new (require('mongoose')).Schema.Types.Decimal128('$minimumStock') } }).select('name sku currentStock minimumStock unit').lean(),
    Product.aggregate([
      { $match: { businessId, status: 'active' } },
      { $group: { _id: null, totalStockValue: { $sum: { $multiply: ['$sellingPrice', '$currentStock'] } }, totalCostValue: { $sum: { $multiply: ['$purchasePrice', '$currentStock'] } }, totalItems: { $sum: '$currentStock' } } },
    ]),
    Product.aggregate([
      { $match: { businessId, status: 'active' } },
      { $group: { _id: '$categoryId', productCount: { $sum: 1 }, totalStock: { $sum: '$currentStock' } } },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      { $project: { categoryName: '$category.name', productCount: 1, totalStock: 1 } },
    ]),
  ]);

  return {
    totalProducts,
    lowStock: lowStock.filter(p => p.currentStock <= p.minimumStock),
    stockValue: stockValue[0] || { totalStockValue: 0, totalCostValue: 0, totalItems: 0 },
    byCategory,
  };
};

const customerReport = async (businessId, query) => {
  const { startDate, endDate } = getDateRange(query);
  const [totalCustomers, topCustomers, totalOutstanding] = await Promise.all([
    Customer.countDocuments({ businessId }),
    Sale.aggregate([
      { $match: { businessId, status: { $ne: 'voided' }, createdAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$customerId', totalSpent: { $sum: '$total' }, orderCount: { $sum: 1 } } },
      { $sort: { totalSpent: -1 } }, { $limit: 10 },
      { $lookup: { from: 'customers', localField: '_id', foreignField: '_id', as: 'customer' } },
      { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
    ]),
    Customer.aggregate([{ $match: { businessId, balance: { $gt: 0 } } }, { $group: { _id: null, total: { $sum: '$balance' } } }]),
  ]);

  return { totalCustomers, topCustomers, totalOutstanding: totalOutstanding[0]?.total || 0 };
};

const supplierReport = async (businessId, query) => {
  const { startDate, endDate } = getDateRange(query);
  const [totalSuppliers, topSuppliers, totalPayable] = await Promise.all([
    Supplier.countDocuments({ businessId }),
    Purchase.aggregate([
      { $match: { businessId, createdAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$supplierId', totalPurchased: { $sum: '$total' }, orderCount: { $sum: 1 } } },
      { $sort: { totalPurchased: -1 } }, { $limit: 10 },
      { $lookup: { from: 'suppliers', localField: '_id', foreignField: '_id', as: 'supplier' } },
      { $unwind: { path: '$supplier', preserveNullAndEmptyArrays: true } },
    ]),
    Supplier.aggregate([{ $match: { businessId, balance: { $gt: 0 } } }, { $group: { _id: null, total: { $sum: '$balance' } } }]),
  ]);

  return { totalSuppliers, topSuppliers, totalPayable: totalPayable[0]?.total || 0 };
};

const expenseReport = async (businessId, query) => {
  const { startDate, endDate } = getDateRange(query);
  const match = { businessId, date: { $gte: startDate, $lte: endDate } };

  const [total, byCategory, monthlyTrend] = await Promise.all([
    Expense.aggregate([{ $match: match }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Expense.aggregate([{ $match: match }, { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } }, { $sort: { total: -1 } }]),
    Expense.aggregate([
      { $match: match },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$date' } }, total: { $sum: '$amount' } } },
      { $sort: { _id: 1 } },
    ]),
  ]);

  return { total: total[0]?.total || 0, byCategory, monthlyTrend };
};

const profitLossReport = async (businessId, query) => {
  const { startDate, endDate } = getDateRange(query);

  const [revenueResult, purchaseResult, expenseResult] = await Promise.all([
    Sale.aggregate([{ $match: { businessId, status: { $ne: 'voided' }, createdAt: { $gte: startDate, $lte: endDate } } }, { $group: { _id: null, totalRevenue: { $sum: '$total' }, totalCost: { $sum: { $reduce: { input: '$items', initialValue: 0, in: { $add: ['$$value', { $multiply: ['$$this.quantity', { $ifNull: [{ $getField: 'purchasePrice' }, 0] }] }] } } } } } }]),
    Purchase.aggregate([{ $match: { businessId, createdAt: { $gte: startDate, $lte: endDate } } }, { $group: { _id: null, totalPurchases: { $sum: '$total' } } }]),
    Expense.aggregate([{ $match: { businessId, date: { $gte: startDate, $lte: endDate } } }, { $group: { _id: null, totalExpenses: { $sum: '$amount' } } }]),
  ]);

  const totalRevenue = revenueResult[0]?.totalRevenue || 0;
  const totalPurchases = purchaseResult[0]?.totalPurchases || 0;
  const totalExpenses = expenseResult[0]?.totalExpenses || 0;
  const grossProfit = totalRevenue - totalPurchases;
  const netProfit = grossProfit - totalExpenses;

  return {
    period: { startDate, endDate },
    totalRevenue,
    totalPurchases,
    totalExpenses,
    grossProfit,
    netProfit,
    profitMargin: totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(2) : 0,
  };
};

module.exports = { salesReport, inventoryReport, customerReport, supplierReport, expenseReport, profitLossReport };
