// // // const Supplier = require('../models/Supplier');
// // // const SupplierTransaction = require('../models/SupplierTransaction');
// // // const config = require('../config');

// // // class SupplierError extends Error {
// // //   constructor(message, statusCode) { super(message); this.statusCode = statusCode; }
// // // }

// // // const getAll = async (businessId, query) => {
// // //   const page = parseInt(query.page) || config.pagination.defaultPage;
// // //   const limit = Math.min(parseInt(query.limit) || config.pagination.defaultLimit, config.pagination.maxLimit);
// // //   const skip = (page - 1) * limit;
// // //   const filter = { businessId };
// // //   if (query.search) filter.$or = [{ name: { $regex: query.search, $options: 'i' } }, { company: { $regex: query.search, $options: 'i' } }];
// // //   if (query.status) filter.status = query.status;

// // //   const [data, total] = await Promise.all([
// // //     Supplier.find(filter).sort('-createdAt').skip(skip).limit(limit).lean(),
// // //     Supplier.countDocuments(filter),
// // //   ]);
// // //   return { data, page, limit, total };
// // // };

// // // const getById = async (id, businessId) => {
// // //   const supplier = await Supplier.findOne({ _id: id, businessId }).lean();
// // //   if (!supplier) throw new SupplierError('Supplier not found', 404);
// // //   return supplier;
// // // };

// // // const create = async (businessId, data, userId) => {
// // //   const supplier = await Supplier.create({ ...data, businessId, createdBy: userId });
// // //   return supplier;
// // // };

// // // const update = async (id, businessId, data) => {
// // //   const supplier = await Supplier.findOneAndUpdate({ _id: id, businessId }, data, { new: true, runValidators: true });
// // //   if (!supplier) throw new SupplierError('Supplier not found', 404);
// // //   return supplier;
// // // };

// // // const remove = async (id, businessId) => {
// // //   const supplier = await Supplier.findOneAndDelete({ _id: id, businessId });
// // //   if (!supplier) throw new SupplierError('Supplier not found', 404);
// // //   return { message: 'Supplier deleted' };
// // // };

// // // const getLedger = async (id, businessId, query) => {
// // //   const supplier = await Supplier.findOne({ _id: id, businessId });
// // //   if (!supplier) throw new SupplierError('Supplier not found', 404);

// // //   const page = parseInt(query.page) || config.pagination.defaultPage;
// // //   const limit = Math.min(parseInt(query.limit) || config.pagination.defaultLimit, config.pagination.maxLimit);
// // //   const skip = (page - 1) * limit;
// // //   const filter = { supplierId: id, businessId };
// // //   if (query.startDate && query.endDate) filter.createdAt = { $gte: new Date(query.startDate), $lte: new Date(query.endDate) };

// // //   const [data, total] = await Promise.all([
// // //     SupplierTransaction.find(filter).sort('-createdAt').skip(skip).limit(limit).lean(),
// // //     SupplierTransaction.countDocuments(filter),
// // //   ]);
// // //   return { supplier, data, page, limit, total };
// // // };

// // // const recordPayment = async (id, businessId, { amount, paymentMethod, notes }, userId) => {
// // //   const supplier = await Supplier.findOne({ _id: id, businessId });
// // //   if (!supplier) throw new SupplierError('Supplier not found', 404);
// // //   if (amount <= 0) throw new SupplierError('Amount must be positive', 400);

// // //   const previousBalance = supplier.balance;
// // //   supplier.balance -= amount;
// // //   if (supplier.balance < 0) supplier.balance = 0;
// // //   await supplier.save();

// // //   await SupplierTransaction.create({
// // //     supplierId: id, type: 'payment', amount, debit: amount, credit: 0,
// // //     balance: supplier.balance, referenceType: 'payment', notes: notes || 'Payment made',
// // //     businessId, createdBy: userId,
// // //   });

// // //   return supplier;
// // // };

// // // const getStats = async (businessId) => {
// // //   const [total, active, totalPayable] = await Promise.all([
// // //     Supplier.countDocuments({ businessId }),
// // //     Supplier.countDocuments({ businessId, status: 'active' }),
// // //     Supplier.aggregate([{ $match: { businessId, balance: { $gt: 0 } } }, { $group: { _id: null, total: { $sum: '$balance' } } }]),
// // //   ]);
// // //   return { total, active, totalPayable: totalPayable[0]?.total || 0 };
// // // };

// // // module.exports = { getAll, getById, create, update, delete: remove, getLedger, recordPayment, getStats };
// // const Supplier = require('../models/Supplier');
// // const SupplierTransaction = require('../models/SupplierTransaction');
// // const Purchase = require('../models/Purchase');
// // const config = require('../config');

// // class SupplierError extends Error {
// //   constructor(message, statusCode) { super(message); this.statusCode = statusCode; }
// // }

// // const getAll = async (businessId, query) => {
// //   const page = parseInt(query.page) || config.pagination.defaultPage;
// //   const limit = Math.min(parseInt(query.limit) || config.pagination.defaultLimit, config.pagination.maxLimit);
// //   const skip = (page - 1) * limit;
// //   const filter = { businessId };
// //   if (query.search) filter.$or = [{ name: { $regex: query.search, $options: 'i' } }, { company: { $regex: query.search, $options: 'i' } }];
// //   if (query.status) filter.status = query.status;

// //   const [suppliers, total] = await Promise.all([
// //     Supplier.find(filter).sort('-createdAt').skip(skip).limit(limit).lean(),
// //     Supplier.countDocuments(filter),
// //   ]);

// //   // Compute totalPurchases from Purchases for these suppliers
// //   const supplierIds = suppliers.map(s => s._id);
// //   let purchaseMap = {};
// //   if (supplierIds.length > 0) {
// //     try {
// //       const purchaseData = await Purchase.aggregate([
// //         { $match: { supplierId: { $in: supplierIds } } },
// //         { $group: { _id: '$supplierId', total: { $sum: { $ifNull: ['$totalAmount', '$total'] } } } },
// //       ]);
// //       purchaseMap = Object.fromEntries(
// //         purchaseData.filter(p => p._id != null).map(p => [p._id.toString(), p.total])
// //       );
// //     } catch {
// //       // non-critical if Purchase model has different field names
// //     }
// //   }

// //   const data = suppliers.map(s => ({
// //     ...s,
// //     id: s._id.toString(),
// //     totalPurchases: purchaseMap[s._id.toString()] || 0,
// //     balanceDue: s.balance || 0,
// //   }));

// //   return { data, page, limit, total };
// // };

// // // // const getById = async (id, businessId) => {
// // // //   const supplier = await Supplier.findOne({ _id: id, businessId }).lean();
// // // //   if (!supplier) throw new SupplierError('Supplier not found', 404);
// // // //   return { ...supplier, id: supplier._id.toString(), balanceDue: supplier.balance || 0 };
// // // // };
// // // const getById = async (id, businessId) => {
// // //   const supplier = await Supplier.findOne({ _id: id, businessId }).lean();
// // //   if (!supplier) throw new SupplierError('Supplier not found', 404);

// // //   const [paidResult, purchaseResult] = await Promise.all([
// // //     SupplierTransaction.aggregate([
// // //       { $match: { supplierId: id, businessId, type: 'payment' } },
// // //       { $group: { _id: null, total: { $sum: '$amount' } } },
// // //     ]),
// // //     Purchase.aggregate([
// // //       { $match: { supplierId: id } },
// // //       { $group: { _id: null, total: { $sum: { $ifNull: ['$totalAmount', '$total'] } } } },
// // //     ]),
// // //   ]);

// // //   return {
// // //     ...supplier,
// // //     id: supplier._id.toString(),
// // //     totalPurchases: purchaseResult[0]?.total || 0,
// // //     totalPaid: paidResult[0]?.total || 0,
// // //     balanceDue: supplier.balance || 0,
// // //   };
// // // };
// // const getById = async (id, businessId) => {
// //   const supplier = await Supplier.findOne({ _id: id, businessId }).lean();
// //   if (!supplier) throw new SupplierError('Supplier not found', 404);

// //   const result = {
// //     ...supplier,
// //     id: supplier._id.toString(),
// //     balanceDue: supplier.balance || 0,
// //   };

// //   try {
// //     const mongoose = require('mongoose');
// //     const objectId = new mongoose.Types.ObjectId(id);
// //     const [paidResult, purchaseResult] = await Promise.all([
// //       SupplierTransaction.aggregate([
// //         { $match: { supplierId: objectId, businessId, type: 'payment' } },
// //         { $group: { _id: null, total: { $sum: '$amount' } } },
// //       ]),
// //       Purchase.aggregate([
// //         { $match: { supplierId: objectId } },
// //         { $group: { _id: null, total: { $sum: { $ifNull: ['$totalAmount', '$total'] } } } },
// //       ]),
// //     ]);
// //     if (purchaseResult[0]?.total) result.totalPurchases = purchaseResult[0].total;
// //     if (paidResult[0]?.total) result.totalPaid = paidResult[0].total;
// //   } catch {}

// //   return result;
// // };
// // const create = async (businessId, data, userId) => {
// //   const supplier = await Supplier.create({ ...data, businessId, createdBy: userId });
// //   return supplier;
// // };

// // const update = async (id, businessId, data) => {
// //   const supplier = await Supplier.findOneAndUpdate({ _id: id, businessId }, data, { new: true, runValidators: true });
// //   if (!supplier) throw new SupplierError('Supplier not found', 404);
// //   return supplier;
// // };

// // const remove = async (id, businessId) => {
// //   const supplier = await Supplier.findOneAndDelete({ _id: id, businessId });
// //   if (!supplier) throw new SupplierError('Supplier not found', 404);
// //   return { message: 'Supplier deleted' };
// // };

// // const getLedger = async (id, businessId, query) => {
// //   const supplier = await Supplier.findOne({ _id: id, businessId });
// //   if (!supplier) throw new SupplierError('Supplier not found', 404);

// //   const page = parseInt(query.page) || config.pagination.defaultPage;
// //   const limit = Math.min(parseInt(query.limit) || config.pagination.defaultLimit, config.pagination.maxLimit);
// //   const skip = (page - 1) * limit;
// //   const filter = { supplierId: id, businessId };
// //   if (query.startDate && query.endDate) filter.createdAt = { $gte: new Date(query.startDate), $lte: new Date(query.endDate) };

// //   const [data, total] = await Promise.all([
// //     SupplierTransaction.find(filter).sort('-createdAt').skip(skip).limit(limit).lean(),
// //     SupplierTransaction.countDocuments(filter),
// //   ]);
// //   return { supplier, data, page, limit, total };
// // };

// // const recordPayment = async (id, businessId, { amount, paymentMethod, notes }, userId) => {
// //   const supplier = await Supplier.findOne({ _id: id, businessId });
// //   if (!supplier) throw new SupplierError('Supplier not found', 404);
// //   if (amount <= 0) throw new SupplierError('Amount must be positive', 400);

// //   const previousBalance = supplier.balance;
// //   supplier.balance -= amount;
// //   if (supplier.balance < 0) supplier.balance = 0;
// //   await supplier.save();

// //   await SupplierTransaction.create({
// //     supplierId: id, type: 'payment', amount, debit: amount, credit: 0,
// //     balance: supplier.balance, referenceType: 'payment', notes: notes || 'Payment made',
// //     businessId, createdBy: userId,
// //   });

// //   return supplier;
// // };

// // const getStats = async (businessId) => {
// //   const [total, active, totalPayable] = await Promise.all([
// //     Supplier.countDocuments({ businessId }),
// //     Supplier.countDocuments({ businessId, status: 'active' }),
// //     Supplier.aggregate([{ $match: { businessId, balance: { $gt: 0 } } }, { $group: { _id: null, total: { $sum: '$balance' } } }]),
// //   ]);
// //   return {
// //     totalSuppliers: total,
// //     totalDue: totalPayable[0]?.total || 0,
// //     totalPurchases: 0,
// //   };
// // };

// // module.exports = { getAll, getById, create, update, delete: remove, getLedger, recordPayment, getStats };
// const mongoose = require('mongoose');
// const Supplier = require('../models/Supplier');
// const SupplierTransaction = require('../models/SupplierTransaction');
// const Purchase = require('../models/Purchase');
// const config = require('../config');

// class SupplierError extends Error {
//   constructor(message, statusCode) { super(message); this.statusCode = statusCode; }
// }

// const getAll = async (businessId, query) => {
//   const page = parseInt(query.page) || config.pagination.defaultPage;
//   const limit = Math.min(parseInt(query.limit) || config.pagination.defaultLimit, config.pagination.maxLimit);
//   const skip = (page - 1) * limit;
//   const filter = { businessId };
//   if (query.search) filter.$or = [{ name: { $regex: query.search, $options: 'i' } }, { company: { $regex: query.search, $options: 'i' } }];
//   if (query.status) filter.status = query.status;

//   const [suppliers, total] = await Promise.all([
//     Supplier.find(filter).sort('-createdAt').skip(skip).limit(limit).lean(),
//     Supplier.countDocuments(filter),
//   ]);

//   // Compute totalPurchases from Purchases for these suppliers
//   const supplierIds = suppliers.map(s => s._id);
//   let purchaseMap = {};
//   if (supplierIds.length > 0) {
//     try {
//       const purchaseData = await Purchase.aggregate([
//         { $match: { supplierId: { $in: supplierIds } } },
//         { $group: { _id: '$supplierId', total: { $sum: { $ifNull: ['$totalAmount', '$total'] } } } },
//       ]);
//       purchaseMap = Object.fromEntries(
//         purchaseData.filter(p => p._id != null).map(p => [p._id.toString(), p.total])
//       );
//     } catch {
//       // non-critical if Purchase model has different field names
//     }
//   }

//   const data = suppliers.map(s => ({
//     ...s,
//     id: s._id.toString(),
//     totalPurchases: purchaseMap[s._id.toString()] || 0,
//     balanceDue: s.balance || 0,
//   }));

//   return { data, page, limit, total };
// };

// const getById = async (id, businessId) => {
//   const supplier = await Supplier.findOne({ _id: id, businessId }).lean();
//   if (!supplier) throw new SupplierError('Supplier not found', 404);

//   let totalPurchases = supplier.totalPurchases || 0;
//   let totalPaid = 0;

//   try {
//     const objId = new mongoose.Types.ObjectId(id);
//     const [purchaseResult, paymentResult] = await Promise.all([
//       Purchase.aggregate([
//         { $match: { supplierId: objId } },
//         { $group: { _id: null, total: { $sum: { $ifNull: ['$totalAmount', '$total', 0] } } } },
//       ]),
//       SupplierTransaction.aggregate([
//         { $match: { supplierId: objId, type: 'payment' } },
//         { $group: { _id: null, total: { $sum: { $ifNull: ['$amount', 0] } } } },
//       ]),
//     ]);
//     if (purchaseResult.length > 0 && purchaseResult[0].total > 0) totalPurchases = purchaseResult[0].total;
//     if (paymentResult.length > 0) totalPaid = paymentResult[0].total;
//   } catch (err) {
//     console.error('getById aggregate error:', err.message);
//   }

//   return {
//     ...supplier,
//     id: supplier._id.toString(),
//     totalPurchases,
//     totalPaid,
//     balanceDue: supplier.balance || 0,
//   };
// };

// const create = async (businessId, data, userId) => {
//   const supplier = await Supplier.create({ ...data, businessId, createdBy: userId });
//   return supplier;
// };

// const update = async (id, businessId, data) => {
//   const supplier = await Supplier.findOneAndUpdate({ _id: id, businessId }, data, { new: true, runValidators: true });
//   if (!supplier) throw new SupplierError('Supplier not found', 404);
//   return supplier;
// };

// const remove = async (id, businessId) => {
//   const supplier = await Supplier.findOneAndDelete({ _id: id, businessId });
//   if (!supplier) throw new SupplierError('Supplier not found', 404);
//   return { message: 'Supplier deleted' };
// };

// const getLedger = async (id, businessId, query) => {
//   const supplier = await Supplier.findOne({ _id: id, businessId });
//   if (!supplier) throw new SupplierError('Supplier not found', 404);

//   const page = parseInt(query.page) || config.pagination.defaultPage;
//   const limit = Math.min(parseInt(query.limit) || config.pagination.defaultLimit, config.pagination.maxLimit);
//   const skip = (page - 1) * limit;
//   const filter = { supplierId: id, businessId };
//   if (query.startDate && query.endDate) filter.createdAt = { $gte: new Date(query.startDate), $lte: new Date(query.endDate) };

//   const [data, total] = await Promise.all([
//     SupplierTransaction.find(filter).sort('-createdAt').skip(skip).limit(limit).lean(),
//     SupplierTransaction.countDocuments(filter),
//   ]);
//   return { supplier, data, page, limit, total };
// };

// const recordPayment = async (id, businessId, { amount, paymentMethod, notes }, userId) => {
//   const supplier = await Supplier.findOne({ _id: id, businessId });
//   if (!supplier) throw new SupplierError('Supplier not found', 404);
//   if (amount <= 0) throw new SupplierError('Amount must be positive', 400);

//   const previousBalance = supplier.balance;
//   supplier.balance -= amount;
//   if (supplier.balance < 0) supplier.balance = 0;
//   await supplier.save();

//   await SupplierTransaction.create({
//     supplierId: id, type: 'payment', amount, debit: amount, credit: 0,
//     balance: supplier.balance, referenceType: 'payment', notes: notes || 'Payment made',
//     businessId, createdBy: userId,
//   });

//   return supplier;
// };

// const getStats = async (businessId) => {
//   // aggregate() does NOT auto-cast strings to ObjectId, so convert explicitly
//   const bizId = new mongoose.Types.ObjectId(businessId);

//   const [total, active, totalPayable, totalPurchasesResult] = await Promise.all([
//     Supplier.countDocuments({ businessId }),
//     Supplier.countDocuments({ businessId, status: 'active' }),
//     Supplier.aggregate([{ $match: { businessId: bizId, balance: { $gt: 0 } } }, { $group: { _id: null, total: { $sum: '$balance' } } }]),
//     Purchase.aggregate([
//       { $match: { businessId: bizId } },
//       { $group: { _id: null, total: { $sum: { $ifNull: ['$totalAmount', '$total', 0] } } } },
//     ]),
//   ]);
//   return {
//     totalSuppliers: total,
//     totalDue: totalPayable[0]?.total || 0,
//     totalPurchases: totalPurchasesResult[0]?.total || 0,
//   };
// };

// module.exports = { getAll, getById, create, update, delete: remove, getLedger, recordPayment, getStats };
const mongoose = require('mongoose');
const Supplier = require('../models/Supplier');
const SupplierTransaction = require('../models/SupplierTransaction');
const Purchase = require('../models/Purchase');
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

  const [suppliers, total] = await Promise.all([
    Supplier.find(filter).sort('-createdAt').skip(skip).limit(limit).lean(),
    Supplier.countDocuments(filter),
  ]);

  // Compute totalPurchases from Purchases for these suppliers
  const supplierIds = suppliers.map(s => s._id);
  let purchaseMap = {};
  if (supplierIds.length > 0) {
    try {
      const purchaseData = await Purchase.aggregate([
        { $match: { supplierId: { $in: supplierIds } } },
        { $group: { _id: '$supplierId', total: { $sum: { $ifNull: ['$totalAmount', '$total'] } } } },
      ]);
      purchaseMap = Object.fromEntries(
        purchaseData.filter(p => p._id != null).map(p => [p._id.toString(), p.total])
      );
    } catch {
      // non-critical if Purchase model has different field names
    }
  }

  const data = suppliers.map(s => ({
    ...s,
    id: s._id.toString(),
    totalPurchases: purchaseMap[s._id.toString()] || 0,
    balanceDue: s.balance || 0,
  }));

  return { data, page, limit, total };
};

const getById = async (id, businessId) => {
  const supplier = await Supplier.findOne({ _id: id, businessId }).lean();
  if (!supplier) throw new SupplierError('Supplier not found', 404);

  let totalPurchases = supplier.totalPurchases || 0;
  let totalPaid = 0;

  try {
    const objId = new mongoose.Types.ObjectId(id);
    const [purchaseResult, paymentResult] = await Promise.all([
      Purchase.aggregate([
        { $match: { supplierId: objId } },
        { $group: { _id: null, total: { $sum: { $ifNull: ['$totalAmount', '$total', 0] } } } },
      ]),
      SupplierTransaction.aggregate([
        { $match: { supplierId: objId, type: 'payment' } },
        { $group: { _id: null, total: { $sum: { $ifNull: ['$amount', 0] } } } },
      ]),
    ]);
    if (purchaseResult.length > 0 && purchaseResult[0].total > 0) totalPurchases = purchaseResult[0].total;
    if (paymentResult.length > 0) totalPaid = paymentResult[0].total;
  } catch (err) {
    console.error('getById aggregate error:', err.message);
  }

  return {
    ...supplier,
    id: supplier._id.toString(),
    totalPurchases,
    totalPaid,
    balanceDue: supplier.balance || 0,
  };
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
  // aggregate() does NOT auto-cast strings to ObjectId, so convert explicitly
  const bizId = new mongoose.Types.ObjectId(businessId);

  const [total, active, suppliersWithBalance, totalPurchasesResult] = await Promise.all([
    Supplier.countDocuments({ businessId }),
    Supplier.countDocuments({ businessId, status: 'active' }),
    // Use find() instead of aggregate — avoids Decimal128/type issues with $sum
    Supplier.find({ businessId, balance: { $gt: 0 } }, { balance: 1 }).lean(),
    Purchase.aggregate([
      { $match: { businessId: bizId } },
      { $group: { _id: null, total: { $sum: { $ifNull: ['$totalAmount', '$total', 0] } } } },
    ]),
  ]);

  // Sum balance in JS to avoid any MongoDB type issues
  const totalDue = suppliersWithBalance.reduce((sum, s) => sum + (Number(s.balance) || 0), 0);

  return {
    totalSuppliers: total,
    totalPayable: totalDue,   // ← was "totalDue" before
    totalPurchases: totalPurchasesResult[0]?.total || 0,
  };
};

module.exports = { getAll, getById, create, update, delete: remove, getLedger, recordPayment, getStats };
