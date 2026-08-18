// const express = require('express');
// const router = express.Router();
// const businessController = require('../controllers/businessController');
// const { verifyToken } = require('../middlewares/auth');
// const { setTenant } = require('../middlewares/tenant');

// router.use(verifyToken, setTenant);
// router.get('/', businessController.getBusiness);
// router.put('/', businessController.updateBusiness);
// router.put('/settings', businessController.updateSettings);
// router.post('/logo', businessController.updateLogo);
// router.get('/stats', businessController.getBusinessStats);
// router.put('/deactivate', businessController.deactivateBusiness);
// router.delete('/', businessController.deleteBusiness);

// module.exports = router;
const express = require('express');
const router = express.Router();
const businessController = require('../controllers/businessController');
const { verifyToken, requirePermission } = require('../middlewares/auth');
const { setTenant } = require('../middlewares/tenant');

router.use(verifyToken, setTenant);
router.get('/', businessController.getBusiness);
router.get('/stats', businessController.getBusinessStats);
router.put('/', requirePermission('settings.update'), businessController.updateBusiness);
router.put('/settings', requirePermission('settings.update'), businessController.updateSettings);
router.post('/logo', requirePermission('settings.update'), businessController.updateLogo);
router.put('/deactivate', requirePermission('settings.update'), businessController.deactivateBusiness);
router.delete('/', requirePermission('settings.update'), businessController.deleteBusiness);

module.exports = router;
