const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const featureFlagController = require('../controllers/featureFlagController');
const supportController = require('../controllers/supportController');
const platformSettingsController = require('../controllers/platformSettingsController');
const { verifyToken, requireRole } = require('../middlewares/auth');

router.use(verifyToken, requireRole('super_admin'));

// Feature Flags
router.get('/feature-flags', featureFlagController.getAll);
router.post('/feature-flags', featureFlagController.create);
router.put('/feature-flags/:id', featureFlagController.update);
router.put('/feature-flags/:id/toggle', featureFlagController.toggleFlag);
router.delete('/feature-flags/:id', featureFlagController.deleteFlag);

// Support Requests
router.get('/support-requests', supportController.getAll);
router.get('/support-requests/:id', supportController.getById);
router.put('/support-requests/:id', supportController.updateStatus);

// Platform Settings
router.get('/settings/platform', platformSettingsController.getAll);
router.put('/settings/platform', platformSettingsController.update);

// Existing routes
router.get('/dashboard', adminController.getDashboard);
router.get('/businesses', adminController.getBusinesses);
router.get('/businesses/:id', adminController.getBusinessById);
router.put('/businesses/:id/activate', adminController.activateBusiness);
router.put('/businesses/:id/suspend', adminController.suspendBusiness);
router.get('/plans', adminController.getPlans);
router.post('/plans', adminController.createPlan);
router.put('/plans/:id', adminController.updatePlan);
router.get('/subscriptions', adminController.getSubscriptions);
router.get('/payments', adminController.getPayments);
router.get('/audit-logs', adminController.getAuditLogs);
router.get('/users', adminController.getUsers);
router.get('/revenue', adminController.getRevenue);

module.exports = router;
