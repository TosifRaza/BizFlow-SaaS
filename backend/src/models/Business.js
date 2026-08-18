const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },
    type: {
      type: String,
      enum: [
        'retail', 'wholesale', 'restaurant', 'service',
        'manufacturing', 'ecommerce', 'healthcare', 'education', 'other',
      ],
      default: 'retail',
    },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    pincode: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    logo: { type: String },
    gstNumber: { type: String, trim: true, uppercase: true },
    currency: {
      type: String,
      enum: ['INR', 'USD', 'EUR', 'GBP'],
      default: 'INR',
    },
    taxEnabled: { type: Boolean, default: false },
    taxRate: { type: Number, min: 0, max: 100, default: 0 },
    invoicePrefix: { type: String, default: 'INV', trim: true },
    invoiceFormat: {
      type: String,
      enum: ['INV-YYYYMMDD-XXX', 'INV-XXXX', 'INV-YYYY-XXX'],
      default: 'INV-YYYYMMDD-XXX',
    },
    subscriptionStatus: {
      type: String,
      enum: ['trial', 'active', 'expired', 'suspended'],
      default: 'trial',
    },
    trialStartDate: { type: Date },
    trialEndDate: { type: Date },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
    usage: {
      productsUsed: { type: Number, default: 0 },
      usersUsed: { type: Number, default: 0 },
      branchesUsed: { type: Number, default: 0 },
    },
    settings: {
      notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        lowStock: { type: Boolean, default: true },
        salesAlert: { type: Boolean, default: true },
        paymentReminder: { type: Boolean, default: true },
      },
      security: {
        twoFactorEnabled: { type: Boolean, default: false },
        sessionTimeout: { type: Number, default: 60 },
        passwordExpiry: { type: Number, default: 90 },
      },
    },
    notificationPreferences: {
      lowStock: { email: { type: Boolean, default: true }, inApp: { type: Boolean, default: true } },
      sales: { inApp: { type: Boolean, default: true } },
      payments: { email: { type: Boolean, default: true }, inApp: { type: Boolean, default: true } },
      expenses: { inApp: { type: Boolean, default: true } },
      subscription: { email: { type: Boolean, default: true }, inApp: { type: Boolean, default: true } },
      dailySummary: { email: { type: Boolean, default: false } },
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

businessSchema.index({ name: 1 });
businessSchema.index({ subscriptionStatus: 1 });
businessSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Business', businessSchema);
