const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { verifyToken, requirePermission } = require('../middlewares/auth');
const { setTenant } = require('../middlewares/tenant');

router.use(verifyToken, setTenant);
router.get('/', requirePermission('customers.view'), customerController.getAll);
router.get('/stats', requirePermission('customers.view'), customerController.getStats);
router.get('/:id', requirePermission('customers.view'), customerController.getById);
router.get('/:id/ledger', requirePermission('customers.view'), customerController.getLedger);
router.post('/', requirePermission('customers.create'), customerController.create);
router.put('/:id', requirePermission('customers.update'), customerController.update);
router.delete('/:id', requirePermission('customers.delete'), customerController.delete);
router.post('/:id/payment', requirePermission('customers.update'), customerController.recordPayment);

module.exports = router;
