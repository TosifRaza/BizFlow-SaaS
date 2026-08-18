const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Supplier name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },
    company: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    address: { type: String, trim: true },
    gstNumber: { type: String, trim: true, uppercase: true },
    balance: {
      type: Number,
      default: 0,
    },
    notes: { type: String, trim: true },
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

supplierSchema.index({ businessId: 1, name: 1 });
supplierSchema.index({ businessId: 1, phone: 1 });

module.exports = mongoose.model('Supplier', supplierSchema);
