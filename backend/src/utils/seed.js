const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config');
const User = require('../models/User');
const Business = require('../models/Business');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Supplier = require('../models/Supplier');
const Sale = require('../models/Sale');
const Purchase = require('../models/Purchase');
const Expense = require('../models/Expense');
const Plan = require('../models/Plan');
const Subscription = require('../models/Subscription');
const Role = require('../models/Role');
const { ALL_PERMISSIONS } = require('./constants');

const seedPlans = async () => {
  const existing = await Plan.countDocuments();
  if (existing > 0) {
    console.log('Plans already exist, skipping...');
    return await Plan.find();
  }

  const plans = await Plan.insertMany([
    {
      name: 'Free', price: 0, yearlyPrice: 0, interval: 'monthly', isPopular: false,
      limits: { products: 50, users: 1, branches: 1, features: ['basic_inventory', 'basic_reports', 'pos'] },
      status: 'active',
    },
    {
      name: 'Starter', price: 299, yearlyPrice: 2990, interval: 'monthly', isPopular: false,
      limits: { products: 500, users: 3, branches: 2, features: ['inventory', 'reports', 'pos', 'multi_user', 'branches'] },
      status: 'active',
    },
    {
      name: 'Business', price: 599, yearlyPrice: 5990, interval: 'monthly', isPopular: true,
      limits: { products: 2000, users: 10, branches: 5, features: ['inventory', 'reports', 'pos', 'multi_user', 'branches', 'advanced_reports', 'gst_billing', 'api_access'] },
      status: 'active',
    },
    {
      name: 'Pro', price: 999, yearlyPrice: 9990, interval: 'monthly', isPopular: false,
      limits: { products: 99999, users: 50, branches: 20, features: ['inventory', 'reports', 'pos', 'multi_user', 'branches', 'advanced_reports', 'gst_billing', 'api_access', 'custom_integrations', 'priority_support'] },
      status: 'active',
    },
  ]);
  console.log(`Created ${plans.length} plans`);
  return plans;
};

const seedSuperAdmin = async () => {
  const existing = await User.findOne({ email: 'admin@StoreX.com' });
  if (existing) {
    console.log('Super admin already exists, skipping...');
    return existing;
  }
  const admin = await User.create({
    name: 'StoreX Admin', email: 'admin@StoreX.com', phone: '9999999999',
    password: 'Admin@123', role: 'super_admin', status: 'active',
  });
  console.log('Super admin created: admin@StoreX.com / Admin@123');
  return admin;
};

const seedDemoBusiness = async (plans) => {
  const existingUser = await User.findOne({ email: 'demo@StoreX.com' });
  if (existingUser) {
    console.log('Demo business already exists, skipping...');
    return existingUser;
  }

  const freePlan = plans.find(p => p.name === 'Free');
  const business = await Business.create({
    name: 'Demo Retail Store', type: 'retail', address: '123 Main Street',
    city: 'Mumbai', state: 'Maharashtra', pincode: '400001',
    phone: '9876543210', email: 'demo@store.com',
    currency: 'INR', taxEnabled: true, taxRate: 18,
    invoicePrefix: 'INV', subscriptionStatus: 'trial',
    trialStartDate: new Date(),
    trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    planId: freePlan._id,
    usage: { productsUsed: 0, usersUsed: 1, branchesUsed: 1 },
    settings: { notifications: { email: true, sms: false, lowStock: true, salesAlert: true, paymentReminder: true }, security: { twoFactorEnabled: false, sessionTimeout: 60, passwordExpiry: 90 } },
    status: 'active',
  });

  const user = await User.create({
    name: 'Demo Owner', email: 'demo@StoreX.com', phone: '9876543210',
    password: 'Demo@123', role: 'owner', businessId: business._id, status: 'active',
  });
  business.createdBy = user._id;
  await business.save();

  await Role.insertMany([
    { name: 'owner', description: 'Full access', permissions: ALL_PERMISSIONS, isDefault: true, businessId: business._id },
    { name: 'manager', description: 'Manager', permissions: ALL_PERMISSIONS.filter(p => !p.includes('delete')), isDefault: false, businessId: business._id },
    { name: 'staff', description: 'Staff', permissions: ALL_PERMISSIONS.filter(p => p.includes('.view') || p === 'sales.create' || p === 'customers.create'), isDefault: true, businessId: business._id },
  ]);

  await Subscription.create({
    businessId: business._id, planId: freePlan._id, status: 'trial',
    startDate: new Date(), endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    trialStartDate: new Date(), trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
  });

  // Seed categories
  const categories = await Category.insertMany([
    { name: 'Electronics', description: 'Electronic devices and accessories', businessId: business._id, status: 'active', createdBy: user._id },
    { name: 'Groceries', description: 'Food and daily essentials', businessId: business._id, status: 'active', createdBy: user._id },
    { name: 'Clothing', description: 'Apparel and fashion', businessId: business._id, status: 'active', createdBy: user._id },
    { name: 'Stationery', description: 'Office and school supplies', businessId: business._id, status: 'active', createdBy: user._id },
    { name: 'Household', description: 'Home and kitchen items', businessId: business._id, status: 'active', createdBy: user._id },
  ]);

  // Seed products (15)
  const products = await Product.insertMany([
    { name: 'Wireless Mouse', sku: 'WM-001', categoryId: categories[0]._id, brand: 'Logitech', purchasePrice: 350, sellingPrice: 599, taxRate: 18, unit: 'pcs', currentStock: 50, minimumStock: 10, businessId: business._id, createdBy: user._id },
    { name: 'USB-C Cable', sku: 'UC-001', categoryId: categories[0]._id, brand: 'Anker', purchasePrice: 150, sellingPrice: 299, taxRate: 18, unit: 'pcs', currentStock: 100, minimumStock: 20, businessId: business._id, createdBy: user._id },
    { name: 'Bluetooth Earbuds', sku: 'BE-001', categoryId: categories[0]._id, brand: 'Boat', purchasePrice: 600, sellingPrice: 999, taxRate: 18, unit: 'pcs', currentStock: 30, minimumStock: 5, businessId: business._id, createdBy: user._id },
    { name: 'Power Bank 10000mAh', sku: 'PB-001', categoryId: categories[0]._id, brand: 'Mi', purchasePrice: 700, sellingPrice: 1199, taxRate: 18, unit: 'pcs', currentStock: 25, minimumStock: 5, businessId: business._id, createdBy: user._id },
    { name: 'Basmati Rice 5kg', sku: 'BR-001', categoryId: categories[1]._id, brand: 'India Gate', purchasePrice: 280, sellingPrice: 399, taxRate: 5, unit: 'box', currentStock: 80, minimumStock: 15, businessId: business._id, createdBy: user._id },
    { name: 'Olive Oil 1L', sku: 'OO-001', categoryId: categories[1]._id, brand: 'Fortune', purchasePrice: 250, sellingPrice: 399, taxRate: 5, unit: 'ltr', currentStock: 40, minimumStock: 10, businessId: business._id, createdBy: user._id },
    { name: 'Protein Powder 1kg', sku: 'PP-001', categoryId: categories[1]._id, brand: 'Optimum', purchasePrice: 1500, sellingPrice: 2199, taxRate: 5, unit: 'box', currentStock: 15, minimumStock: 5, businessId: business._id, createdBy: user._id },
    { name: 'Cotton T-Shirt', sku: 'CT-001', categoryId: categories[2]._id, brand: 'H&M', purchasePrice: 300, sellingPrice: 599, taxRate: 12, unit: 'pcs', currentStock: 60, minimumStock: 10, businessId: business._id, createdBy: user._id },
    { name: 'Denim Jeans', sku: 'DJ-001', categoryId: categories[2]._id, brand: 'Levis', purchasePrice: 800, sellingPrice: 1499, taxRate: 12, unit: 'pcs', currentStock: 35, minimumStock: 5, businessId: business._id, createdBy: user._id },
    { name: 'Notebook A4', sku: 'NB-001', categoryId: categories[3]._id, brand: 'Classmate', purchasePrice: 30, sellingPrice: 60, taxRate: 12, unit: 'pcs', currentStock: 200, minimumStock: 50, businessId: business._id, createdBy: user._id },
    { name: 'Gel Pen Pack 10', sku: 'GP-001', categoryId: categories[3]._id, brand: 'Reynolds', purchasePrice: 25, sellingPrice: 50, taxRate: 12, unit: 'box', currentStock: 150, minimumStock: 30, businessId: business._id, createdBy: user._id },
    { name: 'LED Desk Lamp', sku: 'DL-001', categoryId: categories[4]._id, brand: 'Philips', purchasePrice: 400, sellingPrice: 699, taxRate: 18, unit: 'pcs', currentStock: 20, minimumStock: 5, businessId: business._id, createdBy: user._id },
    { name: 'Stainless Steel Bottle 1L', sku: 'SB-001', categoryId: categories[4]._id, brand: 'Milton', purchasePrice: 200, sellingPrice: 350, taxRate: 18, unit: 'pcs', currentStock: 45, minimumStock: 10, businessId: business._id, createdBy: user._id },
    { name: 'Wireless Keyboard', sku: 'WK-001', categoryId: categories[0]._id, brand: 'Logitech', purchasePrice: 500, sellingPrice: 899, taxRate: 18, unit: 'pcs', currentStock: 3, minimumStock: 10, businessId: business._id, createdBy: user._id },
    { name: 'HD Monitor 24"', sku: 'HM-001', categoryId: categories[0]._id, brand: 'Dell', purchasePrice: 8000, sellingPrice: 12999, taxRate: 18, unit: 'pcs', currentStock: 8, minimumStock: 2, businessId: business._id, createdBy: user._id },
  ]);

  business.usage.productsUsed = products.length;
  await business.save();

  // Seed customers (7)
  const customers = await Customer.insertMany([
    { name: 'Rahul Sharma', phone: '9876543201', email: 'rahul@email.com', address: 'Andheri West, Mumbai', balance: 0, status: 'active', businessId: business._id, createdBy: user._id },
    { name: 'Priya Patel', phone: '9876543202', email: 'priya@email.com', address: 'Bandra East, Mumbai', balance: 0, status: 'active', businessId: business._id, createdBy: user._id },
    { name: 'Amit Kumar', phone: '9876543203', email: 'amit@email.com', address: 'Powai, Mumbai', gstNumber: '27AABCU9603R1ZP', balance: 0, status: 'active', businessId: business._id, createdBy: user._id },
    { name: 'Sneha Reddy', phone: '9876543204', email: 'sneha@email.com', address: 'Vashi, Navi Mumbai', balance: 0, status: 'active', businessId: business._id, createdBy: user._id },
    { name: 'Vikram Singh', phone: '9876543205', email: 'vikram@email.com', address: 'Thane West, Thane', balance: 0, status: 'active', businessId: business._id, createdBy: user._id },
    { name: 'Kavita Desai', phone: '9876543206', email: 'kavita@email.com', address: 'Dadar West, Mumbai', balance: 0, status: 'active', businessId: business._id, createdBy: user._id },
    { name: 'Sanjay Gupta', phone: '9876543207', email: 'sanjay@email.com', address: 'Malad West, Mumbai', gstNumber: '27AABCG1234R1ZQ', balance: 0, status: 'active', businessId: business._id, createdBy: user._id },
  ]);

  // Seed suppliers (4)
  const suppliers = await Supplier.insertMany([
    { name: 'Rajesh Trading Co.', company: 'Rajesh Trading', phone: '9988776601', email: 'rajesh@trading.com', address: 'Wholesale Market, Mumbai', balance: 0, status: 'active', businessId: business._id, createdBy: user._id },
    { name: 'Deepak Electronics', company: 'Deepak Electronics Pvt Ltd', phone: '9988776602', email: 'deepak@electronics.com', address: 'Lamington Road, Mumbai', gstNumber: '27AABCD5678R1ZM', balance: 0, status: 'active', businessId: business._id, createdBy: user._id },
    { name: 'Meera Distributors', company: 'Meera Distributors', phone: '9988776603', email: 'meera@dist.com', address: 'Bhiwandi, Thane', balance: 0, status: 'active', businessId: business._id, createdBy: user._id },
  ]);

  // Seed sales (12)
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const saleDate = new Date(now);
    saleDate.setDate(saleDate.getDate() - daysAgo);
    const dateStr = saleDate.getFullYear().toString() + String(saleDate.getMonth() + 1).padStart(2, '0') + String(saleDate.getDate()).padStart(2, '0');
    const seq = String(i + 1).padStart(3, '0');

    const numItems = Math.floor(Math.random() * 3) + 1;
    const items = [];
    let subtotal = 0;

    for (let j = 0; j < numItems; j++) {
      const prod = products[Math.floor(Math.random() * products.length)];
      const qty = Math.floor(Math.random() * 3) + 1;
      const lineTotal = prod.sellingPrice * qty;
      const taxAmount = lineTotal * (prod.taxRate / 100);
      items.push({
        productId: prod._id, productName: prod.name, quantity: qty,
        unitPrice: prod.sellingPrice, discount: 0, taxRate: prod.taxRate,
        taxAmount, total: lineTotal + taxAmount,
      });
      subtotal += lineTotal;
    }

    const totalTax = items.reduce((s, it) => s + it.taxAmount, 0);
    const total = subtotal + totalTax;
    const methods = ['cash', 'upi', 'card', 'credit'];
    const method = methods[Math.floor(Math.random() * methods.length)];
    const isCredit = method === 'credit';

    await Sale.create({
      invoiceNumber: `INV-${dateStr}-${seq}`,
      customerId: customers[Math.floor(Math.random() * customers.length)]._id,
      items, subtotal, discount: 0, taxAmount: totalTax, total,
      amountPaid: isCredit ? 0 : total,
      amountDue: isCredit ? total : 0,
      paymentMethod: method,
      status: isCredit ? 'credit' : 'completed',
      businessId: business._id, createdBy: user._id,
      createdAt: saleDate,
    });
  }

  // Seed purchases (6)
  for (let i = 0; i < 6; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const purchaseDate = new Date(now);
    purchaseDate.setDate(purchaseDate.getDate() - daysAgo);

    const numItems = Math.floor(Math.random() * 3) + 1;
    const items = [];
    let subtotal = 0;

    for (let j = 0; j < numItems; j++) {
      const prod = products[Math.floor(Math.random() * products.length)];
      const qty = Math.floor(Math.random() * 20) + 5;
      const lineTotal = prod.purchasePrice * qty;
      const taxAmount = lineTotal * 0.18;
      items.push({
        productId: prod._id, productName: prod.name, quantity: qty,
        unitPrice: prod.purchasePrice, taxRate: 18, taxAmount, total: lineTotal + taxAmount,
      });
      subtotal += lineTotal;
    }

    const totalTax = items.reduce((s, it) => s + it.taxAmount, 0);
    const total = subtotal + totalTax;

    await Purchase.create({
      supplierId: suppliers[Math.floor(Math.random() * suppliers.length)]._id,
      items, subtotal, taxAmount: totalTax, total,
      amountPaid: total, amountDue: 0, paymentMethod: 'cash', status: 'completed',
      businessId: business._id, createdBy: user._id, createdAt: purchaseDate,
    });
  }

  // Seed expenses (8)
  const expenseCategories = ['rent', 'electricity', 'salary', 'transport', 'internet', 'maintenance', 'marketing', 'other'];
  const amounts = [25000, 3500, 45000, 2000, 999, 1500, 5000, 1200];
  const descriptions = ['Shop rent', 'Electricity bill', 'Staff salary', 'Delivery charges', 'WiFi bill', 'Shop cleaning', 'Social media ads', 'Miscellaneous'];

  for (let i = 0; i < 8; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const expenseDate = new Date(now);
    expenseDate.setDate(expenseDate.getDate() - daysAgo);

    await Expense.create({
      category: expenseCategories[i], amount: amounts[i],
      date: expenseDate, paymentMethod: 'bank_transfer',
      description: descriptions[i], businessId: business._id, createdBy: user._id,
    });
  }

  console.log('Demo business created: demo@StoreX.com / Demo@123');
  console.log('  - 5 categories, 15 products, 7 customers, 3 suppliers');
  console.log('  - 12 sales, 6 purchases, 8 expenses');
  return user;
};

const seed = async () => {
  try {
    console.log('🌱 Seeding database...');
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB');

    const plans = await seedPlans();
    await seedSuperAdmin();
    await seedDemoBusiness(plans);

    console.log('\n✅ Seeding completed!\n');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();
