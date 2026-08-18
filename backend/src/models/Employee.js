const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
    },
    name: {
      type: String,
      required: [true, 'Employee name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: { type: String, trim: true },
    role: {
      type: String,
      enum: ['manager', 'staff'],
      default: 'staff',
    },
    salary: {
      type: Number,
      min: 0,
      default: 0,
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    profilePhoto: { type: String },
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

employeeSchema.index({ businessId: 1, name: 1 });
employeeSchema.index({ businessId: 1, status: 1 });

module.exports = mongoose.model('Employee', employeeSchema);
