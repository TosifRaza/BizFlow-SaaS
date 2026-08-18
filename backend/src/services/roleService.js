// const Role = require('../models/Role');
// const User = require('../models/User');
// const config = require('../config');

// class RoleError extends Error {
//   constructor(message, statusCode) { super(message); this.statusCode = statusCode; }
// }

// const getAll = async (businessId) => {
//   const roles = await Role.find({ businessId }).sort('name').lean();
//   return roles;
// };

// const getById = async (id, businessId) => {
//   const role = await Role.findOne({ _id: id, businessId }).lean();
//   if (!role) throw new RoleError('Role not found', 404);
//   return role;
// };

// const create = async (businessId, data) => {
//   const existing = await Role.findOne({ name: data.name, businessId });
//   if (existing) throw new RoleError('Role name already exists', 409);
//   const role = await Role.create({ ...data, businessId });
//   return role;
// };

// const update = async (id, businessId, data) => {
//   if (data.name) {
//     const existing = await Role.findOne({ name: data.name, businessId, _id: { $ne: id } });
//     if (existing) throw new RoleError('Role name already exists', 409);
//   }
//   const role = await Role.findOneAndUpdate({ _id: id, businessId }, data, { new: true, runValidators: true });
//   if (!role) throw new RoleError('Role not found', 404);
//   return role;
// };

// const remove = async (id, businessId) => {
//   const role = await Role.findOne({ _id: id, businessId });
//   if (!role) throw new RoleError('Role not found', 404);
//   const usersWithRole = await User.countDocuments({ businessId, role: role.name });
//   if (usersWithRole > 0) throw new RoleError('Cannot delete role with assigned users', 400);
//   await Role.findByIdAndDelete(id);
//   return { message: 'Role deleted' };
// };

// const assignRole = async (businessId, { userId, roleName }) => {
//   const role = await Role.findOne({ name: roleName, businessId });
//   if (!role) throw new RoleError('Role not found', 404);
//   const user = await User.findOneAndUpdate({ _id: userId, businessId }, { role: roleName }, { new: true });
//   if (!user) throw new RoleError('User not found in this business', 404);
//   return user.toJSON();
// };

// module.exports = { getAll, getById, create, update, delete: remove, assignRole };
const Role = require('../models/Role');
const User = require('../models/User');
const { getUserPermissions } = require('./authService');

class RoleError extends Error {
  constructor(message, statusCode) { super(message); this.statusCode = statusCode; }
}

const getAll = async (businessId) => {
  const roles = await Role.find({ businessId }).sort('name').lean();
  return roles;
};

const getById = async (id, businessId) => {
  const role = await Role.findOne({ _id: id, businessId }).lean();
  if (!role) throw new RoleError('Role not found', 404);
  return role;
};

const create = async (businessId, data, requestingUser) => {
  const existing = await Role.findOne({ name: data.name, businessId });
  if (existing) throw new RoleError('Role name already exists', 409);

  // Non-owners cannot create roles with permissions they don't have
  let permissions = data.permissions || [];
  if (requestingUser.role !== 'owner' && requestingUser.role !== 'super_admin') {
    const userPerms = await getUserPermissions(requestingUser);
    permissions = permissions.filter((p) => userPerms.includes(p));
  }

  const role = await Role.create({ ...data, businessId, permissions });
  return role;
};

const update = async (id, businessId, data, requestingUser) => {
  if (data.name) {
    const existing = await Role.findOne({ name: data.name, businessId, _id: { $ne: id } });
    if (existing) throw new RoleError('Role name already exists', 409);
  }

  // Non-owners cannot update roles to have permissions they don't have
  let updateData = { ...data };
  if (updateData.permissions && requestingUser.role !== 'owner' && requestingUser.role !== 'super_admin') {
    const userPerms = await getUserPermissions(requestingUser);
    updateData.permissions = updateData.permissions.filter((p) => userPerms.includes(p));
  }

  // Prevent non-owners from modifying the owner role
  if (requestingUser.role !== 'owner' && requestingUser.role !== 'super_admin') {
    const targetRole = await Role.findOne({ _id: id, businessId });
    if (targetRole && targetRole.name === 'owner') {
      throw new RoleError('Cannot modify the owner role', 403);
    }
  }

  const role = await Role.findOneAndUpdate({ _id: id, businessId }, updateData, { new: true, runValidators: true });
  if (!role) throw new RoleError('Role not found', 404);
  return role;
};

const remove = async (id, businessId) => {
  const role = await Role.findOne({ _id: id, businessId });
  if (!role) throw new RoleError('Role not found', 404);
  const usersWithRole = await User.countDocuments({ businessId, role: role.name });
  if (usersWithRole > 0) throw new RoleError('Cannot delete role with assigned users', 400);
  await Role.findByIdAndDelete(id);
  return { message: 'Role deleted' };
};

const assignRole = async (businessId, { userId, roleName }, requestingUser) => {
  // Non-owners cannot assign the owner role
  if (roleName === 'owner' && requestingUser.role !== 'owner' && requestingUser.role !== 'super_admin') {
    throw new RoleError('Cannot assign owner role', 403);
  }

  // Non-owners cannot assign roles with more permissions than they have
  if (requestingUser.role !== 'owner' && requestingUser.role !== 'super_admin') {
    const targetRole = await Role.findOne({ name: roleName, businessId });
    if (targetRole) {
      const userPerms = await getUserPermissions(requestingUser);
      const hasEscalation = targetRole.permissions.some((p) => !userPerms.includes(p));
      if (hasEscalation) {
        throw new RoleError('Cannot assign a role with higher permissions than your own', 403);
      }
    }
  }

  const role = await Role.findOne({ name: roleName, businessId });
  if (!role) throw new RoleError('Role not found', 404);
  const user = await User.findOneAndUpdate({ _id: userId, businessId }, { role: roleName }, { new: true });
  if (!user) throw new RoleError('User not found in this business', 404);
  return user.toJSON();
};

module.exports = { getAll, getById, create, update, delete: remove, assignRole };
