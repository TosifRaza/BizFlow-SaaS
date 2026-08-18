// // const employeeService = require('../services/employeeService');
// // const { successResponse, paginateResponse } = require('../utils/response');

// // const create = async (req, res, next) => {
// //   try {
// //     const result = await employeeService.create(req.businessId, req.body, req.user._id);
// //     successResponse(res, result, 'Employee created', 201);
// //   } catch (error) {
// //     next(error);
// //   }
// // };

// // const getAll = async (req, res, next) => {
// //   try {
// //     const result = await employeeService.getAll(req.businessId, req.query);
// //     paginateResponse(res, result.data, result.page, result.limit, result.total);
// //   } catch (error) {
// //     next(error);
// //   }
// // };

// // const getById = async (req, res, next) => {
// //   try {
// //     const employee = await employeeService.getById(req.params.id, req.businessId);
// //     successResponse(res, employee);
// //   } catch (error) {
// //     next(error);
// //   }
// // };

// // const update = async (req, res, next) => {
// //   try {
// //     const employee = await employeeService.update(req.params.id, req.businessId, req.body);
// //     successResponse(res, employee, 'Employee updated');
// //   } catch (error) {
// //     next(error);
// //   }
// // };

// // const deactivate = async (req, res, next) => {
// //   try {
// //     const employee = await employeeService.deactivate(req.params.id, req.businessId);
// //     successResponse(res, employee, 'Employee status updated');
// //   } catch (error) {
// //     next(error);
// //   }
// // };

// // const deleteEmployee = async (req, res, next) => {
// //   try {
// //     await employeeService.delete(req.params.id, req.businessId);
// //     successResponse(res, null, 'Employee deleted');
// //   } catch (error) {
// //     next(error);
// //   }
// // };

// // const getStats = async (req, res, next) => {
// //   try {
// //     const stats = await employeeService.getStats(req.businessId);
// //     successResponse(res, stats);
// //   } catch (error) {
// //     next(error);
// //   }
// // };

// // module.exports = { create, getAll, getById, update, deactivate, delete: deleteEmployee, getStats };
// const employeeService = require('../services/employeeService');
// const { successResponse, paginateResponse } = require('../utils/response');

// const create = async (req, res, next) => {
//   try {
//     const result = await employeeService.create(req.businessId, req.body, req.user._id);
//     successResponse(res, result, 'Employee created', 201);
//   } catch (error) {
//     next(error);
//   }
// };

// const getAll = async (req, res, next) => {
//   try {
//     const result = await employeeService.getAll(req.businessId, req.query);
//     paginateResponse(res, result.data, result.page, result.limit, result.total);
//   } catch (error) {
//     next(error);
//   }
// };

// const getById = async (req, res, next) => {
//   try {
//     const employee = await employeeService.getById(req.params.id, req.businessId);
//     successResponse(res, employee);
//   } catch (error) {
//     next(error);
//   }
// };

// const update = async (req, res, next) => {
//   try {
//     const employee = await employeeService.update(req.params.id, req.businessId, req.body);
//     successResponse(res, employee, 'Employee updated');
//   } catch (error) {
//     next(error);
//   }
// };

// const deactivate = async (req, res, next) => {
//   try {
//     const employee = await employeeService.deactivate(req.params.id, req.businessId);
//     successResponse(res, employee, 'Employee status updated');
//   } catch (error) {
//     next(error);
//   }
// };

// const deleteEmployee = async (req, res, next) => {
//   try {
//     await employeeService.delete(req.params.id, req.businessId);
//     successResponse(res, null, 'Employee deleted');
//   } catch (error) {
//     next(error);
//   }
// };

// const getStats = async (req, res, next) => {
//   try {
//     const stats = await employeeService.getStats(req.businessId);
//     successResponse(res, stats);
//   } catch (error) {
//     next(error);
//   }
// };

// const resetPassword = async (req, res, next) => {
//   try {
//     const { password } = req.body;
//     if (!password || password.length < 6) {
//       return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
//     }
//     await employeeService.resetPassword(req.params.id, req.businessId, password);
//     successResponse(res, null, 'Password reset successful');
//   } catch (error) {
//     next(error);
//   }
// };

// module.exports = { create, getAll, getById, update, deactivate, delete: deleteEmployee, getStats, resetPassword };
const employeeService = require('../services/employeeService');
const { successResponse, paginateResponse } = require('../utils/response');

const create = async (req, res, next) => {
  try {
    const result = await employeeService.create(req.businessId, req.body, req.user._id);
    successResponse(res, result, 'Employee created', 201);
  } catch (error) {
    next(error);
  }
};

const getAll = async (req, res, next) => {
  try {
    const result = await employeeService.getAll(req.businessId, req.query);
    paginateResponse(res, result.data, result.page, result.limit, result.total);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const employee = await employeeService.getById(req.params.id, req.businessId);
    successResponse(res, employee);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const employee = await employeeService.update(req.params.id, req.businessId, req.body);
    successResponse(res, employee, 'Employee updated');
  } catch (error) {
    next(error);
  }
};

const deactivate = async (req, res, next) => {
  try {
    const employee = await employeeService.deactivate(req.params.id, req.businessId);
    successResponse(res, employee, 'Employee status updated');
  } catch (error) {
    next(error);
  }
};

const deleteEmployee = async (req, res, next) => {
  try {
    await employeeService.delete(req.params.id, req.businessId);
    successResponse(res, null, 'Employee deleted');
  } catch (error) {
    next(error);
  }
};

const getStats = async (req, res, next) => {
  try {
    const stats = await employeeService.getStats(req.businessId);
    successResponse(res, stats);
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }
    await employeeService.resetPassword(req.params.id, req.businessId, password);
    successResponse(res, null, 'Password reset successful');
  } catch (error) {
    next(error);
  }
};

module.exports = { create, getAll, getById, update, deactivate, delete: deleteEmployee, getStats, resetPassword };