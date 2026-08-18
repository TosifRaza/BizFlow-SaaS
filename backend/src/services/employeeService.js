// // const User = require('../models/User');
// // const Employee = require('../models/Employee');
// // const Business = require('../models/Business');
// // const Sale = require('../models/Sale');
// // const config = require('../config');

// // class EmployeeError extends Error {
// //   constructor(message, statusCode) { super(message); this.statusCode = statusCode; }
// // }

// // const getAll = async (businessId, query) => {
// //   const page = parseInt(query.page) || config.pagination.defaultPage;
// //   const limit = Math.min(parseInt(query.limit) || config.pagination.defaultLimit, config.pagination.maxLimit);
// //   const skip = (page - 1) * limit;
// //   const filter = { businessId };
// //   if (query.status) filter.status = query.status;
// //   if (query.search) filter.$or = [{ name: { $regex: query.search, $options: 'i' } }, { email: { $regex: query.search, $options: 'i' } }];
// //   if (query.branchId) filter.branchId = query.branchId;

// //   const [data, total] = await Promise.all([
// //     Employee.find(filter).populate('userId', 'email status').sort('-createdAt').skip(skip).limit(limit).lean(),
// //     Employee.countDocuments(filter),
// //   ]);
// //   return { data, page, limit, total };
// // };

// // const getById = async (id, businessId) => {
// //   const employee = await Employee.findOne({ _id: id, businessId }).populate('userId', 'email status').lean();
// //   if (!employee) throw new EmployeeError('Employee not found', 404);
// //   return employee;
// // };

// // const create = async (businessId, { name, email, phone, role, salary, password, profilePhoto }, userId) => {
// //   if (email) {
// //     const existingUser = await User.findOne({ email });
// //     if (existingUser) throw new EmployeeError('User with this email already exists', 409);
// //   }
// //   if (!password) password = 'TempPass@123';

// //   const user = await User.create({ name, email, phone, password, role: role || 'staff', businessId, status: 'active' });
// //   const employee = await Employee.create({ userId: user._id, name, email, phone, role: role || 'staff', salary, profilePhoto, businessId, createdBy: userId });

// //   const business = await Business.findById(businessId);
// //   if (business) {
// //     business.usage.usersUsed += 1;
// //     await business.save();
// //   }

// //   return { user: user.toJSON(), employee };
// // };

// // const update = async (id, businessId, data) => {
// //   const employee = await Employee.findOne({ _id: id, businessId });
// //   if (!employee) throw new EmployeeError('Employee not found', 404);

// //   const allowed = ['name', 'phone', 'role', 'salary', 'profilePhoto'];
// //   const filtered = {};
// //   for (const key of allowed) {
// //     if (data[key] !== undefined) filtered[key] = data[key];
// //   }

// //   Object.assign(employee, filtered);
// //   await employee.save();

// //   if (employee.userId) {
// //     const updateFields = {};
// //     if (data.name) updateFields.name = data.name;
// //     if (data.phone) updateFields.phone = data.phone;
// //     if (Object.keys(updateFields).length > 0) {
// //       await User.findByIdAndUpdate(employee.userId, updateFields);
// //     }
// //   }

// //   return employee;
// // };

// // const deactivate = async (id, businessId) => {
// //   const employee = await Employee.findOne({ _id: id, businessId });
// //   if (!employee) throw new EmployeeError('Employee not found', 404);

// //   employee.status = employee.status === 'active' ? 'inactive' : 'active';
// //   await employee.save();

// //   if (employee.userId) {
// //     await User.findByIdAndUpdate(employee.userId, { status: employee.status });
// //   }

// //   return employee;
// // };

// // const deleteEmployee = async (id, businessId) => {
// //   const employee = await Employee.findOne({ _id: id, businessId });
// //   if (!employee) throw new EmployeeError('Employee not found', 404);

// //   if (employee.userId) {
// //     const user = await User.findById(employee.userId);
// //     if (!user) throw new EmployeeError('Associated user not found', 404);

// //     // Check if employee is an owner
// //     if (user.role === 'owner') {
// //       throw new EmployeeError('Cannot delete the business owner', 400);
// //     }

// //     // Check if employee is the last remaining owner/manager
// //     if (user.role === 'manager' || user.role === 'owner') {
// //       const otherActiveEmployeeUserIds = (await Employee.find({ businessId, status: 'active', _id: { $ne: id } }).select('userId').lean()).map(e => e.userId);
// //       const managerUserCount = await User.countDocuments({
// //         _id: { $in: otherActiveEmployeeUserIds },
// //         role: { $in: ['owner', 'manager'] },
// //       });
// //       if (managerUserCount === 0) {
// //         throw new EmployeeError('Cannot delete the last remaining owner/manager', 400);
// //       }
// //     }

// //     // Check for recent activity (sales created by this user in last 30 days)
// //     const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
// //     const recentSales = await Sale.countDocuments({
// //       businessId,
// //       createdBy: employee.userId,
// //       createdAt: { $gte: thirtyDaysAgo },
// //     });
// //     if (recentSales > 0) {
// //       throw new EmployeeError('Cannot delete employee with sales activity in the last 30 days', 400);
// //     }

// //     await User.findByIdAndDelete(employee.userId);
// //   }

// //   await Employee.findByIdAndDelete(id);

// //   const business = await Business.findById(businessId);
// //   if (business && business.usage.usersUsed > 0) {
// //     business.usage.usersUsed -= 1;
// //     await business.save();
// //   }

// //   return { message: 'Employee deleted' };
// // };

// // const getStats = async (businessId) => {
// //   const [total, active, inactive, totalSalary] = await Promise.all([
// //     Employee.countDocuments({ businessId }),
// //     Employee.countDocuments({ businessId, status: 'active' }),
// //     Employee.countDocuments({ businessId, status: 'inactive' }),
// //     Employee.aggregate([{ $match: { businessId, status: 'active' } }, { $group: { _id: null, total: { $sum: '$salary' } } }]),
// //   ]);
// //   return { total, active, inactive, totalSalary: totalSalary[0]?.total || 0 };
// // };

// // module.exports = { getAll, getById, create, update, deactivate, delete: deleteEmployee, getStats };
// const User = require('../models/User');
// const Employee = require('../models/Employee');
// const Business = require('../models/Business');
// const Sale = require('../models/Sale');
// const config = require('../config');

// class EmployeeError extends Error {
//   constructor(message, statusCode) { super(message); this.statusCode = statusCode; }
// }

// const getAll = async (businessId, query) => {
//   const page = parseInt(query.page) || config.pagination.defaultPage;
//   const limit = Math.min(parseInt(query.limit) || config.pagination.defaultLimit, config.pagination.maxLimit);
//   const skip = (page - 1) * limit;
//   const filter = { businessId };
//   if (query.status) filter.status = query.status;
//   if (query.search) filter.$or = [{ name: { $regex: query.search, $options: 'i' } }, { email: { $regex: query.search, $options: 'i' } }];
//   if (query.branchId) filter.branchId = query.branchId;

//   const [data, total] = await Promise.all([
//     Employee.find(filter).populate('userId', 'email status').sort('-createdAt').skip(skip).limit(limit).lean(),
//     Employee.countDocuments(filter),
//   ]);
//   return { data, page, limit, total };
// };

// const getById = async (id, businessId) => {
//   const employee = await Employee.findOne({ _id: id, businessId }).populate('userId', 'email status').lean();
//   if (!employee) throw new EmployeeError('Employee not found', 404);
//   return employee;
// };

// const create = async (businessId, { name, email, phone, role, salary, password, profilePhoto }, userId) => {
//   if (email) {
//     const existingUser = await User.findOne({ email });
//     if (existingUser) throw new EmployeeError('User with this email already exists', 409);
//   }
//   if (!password) password = 'TempPass@123';

//   const user = await User.create({ name, email, phone, password, role: role || 'staff', businessId, status: 'active' });
//   const employee = await Employee.create({ userId: user._id, name, email, phone, role: role || 'staff', salary, profilePhoto, businessId, createdBy: userId });

//   const business = await Business.findById(businessId);
//   if (business) {
//     business.usage.usersUsed += 1;
//     await business.save();
//   }

//   return { user: user.toJSON(), employee };
// };

// const update = async (id, businessId, data) => {
//   const employee = await Employee.findOne({ _id: id, businessId });
//   if (!employee) throw new EmployeeError('Employee not found', 404);

//   const allowed = ['name', 'phone', 'role', 'salary', 'profilePhoto'];
//   const filtered = {};
//   for (const key of allowed) {
//     if (data[key] !== undefined) filtered[key] = data[key];
//   }

//   Object.assign(employee, filtered);
//   await employee.save();

//   if (employee.userId) {
//     const updateFields = {};
//     if (data.name) updateFields.name = data.name;
//     if (data.phone) updateFields.phone = data.phone;
//     if (Object.keys(updateFields).length > 0) {
//       await User.findByIdAndUpdate(employee.userId, updateFields);
//     }
//   }

//   return employee;
// };

// const deactivate = async (id, businessId) => {
//   const employee = await Employee.findOne({ _id: id, businessId });
//   if (!employee) throw new EmployeeError('Employee not found', 404);

//   employee.status = employee.status === 'active' ? 'inactive' : 'active';
//   await employee.save();

//   if (employee.userId) {
//     await User.findByIdAndUpdate(employee.userId, { status: employee.status });
//   }

//   return employee;
// };

// const deleteEmployee = async (id, businessId) => {
//   const employee = await Employee.findOne({ _id: id, businessId });
//   if (!employee) throw new EmployeeError('Employee not found', 404);

//   if (employee.userId) {
//     const user = await User.findById(employee.userId);
//     if (!user) throw new EmployeeError('Associated user not found', 404);

//     // Check if employee is an owner
//     if (user.role === 'owner') {
//       throw new EmployeeError('Cannot delete the business owner', 400);
//     }

//     // Check if employee is the last remaining owner/manager
//     if (user.role === 'manager' || user.role === 'owner') {
//       const otherActiveEmployeeUserIds = (await Employee.find({ businessId, status: 'active', _id: { $ne: id } }).select('userId').lean()).map(e => e.userId);
//       const managerUserCount = await User.countDocuments({
//         _id: { $in: otherActiveEmployeeUserIds },
//         role: { $in: ['owner', 'manager'] },
//       });
//       if (managerUserCount === 0) {
//         throw new EmployeeError('Cannot delete the last remaining owner/manager', 400);
//       }
//     }

//     // Check for recent activity (sales created by this user in last 30 days)
//     const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
//     const recentSales = await Sale.countDocuments({
//       businessId,
//       createdBy: employee.userId,
//       createdAt: { $gte: thirtyDaysAgo },
//     });
//     if (recentSales > 0) {
//       throw new EmployeeError('Cannot delete employee with sales activity in the last 30 days', 400);
//     }

//     await User.findByIdAndDelete(employee.userId);
//   }

//   await Employee.findByIdAndDelete(id);

//   const business = await Business.findById(businessId);
//   if (business && business.usage.usersUsed > 0) {
//     business.usage.usersUsed -= 1;
//     await business.save();
//   }

//   return { message: 'Employee deleted' };
// };

// const getStats = async (businessId) => {
//   const [total, active, inactive, totalSalary] = await Promise.all([
//     Employee.countDocuments({ businessId }),
//     Employee.countDocuments({ businessId, status: 'active' }),
//     Employee.countDocuments({ businessId, status: 'inactive' }),
//     Employee.aggregate([{ $match: { businessId, status: 'active' } }, { $group: { _id: null, total: { $sum: '$salary' } } }]),
//   ]);
//   return { total, active, inactive, totalSalary: totalSalary[0]?.total || 0 };
// };

// const resetPassword = async (id, businessId, newPassword) => {
//   const employee = await Employee.findOne({ _id: id, businessId });
//   if (!employee) throw new EmployeeError('Employee not found', 404);

//   if (employee.userId) {
//     const user = await User.findById(employee.userId);
//     if (!user) throw new EmployeeError('Associated user not found', 404);
//     if (user.role === 'owner') throw new EmployeeError('Cannot reset owner password from here', 400);
//     user.password = newPassword;
//     await user.save();
//   }

//   return { message: 'Password reset successful' };
// };

// module.exports = { getAll, getById, create, update, deactivate, delete: deleteEmployee, getStats, resetPassword };
const User = require('../models/User');
const Employee = require('../models/Employee');
const Business = require('../models/Business');
const Sale = require('../models/Sale');
const config = require('../config');

class EmployeeError extends Error {
  constructor(message, statusCode) { super(message); this.statusCode = statusCode; }
}

const getAll = async (businessId, query) => {
  const page = parseInt(query.page) || config.pagination.defaultPage;
  const limit = Math.min(parseInt(query.limit) || config.pagination.defaultLimit, config.pagination.maxLimit);
  const skip = (page - 1) * limit;
  const filter = { businessId };
  if (query.status) filter.status = query.status;
  if (query.search) filter.$or = [{ name: { $regex: query.search, $options: 'i' } }, { email: { $regex: query.search, $options: 'i' } }];
  if (query.branchId) filter.branchId = query.branchId;

  const [data, total] = await Promise.all([
    Employee.find(filter).populate('userId', 'email status').sort('-createdAt').skip(skip).limit(limit).lean(),
    Employee.countDocuments(filter),
  ]);
  return { data, page, limit, total };
};

const getById = async (id, businessId) => {
  const employee = await Employee.findOne({ _id: id, businessId }).populate('userId', 'email status').lean();
  if (!employee) throw new EmployeeError('Employee not found', 404);
  return employee;
};

const create = async (businessId, { name, email, phone, role, salary, password, profilePhoto }, userId) => {
  if (email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) throw new EmployeeError('User with this email already exists', 409);
  }
  if (!password) password = 'TempPass@123';

  const user = await User.create({ name, email, phone, password, role: role || 'staff', businessId, status: 'active' });
  const employee = await Employee.create({ userId: user._id, name, email, phone, role: role || 'staff', salary, profilePhoto, businessId, createdBy: userId });

  const business = await Business.findById(businessId);
  if (business) {
    business.usage.usersUsed += 1;
    await business.save();
  }

  return { user: user.toJSON(), employee };
};

const update = async (id, businessId, data) => {
  const employee = await Employee.findOne({ _id: id, businessId });
  if (!employee) throw new EmployeeError('Employee not found', 404);

  const allowed = ['name', 'phone', 'role', 'salary', 'profilePhoto'];
  const filtered = {};
  for (const key of allowed) {
    if (data[key] !== undefined) filtered[key] = data[key];
  }

  Object.assign(employee, filtered);
  await employee.save();

  if (employee.userId) {
    const updateFields = {};
    if (data.name) updateFields.name = data.name;
    if (data.phone) updateFields.phone = data.phone;
    if (Object.keys(updateFields).length > 0) {
      await User.findByIdAndUpdate(employee.userId, updateFields);
    }
  }

  return employee;
};

const deactivate = async (id, businessId) => {
  const employee = await Employee.findOne({ _id: id, businessId });
  if (!employee) throw new EmployeeError('Employee not found', 404);

  employee.status = employee.status === 'active' ? 'inactive' : 'active';
  await employee.save();

  if (employee.userId) {
    await User.findByIdAndUpdate(employee.userId, { status: employee.status });
  }

  return employee;
};

const deleteEmployee = async (id, businessId) => {
  const employee = await Employee.findOne({ _id: id, businessId });
  if (!employee) throw new EmployeeError('Employee not found', 404);

  if (employee.userId) {
    const user = await User.findById(employee.userId);
    if (!user) throw new EmployeeError('Associated user not found', 404);

    // Check if employee is an owner
    if (user.role === 'owner') {
      throw new EmployeeError('Cannot delete the business owner', 400);
    }

    // Check if employee is the last remaining owner/manager
    if (user.role === 'manager' || user.role === 'owner') {
      const otherActiveEmployeeUserIds = (await Employee.find({ businessId, status: 'active', _id: { $ne: id } }).select('userId').lean()).map(e => e.userId);
      const managerUserCount = await User.countDocuments({
        _id: { $in: otherActiveEmployeeUserIds },
        role: { $in: ['owner', 'manager'] },
      });
      if (managerUserCount === 0) {
        throw new EmployeeError('Cannot delete the last remaining owner/manager', 400);
      }
    }

    // Check for recent activity (sales created by this user in last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentSales = await Sale.countDocuments({
      businessId,
      createdBy: employee.userId,
      createdAt: { $gte: thirtyDaysAgo },
    });
    if (recentSales > 0) {
      throw new EmployeeError('Cannot delete employee with sales activity in the last 30 days', 400);
    }

    await User.findByIdAndDelete(employee.userId);
  }

  await Employee.findByIdAndDelete(id);

  const business = await Business.findById(businessId);
  if (business && business.usage.usersUsed > 0) {
    business.usage.usersUsed -= 1;
    await business.save();
  }

  return { message: 'Employee deleted' };
};

const getStats = async (businessId) => {
  const [total, active, inactive, totalSalary] = await Promise.all([
    Employee.countDocuments({ businessId }),
    Employee.countDocuments({ businessId, status: 'active' }),
    Employee.countDocuments({ businessId, status: 'inactive' }),
    Employee.aggregate([{ $match: { businessId, status: 'active' } }, { $group: { _id: null, total: { $sum: '$salary' } } }]),
  ]);
  return { total, active, inactive, totalSalary: totalSalary[0]?.total || 0 };
};

const resetPassword = async (id, businessId, newPassword) => {
  const employee = await Employee.findOne({ _id: id, businessId });
  if (!employee) throw new EmployeeError('Employee not found', 404);

  if (employee.userId) {
    const user = await User.findById(employee.userId);
    if (!user) throw new EmployeeError('Associated user not found', 404);
    if (user.role === 'owner') throw new EmployeeError('Cannot reset owner password from here', 400);
    user.password = newPassword;
    await user.save();
  }

  return { message: 'Password reset successful' };
};

module.exports = { getAll, getById, create, update, deactivate, delete: deleteEmployee, getStats, resetPassword };