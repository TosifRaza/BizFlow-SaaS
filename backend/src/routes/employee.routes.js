// // const express = require('express');
// // const router = express.Router();
// // const employeeController = require('../controllers/employeeController');
// // const { verifyToken, requirePermission } = require('../middlewares/auth');
// // const { setTenant } = require('../middlewares/tenant');

// // router.use(verifyToken, setTenant);
// // router.get('/', requirePermission('employees.view'), employeeController.getAll);
// // router.get('/stats', requirePermission('employees.view'), employeeController.getStats);
// // router.get('/:id', requirePermission('employees.view'), employeeController.getById);
// // router.post('/', requirePermission('employees.create'), employeeController.create);
// // router.put('/:id', requirePermission('employees.update'), employeeController.update);
// // router.put('/:id/deactivate', requirePermission('employees.update'), employeeController.deactivate);
// // router.delete('/:id', requirePermission('employees.delete'), employeeController.delete);

// // module.exports = router;
// const express = require('express');
// const router = express.Router();
// const employeeController = require('../controllers/employeeController');
// const { verifyToken, requirePermission } = require('../middlewares/auth');
// const { setTenant } = require('../middlewares/tenant');

// router.use(verifyToken, setTenant);
// router.get('/', requirePermission('employees.view'), employeeController.getAll);
// router.get('/stats', requirePermission('employees.view'), employeeController.getStats);
// router.get('/:id', requirePermission('employees.view'), employeeController.getById);
// router.post('/', requirePermission('employees.create'), employeeController.create);
// router.put('/:id', requirePermission('employees.update'), employeeController.update);
// router.put('/:id/deactivate', requirePermission('employees.update'), employeeController.deactivate);
// router.put('/:id/reset-password', requirePermission('employees.update'), employeeController.resetPassword);
// router.delete('/:id', requirePermission('employees.delete'), employeeController.delete);

// module.exports = router;
const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { verifyToken, requirePermission } = require('../middlewares/auth');
const { setTenant } = require('../middlewares/tenant');

router.use(verifyToken, setTenant);
router.get('/', requirePermission('employees.view'), employeeController.getAll);
router.get('/stats', requirePermission('employees.view'), employeeController.getStats);
router.get('/:id', requirePermission('employees.view'), employeeController.getById);
router.post('/', requirePermission('employees.create'), employeeController.create);
router.put('/:id', requirePermission('employees.update'), employeeController.update);
router.put('/:id/deactivate', requirePermission('employees.update'), employeeController.deactivate);
router.put('/:id/reset-password', requirePermission('employees.update'), employeeController.resetPassword);
router.delete('/:id', requirePermission('employees.delete'), employeeController.delete);

module.exports = router;