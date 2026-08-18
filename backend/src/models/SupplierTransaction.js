const mongoose = require('mongoose');

const supplierTransactionSchema = new mongoose.Schema(
  {
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: [true, 'Supplier ID is required'],
      index: true,
    },
    type: {
      type: String,
      enum: ['purchase', 'payment', 'return', 'adjustment'],
      required: [true, 'Transaction type is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
    },
    debit: {
      type: Number,
      default: 0,
    },
    credit: {
      type: Number,
      default: 0,
    },
    balance: {
      type: Number,
      required: true,
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    referenceType: {
      type: String,
      enum: ['purchase', 'payment', 'return', 'adjustment'],
    },
    notes: { type: String, trim: true },
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

supplierTransactionSchema.index({ businessId: 1, supplierId: 1, createdAt: -1 });
supplierTransactionSchema.index({ referenceId: 1 });

module.exports = mongoose.model('SupplierTransaction', supplierTransactionSchema);
