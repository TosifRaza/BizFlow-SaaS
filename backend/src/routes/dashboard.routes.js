const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { verifyToken, requirePermission } = require('../middlewares/auth');
const { setTenant } = require('../middlewares/tenant');

router.use(verifyToken, setTenant);
router.get('/stats', requirePermission('dashboard.view'), dashboardController.getDashboardStats);
router.get('/chart-data', requirePermission('dashboard.view'), dashboardController.getChartData);

module.exports = router;
