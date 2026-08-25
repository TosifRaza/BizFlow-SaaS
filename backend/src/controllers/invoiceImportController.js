// const invoiceImportService = require('../services/invoiceImportService');
// const { successResponse } = require('../utils/response');

// const uploadAndExtract = async (req, res, next) => {
//   try {
//     const result = await invoiceImportService.uploadAndExtract(
//       req.businessId,
//       req.file,
//       req.user._id
//     );
//     successResponse(res, result, 'Invoice extracted successfully');
//   } catch (error) {
//     next(error);
//   }
// };

// const getById = async (req, res, next) => {
//   try {
//     const imp = await invoiceImportService.getById(req.params.id, req.businessId);
//     successResponse(res, imp);
//   } catch (error) {
//     next(error);
//   }
// };

// const confirmImport = async (req, res, next) => {
//   try {
//     const result = await invoiceImportService.confirmImport(
//       req.params.id,
//       req.businessId,
//       req.body,
//       req.user._id
//     );
//     successResponse(res, result, 'Invoice imported successfully');
//   } catch (error) {
//     next(error);
//   }
// };

// const remove = async (req, res, next) => {
//   try {
//     const result = await invoiceImportService.remove(req.params.id, req.businessId);
//     successResponse(res, result, 'Import deleted');
//   } catch (error) {
//     next(error);
//   }
// };

// module.exports = { uploadAndExtract, getById, confirmImport, remove };
const invoiceImportService = require('../services/invoiceImportService');
const { getProviderInfo } = require('../services/invoiceExtractionService');
const { successResponse } = require('../utils/response');

const uploadAndExtract = async (req, res, next) => {
  try {
    const result = await invoiceImportService.uploadAndExtract(
      req.businessId,
      req.file,
      req.user._id
    );
    successResponse(res, result, 'Invoice extracted successfully');
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const imp = await invoiceImportService.getById(req.params.id, req.businessId);
    successResponse(res, imp);
  } catch (error) {
    next(error);
  }
};

const createManual = async (req, res, next) => {
  try {
    const result = await invoiceImportService.createManual(
      req.businessId,
      req.body,
      req.user._id
    );
    successResponse(res, result, 'Manual import created');
  } catch (error) {
    next(error);
  }
};

const confirmImport = async (req, res, next) => {
  try {
    const result = await invoiceImportService.confirmImport(
      req.params.id,
      req.businessId,
      req.body,
      req.user._id
    );
    successResponse(res, result, 'Invoice imported successfully');
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const result = await invoiceImportService.remove(req.params.id, req.businessId);
    successResponse(res, result, 'Import deleted');
  } catch (error) {
    next(error);
  }
};

const providerInfo = async (req, res, next) => {
  try {
    const info = getProviderInfo();
    successResponse(res, info);
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadAndExtract, getById, createManual, confirmImport, remove, providerInfo };
