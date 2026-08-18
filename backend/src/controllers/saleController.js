const saleService = require('../services/saleService');
const { successResponse, paginateResponse } = require('../utils/response');

const create = async (req, res, next) => {
  try {
    const sale = await saleService.create(req.businessId, req.body, req.user._id);
    successResponse(res, sale, 'Sale created', 201);
  } catch (error) {
    next(error);
  }
};

const getAll = async (req, res, next) => {
  try {
    const result = await saleService.getAll(req.businessId, req.query, req.branchFilter);
    paginateResponse(res, result.data, result.page, result.limit, result.total);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const sale = await saleService.getById(req.params.id, req.businessId);
    successResponse(res, sale);
  } catch (error) {
    next(error);
  }
};

const getInvoiceData = async (req, res, next) => {
  try {
    const sale = await saleService.getInvoiceData(req.params.invoiceNumber, req.businessId);
    successResponse(res, sale);
  } catch (error) {
    next(error);
  }
};

const recordPayment = async (req, res, next) => {
  try {
    const sale = await saleService.recordPayment(req.params.id, req.businessId, req.body, req.user._id);
    successResponse(res, sale, 'Payment recorded');
  } catch (error) {
    next(error);
  }
};

const voidSale = async (req, res, next) => {
  try {
    const sale = await saleService.voidSale(req.params.id, req.businessId, req.user._id);
    successResponse(res, sale, 'Sale voided');
  } catch (error) {
    next(error);
  }
};

const returnSale = async (req, res, next) => {
  try {
    const result = await saleService.returnSale(req.params.id, req.businessId, req.body, req.user._id);
    successResponse(res, result, 'Sale returned');
  } catch (error) {
    next(error);
  }
};

const downloadInvoicePDF = async (req, res, next) => {
  try {
    const pdfBuffer = await saleService.generateInvoicePDF(req.params.id, req.businessId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${req.params.id}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

module.exports = { create, getAll, getById, getInvoiceData, recordPayment, voidSale, returnSale, downloadInvoicePDF };
