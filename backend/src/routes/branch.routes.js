const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branchController');
const { verifyToken, requirePermission } = require('../middlewares/auth');
const { setTenant } = require('../middlewares/tenant');

router.use(verifyToken, setTenant);
router.get('/', requirePermission('branches.view'), branchController.getAll);
router.get('/:id', requirePermission('branches.view'), branchController.getById);
router.post('/', requirePermission('branches.create'), branchController.create);
router.put('/:id', requirePermission('branches.update'), branchController.update);
router.delete('/:id', requirePermission('branches.delete'), branchController.delete);
router.post('/transfer-stock', requirePermission('inventory.transfer'), branchController.transferStock);

module.exports = router;
