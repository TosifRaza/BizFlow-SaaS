const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ['rent', 'electricity', 'salary', 'transport', 'internet', 'maintenance', 'marketing', 'packaging', 'other'],
      required: [true, 'Expense category is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'upi', 'card', 'bank_transfer', 'other'],
      default: 'cash',
    },
    description: { type: String, trim: true },
    attachment: { type: String },
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

expenseSchema.index({ businessId: 1, category: 1, createdAt: -1 });
expenseSchema.index({ businessId: 1, date: -1 });
expenseSchema.index({ businessId: 1, createdBy: 1, createdAt: -1 });

module.exports = mongoose.model('Expense', expenseSchema);
