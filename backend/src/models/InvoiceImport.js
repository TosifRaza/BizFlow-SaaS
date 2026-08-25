// const mongoose = require('mongoose');

// const invoiceImportSchema = new mongoose.Schema(
//   {
//     businessId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Business',
//       required: true,
//       index: true,
//     },
//     branchId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Branch',
//     },
//     originalFilename: {
//       type: String,
//       required: true,
//     },
//     fileUrl: {
//       type: String,
//       required: true,
//     },
//     mimeType: {
//       type: String,
//       required: true,
//     },
//     fileSize: {
//       type: Number,
//     },

//     supplierId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Supplier',
//     },
//     invoiceNumber: {
//       type: String,
//     },

//     status: {
//       type: String,
//       enum: ['uploaded', 'processing', 'review', 'confirmed', 'completed', 'failed'],
//       default: 'uploaded',
//     },

//     extractionResult: {
//       invoice: {
//         invoiceNumber: String,
//         invoiceDate: String,
//         supplierName: String,
//         supplierGSTIN: String,
//         supplierPhone: String,
//         supplierEmail: String,
//         billingAddress: String,
//         shippingAddress: String,
//         subtotal: Number,
//         discount: Number,
//         cgst: Number,
//         sgst: Number,
//         igst: Number,
//         otherCharges: Number,
//         roundOff: Number,
//         grandTotal: Number,
//       },
//       items: [
//         {
//           productName: String,
//           sku: String,
//           barcode: String,
//           hsnCode: String,
//           quantity: Number,
//           unit: String,
//           purchasePrice: Number,
//           discount: Number,
//           taxRate: Number,
//           taxAmount: Number,
//           lineTotal: Number,
//           confidence: {
//             productName: Number,
//             sku: Number,
//             quantity: Number,
//             purchasePrice: Number,
//             taxRate: Number,
//           },
//         },
//       ],
//     },

//     reviewData: {
//       supplierId: mongoose.Schema.Types.ObjectId,
//       supplierAction: { type: String, enum: ['existing', 'new', 'select'] },
//       items: [
//         {
//           productId: mongoose.Schema.Types.ObjectId,
//           matchAction: { type: String, enum: ['existing', 'new'] },
//           productName: String,
//           sku: String,
//           barcode: String,
//           hsnCode: String,
//           categoryId: mongoose.Schema.Types.ObjectId,
//           brand: String,
//           quantity: Number,
//           unit: String,
//           purchasePrice: Number,
//           sellingPrice: Number,
//           discount: Number,
//           taxRate: Number,
//           taxAmount: Number,
//           lineTotal: Number,
//           supplierId: mongoose.Schema.Types.ObjectId,
//           minimumStock: Number,
//           usePurchaseAsSelling: { type: Boolean, default: false },
//         },
//       ],
//       invoiceNumber: String,
//       invoiceDate: String,
//       notes: String,
//       paymentMethod: String,
//     },

//     importedPurchaseId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Purchase',
//     },

//     summary: {
//       productsCreated: { type: Number, default: 0 },
//       productsMatched: { type: Number, default: 0 },
//       purchaseTotal: { type: Number, default: 0 },
//       inventoryUpdated: { type: Number, default: 0 },
//     },

//     errorMessage: {
//       type: String,
//     },

//     createdBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//     },
//   },
//   { timestamps: true }
// );

// invoiceImportSchema.index({ businessId, status, createdAt: -1 });
// invoiceImportSchema.index({ businessId, invoiceNumber });

// module.exports = mongoose.model('InvoiceImport', invoiceImportSchema);
const mongoose = require('mongoose');

const invoiceImportSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      index: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
    },
    originalFilename: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
    },

    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
    },
    invoiceNumber: {
      type: String,
    },

    status: {
      type: String,
      enum: ['uploaded', 'processing', 'review', 'confirmed', 'completed', 'failed'],
      default: 'uploaded',
    },

    extractionResult: {
      invoice: {
        invoiceNumber: String,
        invoiceDate: String,
        supplierName: String,
        supplierGSTIN: String,
        supplierPhone: String,
        supplierEmail: String,
        billingAddress: String,
        shippingAddress: String,
        subtotal: Number,
        discount: Number,
        cgst: Number,
        sgst: Number,
        igst: Number,
        otherCharges: Number,
        roundOff: Number,
        grandTotal: Number,
      },
      items: [
        {
          productName: String,
          sku: String,
          barcode: String,
          hsnCode: String,
          quantity: Number,
          unit: String,
          purchasePrice: Number,
          discount: Number,
          taxRate: Number,
          taxAmount: Number,
          lineTotal: Number,
          confidence: {
            productName: Number,
            sku: Number,
            quantity: Number,
            purchasePrice: Number,
            taxRate: Number,
          },
        },
      ],
    },

    reviewData: {
      supplierId: mongoose.Schema.Types.ObjectId,
      supplierAction: { type: String, enum: ['existing', 'new', 'select'] },
      items: [
        {
          productId: mongoose.Schema.Types.ObjectId,
          matchAction: { type: String, enum: ['existing', 'new'] },
          productName: String,
          sku: String,
          barcode: String,
          hsnCode: String,
          categoryId: mongoose.Schema.Types.ObjectId,
          brand: String,
          quantity: Number,
          unit: String,
          purchasePrice: Number,
          sellingPrice: Number,
          discount: Number,
          taxRate: Number,
          taxAmount: Number,
          lineTotal: Number,
          supplierId: mongoose.Schema.Types.ObjectId,
          minimumStock: Number,
          usePurchaseAsSelling: { type: Boolean, default: false },
        },
      ],
      invoiceNumber: String,
      invoiceDate: String,
      notes: String,
      paymentMethod: String,
    },

    importedPurchaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Purchase',
    },

    summary: {
      productsCreated: { type: Number, default: 0 },
      productsMatched: { type: Number, default: 0 },
      purchaseTotal: { type: Number, default: 0 },
      inventoryUpdated: { type: Number, default: 0 },
    },

    errorMessage: {
      type: String,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

invoiceImportSchema.index({ businessId: 1, status: 1, createdAt: -1 });
invoiceImportSchema.index({ businessId: 1, invoiceNumber: 1 });

module.exports = mongoose.model('InvoiceImport', invoiceImportSchema);
