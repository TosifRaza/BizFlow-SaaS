const mongoose = require('mongoose');

const customerTransactionSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer ID is required'],
      index: true,
    },
    type: {
      type: String,
      enum: ['sale', 'payment', 'return', 'adjustment'],
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
      enum: ['sale', 'payment', 'return', 'adjustment'],
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

customerTransactionSchema.index({ businessId: 1, customerId: 1, createdAt: -1 });
customerTransactionSchema.index({ referenceId: 1 });

module.exports = mongoose.model('CustomerTransaction', customerTransactionSchema);
