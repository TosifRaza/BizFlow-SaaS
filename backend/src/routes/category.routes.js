const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { verifyToken, requirePermission } = require('../middlewares/auth');
const { setTenant } = require('../middlewares/tenant');

router.use(verifyToken, setTenant);
router.get('/', requirePermission('categories.view'), categoryController.getAll);
router.get('/:id', requirePermission('categories.view'), categoryController.getById);
router.post('/', requirePermission('categories.create'), categoryController.create);
router.put('/:id', requirePermission('categories.update'), categoryController.update);
router.delete('/:id', requirePermission('categories.delete'), categoryController.delete);

module.exports = router;
