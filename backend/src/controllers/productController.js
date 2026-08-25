// // const productService = require('../services/productService');
// // const { successResponse, paginateResponse } = require('../utils/response');

// // const create = async (req, res, next) => {
// //   try {
// //     const product = await productService.create(req.businessId, req.body, req.user._id);
// //     successResponse(res, product, 'Product created', 201);
// //   } catch (error) {
// //     next(error);
// //   }
// // };

// // const getAll = async (req, res, next) => {
// //   try {
// //     const result = await productService.getAll(req.businessId, req.query);
// //     paginateResponse(res, result.data, result.page, result.limit, result.total);
// //   } catch (error) {
// //     next(error);
// //   }
// // };

// // const getById = async (req, res, next) => {
// //   try {
// //     const product = await productService.getById(req.params.id, req.businessId);
// //     successResponse(res, product);
// //   } catch (error) {
// //     next(error);
// //   }
// // };

// // const update = async (req, res, next) => {
// //   try {
// //     const product = await productService.update(req.params.id, req.businessId, req.body);
// //     successResponse(res, product, 'Product updated');
// //   } catch (error) {
// //     next(error);
// //   }
// // };

// // const remove = async (req, res, next) => {
// //   try {
// //     await productService.remove(req.params.id, req.businessId);
// //     successResponse(res, null, 'Product deleted');
// //   } catch (error) {
// //     next(error);
// //   }
// // };

// // const bulkImport = async (req, res, next) => {
// //   try {
// //     if (!req.file) throw new Error('No file uploaded');
// //     const result = await productService.bulkImport(req.businessId, req.file.path, req.user._id);
// //     successResponse(res, result, 'Bulk import completed');
// //   } catch (error) {
// //     if (!error.statusCode) error.statusCode = 400;
// //     next(error);
// //   }
// // };

// // const bulkExport = async (req, res, next) => {
// //   try {
// //     const result = await productService.bulkExport(req.businessId, req.query);
// //     res.setHeader('Content-Type', 'text/csv');
// //     res.setHeader('Content-Disposition', 'attachment; filename=products-export.csv');
// //     res.send(result.csv);
// //   } catch (error) { next(error); }
// // };

// // const bulkDelete = async (req, res, next) => {
// //   try {
// //     const result = await productService.bulkDelete(req.businessId, req.body.ids);
// //     successResponse(res, result, 'Products deleted');
// //   } catch (error) {
// //     next(error);
// //   }
// // };

// // const getStats = async (req, res, next) => {
// //   try {
// //     const stats = await productService.getStats(req.businessId);
// //     successResponse(res, stats);
// //   } catch (error) {
// //     next(error);
// //   }
// // };

// // module.exports = { create, getAll, getById, update, delete: remove, bulkImport, bulkExport, bulkDelete, getStats };
// const productService = require('../services/productService');
// const { successResponse, paginateResponse } = require('../utils/response');

// const create = async (req, res, next) => {
//   try {
//     const product = await productService.create(req.businessId, req.body, req.user._id);
//     successResponse(res, product, 'Product created', 201);
//   } catch (error) {
//     next(error);
//   }
// };

// const getAll = async (req, res, next) => {
//   try {
//     const result = await productService.getAll(req.businessId, req.query);
//     paginateResponse(res, result.data, result.page, result.limit, result.total);
//   } catch (error) {
//     next(error);
//   }
// };

// const getById = async (req, res, next) => {
//   try {
//     const product = await productService.getById(req.params.id, req.businessId);
//     successResponse(res, product);
//   } catch (error) {
//     next(error);
//   }
// };

// const update = async (req, res, next) => {
//   try {
//     const product = await productService.update(req.params.id, req.businessId, req.body);
//     successResponse(res, product, 'Product updated');
//   } catch (error) {
//     next(error);
//   }
// };

// const remove = async (req, res, next) => {
//   try {
//     await productService.remove(req.params.id, req.businessId);
//     successResponse(res, null, 'Product deleted');
//   } catch (error) {
//     next(error);
//   }
// };

// const bulkImport = async (req, res, next) => {
//   try {
//     const result = await productService.bulkImport(req.businessId, req.body.products, req.user._id);
//     successResponse(res, result, 'Bulk import completed');
//   } catch (error) {
//     next(error);
//   }
// };

// const bulkExport = async (req, res, next) => {
//   try {
//     const products = await productService.bulkExport(req.businessId);
//     successResponse(res, products);
//   } catch (error) {
//     next(error);
//   }
// };

// const bulkDelete = async (req, res, next) => {
//   try {
//     const result = await productService.bulkDelete(req.businessId, req.body.ids);
//     successResponse(res, result, 'Products deleted');
//   } catch (error) {
//     next(error);
//   }
// };

// const getStats = async (req, res, next) => {
//   try {
//     const stats = await productService.getStats(req.businessId);
//     successResponse(res, stats);
//   } catch (error) {
//     next(error);
//   }
// };

// module.exports = { create, getAll, getById, update, delete: remove, bulkImport, bulkExport, bulkDelete, getStats };
const productService = require('../services/productService');
const { successResponse, paginateResponse } = require('../utils/response');

const create = async (req, res, next) => {
  try {
    const product = await productService.create(req.businessId, req.body, req.user._id);
    successResponse(res, product, 'Product created', 201);
  } catch (error) {
    next(error);
  }
};

const getAll = async (req, res, next) => {
  try {
    const result = await productService.getAll(req.businessId, req.query);
    paginateResponse(res, result.data, result.page, result.limit, result.total);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const product = await productService.getById(req.params.id, req.businessId);
    successResponse(res, product);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const product = await productService.update(req.params.id, req.businessId, req.body);
    successResponse(res, product, 'Product updated');
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await productService.delete(req.params.id, req.businessId);
    successResponse(res, null, 'Product deleted');
  } catch (error) {
    next(error);
  }
};

const bulkImport = async (req, res, next) => {
  try {
    const result = await productService.bulkImport(req.businessId, req.body.products, req.user._id);
    successResponse(res, result, 'Bulk import completed');
  } catch (error) {
    next(error);
  }
};

const bulkExport = async (req, res, next) => {
  try {
    const products = await productService.bulkExport(req.businessId);
    successResponse(res, products);
  } catch (error) {
    next(error);
  }
};

const bulkDelete = async (req, res, next) => {
  try {
    const result = await productService.bulkDelete(req.businessId, req.body.ids);
    successResponse(res, result, 'Products deleted');
  } catch (error) {
    next(error);
  }
};

const getStats = async (req, res, next) => {
  try {
    const stats = await productService.getStats(req.businessId);
    successResponse(res, stats);
  } catch (error) {
    next(error);
  }
};

module.exports = { create, getAll, getById, update, delete: remove, bulkImport, bulkExport, bulkDelete, getStats };
