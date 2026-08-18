const express = require('express');
const router = express.Router();
const saleController = require('../controllers/saleController');
const { verifyToken, requirePermission } = require('../middlewares/auth');
const { setTenant } = require('../middlewares/tenant');
const { setBranchFilter } = require('../middlewares/branch');
const validate = require('../middlewares/validate');

router.use(verifyToken, setTenant, setBranchFilter);
router.get('/', requirePermission('sales.view'), saleController.getAll);
router.get('/invoice/:invoiceNumber', requirePermission('sales.view'), saleController.getInvoiceData);
router.get('/:id/pdf', requirePermission('sales.view'), saleController.downloadInvoicePDF);
router.get('/:id', requirePermission('sales.view'), saleController.getById);
router.post('/', requirePermission('sales.create'), validate({
  items: { required: true, message: 'Sale items are required' },
}), saleController.create);
router.post('/:id/payment', requirePermission('sales.create'), validate({
  amount: { required: true, min: 0, message: 'Payment amount is required and must be positive' },
}), saleController.recordPayment);
router.put('/:id/void', requirePermission('sales.void'), saleController.voidSale);
router.post('/:id/return', requirePermission('sales.return'), saleController.returnSale);

module.exports = router;