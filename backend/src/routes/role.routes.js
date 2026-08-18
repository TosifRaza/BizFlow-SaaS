const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { verifyToken, requirePermission } = require('../middlewares/auth');
const { setTenant } = require('../middlewares/tenant');

router.use(verifyToken, setTenant);
router.get('/', requirePermission('roles.view'), roleController.getAll);
router.get('/:id', requirePermission('roles.view'), roleController.getById);
router.post('/', requirePermission('roles.create'), roleController.create);
router.put('/:id', requirePermission('roles.update'), roleController.update);
router.delete('/:id', requirePermission('roles.delete'), roleController.delete);
router.post('/assign', requirePermission('roles.update'), roleController.assignRole);

module.exports = router;
