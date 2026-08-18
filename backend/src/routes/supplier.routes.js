const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const { verifyToken, requirePermission } = require('../middlewares/auth');
const { setTenant } = require('../middlewares/tenant');

router.use(verifyToken, setTenant);
router.get('/', requirePermission('suppliers.view'), supplierController.getAll);
router.get('/stats', requirePermission('suppliers.view'), supplierController.getStats);
router.get('/:id', requirePermission('suppliers.view'), supplierController.getById);
router.get('/:id/ledger', requirePermission('suppliers.view'), supplierController.getLedger);
router.post('/', requirePermission('suppliers.create'), supplierController.create);
router.put('/:id', requirePermission('suppliers.update'), supplierController.update);
router.delete('/:id', requirePermission('suppliers.delete'), supplierController.delete);
router.post('/:id/payment', requirePermission('suppliers.update'), supplierController.recordPayment);

module.exports = router;
