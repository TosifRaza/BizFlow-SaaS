const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { verifyToken, requirePermission } = require('../middlewares/auth');
const { setTenant } = require('../middlewares/tenant');

router.use(verifyToken, setTenant);
router.get('/', requirePermission('reports.view'), auditController.getLogs);

module.exports = router;
