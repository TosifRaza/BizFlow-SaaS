const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business ID is required'],
      index: true,
    },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: 0,
    },
    currency: {
      type: String,
      enum: ['INR', 'USD', 'EUR', 'GBP'],
      default: 'INR',
    },
    paymentProvider: {
      type: String,
      enum: ['razorpay', 'stripe', 'manual'],
    },
    paymentId: { type: String },
    orderId: { type: String },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

paymentSchema.index({ businessId: 1, createdAt: -1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ paymentId: 1 }, { sparse: true });

module.exports = mongoose.model('Payment', paymentSchema);
