const Sale = require('../models/Sale');
const Purchase = require('../models/Purchase');
const Expense = require('../models/Expense');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const User = require('../models/User');
const Category = require('../models/Category');

const getDashboardStats = async (businessId) => {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

  const [todaySales, thisMonthSales, lastMonthSales, todayPurchases, thisMonthExpenses, totalProducts, totalCustomers, totalUsers, lowStockProducts, creditSales, recentSales] = await Promise.all([
    Sale.aggregate([{ $match: { businessId, status: { $ne: 'voided' }, createdAt: { $gte: todayStart } } }, { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: '$total' } } }]),
    Sale.aggregate([{ $match: { businessId, status: { $ne: 'voided' }, createdAt: { $gte: thisMonthStart } } }, { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: '$total' } } }]),
    Sale.aggregate([{ $match: { businessId, status: { $ne: 'voided' }, createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } } }, { $group: { _id: null, revenue: { $sum: '$total' } } }]),
    Purchase.aggregate([{ $match: { businessId, createdAt: { $gte: todayStart } } }, { $group: { _id: null, count: { $sum: 1 }, total: { $sum: '$total' } } }]),
    Expense.aggregate([{ $match: { businessId, date: { $gte: thisMonthStart } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Product.countDocuments({ businessId, status: 'active' }),
    Customer.countDocuments({ businessId, status: 'active' }),
    User.countDocuments({ businessId, status: 'active' }),
    Product.find({ businessId, status: 'active' }).sort('currentStock').limit(10).select('name sku currentStock minimumStock unit').lean(),
    Sale.aggregate([{ $match: { businessId, status: 'credit' } }, { $group: { _id: null, total: { $sum: '$amountDue' } } }]),
    Sale.find({ businessId, status: { $ne: 'voided' } }).sort({ createdAt: -1 }).limit(10).populate('customerId', 'name').select('invoiceNumber customerId total status createdAt').lean(),
  ]);

  const thisMonthRevenue = thisMonthSales[0]?.revenue || 0;
  const lastMonthRevenue = lastMonthSales[0]?.revenue || 0;
  const revenueGrowth = lastMonthRevenue > 0 ? (((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1) : 0;

  return {
    todaySales: todaySales[0]?.revenue || 0,
    todayOrders: todaySales[0]?.count || 0,
    todayPurchasesTotal: todayPurchases[0]?.total || 0,
    todayPurchasesCount: todayPurchases[0]?.count || 0,
    monthlyRevenue: thisMonthRevenue,
    monthlyOrders: thisMonthSales[0]?.count || 0,
    monthlyExpenses: thisMonthExpenses[0]?.total || 0,
    profit: thisMonthRevenue - (thisMonthExpenses[0]?.total || 0),
    revenueGrowth: parseFloat(revenueGrowth),
    totalProducts,
    totalCustomers,
    totalUsers,
    totalStockValue: 0,
    lowStockProducts: lowStockProducts.filter(p => p.currentStock <= p.minimumStock),
    outstandingPayments: creditSales[0]?.total || 0,
    recentSales: recentSales.map(s => ({
      id: s._id,
      invoiceNumber: s.invoiceNumber,
      customerName: s.customerId?.name || 'Walk-in',
      total: s.total,
      status: s.status,
      date: s.createdAt,
    })),
  };
};

const getChartData = async (businessId, query) => {
  const period = query.period || 'month';
  const now = new Date();
  let startDate;

  if (period === 'today') {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (period === '7days') {
    startDate = new Date(now); startDate.setDate(startDate.getDate() - 7);
  } else if (period === 'thisMonth') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (period === 'lastMonth') {
    startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    now.setDate(0); // last day of previous month
  } else if (period === 'week') {
    startDate = new Date(now); startDate.setDate(startDate.getDate() - 7);
  } else if (period === 'quarter') {
    startDate = new Date(now); startDate.setMonth(startDate.getMonth() - 3);
  } else if (period === 'year') {
    startDate = new Date(now.getFullYear(), 0, 1);
  } else {
    startDate = new Date(now); startDate.setDate(startDate.getDate() - 30);
  }

  // Pick date format based on period range
  const useHourly = period === 'today';
  const dateFormat = useHourly ? '%Y-%m-%d %H:00' : (period === '7days' ? '%Y-%m-%d' : '%Y-%m-%d');

  const [salesOverTime, salesByDate, expensesByDate, topProducts, salesByCategory, paymentMethods] = await Promise.all([
    // Sales over time (for line/area chart)
    Sale.aggregate([
      { $match: { businessId, status: { $ne: 'voided' }, createdAt: { $gte: startDate } } },
      { $group: { _id: { $dateToString: { format: dateFormat, date: '$createdAt' } }, revenue: { $sum: '$total' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    // Revenue by date (for revenue vs expenses chart)
    Sale.aggregate([
      { $match: { businessId, status: { $ne: 'voided' }, createdAt: { $gte: startDate } } },
      { $group: { _id: { $dateToString: { format: dateFormat, date: '$createdAt' } }, revenue: { $sum: '$total' } } },
      { $sort: { _id: 1 } },
    ]),
    // Expenses by date
    Expense.aggregate([
      { $match: { businessId, date: { $gte: startDate } } },
      { $group: { _id: { $dateToString: { format: dateFormat, date: '$date' } }, expenses: { $sum: '$amount' } } },
      { $sort: { _id: 1 } },
    ]),
    // Top products by revenue
    Sale.aggregate([
      { $match: { businessId, status: { $ne: 'voided' }, createdAt: { $gte: startDate } } },
      { $unwind: '$items' },
      { $group: { _id: { productId: '$items.productId', name: '$items.productName' }, quantity: { $sum: '$items.quantity' }, revenue: { $sum: '$items.total' } } },
      { $sort: { revenue: -1 } }, { $limit: 10 },
    ]),
    // Sales by category
    Sale.aggregate([
      { $match: { businessId, status: { $ne: 'voided' }, createdAt: { $gte: startDate } } },
      { $unwind: '$items' },
      { $lookup: { from: 'products', localField: 'items.productId', foreignField: '_id', as: 'product' } },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      { $lookup: { from: 'categories', localField: 'product.categoryId', foreignField: '_id', as: 'category' } },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      { $group: { _id: { $ifNull: ['$category.name', 'Uncategorized'] }, sales: { $sum: '$items.total' } } },
      { $sort: { sales: -1 } },
    ]),
    // Payment methods
    Sale.aggregate([
      { $match: { businessId, status: { $ne: 'voided' }, createdAt: { $gte: startDate } } },
      { $group: { _id: '$paymentMethod', count: { $sum: 1 }, amount: { $sum: '$total' } } },
      { $sort: { count: -1 } },
    ]),
  ]);

  // Transform salesOverTime → chart-friendly { date, revenue, count }
  const salesData = salesOverTime.map(d => ({ date: d._id, revenue: d.revenue, count: d.count }));

  // Merge revenue + expenses into a single flat array for the bar chart
  const revenueMap = new Map(salesByDate.map(d => [d._id, d.revenue]));
  const expenseMap = new Map(expensesByDate.map(d => [d._id, d.expenses]));
  const allDates = new Set([...revenueMap.keys(), ...expenseMap.keys()]);
  const revExpData = [...allDates].sort().map(date => ({
    date,
    revenue: revenueMap.get(date) || 0,
    expenses: expenseMap.get(date) || 0,
  }));

  // Transform topProducts: flatten nested _id.name
  const topProductsData = topProducts.map(d => ({
    name: d._id.name,
    quantity: d.quantity,
    revenue: d.revenue,
  }));

  // Transform salesByCategory
  const categoryData = salesByCategory.map(d => ({
    category: d._id,
    sales: d.sales,
  }));

  // Transform paymentMethods: _id → name
  const paymentData = paymentMethods.map(d => ({
    name: d._id.charAt(0).toUpperCase() + d._id.slice(1),
    count: d.count,
    amount: d.amount,
  }));

  return {
    salesOverTime: salesData,
    revenueVsExpenses: revExpData,
    topProducts: topProductsData,
    salesByCategory: categoryData,
    paymentMethods: paymentData,
  };
};

module.exports = { getDashboardStats, getChartData };
