const Product = require('../models/Product');
const InventoryTransaction = require('../models/InventoryTransaction');
const config = require('../config');
const notificationService = require('./notificationService');

class InventoryError extends Error {
  constructor(message, statusCode) { super(message); this.statusCode = statusCode; }
}

const getStock = async (businessId, query) => {
  const page = parseInt(query.page) || config.pagination.defaultPage;
  const limit = Math.min(parseInt(query.limit) || config.pagination.defaultLimit, config.pagination.maxLimit);
  const skip = (page - 1) * limit;
  const filter = { businessId, status: 'active' };
  if (query.categoryId) filter.categoryId = query.categoryId;
  if (query.search) filter.$or = [{ name: { $regex: query.search, $options: 'i' } }, { sku: { $regex: query.search, $options: 'i' } }];

  const [data, total] = await Promise.all([
    Product.find(filter).select('name sku currentStock minimumStock maximumStock unit sellingPrice categoryId').populate('categoryId', 'name').sort('name').skip(skip).limit(limit).lean(),
    Product.countDocuments(filter),
  ]);
  return { data, page, limit, total };
};

const getMovements = async (businessId, query, branchFilter = {}) => {
  const page = parseInt(query.page) || config.pagination.defaultPage;
  const limit = Math.min(parseInt(query.limit) || config.pagination.defaultLimit, config.pagination.maxLimit);
  const skip = (page - 1) * limit;
  const filter = { ...branchFilter, businessId };
  if (query.productId) filter.productId = query.productId;
  if (query.type) filter.type = query.type;
  if (query.startDate && query.endDate) filter.createdAt = { $gte: new Date(query.startDate), $lte: new Date(query.endDate) };

  const [data, total] = await Promise.all([
    InventoryTransaction.find(filter).populate('productId', 'name sku').populate('createdBy', 'name').sort('-createdAt').skip(skip).limit(limit).lean(),
    InventoryTransaction.countDocuments(filter),
  ]);
  return { data, page, limit, total };
};

// const adjustStock = async (businessId, { productId, type, quantity, notes }, userId) => {
//   const product = await Product.findOne({ _id: productId, businessId });
//   if (!product) throw new InventoryError('Product not found', 404);

//   const previousStock = product.currentStock;
//   let newStock;

//   if (type === 'purchase' || type === 'return' || type === 'adjustment') {
//     newStock = previousStock + quantity;
//   } else if (type === 'sale' || type === 'damage') {
//     if (previousStock < quantity) throw new InventoryError('Insufficient stock', 400);
//     newStock = previousStock - quantity;
//   } else {
//     newStock = quantity;
//   }

//   product.currentStock = newStock;
//   await product.save();

//   await InventoryTransaction.create({
//     productId, type, quantity, previousStock, newStock, notes,
//     referenceType: 'adjustment',
//     businessId, createdBy: userId,
//   });

//   if (product.currentStock <= product.minimumStock) {
//     try {
//       await notificationService.create({
//         userId, businessId, type: 'low_stock',
//         title: 'Low Stock Alert',
//         message: `${product.name} stock is low. Current: ${product.currentStock} ${product.unit || 'units'}, Minimum: ${product.minimumStock}.`,
//         data: { productId: product._id, productName: product.name, currentStock: product.currentStock, minimumStock: product.minimumStock },
//       });
//     } catch {}
//   }

//   return product;
// };

const adjustStock = async (businessId, { productId, type, quantity, notes, reason }, userId) => {
  const product = await Product.findOne({ _id: productId, businessId });
  if (!product) throw new InventoryError('Product not found', 404);

  const previousStock = product.currentStock;
  let newStock;

  if (type === 'add' || type === 'purchase' || type === 'return') {
    newStock = previousStock + quantity;
  } else if (type === 'remove' || type === 'sale' || type === 'damage') {
    if (previousStock < quantity) throw new InventoryError('Insufficient stock', 400);
    newStock = previousStock - quantity;
  } else if (type === 'set' || type === 'adjustment') {
    newStock = quantity;
  } else {
    newStock = previousStock + quantity;
  }

  product.currentStock = newStock;
  await product.save();

  const transactionNotes = notes || reason || `Stock ${type}: ${quantity}`;

  await InventoryTransaction.create({
    productId, type, quantity, previousStock, newStock,
    notes: transactionNotes,
    referenceType: 'adjustment',
    businessId, createdBy: userId,
  });

  if (product.currentStock <= product.minimumStock) {
    try {
      await notificationService.create({
        userId, businessId, type: 'low_stock',
        title: 'Low Stock Alert',
        message: `${product.name} stock is low. Current: ${product.currentStock} ${product.unit || 'units'}, Minimum: ${product.minimumStock}.`,
        data: { productId: product._id, productName: product.name, currentStock: product.currentStock, minimumStock: product.minimumStock },
      });
    } catch {}
  }

  return product;
};

const getLowStock = async (businessId) => {
  const products = await Product.find({
    businessId, status: 'active',
  }).select('name sku currentStock minimumStock unit').lean();

  return products.filter(p => p.currentStock <= p.minimumStock).sort((a, b) => a.currentStock - b.currentStock);
};

const getStockValue = async (businessId) => {
  const result = await Product.aggregate([
    { $match: { businessId, status: 'active' } },
    {
      $group: {
        _id: null,
        totalStockValue: { $sum: { $multiply: ['$sellingPrice', '$currentStock'] } },
        totalCostValue: { $sum: { $multiply: ['$purchasePrice', '$currentStock'] } },
        totalItems: { $sum: '$currentStock' },
        productCount: { $sum: 1 },
      },
    },
  ]);
  return result[0] || { totalStockValue: 0, totalCostValue: 0, totalItems: 0, productCount: 0 };
};

const transferStock = async (businessId, { productId, quantity, toBranchId, notes }, userId) => {
  const product = await Product.findOne({ _id: productId, businessId });
  if (!product) throw new InventoryError('Product not found', 404);
  if (product.currentStock < quantity) throw new InventoryError('Insufficient stock', 400);

  const previousStock = product.currentStock;
  product.currentStock -= quantity;
  await product.save();

  await InventoryTransaction.create({
    productId, type: 'transfer', quantity, previousStock, newStock: product.currentStock,
    notes: notes || `Transfer to branch ${toBranchId}`,
    referenceType: 'transfer', branchId: toBranchId,
    businessId, createdBy: userId,
  });

  if (product.currentStock <= product.minimumStock) {
    try {
      await notificationService.create({
        userId, businessId, type: 'low_stock',
        title: 'Low Stock Alert',
        message: `${product.name} stock is low. Current: ${product.currentStock} ${product.unit || 'units'}, Minimum: ${product.minimumStock}.`,
        data: { productId: product._id, productName: product.name, currentStock: product.currentStock, minimumStock: product.minimumStock },
      });
    } catch {}
  }

  return product;
};

module.exports = { getStock, getMovements, adjustStock, getLowStock, getStockValue, transferStock };
