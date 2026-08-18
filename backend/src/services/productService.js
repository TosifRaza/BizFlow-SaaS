// const Product = require('../models/Product');
// const Category = require('../models/Category');
// const config = require('../config');

// class ProductError extends Error {
//   constructor(message, statusCode) { super(message); this.statusCode = statusCode; }
// }

// const buildFilter = (query, businessId) => {
//   const filter = { businessId };
//   if (query.search) {
//     filter.$or = [
//       { name: { $regex: query.search, $options: 'i' } },
//       { sku: { $regex: query.search, $options: 'i' } },
//       { barcode: { $regex: query.search, $options: 'i' } },
//     ];
//   }
//   if (query.categoryId) filter.categoryId = query.categoryId;
//   if (query.status) filter.status = query.status;
//   if (query.minPrice) filter.sellingPrice = { ...filter.sellingPrice, $gte: Number(query.minPrice) };
//   if (query.maxPrice) filter.sellingPrice = { ...filter.sellingPrice, $lte: Number(query.maxPrice) };
//   return filter;
// };

// const getAll = async (businessId, query) => {
//   const page = parseInt(query.page) || config.pagination.defaultPage;
//   const limit = Math.min(parseInt(query.limit) || config.pagination.defaultLimit, config.pagination.maxLimit);
//   const skip = (page - 1) * limit;
//   const sort = query.sort || '-createdAt';

//   const filter = buildFilter(query, businessId);
//   const [data, total] = await Promise.all([
//     Product.find(filter).populate('categoryId', 'name').sort(sort).skip(skip).limit(limit).lean(),
//     Product.countDocuments(filter),
//   ]);
//   return { data, page, limit, total };
// };

// const getById = async (id, businessId) => {
//   const product = await Product.findOne({ _id: id, businessId }).populate('categoryId', 'name').lean();
//   if (!product) throw new ProductError('Product not found', 404);
//   return product;
// };

// const create = async (businessId, data, userId) => {
//   const category = await Category.findOne({ _id: data.categoryId, businessId });
//   if (!category) throw new ProductError('Category not found', 404);

//   if (data.sku) {
//     const existingSku = await Product.findOne({ sku: data.sku, businessId });
//     if (existingSku) throw new ProductError('SKU already exists', 409);
//   }

//   const product = await Product.create({ ...data, businessId, createdBy: userId });
//   await updateBusinessUsage(businessId);
//   return product;
// };

// const update = async (id, businessId, data) => {
//   if (data.sku) {
//     const existingSku = await Product.findOne({ sku: data.sku, businessId, _id: { $ne: id } });
//     if (existingSku) throw new ProductError('SKU already exists', 409);
//   }
//   const product = await Product.findOneAndUpdate({ _id: id, businessId }, data, { new: true, runValidators: true });
//   if (!product) throw new ProductError('Product not found', 404);
//   return product;
// };

// const remove = async (id, businessId) => {
//   const product = await Product.findOneAndDelete({ _id: id, businessId });
//   if (!product) throw new ProductError('Product not found', 404);
//   return { message: 'Product deleted' };
// };

// const bulkExport = async (businessId, query = {}) => {
//   const filter = { businessId };
//   if (query.categoryId) filter.categoryId = query.categoryId;
//   if (query.status) filter.status = query.status;
//   const products = await Product.find(filter)
//     .select('name sku description category sellingPrice purchasePrice unit currentStock minimumStock maximumStock hsnCode gstRate status')
//     .populate('categoryId', 'name')
//     .lean();

//   // Convert to CSV
//   const headers = ['Name', 'SKU', 'Description', 'Category', 'Selling Price', 'Purchase Price', 'Unit', 'Current Stock', 'Min Stock', 'Max Stock', 'HSN Code', 'GST Rate (%)', 'Status'];
//   const rows = products.map(p => [
//     p.name, p.sku, p.description || '', p.categoryId?.name || '', p.sellingPrice, p.purchasePrice || '',
//     p.unit || 'pcs', p.currentStock, p.minimumStock || 0, p.maximumStock || '', p.hsnCode || '', p.gstRate || 0, p.status
//   ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));

//   return { csv: [headers.join(','), ...rows].join('\n'), count: products.length };
// };

// function parseCSVLine(line) {
//   const result = [];
//   let current = '';
//   let inQuotes = false;
//   for (let i = 0; i < line.length; i++) {
//     if (line[i] === '"') { inQuotes = !inQuotes; }
//     else if (line[i] === ',' && !inQuotes) { result.push(current); current = ''; }
//     else { current += line[i]; }
//   }
//   result.push(current);
//   return result;
// }

// const bulkImport = async (businessId, filePath, userId) => {
//   const fs = require('fs');
//   const lines = fs.readFileSync(filePath, 'utf-8').split('\n').filter(l => l.trim());
//   if (lines.length < 2) throw new ProductError('CSV must have headers and at least one row', 400);

//   const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase());
//   const nameIdx = headers.indexOf('name');
//   const skuIdx = headers.indexOf('sku');
//   if (nameIdx === -1) throw new ProductError('CSV must have a "Name" column', 400);

//   const results = { created: 0, updated: 0, errors: [] };
//   for (let i = 1; i < lines.length; i++) {
//     try {
//       const values = parseCSVLine(lines[i]);
//       const name = values[nameIdx]?.trim();
//       if (!name) { results.errors.push(`Row ${i+1}: Missing name`); continue; }

//       const existing = await Product.findOne({ businessId, sku: values[skuIdx]?.trim() || undefined });
//       const productData = {
//         businessId, name, sku: values[skuIdx]?.trim() || `SKU-${Date.now()}-${i}`,
//         description: values[headers.indexOf('description')]?.trim() || '',
//         sellingPrice: parseFloat(values[headers.indexOf('selling price')]?.trim()) || 0,
//         purchasePrice: parseFloat(values[headers.indexOf('purchase price')]?.trim()) || 0,
//         unit: values[headers.indexOf('unit')]?.trim() || 'pcs',
//         currentStock: parseInt(values[headers.indexOf('current stock')]?.trim()) || 0,
//         minimumStock: parseInt(values[headers.indexOf('min stock')]?.trim()) || 0,
//         hsnCode: values[headers.indexOf('hsn code')]?.trim() || '',
//         gstRate: parseFloat(values[headers.indexOf('gst rate (%)')]?.trim()) || 0,
//         updatedBy: userId,
//       };

//       if (existing) {
//         await Product.findByIdAndUpdate(existing._id, productData);
//         results.updated++;
//       } else {
//         await Product.create({ ...productData, createdBy: userId, status: 'active' });
//         results.created++;
//       }
//     } catch (err) {
//       results.errors.push(`Row ${i+1}: ${err.message}`);
//     }
//   }

//   // Cleanup temp file
//   try { fs.unlinkSync(filePath); } catch {}
//   return results;
// };

// const bulkDelete = async (businessId, ids) => {
//   const result = await Product.deleteMany({ _id: { $in: ids }, businessId });
//   return { deleted: result.deletedCount };
// };

// const getStats = async (businessId) => {
//   const [total, active, inactive, lowStock, totalValue] = await Promise.all([
//     Product.countDocuments({ businessId }),
//     Product.countDocuments({ businessId, status: 'active' }),
//     Product.countDocuments({ businessId, status: 'inactive' }),
//     Product.countDocuments({ businessId, currentStock: { $lte: new mongoose.Schema.Types.Decimal128('$minimumStock') } }),
//     Product.aggregate([
//       { $match: { businessId, status: 'active' } },
//       { $project: { value: { $multiply: ['$sellingPrice', '$currentStock'] } } },
//       { $group: { _id: null, total: { $sum: '$value' } } },
//     ]),
//   ]);
//   return { total, active, inactive, lowStock, totalValue: totalValue[0]?.total || 0 };
// };

// const updateBusinessUsage = async (businessId) => {
//   const count = await Product.countDocuments({ businessId });
//   await require('../models/Business').updateOne({ _id: businessId }, { $set: { 'usage.productsUsed': count } });
// };

// module.exports = { getAll, getById, create, update, delete: remove, bulkImport, bulkExport, bulkDelete, getStats };
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const config = require('../config');

class ProductError extends Error {
  constructor(message, statusCode) { super(message); this.statusCode = statusCode; }
}

const buildFilter = (query, businessId) => {
  const filter = { businessId };
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { sku: { $regex: query.search, $options: 'i' } },
      { barcode: { $regex: query.search, $options: 'i' } },
    ];
  }
  if (query.categoryId) filter.categoryId = query.categoryId;
  if (query.status) filter.status = query.status;
  if (query.minPrice) filter.sellingPrice = { ...filter.sellingPrice, $gte: Number(query.minPrice) };
  if (query.maxPrice) filter.sellingPrice = { ...filter.sellingPrice, $lte: Number(query.maxPrice) };
  return filter;
};

const getAll = async (businessId, query) => {
  const page = parseInt(query.page) || config.pagination.defaultPage;
  const limit = Math.min(parseInt(query.limit) || config.pagination.defaultLimit, config.pagination.maxLimit);
  const skip = (page - 1) * limit;
  const sort = query.sort || '-createdAt';

  const filter = buildFilter(query, businessId);
  const [data, total] = await Promise.all([
    Product.find(filter).populate('categoryId', 'name').sort(sort).skip(skip).limit(limit).lean(),
    Product.countDocuments(filter),
  ]);
  return { data, page, limit, total };
};

const getById = async (id, businessId) => {
  const product = await Product.findOne({ _id: id, businessId }).populate('categoryId', 'name').lean();
  if (!product) throw new ProductError('Product not found', 404);
  return product;
};

const create = async (businessId, data, userId) => {
  const category = await Category.findOne({ _id: data.categoryId, businessId });
  if (!category) throw new ProductError('Category not found', 404);

  if (data.sku) {
    const existingSku = await Product.findOne({ sku: data.sku, businessId });
    if (existingSku) throw new ProductError('SKU already exists', 409);
  }

  const product = await Product.create({ ...data, businessId, createdBy: userId });
  await updateBusinessUsage(businessId);
  return product;
};

const update = async (id, businessId, data) => {
  if (data.sku) {
    const existingSku = await Product.findOne({ sku: data.sku, businessId, _id: { $ne: id } });
    if (existingSku) throw new ProductError('SKU already exists', 409);
  }
  const product = await Product.findOneAndUpdate({ _id: id, businessId }, data, { new: true, runValidators: true });
  if (!product) throw new ProductError('Product not found', 404);
  return product;
};

const remove = async (id, businessId) => {
  const product = await Product.findOneAndDelete({ _id: id, businessId });
  if (!product) throw new ProductError('Product not found', 404);
  return { message: 'Product deleted' };
};

const bulkExport = async (businessId, query = {}) => {
  const filter = { businessId };
  if (query.categoryId) filter.categoryId = query.categoryId;
  if (query.status) filter.status = query.status;
  const products = await Product.find(filter)
    .select('name sku description category sellingPrice purchasePrice unit currentStock minimumStock maximumStock hsnCode gstRate status')
    .populate('categoryId', 'name')
    .lean();

  const headers = ['Name', 'SKU', 'Description', 'Category', 'Selling Price', 'Purchase Price', 'Unit', 'Current Stock', 'Min Stock', 'Max Stock', 'HSN Code', 'GST Rate (%)', 'Status'];
  const rows = products.map(p => [
    p.name, p.sku, p.description || '', p.categoryId?.name || '', p.sellingPrice, p.purchasePrice || '',
    p.unit || 'pcs', p.currentStock, p.minimumStock || 0, p.maximumStock || '', p.hsnCode || '', p.gstRate || 0, p.status
  ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));

  return { csv: [headers.join(','), ...rows].join('\n'), count: products.length };
};

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') { inQuotes = !inQuotes; }
    else if (line[i] === ',' && !inQuotes) { result.push(current); current = ''; }
    else { current += line[i]; }
  }
  result.push(current);
  return result;
}

const bulkImport = async (businessId, filePath, userId) => {
  const fs = require('fs');
  const lines = fs.readFileSync(filePath, 'utf-8').split('\n').filter(l => l.trim());
  if (lines.length < 2) throw new ProductError('CSV must have headers and at least one row', 400);

  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase());
  const nameIdx = headers.indexOf('name');
  const skuIdx = headers.indexOf('sku');
  if (nameIdx === -1) throw new ProductError('CSV must have a "Name" column', 400);

  const results = { created: 0, updated: 0, errors: [] };
  for (let i = 1; i < lines.length; i++) {
    try {
      const values = parseCSVLine(lines[i]);
      const name = values[nameIdx]?.trim();
      if (!name) { results.errors.push(`Row ${i+1}: Missing name`); continue; }

      const existing = await Product.findOne({ businessId, sku: values[skuIdx]?.trim() || undefined });
      const productData = {
        businessId, name, sku: values[skuIdx]?.trim() || `SKU-${Date.now()}-${i}`,
        description: values[headers.indexOf('description')]?.trim() || '',
        sellingPrice: parseFloat(values[headers.indexOf('selling price')]?.trim()) || 0,
        purchasePrice: parseFloat(values[headers.indexOf('purchase price')]?.trim()) || 0,
        unit: values[headers.indexOf('unit')]?.trim() || 'pcs',
        currentStock: parseInt(values[headers.indexOf('current stock')]?.trim()) || 0,
        minimumStock: parseInt(values[headers.indexOf('min stock')]?.trim()) || 0,
        hsnCode: values[headers.indexOf('hsn code')]?.trim() || '',
        gstRate: parseFloat(values[headers.indexOf('gst rate (%)')]?.trim()) || 0,
        updatedBy: userId,
      };

      if (existing) {
        await Product.findByIdAndUpdate(existing._id, productData);
        results.updated++;
      } else {
        await Product.create({ ...productData, createdBy: userId, status: 'active' });
        results.created++;
      }
    } catch (err) {
      results.errors.push(`Row ${i+1}: ${err.message}`);
    }
  }

  try { fs.unlinkSync(filePath); } catch {}
  return results;
};

const bulkDelete = async (businessId, ids) => {
  const result = await Product.deleteMany({ _id: { $in: ids }, businessId });
  return { deleted: result.deletedCount };
};

const getStats = async (businessId) => {
  const [total, active, inactive, lowStock, totalValue] = await Promise.all([
    Product.countDocuments({ businessId }),
    Product.countDocuments({ businessId, status: 'active' }),
    Product.countDocuments({ businessId, status: 'inactive' }),
    Product.countDocuments({
      businessId,
      $expr: { $lte: ['$currentStock', '$minimumStock'] }
    }),
    Product.aggregate([
      { $match: { businessId, status: 'active' } },
      { $project: { value: { $multiply: ['$sellingPrice', '$currentStock'] } } },
      { $group: { _id: null, total: { $sum: '$value' } } },
    ]),
  ]);
  return { total, active, inactive, lowStock, totalValue: totalValue[0]?.total || 0 };
};

const updateBusinessUsage = async (businessId) => {
  const count = await Product.countDocuments({ businessId });
  await require('../models/Business').updateOne({ _id: businessId }, { $set: { 'usage.productsUsed': count } });
};

module.exports = { getAll, getById, create, update, delete: remove, bulkImport, bulkExport, bulkDelete, getStats };