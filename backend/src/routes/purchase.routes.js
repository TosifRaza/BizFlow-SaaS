const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');
const { verifyToken, requirePermission } = require('../middlewares/auth');
const { setTenant } = require('../middlewares/tenant');
const { setBranchFilter } = require('../middlewares/branch');

router.use(verifyToken, setTenant, setBranchFilter);
router.get('/', requirePermission('purchases.view'), purchaseController.getAll);
router.get('/:id', requirePermission('purchases.view'), purchaseController.getById);
router.post('/', requirePermission('purchases.create'), purchaseController.create);
router.post('/:id/payment', requirePermission('purchases.create'), purchaseController.recordPayment);

module.exports = router;
