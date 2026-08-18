const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { verifyToken, requirePermission } = require('../middlewares/auth');
const { setTenant } = require('../middlewares/tenant');

router.use(verifyToken, setTenant);
router.get('/', requirePermission('notifications.view'), notificationController.getAll);
router.get('/unread-count', requirePermission('notifications.view'), notificationController.getUnreadCount);
router.put('/:id/read', requirePermission('notifications.view'), notificationController.markRead);
router.put('/mark-all-read', requirePermission('notifications.view'), notificationController.markAllRead);

module.exports = router;
