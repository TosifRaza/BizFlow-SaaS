const mongoose = require('mongoose');
const PDFDocument = require('pdfkit');
const Sale = require('../models/Sale');
const SaleItem = require('../models/SaleItem');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const CustomerTransaction = require('../models/CustomerTransaction');
const InventoryTransaction = require('../models/InventoryTransaction');
const Business = require('../models/Business');
const config = require('../config');
const notificationService = require('./notificationService');

class SaleError extends Error {
  constructor(message, statusCode) { super(message); this.statusCode = statusCode; }
}

const generateInvoiceNumber = async (businessId) => {
  const business = await Business.findById(businessId);
  const prefix = business?.invoicePrefix || 'INV';
  const now = new Date();
  const dateStr = now.getFullYear().toString() + String(now.getMonth() + 1).padStart(2, '0') + String(now.getDate()).padStart(2, '0');
  const count = await Sale.countDocuments({ businessId, createdAt: { $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) } });
  const seq = String(count + 1).padStart(3, '0');
  return `${prefix}-${dateStr}-${seq}`;
};

const create = async (businessId, { customerId, items, discount, paymentMethod, notes, branchId }, userId) => {
  if (!items || items.length === 0) throw new SaleError('Sale must have at least one item', 400);

  let subtotal = 0;
  let totalTax = 0;
  const saleItems = [];

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    for (const item of items) {
      const product = await Product.findOne({ _id: item.productId, businessId, status: 'active' }).session(session);
      if (!product) throw new SaleError(`Product not found: ${item.productId}`, 404);
      if (product.currentStock < item.quantity) throw new SaleError(`Insufficient stock for ${product.name}. Available: ${product.currentStock}`, 400);

      const unitPrice = item.unitPrice || product.sellingPrice;
      const itemDiscount = item.discount || product.discount || discount || 0;
      const taxRate = item.taxRate !== undefined ? item.taxRate : product.taxRate;
      const lineTotalBeforeTax = (unitPrice * item.quantity) * (1 - itemDiscount / 100);
      const taxAmount = lineTotalBeforeTax * (taxRate / 100);
      const lineTotal = lineTotalBeforeTax + taxAmount;

      subtotal += lineTotalBeforeTax;
      totalTax += taxAmount;

      saleItems.push({
        productId: product._id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice,
        discount: itemDiscount,
        taxRate,
        taxAmount,
        total: lineTotal,
      });
    }

    const total = subtotal + totalTax;
    let amountPaid = 0;
    let amountDue = total;
    let status = 'credit';

    if (paymentMethod !== 'credit') {
      amountPaid = total;
      amountDue = 0;
      status = 'completed';
    }

    const invoiceNumber = await generateInvoiceNumber(businessId);
    const sale = await Sale.create([{
      invoiceNumber, customerId, items: saleItems, subtotal,
      discount: discount || 0, taxAmount: totalTax, total, amountPaid, amountDue,
      paymentMethod: paymentMethod || 'cash', status, notes, businessId, branchId, createdBy: userId,
    }], { session });
    const saleDoc = sale[0];

    for (const item of saleItems) {
      await SaleItem.create([{
        saleId: saleDoc._id, productId: item.productId, productName: item.productName,
        quantity: item.quantity, unitPrice: item.unitPrice, discount: item.discount,
        taxRate: item.taxRate, taxAmount: item.taxAmount, total: item.total, businessId,
      }], { session });

      const product = await Product.findById(item.productId).session(session);
      const previousStock = product.currentStock;
      const newStock = previousStock - item.quantity;
      product.currentStock = newStock;
      await product.save({ session });

      await InventoryTransaction.create([{
        productId: item.productId, type: 'sale', quantity: item.quantity,
        previousStock, newStock, referenceId: saleDoc._id, referenceType: 'sale',
        businessId, branchId, createdBy: userId,
      }], { session });
    }

    if (customerId) {
      const customer = await Customer.findById(customerId).session(session);
      if (customer) {
        customer.balance += amountDue;
        await customer.save({ session });
        await CustomerTransaction.create([{
          customerId, type: 'sale', amount: total, debit: amountDue, credit: 0,
          balance: customer.balance, referenceId: saleDoc._id, referenceType: 'sale',
          businessId, createdBy: userId,
        }], { session });
      }
    }

    await session.commitTransaction();
    session.endSession();
    const result = await Sale.findById(saleDoc._id).populate('customerId', 'name phone email').lean();
    try {
      await notificationService.create({
        userId, businessId, type: 'sale',
        title: 'New Sale',
        message: `Sale #${saleDoc.invoiceNumber} created for \u20b9${total.toFixed(2)}`,
        data: { saleId: saleDoc._id, saleNumber: saleDoc.invoiceNumber, amount: total },
      });
    } catch {}
    return result;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getAll = async (businessId, query, branchFilter = {}) => {
  const page = parseInt(query.page) || config.pagination.defaultPage;
  const limit = Math.min(parseInt(query.limit) || config.pagination.defaultLimit, config.pagination.maxLimit);
  const skip = (page - 1) * limit;
  const filter = { ...branchFilter, businessId };
  if (query.status) filter.status = query.status;
  if (query.customerId) filter.customerId = query.customerId;
  if (query.startDate && query.endDate) filter.createdAt = { $gte: new Date(query.startDate), $lte: new Date(query.endDate) };
  if (query.paymentMethod) filter.paymentMethod = query.paymentMethod;
  if (query.branchId) filter.branchId = query.branchId;

  const [data, total] = await Promise.all([
    Sale.find(filter).populate('customerId', 'name phone').populate('createdBy', 'name').sort('-createdAt').skip(skip).limit(limit).lean(),
    Sale.countDocuments(filter),
  ]);
  return { data, page, limit, total };
};

const getById = async (id, businessId) => {
  const sale = await Sale.findOne({ _id: id, businessId }).populate('customerId', 'name phone email address gstNumber').populate('createdBy', 'name').lean();
  if (!sale) throw new SaleError('Sale not found', 404);
  return sale;
};

const getInvoiceData = async (invoiceNumber, businessId) => {
  const sale = await Sale.findOne({ invoiceNumber, businessId }).populate('customerId', 'name phone email address gstNumber').populate('createdBy', 'name').lean();
  if (!sale) throw new SaleError('Invoice not found', 404);
  return sale;
};

const recordPayment = async (id, businessId, { amount, paymentMethod }, userId) => {
  const sale = await Sale.findById(id);
  if (!sale || sale.businessId.toString() !== businessId.toString()) throw new SaleError('Sale not found', 404);
  if (sale.status === 'completed') throw new SaleError('Sale already paid in full', 400);
  if (amount <= 0) throw new SaleError('Amount must be positive', 400);

  const newAmountPaid = sale.amountPaid + amount;
  const newAmountDue = sale.total - newAmountPaid;

  sale.amountPaid = newAmountPaid;
  sale.amountDue = Math.max(0, newAmountDue);
  sale.paymentMethod = paymentMethod || sale.paymentMethod;
  sale.status = newAmountDue <= 0 ? 'completed' : 'partial';
  await sale.save();

  if (sale.customerId) {
    const customer = await Customer.findById(sale.customerId);
    if (customer) {
      customer.balance -= amount;
      if (customer.balance < 0) customer.balance = 0;
      await customer.save();
      await CustomerTransaction.create({
        customerId: customer._id, type: 'payment', amount, debit: 0, credit: amount,
        balance: customer.balance, referenceId: sale._id, referenceType: 'payment',
        notes: `Payment for invoice ${sale.invoiceNumber}`, businessId, createdBy: userId,
      });
    }
  }

  try {
    await notificationService.create({
      userId, businessId, type: 'payment',
      title: 'Payment Received',
      message: `Payment of \u20b9${amount.toFixed(2)} received for invoice ${sale.invoiceNumber}.`,
      data: { saleId: sale._id, invoiceNumber: sale.invoiceNumber, amount },
    });
  } catch {}

  return sale;
};

const voidSale = async (id, businessId, userId) => {
  const sale = await Sale.findOne({ _id: id, businessId });
  if (!sale) throw new SaleError('Sale not found', 404);
  if (sale.status === 'voided') throw new SaleError('Sale already voided', 400);

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    sale.status = 'voided';
    await sale.save({ session });

    for (const item of sale.items) {
      const product = await Product.findById(item.productId).session(session);
      if (product) {
        const previousStock = product.currentStock;
        product.currentStock += item.quantity;
        await product.save({ session });
        await InventoryTransaction.create([{
          productId: product._id, type: 'return', quantity: item.quantity,
          previousStock, newStock: product.currentStock, referenceId: sale._id,
          referenceType: 'sale', notes: 'Sale voided - stock restored', businessId, createdBy: userId,
        }], { session });
      }
    }

    if (sale.customerId && sale.amountDue > 0) {
      const customer = await Customer.findById(sale.customerId).session(session);
      if (customer) {
        customer.balance -= sale.amountDue;
        if (customer.balance < 0) customer.balance = 0;
        await customer.save({ session });
      }
    }

    await session.commitTransaction();
    session.endSession();
    return sale;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const returnSale = async (id, businessId, { items: returnItems, notes }, userId) => {
  const sale = await Sale.findOne({ _id: id, businessId });
  if (!sale) throw new SaleError('Sale not found', 404);
  if (sale.status === 'voided') throw new SaleError('Cannot return a voided sale', 400);

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    let totalReturn = 0;
    for (const retItem of returnItems) {
      const saleItem = sale.items.find(i => i.productId.toString() === retItem.productId);
      if (!saleItem) throw new SaleError(`Product ${retItem.productId} not in this sale`, 404);
      if (retItem.quantity > saleItem.quantity) throw new SaleError(`Return quantity exceeds sold quantity for ${saleItem.productName}`, 400);

      const product = await Product.findById(retItem.productId).session(session);
      if (product) {
        const previousStock = product.currentStock;
        product.currentStock += retItem.quantity;
        await product.save({ session });
        await InventoryTransaction.create([{
          productId: product._id, type: 'return', quantity: retItem.quantity,
          previousStock, newStock: product.currentStock, referenceId: sale._id,
          referenceType: 'sale', notes: notes || 'Sale return', businessId, createdBy: userId,
        }], { session });
      }
      totalReturn += saleItem.unitPrice * retItem.quantity;
    }

    if (sale.customerId && totalReturn > 0) {
      const customer = await Customer.findById(sale.customerId).session(session);
      if (customer) {
        customer.balance -= totalReturn;
        if (customer.balance < 0) customer.balance = 0;
        await customer.save({ session });
        await CustomerTransaction.create([{
          customerId: customer._id, type: 'return', amount: totalReturn, debit: 0, credit: totalReturn,
          balance: customer.balance, referenceId: sale._id, referenceType: 'return',
          notes: notes || 'Sale return', businessId, createdBy: userId,
        }], { session });
      }
    }

    await session.commitTransaction();
    session.endSession();
    return { message: 'Sale returned successfully', refundAmount: totalReturn };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const generateInvoicePDF = async (saleId, businessId) => {
  const sale = await Sale.findOne({ _id: saleId, businessId })
    .populate('customerId', 'name email phone address gstNumber')
    .populate('businessId', 'name address city state pincode phone email gstNumber logo')
    .lean();
  if (!sale) throw new SaleError('Sale not found', 404);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    const business = sale.businessId;
    const customer = sale.customerId;

    // Header
    doc.fontSize(20).text(business?.name || 'Business', { align: 'right' });
    if (business?.address) doc.fontSize(10).text(business.address, { align: 'right' });
    if (business?.city || business?.state) doc.fontSize(10).text(`${business?.city || ''} ${business?.state || ''} ${business?.pincode || ''}`.trim(), { align: 'right' });
    if (business?.phone) doc.fontSize(10).text(`Phone: ${business.phone}`, { align: 'right' });
    if (business?.gstNumber) doc.fontSize(10).text(`GSTIN: ${business.gstNumber}`, { align: 'right' });

    doc.moveDown(1.5);
    doc.fontSize(16).text('INVOICE', { align: 'center' });
    doc.fontSize(10).text(`Invoice #: ${sale.invoiceNumber}`, { align: 'center' });
    doc.text(`Date: ${new Date(sale.createdAt).toLocaleDateString('en-IN')}`, { align: 'center' });

    doc.moveDown(1);

    // Customer info
    doc.fontSize(11).text('Bill To:', { underline: true });
    doc.fontSize(10).text(customer?.name || 'Customer');
    if (customer?.address) doc.text(customer.address);
    if (customer?.phone) doc.text(`Phone: ${customer.phone}`);
    if (customer?.email) doc.text(`Email: ${customer.email}`);

    doc.moveDown(1);

    // Table header
    const tableTop = doc.y;
    doc.fontSize(10);
    doc.text('#', 50, tableTop);
    doc.text('Item', 80, tableTop);
    doc.text('Qty', 320, tableTop, { width: 50, align: 'center' });
    doc.text('Rate', 380, tableTop, { width: 70, align: 'right' });
    doc.text('Amount', 460, tableTop, { width: 70, align: 'right' });

    doc.moveTo(50, tableTop + 15).lineTo(530, tableTop + 15).stroke();

    let y = tableTop + 25;
    sale.items.forEach((item, idx) => {
      if (y > 650) {
        doc.addPage();
        y = 50;
      }
      const amount = item.quantity * item.unitPrice;
      doc.text(`${idx + 1}`, 50, y);
      doc.text(item.productName || item.description || 'Item', 80, y);
      doc.text(String(item.quantity), 320, y, { width: 50, align: 'center' });
      doc.text(`\u20b9${item.unitPrice.toFixed(2)}`, 380, y, { width: 70, align: 'right' });
      doc.text(`\u20b9${amount.toFixed(2)}`, 460, y, { width: 70, align: 'right' });
      y += 20;
    });

    doc.moveTo(50, y).lineTo(530, y).stroke();
    y += 10;

    // Totals
    doc.text(`Subtotal: \u20b9${(sale.subtotal || 0).toFixed(2)}`, 380, y, { width: 150, align: 'right' });
    y += 18;
    if (sale.taxAmount) {
      doc.text(`Tax: \u20b9${sale.taxAmount.toFixed(2)}`, 380, y, { width: 150, align: 'right' });
      y += 18;
    }
    if (sale.discount) {
      doc.text(`Discount: -\u20b9${sale.discount.toFixed(2)}`, 380, y, { width: 150, align: 'right' });
      y += 18;
    }
    doc.fontSize(11).text(`Total: \u20b9${(sale.total || 0).toFixed(2)}`, 380, y, { width: 150, align: 'right' });

    doc.end();
  });
};

module.exports = { create, getAll, getById, getInvoiceData, recordPayment, voidSale, returnSale, generateInvoicePDF };
