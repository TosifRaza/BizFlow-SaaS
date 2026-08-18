const mongoose = require('mongoose');

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Plan name is required'],
      trim: true,
      unique: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    interval: {
      type: String,
      enum: ['monthly', 'yearly'],
      default: 'monthly',
    },
    limits: {
      products: { type: Number, default: 50 },
      users: { type: Number, default: 3 },
      branches: { type: Number, default: 1 },
      features: [{ type: String }],
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

planSchema.index({ price: 1 });

module.exports = mongoose.model('Plan', planSchema);
