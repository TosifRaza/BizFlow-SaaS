const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const businessRoutes = require('./business.routes');
const productRoutes = require('./product.routes');
const categoryRoutes = require('./category.routes');
const inventoryRoutes = require('./inventory.routes');
const customerRoutes = require('./customer.routes');
const supplierRoutes = require('./supplier.routes');
const saleRoutes = require('./sale.routes');
const purchaseRoutes = require('./purchase.routes');
const expenseRoutes = require('./expense.routes');
const employeeRoutes = require('./employee.routes');
const roleRoutes = require('./role.routes');
const notificationRoutes = require('./notification.routes');
const reportRoutes = require('./report.routes');
const dashboardRoutes = require('./dashboard.routes');
const subscriptionRoutes = require('./subscription.routes');
const adminRoutes = require('./admin.routes');
const uploadRoutes = require('./upload.routes');
const branchRoutes = require('./branch.routes');
const auditRoutes = require('./audit.routes');
const { checkSubscription } = require('../middlewares/subscription');

router.use('/auth', authRoutes);
router.use('/business', businessRoutes);
router.use('/products', checkSubscription, productRoutes);
router.use('/categories', checkSubscription, categoryRoutes);
router.use('/inventory', checkSubscription, inventoryRoutes);
router.use('/customers', checkSubscription, customerRoutes);
router.use('/suppliers', checkSubscription, supplierRoutes);
router.use('/sales', checkSubscription, saleRoutes);
router.use('/purchases', checkSubscription, purchaseRoutes);
router.use('/expenses', checkSubscription, expenseRoutes);
router.use('/employees', checkSubscription, employeeRoutes);
router.use('/roles', checkSubscription, roleRoutes);
router.use('/notifications', checkSubscription, notificationRoutes);
router.use('/reports', checkSubscription, reportRoutes);
router.use('/dashboard', checkSubscription, dashboardRoutes);
router.use('/subscription', subscriptionRoutes);
router.use('/admin', adminRoutes);
router.use('/upload', checkSubscription, uploadRoutes);
router.use('/branches', checkSubscription, branchRoutes);
router.use('/audit', checkSubscription, auditRoutes);

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server is running', timestamp: new Date().toISOString() });
});

module.exports = router;
