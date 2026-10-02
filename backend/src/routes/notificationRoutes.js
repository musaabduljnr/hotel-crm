const express = require('express');
const router = express.Router();
const { getNotifications, createNotification } = require('../controllers/notificationController');
const { requireAuth, requireAnyRole } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', requireAnyRole(['admin', 'manager', 'receptionist', 'staff']), getNotifications);
router.post('/', requireAnyRole(['admin', 'manager', 'receptionist']), createNotification);

module.exports = router;
