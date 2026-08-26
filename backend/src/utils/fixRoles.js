const mongoose = require('mongoose');
const Role = require('../models/Role');
const { ALL_PERMISSIONS } = require('./constants');

const MANAGER_PERMISSIONS = [
  'dashboard.view',
  'products.view', 'products.create', 'products.update',
  'categories.view', 'categories.create', 'categories.update',
  'inventory.view', 'inventory.adjust',
  'sales.view', 'sales.create',
  'purchases.view', 'purchases.create',
  'customers.view', 'customers.create', 'customers.update',
  'suppliers.view', 'suppliers.create', 'suppliers.update',
  'expenses.view', 'expenses.create', 'expenses.update',
  'employees.view', 'employees.create', 'employees.update',
  'reports.view', 'reports.export',
  'settings.view', 'settings.update',
  'roles.view', 'roles.create', 'roles.update',
  'branches.view', 'branches.create', 'branches.update',
  'notifications.view',
];

const STAFF_PERMISSIONS = [
  'dashboard.view',
  'products.view',
  'categories.view',
  'inventory.view',
  'sales.view', 'sales.create',
  'customers.view', 'customers.create',
  'notifications.view',
];

const fixRoles = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/StoreX');
    console.log('Connected to MongoDB');

    const managerResult = await Role.updateMany(
      { name: 'manager' },
      { $set: { permissions: MANAGER_PERMISSIONS } }
    );
    console.log(`Updated ${managerResult.modifiedCount} manager roles`);

    const staffResult = await Role.updateMany(
      { name: 'staff' },
      { $set: { permissions: STAFF_PERMISSIONS } }
    );
    console.log(`Updated ${staffResult.modifiedCount} staff roles`);

    console.log('Done! All existing business roles have been fixed.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
};

fixRoles();
