// const mongoose = require('mongoose');

// const inventoryTransactionSchema = new mongoose.Schema(
//   {
//     productId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Product',
//       required: [true, 'Product ID is required'],
//     },
//     type: {
//       type: String,
//       enum: ['purchase', 'sale', 'return', 'damage', 'adjustment', 'transfer'],
//       required: [true, 'Transaction type is required'],
//     },
//     quantity: {
//       type: Number,
//       required: [true, 'Quantity is required'],
//     },
//     previousStock: {
//       type: Number,
//       required: true,
//     },
//     newStock: {
//       type: Number,
//       required: true,
//     },
//     referenceId: {
//       type: mongoose.Schema.Types.ObjectId,
//     },
//     referenceType: {
//       type: String,
//       enum: ['sale', 'purchase', 'adjustment', 'transfer', 'return'],
//     },
//     notes: { type: String, trim: true },
//     businessId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Business',
//       required: [true, 'Business ID is required'],
//       index: true,
//     },
//     branchId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Branch',
//     },
//     createdBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//     },
//   },
//   { timestamps: true }
// );

// inventoryTransactionSchema.index({ businessId: 1, productId: 1, createdAt: -1 });
// inventoryTransactionSchema.index({ businessId: 1, type: 1 });
// inventoryTransactionSchema.index({ referenceId: 1, referenceType: 1 });

// module.exports = mongoose.model('InventoryTransaction', inventoryTransactionSchema);
const mongoose = require('mongoose');

const inventoryTransactionSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required'],
    },
    type: {
      type: String,
      enum: ['purchase', 'sale', 'return', 'damage', 'adjustment', 'transfer', 'add', 'remove', 'set'],
      required: [true, 'Transaction type is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
    },
    previousStock: {
      type: Number,
      required: true,
    },
    newStock: {
      type: Number,
      required: true,
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    referenceType: {
      type: String,
      enum: ['sale', 'purchase', 'adjustment', 'transfer', 'return', 'add', 'remove', 'set'],
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

inventoryTransactionSchema.index({ businessId: 1, productId: 1, createdAt: -1 });
inventoryTransactionSchema.index({ businessId: 1, type: 1 });
inventoryTransactionSchema.index({ referenceId: 1, referenceType: 1 });

module.exports = mongoose.model('InventoryTransaction', inventoryTransactionSchema);