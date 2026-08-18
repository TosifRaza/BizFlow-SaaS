// const roleService = require('../services/roleService');
// const { successResponse } = require('../utils/response');

// const create = async (req, res, next) => {
//   try {
//     const role = await roleService.create(req.businessId, req.body);
//     successResponse(res, role, 'Role created', 201);
//   } catch (error) {
//     next(error);
//   }
// };

// const getAll = async (req, res, next) => {
//   try {
//     const roles = await roleService.getAll(req.businessId);
//     successResponse(res, roles);
//   } catch (error) {
//     next(error);
//   }
// };

// const getById = async (req, res, next) => {
//   try {
//     const role = await roleService.getById(req.params.id, req.businessId);
//     successResponse(res, role);
//   } catch (error) {
//     next(error);
//   }
// };

// const update = async (req, res, next) => {
//   try {
//     const role = await roleService.update(req.params.id, req.businessId, req.body);
//     successResponse(res, role, 'Role updated');
//   } catch (error) {
//     next(error);
//   }
// };

// const remove = async (req, res, next) => {
//   try {
//     await roleService.remove(req.params.id, req.businessId);
//     successResponse(res, null, 'Role deleted');
//   } catch (error) {
//     next(error);
//   }
// };

// const assignRole = async (req, res, next) => {
//   try {
//     const user = await roleService.assignRole(req.businessId, req.body);
//     successResponse(res, user, 'Role assigned');
//   } catch (error) {
//     next(error);
//   }
// };

// module.exports = { create, getAll, getById, update, delete: remove, assignRole };
const roleService = require('../services/roleService');
const { successResponse } = require('../utils/response');

const create = async (req, res, next) => {
  try {
    const role = await roleService.create(req.businessId, req.body, req.user);
    successResponse(res, role, 'Role created', 201);
  } catch (error) {
    next(error);
  }
};

const getAll = async (req, res, next) => {
  try {
    const roles = await roleService.getAll(req.businessId);
    successResponse(res, roles);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const role = await roleService.getById(req.params.id, req.businessId);
    successResponse(res, role);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const role = await roleService.update(req.params.id, req.businessId, req.body, req.user);
    successResponse(res, role, 'Role updated');
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await roleService.remove(req.params.id, req.businessId);
    successResponse(res, null, 'Role deleted');
  } catch (error) {
    next(error);
  }
};

const assignRole = async (req, res, next) => {
  try {
    const user = await roleService.assignRole(req.businessId, req.body, req.user);
    successResponse(res, user, 'Role assigned');
  } catch (error) {
    next(error);
  }
};

module.exports = { create, getAll, getById, update, delete: remove, assignRole };
