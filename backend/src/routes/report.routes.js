const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifyToken, requirePermission } = require('../middlewares/auth');
const { setTenant } = require('../middlewares/tenant');

router.use(verifyToken, setTenant);
router.get('/sales', requirePermission('reports.view'), reportController.salesReport);
router.get('/inventory', requirePermission('reports.view'), reportController.inventoryReport);
router.get('/customers', requirePermission('reports.view'), reportController.customerReport);
router.get('/suppliers', requirePermission('reports.view'), reportController.supplierReport);
router.get('/expenses', requirePermission('reports.view'), reportController.expenseReport);
router.get('/profit-loss', requirePermission('reports.view'), reportController.profitLossReport);

module.exports = router;
