// const mongoose = require('mongoose');
// const Purchase = require('../models/Purchase');
// const PurchaseItem = require('../models/PurchaseItem');
// const Product = require('../models/Product');
// const Supplier = require('../models/Supplier');
// const SupplierTransaction = require('../models/SupplierTransaction');
// const InventoryTransaction = require('../models/InventoryTransaction');
// const config = require('../config');
// const notificationService = require('./notificationService');

// class PurchaseError extends Error {
//   constructor(message, statusCode) { super(message); this.statusCode = statusCode; }
// }

// const create = async (businessId, { supplierId, items, paymentMethod, notes, branchId }, userId) => {
//   if (!items || items.length === 0) throw new PurchaseError('Purchase must have at least one item', 400);

//   const supplier = await Supplier.findOne({ _id: supplierId, businessId });
//   if (!supplier) throw new PurchaseError('Supplier not found', 404);

//   const session = await mongoose.startSession();
//   session.startTransaction();
//   try {
//     let subtotal = 0;
//     let totalTax = 0;
//     const purchaseItems = [];

//     for (const item of items) {
//       const product = await Product.findOne({ _id: item.productId, businessId }).session(session);
//       if (!product) throw new PurchaseError(`Product not found: ${item.productId}`, 404);

//       const unitPrice = item.unitPrice || product.purchasePrice;
//       const taxRate = item.taxRate !== undefined ? item.taxRate : 0;
//       const lineTotalBeforeTax = unitPrice * item.quantity;
//       const taxAmount = lineTotalBeforeTax * (taxRate / 100);
//       const lineTotal = lineTotalBeforeTax + taxAmount;

//       subtotal += lineTotalBeforeTax;
//       totalTax += taxAmount;

//       purchaseItems.push({
//         productId: product._id, productName: product.name, quantity: item.quantity,
//         unitPrice, taxRate, taxAmount, total: lineTotal,
//       });
//     }

//     const total = subtotal + totalTax;
//     let amountPaid = 0;
//     let amountDue = total;
//     let status = 'credit';

//     if (paymentMethod && paymentMethod !== 'credit') {
//       amountPaid = total;
//       amountDue = 0;
//       status = 'completed';
//     }

//     const purchase = await Purchase.create([{
//       supplierId, items: purchaseItems, subtotal, taxAmount: totalTax, total,
//       amountPaid, amountDue, paymentMethod: paymentMethod || 'cash', status,
//       notes, businessId, branchId, createdBy: userId,
//     }], { session });
//     const purchaseDoc = purchase[0];

//     for (const item of purchaseItems) {
//       await PurchaseItem.create([{
//         purchaseId: purchaseDoc._id, productId: item.productId, productName: item.productName,
//         quantity: item.quantity, unitPrice: item.unitPrice, taxRate: item.taxRate,
//         taxAmount: item.taxAmount, total: item.total, businessId,
//       }], { session });

//       const product = await Product.findById(item.productId).session(session);
//       const previousStock = product.currentStock;
//       const newStock = previousStock + item.quantity;
//       product.currentStock = newStock;
//       if (item.unitPrice) product.purchasePrice = item.unitPrice;
//       await product.save({ session });

//       await InventoryTransaction.create([{
//         productId: product._id, type: 'purchase', quantity: item.quantity,
//         previousStock, newStock, referenceId: purchaseDoc._id, referenceType: 'purchase',
//         businessId, branchId, createdBy: userId,
//       }], { session });
//     }

//     supplier.balance += amountDue;
//     await supplier.save({ session });

//     await SupplierTransaction.create([{
//       supplierId, type: 'purchase', amount: total, debit: amountDue, credit: 0,
//       balance: supplier.balance, referenceId: purchaseDoc._id, referenceType: 'purchase',
//       businessId, createdBy: userId,
//     }], { session });

//     await session.commitTransaction();
//     session.endSession();
//     const result = await Purchase.findById(purchaseDoc._id).populate('supplierId', 'name company').lean();
//     try {
//       await notificationService.create({
//         userId, businessId, type: 'purchase_completed',
//         title: 'Purchase Completed',
//         message: `Purchase for $${total.toFixed(2)} from ${supplier.name} has been completed.`,
//         data: { purchaseId: purchaseDoc._id, supplierId: supplier._id, supplierName: supplier.name, total },
//       });
//     } catch {}
//     return result;
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     throw error;
//   }
// };

// const getAll = async (businessId, query, branchFilter = {}) => {
//   const page = parseInt(query.page) || config.pagination.defaultPage;
//   const limit = Math.min(parseInt(query.limit) || config.pagination.defaultLimit, config.pagination.maxLimit);
//   const skip = (page - 1) * limit;
//   const filter = { ...branchFilter, businessId };
//   if (query.status) filter.status = query.status;
//   if (query.supplierId) filter.supplierId = query.supplierId;
//   if (query.startDate && query.endDate) filter.createdAt = { $gte: new Date(query.startDate), $lte: new Date(query.endDate) };

//   const [data, total] = await Promise.all([
//     Purchase.find(filter).populate('supplierId', 'name company').populate('createdBy', 'name').sort('-createdAt').skip(skip).limit(limit).lean(),
//     Purchase.countDocuments(filter),
//   ]);
//   return { data, page, limit, total };
// };

// const getById = async (id, businessId) => {
//   const purchase = await Purchase.findOne({ _id: id, businessId }).populate('supplierId', 'name company phone email').populate('createdBy', 'name').lean();
//   if (!purchase) throw new PurchaseError('Purchase not found', 404);
//   return purchase;
// };

// const recordPayment = async (id, businessId, { amount, paymentMethod }, userId) => {
//   const purchase = await Purchase.findById(id);
//   if (!purchase || purchase.businessId.toString() !== businessId.toString()) throw new PurchaseError('Purchase not found', 404);
//   if (purchase.status === 'completed') throw new PurchaseError('Purchase already paid in full', 400);
//   if (amount <= 0) throw new PurchaseError('Amount must be positive', 400);

//   const newAmountPaid = purchase.amountPaid + amount;
//   const newAmountDue = purchase.total - newAmountPaid;

//   purchase.amountPaid = newAmountPaid;
//   purchase.amountDue = Math.max(0, newAmountDue);
//   purchase.status = newAmountDue <= 0 ? 'completed' : 'partial';
//   await purchase.save();

//   const supplier = await Supplier.findById(purchase.supplierId);
//   if (supplier) {
//     supplier.balance -= amount;
//     if (supplier.balance < 0) supplier.balance = 0;
//     await supplier.save();
//     await SupplierTransaction.create({
//       supplierId: supplier._id, type: 'payment', amount, debit: 0, credit: amount,
//       balance: supplier.balance, referenceId: purchase._id, referenceType: 'payment',
//       notes: `Payment for purchase`, businessId, createdBy: userId,
//     });
//   }

//   return purchase;
// };

// module.exports = { create, getAll, getById, recordPayment };
const mongoose = require('mongoose');
const Purchase = require('../models/Purchase');
const PurchaseItem = require('../models/PurchaseItem');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');
const SupplierTransaction = require('../models/SupplierTransaction');
const InventoryTransaction = require('../models/InventoryTransaction');
const config = require('../config');

class PurchaseError extends Error {
  constructor(message, statusCode) { super(message); this.statusCode = statusCode; }
}

const create = async (businessId, { supplierId, items, paymentMethod, notes, branchId }, userId, options = {}) => {
  if (!items || items.length === 0) throw new PurchaseError('Purchase must have at least one item', 400);

  const supplier = await Supplier.findOne({ _id: supplierId, businessId });
  if (!supplier) throw new PurchaseError('Supplier not found', 404);

  // Use provided session (from invoiceImport) or create our own
  const ownSession = !options.session;
  const session = options.session || (await mongoose.startSession());
  if (ownSession) session.startTransaction();
  try {
    let subtotal = 0;
    let totalTax = 0;
    const purchaseItems = [];

    for (const item of items) {
      const product = await Product.findOne({ _id: item.productId, businessId }).session(session);
      if (!product) throw new PurchaseError(`Product not found: ${item.productId}`, 404);

      const unitPrice = item.unitPrice || product.purchasePrice;
      const taxRate = item.taxRate !== undefined ? item.taxRate : 0;
      const lineTotalBeforeTax = unitPrice * item.quantity;
      const taxAmount = lineTotalBeforeTax * (taxRate / 100);
      const lineTotal = lineTotalBeforeTax + taxAmount;

      subtotal += lineTotalBeforeTax;
      totalTax += taxAmount;

      purchaseItems.push({
        productId: product._id, productName: product.name, quantity: item.quantity,
        unitPrice, taxRate, taxAmount, total: lineTotal,
      });
    }

    const total = subtotal + totalTax;
    let amountPaid = 0;
    let amountDue = total;
    let status = 'credit';

    if (paymentMethod && paymentMethod !== 'credit') {
      amountPaid = total;
      amountDue = 0;
      status = 'completed';
    }

    const purchase = await Purchase.create([{
      supplierId, items: purchaseItems, subtotal, taxAmount: totalTax, total,
      amountPaid, amountDue, paymentMethod: paymentMethod || 'cash', status,
      notes, businessId, branchId, createdBy: userId,
    }], { session });
    const purchaseDoc = purchase[0];

    for (const item of purchaseItems) {
      await PurchaseItem.create([{
        purchaseId: purchaseDoc._id, productId: item.productId, productName: item.productName,
        quantity: item.quantity, unitPrice: item.unitPrice, taxRate: item.taxRate,
        taxAmount: item.taxAmount, total: item.total, businessId,
      }], { session });

      const product = await Product.findById(item.productId).session(session);
      const previousStock = product.currentStock;
      const newStock = previousStock + item.quantity;
      product.currentStock = newStock;
      if (item.unitPrice) product.purchasePrice = item.unitPrice;
      await product.save({ session });

      await InventoryTransaction.create([{
        productId: product._id, type: 'purchase', quantity: item.quantity,
        previousStock, newStock, referenceId: purchaseDoc._id, referenceType: 'purchase',
        businessId, branchId, createdBy: userId,
      }], { session });
    }

    supplier.balance += amountDue;
    await supplier.save({ session });

    await SupplierTransaction.create([{
      supplierId, type: 'purchase', amount: total, debit: amountDue, credit: 0,
      balance: supplier.balance, referenceId: purchaseDoc._id, referenceType: 'purchase',
      businessId, createdBy: userId,
    }], { session });

    if (ownSession) {
      await session.commitTransaction();
      session.endSession();
      return await Purchase.findById(purchaseDoc._id).populate('supplierId', 'name company').lean();
    }
    // If session was provided externally, don't commit/end it — caller handles that
    return purchaseDoc;
  } catch (error) {
    if (ownSession) {
      await session.abortTransaction();
      session.endSession();
    }
    throw error;
  }
};

const getAll = async (businessId, query) => {
  const page = parseInt(query.page) || config.pagination.defaultPage;
  const limit = Math.min(parseInt(query.limit) || config.pagination.defaultLimit, config.pagination.maxLimit);
  const skip = (page - 1) * limit;
  const filter = { businessId };
  if (query.status) filter.status = query.status;
  if (query.supplierId) filter.supplierId = query.supplierId;
  if (query.startDate && query.endDate) filter.createdAt = { $gte: new Date(query.startDate), $lte: new Date(query.endDate) };

  const [data, total] = await Promise.all([
    Purchase.find(filter).populate('supplierId', 'name company').populate('createdBy', 'name').sort('-createdAt').skip(skip).limit(limit).lean(),
    Purchase.countDocuments(filter),
  ]);
  return { data, page, limit, total };
};

const getById = async (id, businessId) => {
  const purchase = await Purchase.findOne({ _id: id, businessId }).populate('supplierId', 'name company phone email').populate('createdBy', 'name').lean();
  if (!purchase) throw new PurchaseError('Purchase not found', 404);
  return purchase;
};

const recordPayment = async (id, businessId, { amount, paymentMethod }, userId) => {
  const purchase = await Purchase.findById(id);
  if (!purchase || purchase.businessId.toString() !== businessId.toString()) throw new PurchaseError('Purchase not found', 404);
  if (purchase.status === 'completed') throw new PurchaseError('Purchase already paid in full', 400);
  if (amount <= 0) throw new PurchaseError('Amount must be positive', 400);

  const newAmountPaid = purchase.amountPaid + amount;
  const newAmountDue = purchase.total - newAmountPaid;

  purchase.amountPaid = newAmountPaid;
  purchase.amountDue = Math.max(0, newAmountDue);
  purchase.status = newAmountDue <= 0 ? 'completed' : 'partial';
  await purchase.save();

  const supplier = await Supplier.findById(purchase.supplierId);
  if (supplier) {
    supplier.balance -= amount;
    if (supplier.balance < 0) supplier.balance = 0;
    await supplier.save();
    await SupplierTransaction.create({
      supplierId: supplier._id, type: 'payment', amount, debit: 0, credit: amount,
      balance: supplier.balance, referenceId: purchase._id, referenceType: 'payment',
      notes: `Payment for purchase`, businessId, createdBy: userId,
    });
  }

  return purchase;
};

module.exports = { create, getAll, getById, recordPayment };
