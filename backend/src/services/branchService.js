const Branch = require('../models/Branch');
const Product = require('../models/Product');
const InventoryTransaction = require('../models/InventoryTransaction');
const Business = require('../models/Business');
const config = require('../config');

class BranchError extends Error {
  constructor(message, statusCode) { super(message); this.statusCode = statusCode; }
}

const getAll = async (businessId, query) => {
  const page = parseInt(query.page) || config.pagination.defaultPage;
  const limit = Math.min(parseInt(query.limit) || config.pagination.defaultLimit, config.pagination.maxLimit);
  const skip = (page - 1) * limit;
  const filter = { businessId };
  if (query.status) filter.status = query.status;

  const [data, total] = await Promise.all([
    Branch.find(filter).sort('-createdAt').skip(skip).limit(limit).lean(),
    Branch.countDocuments(filter),
  ]);
  return { data, page, limit, total };
};

const getById = async (id, businessId) => {
  const branch = await Branch.findOne({ _id: id, businessId }).lean();
  if (!branch) throw new BranchError('Branch not found', 404);
  return branch;
};

const create = async (businessId, data, userId) => {
  const count = await Branch.countDocuments({ businessId });
  const business = await Business.findById(businessId);
  if (business && business.planId) {
    const plan = await require('../models/Plan').findById(business.planId);
    if (plan && count >= plan.limits.branches) {
      throw new BranchError('Branch limit reached. Upgrade your plan.', 403);
    }
  }

  const isMain = count === 0;
  const branch = await Branch.create({ ...data, isMain, businessId, createdBy: userId });

  if (business) {
    business.usage.branchesUsed = count + 1;
    await business.save();
  }

  return branch;
};

const update = async (id, businessId, data) => {
  const branch = await Branch.findOneAndUpdate({ _id: id, businessId }, data, { new: true, runValidators: true });
  if (!branch) throw new BranchError('Branch not found', 404);
  return branch;
};

const remove = async (id, businessId) => {
  const branch = await Branch.findOneAndDelete({ _id: id, businessId });
  if (!branch) throw new BranchError('Branch not found', 404);
  if (branch.isMain) throw new BranchError('Cannot delete the main branch', 400);

  const count = await Branch.countDocuments({ businessId });
  const business = await Business.findById(businessId);
  if (business) {
    business.usage.branchesUsed = count;
    await business.save();
  }

  return { message: 'Branch deleted' };
};

const transferStock = async (businessId, { productId, quantity, fromBranchId, toBranchId, notes }, userId) => {
  const fromBranch = await Branch.findOne({ _id: fromBranchId, businessId });
  const toBranch = await Branch.findOne({ _id: toBranchId, businessId });
  if (!fromBranch || !toBranch) throw new BranchError('Branch not found', 404);

  const product = await Product.findOne({ _id: productId, businessId });
  if (!product) throw new BranchError('Product not found', 404);
  if (product.currentStock < quantity) throw new BranchError('Insufficient stock', 400);

  const previousStock = product.currentStock;
  product.currentStock -= quantity;
  await product.save();

  await InventoryTransaction.create({
    productId, type: 'transfer', quantity, previousStock, newStock: product.currentStock,
    notes: notes || `Transfer from ${fromBranch.name} to ${toBranch.name}`,
    referenceType: 'transfer', branchId: toBranchId, businessId, createdBy: userId,
  });

  return product;
};

module.exports = { getAll, getById, create, update, delete: remove, transferStock };
