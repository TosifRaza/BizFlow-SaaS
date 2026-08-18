const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Role name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    description: { type: String, trim: true, maxlength: 500 },
    permissions: {
      type: [String],
      default: [],
      validate: {
        validator: function (v) {
          return Array.isArray(v);
        },
        message: 'Permissions must be an array of strings',
      },
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business ID is required'],
      index: true,
    },
  },
  { timestamps: true }
);

roleSchema.index({ businessId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Role', roleSchema);
