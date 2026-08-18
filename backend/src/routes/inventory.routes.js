const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { verifyToken, requirePermission } = require('../middlewares/auth');
const { setTenant } = require('../middlewares/tenant');
const { setBranchFilter } = require('../middlewares/branch');

router.use(verifyToken, setTenant, setBranchFilter);
router.get('/stock', requirePermission('inventory.view'), inventoryController.getStock);
router.get('/movements', requirePermission('inventory.view'), inventoryController.getMovements);
router.post('/adjust', requirePermission('inventory.adjust'), inventoryController.adjustStock);
router.get('/low-stock', requirePermission('inventory.view'), inventoryController.getLowStock);
router.get('/stock-value', requirePermission('inventory.view'), inventoryController.getStockValue);
router.post('/transfer', requirePermission('inventory.transfer'), inventoryController.transferStock);

module.exports = router;
