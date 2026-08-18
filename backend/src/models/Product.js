const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },
    sku: {
      type: String,
      trim: true,
      uppercase: true,
    },
    barcode: { type: String, trim: true },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    brand: { type: String, trim: true },
    description: { type: String, trim: true, maxlength: 1000 },
    image: { type: String },
    purchasePrice: {
      type: Number,
      min: [0, 'Purchase price cannot be negative'],
      default: 0,
    },
    sellingPrice: {
      type: Number,
      min: [0, 'Selling price cannot be negative'],
      required: [true, 'Selling price is required'],
    },
    discount: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    taxRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    unit: {
      type: String,
      enum: ['pcs', 'kg', 'ltr', 'm', 'box'],
      default: 'pcs',
    },
    currentStock: {
      type: Number,
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    minimumStock: {
      type: Number,
      min: 0,
      default: 10,
    },
    maximumStock: {
      type: Number,
      min: 0,
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business ID is required'],
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

productSchema.index({ businessId: 1, name: 1 });
productSchema.index({ businessId: 1, sku: 1 }, { unique: true, sparse: true });
productSchema.index({ businessId: 1, categoryId: 1 });
productSchema.index({ businessId: 1, status: 1 });
productSchema.index({ businessId: 1, currentStock: 1 });

module.exports = mongoose.model('Product', productSchema);
