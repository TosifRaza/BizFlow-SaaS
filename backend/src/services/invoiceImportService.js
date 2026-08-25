// // const mongoose = require('mongoose');
// // const path = require('path');
// // const fs = require('fs');
// // const InvoiceImport = require('../models/InvoiceImport');
// // const Product = require('../models/Product');
// // const Supplier = require('../models/Supplier');
// // const Category = require('../models/Category');
// // const Purchase = require('../models/Purchase');
// // const { extractInvoice, ExtractionError } = require('./invoiceExtractionService');
// // const purchaseService = require('./purchaseService');
// // const productService = require('./productService');
// // const auditService = require('./auditService');
// // const config = require('../config');

// // class ImportError extends Error {
// //   constructor(message, statusCode) { super(message); this.statusCode = statusCode; }
// // }

// // // ─── Upload + Extract ─────────────────────────────────────────
// // const uploadAndExtract = async (businessId, file, userId) => {
// //   if (!file) throw new ImportError('No file uploaded', 400);

// //   const importRecord = await InvoiceImport.create({
// //     businessId,
// //     originalFilename: file.originalname,
// //     fileUrl: file.path,
// //     mimeType: file.mimetype,
// //     fileSize: file.size,
// //     status: 'processing',
// //     createdBy: userId,
// //   });

// //   try {
// //     const extraction = await extractInvoice(file.path);
// //     importRecord.extractionResult = extraction;
// //     importRecord.status = 'review';
// //     importRecord.invoiceNumber = extraction.invoice?.invoiceNumber || null;
// //     await importRecord.save();

// //     const matchResults = await performMatching(businessId, extraction);
// //     return { importId: importRecord._id, extraction, matches: matchResults };
// //   } catch (error) {
// //     importRecord.status = 'failed';
// //     importRecord.errorMessage = error.message;
// //     await importRecord.save();
// //     throw error;
// //   }
// // };

// // // ─── Matching Logic ───────────────────────────────────────────
// // const normalizeStr = (s) => (s || '').toString().toLowerCase().replace(/[^a-z0-9]/g, '');

// // const performMatching = async (businessId, extraction) => {
// //   const { supplierMatches, newSupplierSuggestion } = await matchSupplier(businessId, extraction.invoice);
// //   const productMatches = await matchProducts(businessId, extraction.items);
// //   const categories = await Category.find({ businessId, status: 'active' }).select('_id name').lean();

// //   return { supplierMatches, newSupplierSuggestion, productMatches, categories };
// // };

// // const matchSupplier = async (businessId, invoiceInfo) => {
// //   if (!invoiceInfo?.supplierName) return { supplierMatches: [], newSupplierSuggestion: invoiceInfo?.supplierName || null };

// //   const query = { businessId, status: 'active' };
// //   const suppliers = await Supplier.find(query).select('_id name company phone email gstNumber').lean();
// //   const matches = [];
// //   const normalized = normalizeStr(invoiceInfo.supplierName);

// //   for (const supplier of suppliers) {
// //     let score = 0;
// //     let matchFields = [];

// //     // Name matching
// //     if (normalizeStr(supplier.name) === normalized || normalizeStr(supplier.company || '') === normalized) {
// //       score += 50;
// //       matchFields.push('name');
// //     } else if (normalizeStr(supplier.name).includes(normalized) || normalized.includes(normalizeStr(supplier.name))) {
// //       score += 30;
// //       matchFields.push('name');
// //     }

// //     // GSTIN matching (strong signal)
// //     if (invoiceInfo.supplierGSTIN && supplier.gstNumber) {
// //       if (normalizeStr(invoiceInfo.supplierGSTIN) === normalizeStr(supplier.gstNumber)) {
// //         score += 40;
// //         matchFields.push('gstin');
// //       }
// //     }

// //     // Phone matching
// //     if (invoiceInfo.supplierPhone && supplier.phone) {
// //       const invPhone = invoiceInfo.supplierPhone.replace(/[^0-9]/g, '');
// //       const supPhone = supplier.phone.replace(/[^0-9]/g, '');
// //       if (invPhone.length >= 10 && supPhone.length >= 10 && (invPhone.endsWith(supPhone) || supPhone.endsWith(invPhone))) {
// //         score += 20;
// //         matchFields.push('phone');
// //       }
// //     }

// //     if (score > 0) {
// //       matches.push({ supplier, score, matchFields });
// //     }
// //   }

// //   matches.sort((a, b) => b.score - a.score);
// //   const bestMatch = matches.length > 0 && matches[0].score >= 40 ? matches[0] : null;

// //   return {
// //     supplierMatches: matches.slice(0, 5),
// //     matchedSupplier: bestMatch ? bestMatch.supplier : null,
// //     newSupplierSuggestion: bestMatch ? null : invoiceInfo.supplierName,
// //   };
// // };

// // const matchProducts = async (businessId, items) => {
// //   const products = await Product.find({ businessId, status: 'active' }).select('_id name sku barcode categoryId purchasePrice currentStock supplierId hsnCode').lean();
// //   const results = [];

// //   for (const item of items) {
// //     let bestMatch = null;
// //     let bestScore = 0;
// //     let matchMethod = null;

// //     const itemSku = normalizeStr(item.sku);
// //     const itemBarcode = (item.barcode || '').trim();
// //     const itemHsn = (item.hsnCode || '').trim();
// //     const itemName = normalizeStr(item.productName);

// //     for (const product of products) {
// //       // Exact SKU match (strongest)
// //       if (itemSku && product.sku && normalizeStr(product.sku) === itemSku) {
// //         bestMatch = product;
// //         bestScore = 95;
// //         matchMethod = 'sku';
// //         break;
// //       }

// //       // Exact barcode match
// //       if (itemBarcode && product.barcode && product.barcode.trim() === itemBarcode) {
// //         bestMatch = product;
// //         bestScore = 95;
// //         matchMethod = 'barcode';
// //         break;
// //       }

// //       // HSN code match
// //       if (itemHsn && product.hsnCode && product.hsnCode.trim() === itemHsn && itemName === normalizeStr(product.name)) {
// //         bestMatch = product;
// //         bestScore = 80;
// //         matchMethod = 'hsn';
// //         break;
// //       }

// //       // Normalized name match
// //       if (itemName && normalizeStr(product.name) === itemName) {
// //         if (bestScore < 75) {
// //           bestMatch = product;
// //           bestScore = 75;
// //           matchMethod = 'name_exact';
// //         }
// //       }
// //       // Fuzzy name match (one contains the other)
// //       else if (itemName && (normalizeStr(product.name).includes(itemName) || itemName.includes(normalizeStr(product.name)))) {
// //         if (bestScore < 50) {
// //           bestMatch = product;
// //           bestScore = 50;
// //           matchMethod = 'name_fuzzy';
// //         }
// //       }
// //     }

// //     results.push({
// //       extractedItem: item,
// //       matchedProduct: bestMatch,
// //       matchScore: bestScore,
// //       matchMethod,
// //       isNew: !bestMatch || bestScore < 40,
// //     });
// //   }

// //   return results;
// // };

// // // ─── Get Import Record ─────────────────────────────────────────
// // const getById = async (id, businessId) => {
// //   const imp = await InvoiceImport.findOne({ _id: id, businessId }).lean();
// //   if (!imp) throw new ImportError('Invoice import not found', 404);
// //   return imp;
// // };

// // // ─── Confirm Import ────────────────────────────────────────────
// // const confirmImport = async (id, businessId, reviewData, userId) => {
// //   const imp = await InvoiceImport.findOne({ _id: id, businessId });
// //   if (!imp) throw new ImportError('Invoice import not found', 404);
// //   if (imp.status === 'completed') throw new ImportError('This invoice has already been imported', 400);
// //   if (imp.status === 'failed') throw new ImportError('Cannot confirm a failed import', 400);

// //   // Duplicate invoice check
// //   if (reviewData.invoiceNumber && reviewData.supplierId) {
// //     const existingPurchase = await Purchase.findOne({
// //       businessId,
// //       supplierId: reviewData.supplierId,
// //       notes: { $regex: reviewData.invoiceNumber, $options: 'i' },
// //     });
// //     if (existingPurchase) {
// //       throw new ImportError(
// //         `Possible duplicate invoice. Invoice "${reviewData.invoiceNumber}" from this supplier has already been imported as Purchase #${existingPurchase._id}.`,
// //         409
// //       );
// //     }
// //   }

// //   imp.status = 'confirmed';
// //   imp.reviewData = reviewData;
// //   await imp.save();

// //   const session = await mongoose.startSession();
// //   session.startTransaction();
// //   try {
// //     let productsCreated = 0;
// //     let productsMatched = 0;
// //     const purchaseItems = [];

// //     for (const item of reviewData.items) {
// //       let productId = item.productId;

// //       // Create new product if needed
// //       if (!productId && item.matchAction === 'new') {
// //         if (!item.categoryId) throw new ImportError(`Category is required for new product: ${item.productName}`, 400);
// //         if (!item.sellingPrice && !item.usePurchaseAsSelling) throw new ImportError(`Selling price is required for new product: ${item.productName}`, 400);

// //         const newProduct = await Product.create([{
// //           name: item.productName,
// //           sku: item.sku || '',
// //           barcode: item.barcode || '',
// //           categoryId: item.categoryId,
// //           brand: item.brand || '',
// //           purchasePrice: item.purchasePrice || 0,
// //           sellingPrice: item.usePurchaseAsSelling ? (item.purchasePrice || 0) : (item.sellingPrice || 0),
// //           taxRate: item.taxRate || 0,
// //           unit: item.unit || 'pcs',
// //           minimumStock: item.minimumStock || 10,
// //           supplierId: item.supplierId || reviewData.supplierId || null,
// //           status: 'active',
// //           businessId,
// //           createdBy: userId,
// //         }], { session });
// //         productId = newProduct[0]._id;
// //         productsCreated++;
// //       } else if (productId) {
// //         productsMatched++;
// //       }

// //       if (!productId) throw new ImportError(`No product resolved for item: ${item.productName}`, 400);

// //       const unitPrice = item.purchasePrice || 0;
// //       const taxRate = item.taxRate || 0;
// //       const lineTotalBeforeTax = unitPrice * (item.quantity || 0);
// //       const taxAmount = lineTotalBeforeTax * (taxRate / 100);
// //       const lineTotal = lineTotalBeforeTax + taxAmount;

// //       purchaseItems.push({
// //         productId,
// //         quantity: item.quantity || 0,
// //         unitPrice,
// //         taxRate,
// //       });
// //     }

// //     if (purchaseItems.length === 0) throw new ImportError('No valid items to import', 400);

// //     // Create purchase using existing purchaseService
// //     const purchase = await purchaseService.create(
// //       businessId,
// //       {
// //         supplierId: reviewData.supplierId,
// //         items: purchaseItems,
// //         paymentMethod: reviewData.paymentMethod || 'credit',
// //         notes: reviewData.invoiceNumber ? `Invoice: ${reviewData.invoiceNumber}` : (reviewData.notes || 'Imported via Scan & Stock'),
// //         branchId: reviewData.branchId || null,
// //       },
// //       userId
// //     );

// //     imp.status = 'completed';
// //     imp.importedPurchaseId = purchase._id;
// //     imp.supplierId = reviewData.supplierId;
// //     imp.summary = {
// //       productsCreated,
// //       productsMatched,
// //       purchaseTotal: purchase.total,
// //       inventoryUpdated: purchaseItems.length,
// //     };
// //     await imp.save({ session });

// //     // Audit log
// //     await auditService.createLog({
// //       userId,
// //       businessId,
// //       action: 'invoice_import',
// //       resource: 'invoice_import',
// //       resourceId: imp._id,
// //       metadata: {
// //         invoiceNumber: reviewData.invoiceNumber,
// //         supplierId: reviewData.supplierId,
// //         purchaseId: purchase._id,
// //         productsCreated,
// //         productsMatched,
// //         totalItems: purchaseItems.length,
// //         totalAmount: purchase.total,
// //         originalFilename: imp.originalFilename,
// //       },
// //       ipAddress: null,
// //       userAgent: null,
// //     });

// //     await session.commitTransaction();
// //     session.endSession();

// //     return {
// //       purchase,
// //       summary: imp.summary,
// //       importId: imp._id,
// //     };
// //   } catch (error) {
// //     await session.abortTransaction();
// //     session.endSession();
// //     imp.status = 'failed';
// //     imp.errorMessage = error.message;
// //     await imp.save();
// //     throw error;
// //   }
// // };

// // // ─── Delete Import ─────────────────────────────────────────────
// // const remove = async (id, businessId) => {
// //   const imp = await InvoiceImport.findOneAndDelete({ _id: id, businessId, status: { $in: ['uploaded', 'processing', 'review', 'failed'] } });
// //   if (!imp) throw new ImportError('Invoice import not found or cannot be deleted', 404);

// //   if (imp.fileUrl && fs.existsSync(imp.fileUrl)) {
// //     try { fs.unlinkSync(imp.fileUrl); } catch (e) { /* ignore */ }
// //   }

// //   return { message: 'Import deleted' };
// // };

// // module.exports = { uploadAndExtract, getById, confirmImport, remove, performMatching };
// const mongoose = require('mongoose');
// const path = require('path');
// const fs = require('fs');
// const InvoiceImport = require('../models/InvoiceImport');
// const Product = require('../models/Product');
// const Supplier = require('../models/Supplier');
// const Category = require('../models/Category');
// const Purchase = require('../models/Purchase');
// const { extractInvoice, ExtractionError } = require('./invoiceExtractionService');
// const purchaseService = require('./purchaseService');
// const productService = require('./productService');
// const auditService = require('./auditService');
// const config = require('../config');

// class ImportError extends Error {
//   constructor(message, statusCode) { super(message); this.statusCode = statusCode; }
// }

// // ─── Upload + Extract ─────────────────────────────────────────
// const uploadAndExtract = async (businessId, file, userId) => {
//   if (!file) throw new ImportError('No file uploaded', 400);

//   const importRecord = await InvoiceImport.create({
//     businessId,
//     originalFilename: file.originalname,
//     fileUrl: file.path,
//     mimeType: file.mimetype,
//     fileSize: file.size,
//     status: 'processing',
//     createdBy: userId,
//   });

//   try {
//     const extraction = await extractInvoice(file.path);
//     importRecord.extractionResult = extraction;
//     importRecord.status = 'review';
//     importRecord.invoiceNumber = extraction.invoice?.invoiceNumber || null;
//     await importRecord.save();

//     const matchResults = await performMatching(businessId, extraction);
//     return { importId: importRecord._id, extraction, matches: matchResults };
//   } catch (error) {
//     importRecord.status = 'failed';
//     importRecord.errorMessage = error.message;
//     await importRecord.save();
//     throw error;
//   }
// };

// // ─── Matching Logic ───────────────────────────────────────────
// const normalizeStr = (s) => (s || '').toString().toLowerCase().replace(/[^a-z0-9]/g, '');

// const performMatching = async (businessId, extraction) => {
//   const { supplierMatches, newSupplierSuggestion } = await matchSupplier(businessId, extraction.invoice);
//   const productMatches = await matchProducts(businessId, extraction.items);
//   const categories = await Category.find({ businessId, status: 'active' }).select('_id name').lean();

//   return { supplierMatches, newSupplierSuggestion, productMatches, categories };
// };

// const matchSupplier = async (businessId, invoiceInfo) => {
//   if (!invoiceInfo?.supplierName) return { supplierMatches: [], newSupplierSuggestion: invoiceInfo?.supplierName || null };

//   const query = { businessId, status: 'active' };
//   const suppliers = await Supplier.find(query).select('_id name company phone email gstNumber').lean();
//   const matches = [];
//   const normalized = normalizeStr(invoiceInfo.supplierName);

//   for (const supplier of suppliers) {
//     let score = 0;
//     let matchFields = [];

//     // Name matching
//     if (normalizeStr(supplier.name) === normalized || normalizeStr(supplier.company || '') === normalized) {
//       score += 50;
//       matchFields.push('name');
//     } else if (normalizeStr(supplier.name).includes(normalized) || normalized.includes(normalizeStr(supplier.name))) {
//       score += 30;
//       matchFields.push('name');
//     }

//     // GSTIN matching (strong signal)
//     if (invoiceInfo.supplierGSTIN && supplier.gstNumber) {
//       if (normalizeStr(invoiceInfo.supplierGSTIN) === normalizeStr(supplier.gstNumber)) {
//         score += 40;
//         matchFields.push('gstin');
//       }
//     }

//     // Phone matching
//     if (invoiceInfo.supplierPhone && supplier.phone) {
//       const invPhone = invoiceInfo.supplierPhone.replace(/[^0-9]/g, '');
//       const supPhone = supplier.phone.replace(/[^0-9]/g, '');
//       if (invPhone.length >= 10 && supPhone.length >= 10 && (invPhone.endsWith(supPhone) || supPhone.endsWith(invPhone))) {
//         score += 20;
//         matchFields.push('phone');
//       }
//     }

//     if (score > 0) {
//       matches.push({ supplier, score, matchFields });
//     }
//   }

//   matches.sort((a, b) => b.score - a.score);
//   const bestMatch = matches.length > 0 && matches[0].score >= 40 ? matches[0] : null;

//   return {
//     supplierMatches: matches.slice(0, 5),
//     matchedSupplier: bestMatch ? bestMatch.supplier : null,
//     newSupplierSuggestion: bestMatch ? null : invoiceInfo.supplierName,
//   };
// };

// const matchProducts = async (businessId, items) => {
//   const products = await Product.find({ businessId, status: 'active' }).select('_id name sku barcode categoryId purchasePrice currentStock supplierId hsnCode').lean();
//   const results = [];

//   for (const item of items) {
//     let bestMatch = null;
//     let bestScore = 0;
//     let matchMethod = null;

//     const itemSku = normalizeStr(item.sku);
//     const itemBarcode = (item.barcode || '').trim();
//     const itemHsn = (item.hsnCode || '').trim();
//     const itemName = normalizeStr(item.productName);

//     for (const product of products) {
//       // Exact SKU match (strongest)
//       if (itemSku && product.sku && normalizeStr(product.sku) === itemSku) {
//         bestMatch = product;
//         bestScore = 95;
//         matchMethod = 'sku';
//         break;
//       }

//       // Exact barcode match
//       if (itemBarcode && product.barcode && product.barcode.trim() === itemBarcode) {
//         bestMatch = product;
//         bestScore = 95;
//         matchMethod = 'barcode';
//         break;
//       }

//       // HSN code match
//       if (itemHsn && product.hsnCode && product.hsnCode.trim() === itemHsn && itemName === normalizeStr(product.name)) {
//         bestMatch = product;
//         bestScore = 80;
//         matchMethod = 'hsn';
//         break;
//       }

//       // Normalized name match
//       if (itemName && normalizeStr(product.name) === itemName) {
//         if (bestScore < 75) {
//           bestMatch = product;
//           bestScore = 75;
//           matchMethod = 'name_exact';
//         }
//       }
//       // Fuzzy name match (one contains the other)
//       else if (itemName && (normalizeStr(product.name).includes(itemName) || itemName.includes(normalizeStr(product.name)))) {
//         if (bestScore < 50) {
//           bestMatch = product;
//           bestScore = 50;
//           matchMethod = 'name_fuzzy';
//         }
//       }
//     }

//     results.push({
//       extractedItem: item,
//       matchedProduct: bestMatch,
//       matchScore: bestScore,
//       matchMethod,
//       isNew: !bestMatch || bestScore < 40,
//     });
//   }

//   return results;
// };

// // ─── Get Import Record ─────────────────────────────────────────
// const getById = async (id, businessId) => {
//   const imp = await InvoiceImport.findOne({ _id: id, businessId }).lean();
//   if (!imp) throw new ImportError('Invoice import not found', 404);
//   return imp;
// };

// // ─── Confirm Import ────────────────────────────────────────────
// const confirmImport = async (id, businessId, reviewData, userId) => {
//   const imp = await InvoiceImport.findOne({ _id: id, businessId });
//   if (!imp) throw new ImportError('Invoice import not found', 404);
//   if (imp.status === 'completed') throw new ImportError('This invoice has already been imported', 400);
//   if (imp.status === 'failed') throw new ImportError('Cannot confirm a failed import', 400);

//   // Duplicate invoice check
//   if (reviewData.invoiceNumber && reviewData.supplierId) {
//     const existingPurchase = await Purchase.findOne({
//       businessId,
//       supplierId: reviewData.supplierId,
//       notes: { $regex: reviewData.invoiceNumber, $options: 'i' },
//     });
//     if (existingPurchase) {
//       throw new ImportError(
//         `Possible duplicate invoice. Invoice "${reviewData.invoiceNumber}" from this supplier has already been imported as Purchase #${existingPurchase._id}.`,
//         409
//       );
//     }
//   }

//   imp.status = 'confirmed';
//   imp.reviewData = reviewData;
//   await imp.save();

//   const session = await mongoose.startSession();
//   session.startTransaction();
//   try {
//     let productsCreated = 0;
//     let productsMatched = 0;
//     const purchaseItems = [];

//     for (const item of reviewData.items) {
//       let productId = item.productId;

//       // Create new product if needed
//       if (!productId && item.matchAction === 'new') {
//         if (!item.categoryId) throw new ImportError(`Category is required for new product: ${item.productName}`, 400);
//         if (!item.sellingPrice && !item.usePurchaseAsSelling) throw new ImportError(`Selling price is required for new product: ${item.productName}`, 400);

//         const newProduct = await Product.create([{
//           name: item.productName,
//           sku: item.sku || '',
//           barcode: item.barcode || '',
//           categoryId: item.categoryId,
//           brand: item.brand || '',
//           purchasePrice: item.purchasePrice || 0,
//           sellingPrice: item.usePurchaseAsSelling ? (item.purchasePrice || 0) : (item.sellingPrice || 0),
//           taxRate: item.taxRate || 0,
//           unit: item.unit || 'pcs',
//           minimumStock: item.minimumStock || 10,
//           supplierId: item.supplierId || reviewData.supplierId || null,
//           status: 'active',
//           businessId,
//           createdBy: userId,
//         }], { session });
//         productId = newProduct[0]._id;
//         productsCreated++;
//       } else if (productId) {
//         productsMatched++;
//       }

//       if (!productId) throw new ImportError(`No product resolved for item: ${item.productName}`, 400);

//       const unitPrice = item.purchasePrice || 0;
//       const taxRate = item.taxRate || 0;
//       const lineTotalBeforeTax = unitPrice * (item.quantity || 0);
//       const taxAmount = lineTotalBeforeTax * (taxRate / 100);
//       const lineTotal = lineTotalBeforeTax + taxAmount;

//       purchaseItems.push({
//         productId,
//         quantity: item.quantity || 0,
//         unitPrice,
//         taxRate,
//       });
//     }

//     if (purchaseItems.length === 0) throw new ImportError('No valid items to import', 400);

//     // Create purchase using existing purchaseService
//     const purchase = await purchaseService.create(
//       businessId,
//       {
//         supplierId: reviewData.supplierId,
//         items: purchaseItems,
//         paymentMethod: reviewData.paymentMethod || 'credit',
//         notes: reviewData.invoiceNumber ? `Invoice: ${reviewData.invoiceNumber}` : (reviewData.notes || 'Imported via Scan & Stock'),
//         branchId: reviewData.branchId || null,
//       },
//       userId
//     );

//     imp.status = 'completed';
//     imp.importedPurchaseId = purchase._id;
//     imp.supplierId = reviewData.supplierId;
//     imp.summary = {
//       productsCreated,
//       productsMatched,
//       purchaseTotal: purchase.total,
//       inventoryUpdated: purchaseItems.length,
//     };
//     await imp.save({ session });

//     // Audit log
//     await auditService.createLog({
//       userId,
//       businessId,
//       action: 'invoice_import',
//       resource: 'invoice_import',
//       resourceId: imp._id,
//       metadata: {
//         invoiceNumber: reviewData.invoiceNumber,
//         supplierId: reviewData.supplierId,
//         purchaseId: purchase._id,
//         productsCreated,
//         productsMatched,
//         totalItems: purchaseItems.length,
//         totalAmount: purchase.total,
//         originalFilename: imp.originalFilename,
//       },
//       ipAddress: null,
//       userAgent: null,
//     });

//     await session.commitTransaction();
//     session.endSession();

//     return {
//       purchase,
//       summary: imp.summary,
//       importId: imp._id,
//     };
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     imp.status = 'failed';
//     imp.errorMessage = error.message;
//     await imp.save();
//     throw error;
//   }
// };

// // ─── Delete Import ─────────────────────────────────────────────
// const remove = async (id, businessId) => {
//   const imp = await InvoiceImport.findOneAndDelete({ _id: id, businessId, status: { $in: ['uploaded', 'processing', 'review', 'failed'] } });
//   if (!imp) throw new ImportError('Invoice import not found or cannot be deleted', 404);

//   if (imp.fileUrl && fs.existsSync(imp.fileUrl)) {
//     try { fs.unlinkSync(imp.fileUrl); } catch (e) { /* ignore */ }
//   }

//   return { message: 'Import deleted' };
// };

// // ─── Manual Entry (no AI needed) ────────────────────────────────
// const createManual = async (businessId, body, userId) => {
//   const { invoice, items } = body;

//   if (!items || items.length === 0) {
//     throw new ImportError('At least one product item is required', 400);
//   }

//   // Build extraction-like structure from manual input
//   const extraction = {
//     invoice: {
//       invoiceNumber: invoice?.invoiceNumber || null,
//       invoiceDate: invoice?.invoiceDate || null,
//       supplierName: invoice?.supplierName || null,
//       supplierGSTIN: invoice?.supplierGSTIN || null,
//       supplierPhone: invoice?.supplierPhone || null,
//       supplierEmail: invoice?.supplierEmail || null,
//       billingAddress: null,
//       shippingAddress: null,
//       subtotal: 0,
//       discount: 0,
//       cgst: 0,
//       sgst: 0,
//       igst: 0,
//       otherCharges: 0,
//       roundOff: 0,
//       grandTotal: 0,
//     },
//     items: items.map(item => ({
//       productName: item.productName,
//       sku: item.sku || null,
//       barcode: item.barcode || null,
//       hsnCode: item.hsnCode || null,
//       quantity: Number(item.quantity) || 0,
//       unit: item.unit || 'pcs',
//       purchasePrice: Number(item.purchasePrice) || 0,
//       discount: 0,
//       taxRate: Number(item.taxRate) || 0,
//       taxAmount: (Number(item.purchasePrice) || 0) * (Number(item.quantity) || 0) * ((Number(item.taxRate) || 0) / 100),
//       lineTotal: (Number(item.purchasePrice) || 0) * (Number(item.quantity) || 0) * (1 + (Number(item.taxRate) || 0) / 100),
//       confidence: { productName: 1.0, sku: 1.0, quantity: 1.0, purchasePrice: 1.0, taxRate: 1.0 },
//     })),
//   };

//   // Recalculate totals
//   let subtotal = 0;
//   let totalTax = 0;
//   for (const item of extraction.items) {
//     subtotal += item.purchasePrice * item.quantity;
//     totalTax += item.taxAmount;
//   }
//   extraction.invoice.subtotal = subtotal;
//   extraction.invoice.grandTotal = subtotal + totalTax;

//   const importRecord = await InvoiceImport.create({
//     businessId,
//     originalFilename: 'manual-entry',
//     fileUrl: null,
//     mimeType: null,
//     fileSize: 0,
//     status: 'review',
//     createdBy: userId,
//     extractionResult: extraction,
//     invoiceNumber: extraction.invoice.invoiceNumber,
//   });

//   const matchResults = await performMatching(businessId, extraction);
//   return { importId: importRecord._id, extraction, matches: matchResults };
// };

// module.exports = { uploadAndExtract, getById, createManual, confirmImport, remove, performMatching };

const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const InvoiceImport = require('../models/InvoiceImport');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');
const Category = require('../models/Category');
const Purchase = require('../models/Purchase');
const { extractInvoice, ExtractionError } = require('./invoiceExtractionService');
const purchaseService = require('./purchaseService');
const productService = require('./productService');
const auditService = require('./auditService');
const config = require('../config');

class ImportError extends Error {
  constructor(message, statusCode) { super(message); this.statusCode = statusCode; }
}

// ─── Upload + Extract ─────────────────────────────────────────
const uploadAndExtract = async (businessId, file, userId) => {
  if (!file) throw new ImportError('No file uploaded', 400);

  const importRecord = await InvoiceImport.create({
    businessId,
    originalFilename: file.originalname,
    fileUrl: file.path,
    mimeType: file.mimetype,
    fileSize: file.size,
    status: 'processing',
    createdBy: userId,
  });

  try {
    const extraction = await extractInvoice(file.path);
    importRecord.extractionResult = extraction;
    importRecord.status = 'review';
    importRecord.invoiceNumber = extraction.invoice?.invoiceNumber || null;
    await importRecord.save();

    const matchResults = await performMatching(businessId, extraction);
    return { importId: importRecord._id, extraction, matches: matchResults };
  } catch (error) {
    importRecord.status = 'failed';
    importRecord.errorMessage = error.message;
    await importRecord.save();
    throw error;
  }
};

// ─── Matching Logic ───────────────────────────────────────────
const normalizeStr = (s) => (s || '').toString().toLowerCase().replace(/[^a-z0-9]/g, '');

const performMatching = async (businessId, extraction) => {
  const { supplierMatches, newSupplierSuggestion } = await matchSupplier(businessId, extraction.invoice);
  const productMatches = await matchProducts(businessId, extraction.items);
  const categories = await Category.find({ businessId, status: 'active' }).select('_id name').lean();

  return { supplierMatches, newSupplierSuggestion, productMatches, categories };
};

const matchSupplier = async (businessId, invoiceInfo) => {
  if (!invoiceInfo?.supplierName) return { supplierMatches: [], newSupplierSuggestion: invoiceInfo?.supplierName || null };

  const query = { businessId, status: 'active' };
  const suppliers = await Supplier.find(query).select('_id name company phone email gstNumber').lean();
  const matches = [];
  const normalized = normalizeStr(invoiceInfo.supplierName);

  for (const supplier of suppliers) {
    let score = 0;
    let matchFields = [];

    // Name matching
    if (normalizeStr(supplier.name) === normalized || normalizeStr(supplier.company || '') === normalized) {
      score += 50;
      matchFields.push('name');
    } else if (normalizeStr(supplier.name).includes(normalized) || normalized.includes(normalizeStr(supplier.name))) {
      score += 30;
      matchFields.push('name');
    }

    // GSTIN matching (strong signal)
    if (invoiceInfo.supplierGSTIN && supplier.gstNumber) {
      if (normalizeStr(invoiceInfo.supplierGSTIN) === normalizeStr(supplier.gstNumber)) {
        score += 40;
        matchFields.push('gstin');
      }
    }

    // Phone matching
    if (invoiceInfo.supplierPhone && supplier.phone) {
      const invPhone = invoiceInfo.supplierPhone.replace(/[^0-9]/g, '');
      const supPhone = supplier.phone.replace(/[^0-9]/g, '');
      if (invPhone.length >= 10 && supPhone.length >= 10 && (invPhone.endsWith(supPhone) || supPhone.endsWith(invPhone))) {
        score += 20;
        matchFields.push('phone');
      }
    }

    if (score > 0) {
      matches.push({ supplier, score, matchFields });
    }
  }

  matches.sort((a, b) => b.score - a.score);
  const bestMatch = matches.length > 0 && matches[0].score >= 40 ? matches[0] : null;

  return {
    supplierMatches: matches.slice(0, 5),
    matchedSupplier: bestMatch ? bestMatch.supplier : null,
    newSupplierSuggestion: bestMatch ? null : invoiceInfo.supplierName,
  };
};

const matchProducts = async (businessId, items) => {
  const products = await Product.find({ businessId, status: 'active' }).select('_id name sku barcode categoryId purchasePrice currentStock supplierId hsnCode').lean();
  const results = [];

  for (const item of items) {
    let bestMatch = null;
    let bestScore = 0;
    let matchMethod = null;

    const itemSku = normalizeStr(item.sku);
    const itemBarcode = (item.barcode || '').trim();
    const itemHsn = (item.hsnCode || '').trim();
    const itemName = normalizeStr(item.productName);

    for (const product of products) {
      // Exact SKU match (strongest)
      if (itemSku && product.sku && normalizeStr(product.sku) === itemSku) {
        bestMatch = product;
        bestScore = 95;
        matchMethod = 'sku';
        break;
      }

      // Exact barcode match
      if (itemBarcode && product.barcode && product.barcode.trim() === itemBarcode) {
        bestMatch = product;
        bestScore = 95;
        matchMethod = 'barcode';
        break;
      }

      // HSN code match
      if (itemHsn && product.hsnCode && product.hsnCode.trim() === itemHsn && itemName === normalizeStr(product.name)) {
        bestMatch = product;
        bestScore = 80;
        matchMethod = 'hsn';
        break;
      }

      // Normalized name match
      if (itemName && normalizeStr(product.name) === itemName) {
        if (bestScore < 75) {
          bestMatch = product;
          bestScore = 75;
          matchMethod = 'name_exact';
        }
      }
      // Fuzzy name match (one contains the other)
      else if (itemName && (normalizeStr(product.name).includes(itemName) || itemName.includes(normalizeStr(product.name)))) {
        if (bestScore < 50) {
          bestMatch = product;
          bestScore = 50;
          matchMethod = 'name_fuzzy';
        }
      }
    }

    results.push({
      extractedItem: item,
      matchedProduct: bestMatch,
      matchScore: bestScore,
      matchMethod,
      isNew: !bestMatch || bestScore < 40,
    });
  }

  return results;
};

// ─── Get Import Record ─────────────────────────────────────────
const getById = async (id, businessId) => {
  const imp = await InvoiceImport.findOne({ _id: id, businessId }).lean();
  if (!imp) throw new ImportError('Invoice import not found', 404);
  return imp;
};

// ─── Confirm Import ────────────────────────────────────────────
const confirmImport = async (id, businessId, reviewData, userId) => {
  const imp = await InvoiceImport.findOne({ _id: id, businessId });
  if (!imp) throw new ImportError('Invoice import not found', 404);
  if (imp.status === 'completed') throw new ImportError('This invoice has already been imported', 400);
  // Allow 'review' AND 'failed' (failed may happen from a previous confirm attempt with validation errors)
  if (!['review', 'failed'].includes(imp.status)) {
    throw new ImportError(`Cannot confirm import with status: ${imp.status}. Only 'review' or 'failed' imports can be confirmed.`, 400);
  }

  // Duplicate invoice check
  if (reviewData.invoiceNumber && reviewData.supplierId) {
    const existingPurchase = await Purchase.findOne({
      businessId,
      supplierId: reviewData.supplierId,
      notes: { $regex: reviewData.invoiceNumber, $options: 'i' },
    });
    if (existingPurchase) {
      throw new ImportError(
        `Possible duplicate invoice. Invoice "${reviewData.invoiceNumber}" from this supplier has already been imported as Purchase #${existingPurchase._id}.`,
        409
      );
    }
  }

  imp.status = 'confirmed';
  imp.reviewData = reviewData;
  await imp.save();

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    let productsCreated = 0;
    let productsMatched = 0;
    const purchaseItems = [];

    for (const item of reviewData.items) {
      let productId = item.productId;

      // Create new product if needed
      if (!productId && item.matchAction === 'new') {
        if (!item.categoryId) throw new ImportError(`Category is required for new product: ${item.productName}`, 400);
        if (!item.sellingPrice && !item.usePurchaseAsSelling) throw new ImportError(`Selling price is required for new product: ${item.productName}`, 400);

        // Normalize unit to match Product model enum (AI may return 'Pcs', 'KG', 'Ltr', etc.)
        const VALID_UNITS = ['pcs', 'kg', 'ltr', 'm', 'box'];
        const normalizedUnit = VALID_UNITS.includes((item.unit || '').toLowerCase())
          ? (item.unit || '').toLowerCase()
          : 'pcs';

        const newProduct = await Product.create([{
          name: item.productName,
          sku: item.sku?.trim() || undefined,
          barcode: item.barcode?.trim() || undefined,
          categoryId: item.categoryId,
          brand: item.brand || '',
          purchasePrice: item.purchasePrice || 0,
          sellingPrice: item.usePurchaseAsSelling ? (item.purchasePrice || 0) : (item.sellingPrice || 0),
          taxRate: item.taxRate || 0,
          unit: normalizedUnit,
          minimumStock: item.minimumStock || 10,
          supplierId: item.supplierId || reviewData.supplierId || null,
          status: 'active',
          businessId,
          createdBy: userId,
        }], { session });
        productId = newProduct[0]._id;
        productsCreated++;
      } else if (productId) {
        productsMatched++;
      }

      if (!productId) throw new ImportError(`No product resolved for item: ${item.productName}`, 400);

      const unitPrice = item.purchasePrice || 0;
      const taxRate = item.taxRate || 0;
      const lineTotalBeforeTax = unitPrice * (item.quantity || 0);
      const taxAmount = lineTotalBeforeTax * (taxRate / 100);
      const lineTotal = lineTotalBeforeTax + taxAmount;

      purchaseItems.push({
        productId,
        quantity: item.quantity || 0,
        unitPrice,
        taxRate,
      });
    }

    if (purchaseItems.length === 0) throw new ImportError('No valid items to import', 400);

    // Create purchase using existing purchaseService, passing the same session
    const purchase = await purchaseService.create(
      businessId,
      {
        supplierId: reviewData.supplierId,
        items: purchaseItems,
        paymentMethod: reviewData.paymentMethod || 'credit',
        notes: reviewData.invoiceNumber ? `Invoice: ${reviewData.invoiceNumber}` : (reviewData.notes || 'Imported via Scan & Stock'),
        branchId: reviewData.branchId || null,
      },
      userId,
      { session }
    );

    imp.status = 'completed';
    imp.importedPurchaseId = purchase._id;
    imp.supplierId = reviewData.supplierId;
    imp.summary = {
      productsCreated,
      productsMatched,
      purchaseTotal: purchase.total,
      inventoryUpdated: purchaseItems.length,
    };
    await imp.save({ session });

    // Audit log
    await auditService.createLog({
      userId,
      businessId,
      action: 'invoice_import',
      resource: 'invoice_import',
      resourceId: imp._id,
      metadata: {
        invoiceNumber: reviewData.invoiceNumber,
        supplierId: reviewData.supplierId,
        purchaseId: purchase._id,
        productsCreated,
        productsMatched,
        totalItems: purchaseItems.length,
        totalAmount: purchase.total,
        originalFilename: imp.originalFilename,
      },
      ipAddress: null,
      userAgent: null,
    });

    await session.commitTransaction();
    session.endSession();

    return {
      purchase,
      summary: imp.summary,
      importId: imp._id,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    // Revert to 'review' so user can fix data and retry (don't permanently fail it)
    imp.status = 'review';
    imp.errorMessage = error.message;
    await imp.save();
    throw error;
  }
};

// ─── Delete Import ─────────────────────────────────────────────
const remove = async (id, businessId) => {
  const imp = await InvoiceImport.findOneAndDelete({ _id: id, businessId, status: { $in: ['uploaded', 'processing', 'review', 'confirming', 'failed'] } });
  if (!imp) throw new ImportError('Invoice import not found or cannot be deleted', 404);

  if (imp.fileUrl && fs.existsSync(imp.fileUrl)) {
    try { fs.unlinkSync(imp.fileUrl); } catch (e) { /* ignore */ }
  }

  return { message: 'Import deleted' };
};

// ─── Manual Entry (no AI needed) ────────────────────────────────
const createManual = async (businessId, body, userId) => {
  const { invoice, items } = body;

  if (!items || items.length === 0) {
    throw new ImportError('At least one product item is required', 400);
  }

  // Build extraction-like structure from manual input
  const extraction = {
    invoice: {
      invoiceNumber: invoice?.invoiceNumber || null,
      invoiceDate: invoice?.invoiceDate || null,
      supplierName: invoice?.supplierName || null,
      supplierGSTIN: invoice?.supplierGSTIN || null,
      supplierPhone: invoice?.supplierPhone || null,
      supplierEmail: invoice?.supplierEmail || null,
      billingAddress: null,
      shippingAddress: null,
      subtotal: 0,
      discount: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      otherCharges: 0,
      roundOff: 0,
      grandTotal: 0,
    },
    items: items.map(item => ({
      productName: item.productName,
      sku: item.sku || null,
      barcode: item.barcode || null,
      hsnCode: item.hsnCode || null,
      quantity: Number(item.quantity) || 0,
      unit: item.unit || 'pcs',
      purchasePrice: Number(item.purchasePrice) || 0,
      discount: 0,
      taxRate: Number(item.taxRate) || 0,
      taxAmount: (Number(item.purchasePrice) || 0) * (Number(item.quantity) || 0) * ((Number(item.taxRate) || 0) / 100),
      lineTotal: (Number(item.purchasePrice) || 0) * (Number(item.quantity) || 0) * (1 + (Number(item.taxRate) || 0) / 100),
      confidence: { productName: 1.0, sku: 1.0, quantity: 1.0, purchasePrice: 1.0, taxRate: 1.0 },
    })),
  };

  // Recalculate totals
  let subtotal = 0;
  let totalTax = 0;
  for (const item of extraction.items) {
    subtotal += item.purchasePrice * item.quantity;
    totalTax += item.taxAmount;
  }
  extraction.invoice.subtotal = subtotal;
  extraction.invoice.grandTotal = subtotal + totalTax;

  const importRecord = await InvoiceImport.create({
    businessId,
    originalFilename: 'manual-entry',
    fileUrl: null,
    mimeType: null,
    fileSize: 0,
    status: 'review',
    createdBy: userId,
    extractionResult: extraction,
    invoiceNumber: extraction.invoice.invoiceNumber,
  });

  const matchResults = await performMatching(businessId, extraction);
  return { importId: importRecord._id, extraction, matches: matchResults };
};

module.exports = { uploadAndExtract, getById, createManual, confirmImport, remove, performMatching };
