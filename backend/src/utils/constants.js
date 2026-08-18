const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  OWNER: 'owner',
  MANAGER: 'manager',
  STAFF: 'staff',
};

const BUSINESS_TYPES = [
  'retail',
  'wholesale',
  'restaurant',
  'service',
  'manufacturing',
  'ecommerce',
  'healthcare',
  'education',
  'other',
];

const PAYMENT_METHODS = ['cash', 'upi', 'card', 'credit', 'bank_transfer', 'other'];

const EXPENSE_CATEGORIES = [
  'rent',
  'electricity',
  'salary',
  'transport',
  'internet',
  'maintenance',
  'marketing',
  'packaging',
  'other',
];

const INVENTORY_TRANSACTION_TYPES = ['purchase', 'sale', 'return', 'damage', 'adjustment', 'transfer'];

const SALE_STATUS = {
  COMPLETED: 'completed',
  PARTIAL: 'partial',
  CREDIT: 'credit',
  VOIDED: 'voided',
};

const PURCHASE_STATUS = {
  COMPLETED: 'completed',
  PARTIAL: 'partial',
  CREDIT: 'credit',
  VOIDED: 'voided',
};

const NOTIFICATION_TYPES = {
  LOW_STOCK: 'low_stock',
  SALE_COMPLETED: 'sale_completed',
  PAYMENT_RECEIVED: 'payment_received',
  PAYMENT_DUE: 'payment_due',
  SUBSCRIPTION_EXPIRING: 'subscription_expiring',
  USER_CREATED: 'user_created',
  SYSTEM: 'system',
};

const PERMISSIONS = {
  PRODUCTS: {
    VIEW: 'products.view',
    CREATE: 'products.create',
    UPDATE: 'products.update',
    DELETE: 'products.delete',
    IMPORT: 'products.import',
    EXPORT: 'products.export',
  },
  CATEGORIES: {
    VIEW: 'categories.view',
    CREATE: 'categories.create',
    UPDATE: 'categories.update',
    DELETE: 'categories.delete',
  },
  INVENTORY: {
    VIEW: 'inventory.view',
    ADJUST: 'inventory.adjust',
    TRANSFER: 'inventory.transfer',
  },
  SALES: {
    VIEW: 'sales.view',
    CREATE: 'sales.create',
    VOID: 'sales.void',
    RETURN: 'sales.return',
  },
  PURCHASES: {
    VIEW: 'purchases.view',
    CREATE: 'purchases.create',
  },
  CUSTOMERS: {
    VIEW: 'customers.view',
    CREATE: 'customers.create',
    UPDATE: 'customers.update',
    DELETE: 'customers.delete',
  },
  SUPPLIERS: {
    VIEW: 'suppliers.view',
    CREATE: 'suppliers.create',
    UPDATE: 'suppliers.update',
    DELETE: 'suppliers.delete',
  },
  EXPENSES: {
    VIEW: 'expenses.view',
    CREATE: 'expenses.create',
    UPDATE: 'expenses.update',
    DELETE: 'expenses.delete',
  },
  EMPLOYEES: {
    VIEW: 'employees.view',
    CREATE: 'employees.create',
    UPDATE: 'employees.update',
    DELETE: 'employees.delete',
  },
  REPORTS: {
    VIEW: 'reports.view',
    EXPORT: 'reports.export',
  },
  DASHBOARD: {
    VIEW: 'dashboard.view',
  },
  SETTINGS: {
    VIEW: 'settings.view',
    UPDATE: 'settings.update',
  },
  ROLES: {
    VIEW: 'roles.view',
    CREATE: 'roles.create',
    UPDATE: 'roles.update',
    DELETE: 'roles.delete',
  },
  BRANCHES: {
    VIEW: 'branches.view',
    CREATE: 'branches.create',
    UPDATE: 'branches.update',
    DELETE: 'branches.delete',
  },
  NOTIFICATIONS: {
    VIEW: 'notifications.view',
  },
};

// const ALL_PERMISSIONS = Object.values(PERMISSIONS).flatMap((group) => Object.values(group));
const ALL_PERMISSIONS = Object.values(PERMISSIONS).flatMap((group) => Object.values(group));
module.exports = {
  USER_ROLES,
  BUSINESS_TYPES,
  PAYMENT_METHODS,
  EXPENSE_CATEGORIES,
  INVENTORY_TRANSACTION_TYPES,
  SALE_STATUS,
  PURCHASE_STATUS,
  NOTIFICATION_TYPES,
  PERMISSIONS,
  ALL_PERMISSIONS,
};
