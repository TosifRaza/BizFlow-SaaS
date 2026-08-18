const Category = require('../models/Category');
const Product = require('../models/Product');
const config = require('../config');

class CategoryError extends Error {
  constructor(message, statusCode) { super(message); this.statusCode = statusCode; }
}

const getAll = async (businessId, query) => {
  const page = parseInt(query.page) || config.pagination.defaultPage;
  const limit = Math.min(parseInt(query.limit) || config.pagination.defaultLimit, config.pagination.maxLimit);
  const skip = (page - 1) * limit;
  const filter = { businessId };
  if (query.status) filter.status = query.status;
  if (query.search) filter.name = { $regex: query.search, $options: 'i' };

  const [data, total] = await Promise.all([
    Category.find(filter).sort('-createdAt').skip(skip).limit(limit).lean(),
    Category.countDocuments(filter),
  ]);
  return { data, page, limit, total };
};

const getById = async (id, businessId) => {
  const category = await Category.findOne({ _id: id, businessId }).lean();
  if (!category) throw new CategoryError('Category not found', 404);
  const productCount = await Product.countDocuments({ categoryId: id, businessId });
  return { ...category, productCount };
};

const create = async (businessId, data, userId) => {
  const existing = await Category.findOne({ name: data.name, businessId });
  if (existing) throw new CategoryError('Category name already exists', 409);
  const category = await Category.create({ ...data, businessId, createdBy: userId });
  return category;
};

const update = async (id, businessId, data) => {
  if (data.name) {
    const existing = await Category.findOne({ name: data.name, businessId, _id: { $ne: id } });
    if (existing) throw new CategoryError('Category name already exists', 409);
  }
  const category = await Category.findOneAndUpdate({ _id: id, businessId }, data, { new: true, runValidators: true });
  if (!category) throw new CategoryError('Category not found', 404);
  return category;
};

const remove = async (id, businessId) => {
  const productCount = await Product.countDocuments({ categoryId: id, businessId });
  if (productCount > 0) throw new CategoryError('Cannot delete category with products. Move or delete products first.', 400);
  const category = await Category.findOneAndDelete({ _id: id, businessId });
  if (!category) throw new CategoryError('Category not found', 404);
  return { message: 'Category deleted' };
};

module.exports = { getAll, getById, create, update, delete: remove };
