const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business ID is required'],
      unique: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
      required: [true, 'Plan ID is required'],
    },
    status: {
      type: String,
      enum: ['trial', 'active', 'expired', 'cancelled'],
      default: 'trial',
    },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    trialStartDate: { type: Date },
    trialEndDate: { type: Date },
    paymentMethod: {
      type: String,
      enum: ['cash', 'upi', 'card', 'bank_transfer', 'other'],
    },
  },
  { timestamps: true }
);

subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ businessId: 1, status: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);
