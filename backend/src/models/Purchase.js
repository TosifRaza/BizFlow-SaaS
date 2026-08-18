const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema(
  {
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: [true, 'Supplier ID is required'],
      index: true,
    },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        productName: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true, min: 0 },
        taxRate: { type: Number, default: 0, min: 0, max: 100 },
        taxAmount: { type: Number, default: 0 },
        total: { type: Number, required: true },
      },
    ],
    subtotal: { type: Number, required: true, min: 0 },
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

purchaseSchema.index({ businessId: 1, supplierId: 1, createdAt: -1 });
purchaseSchema.index({ businessId: 1, status: 1, createdAt: -1 });
purchaseSchema.index({ businessId: 1, createdAt: -1 });

module.exports = mongoose.model('Purchase', purchaseSchema);
