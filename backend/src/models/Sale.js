const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: [true, 'Invoice number is required'],
      trim: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      index: true,
    },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        productName: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true, min: 0 },
        discount: { type: Number, default: 0, min: 0 },
        taxRate: { type: Number, default: 0, min: 0, max: 100 },
        taxAmount: { type: Number, default: 0 },
        total: { type: Number, required: true },
      },
    ],
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    taxAmount: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    amountPaid: { type: Number, default: 0, min: 0 },
    amountDue: { type: Number, default: 0, min: 0 },
    paymentMethod: {
      type: String,
      enum: ['cash', 'upi', 'card', 'credit', 'bank_transfer', 'other'],
      default: 'cash',
    },
    status: {
      type: String,
      enum: ['completed', 'partial', 'credit', 'voided'],
      default: 'completed',
    },
    notes: { type: String, trim: true },
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business ID is required'],
      index: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

saleSchema.index({ businessId: 1, invoiceNumber: 1 }, { unique: true });
saleSchema.index({ businessId: 1, customerId: 1, createdAt: -1 });
saleSchema.index({ businessId: 1, status: 1, createdAt: -1 });
saleSchema.index({ businessId: 1, createdAt: -1 });

module.exports = mongoose.model('Sale', saleSchema);
