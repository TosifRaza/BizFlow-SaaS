const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    address: { type: String, trim: true },
    gstNumber: { type: String, trim: true, uppercase: true },
    openingBalance: {
      type: Number,
      default: 0,
    },
    creditLimit: {
      type: Number,
      min: 0,
      default: 0,
    },
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

customerSchema.index({ businessId: 1, name: 1 });
customerSchema.index({ businessId: 1, phone: 1 });
customerSchema.index({ businessId: 1, email: 1 }, { sparse: true });

customerSchema.methods.toJSON = function () {
  const obj = this.toObject();
  return obj;
};

module.exports = mongoose.model('Customer', customerSchema);
