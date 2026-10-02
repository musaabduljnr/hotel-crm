const express = require('express');
const router = express.Router();
const { getRoomHousekeeping, updateRoomHousekeeping } = require('../controllers/housekeepingController');
const { getMaintenanceTickets, createMaintenanceTicket, updateMaintenanceTicket } = require('../controllers/maintenanceController');
const { requireAuth, requireAnyRole } = require('../middleware/auth');

router.use(requireAuth);

router.get('/housekeeping', requireAnyRole(['admin', 'manager', 'receptionist', 'staff']), getRoomHousekeeping);
router.put('/housekeeping/:id', requireAnyRole(['admin', 'manager', 'receptionist']), updateRoomHousekeeping);

router.get('/maintenance', requireAnyRole(['admin', 'manager', 'receptionist', 'staff']), getMaintenanceTickets);
router.post('/maintenance', requireAnyRole(['admin', 'manager', 'receptionist', 'staff']), createMaintenanceTicket);
router.put('/maintenance/:id', requireAnyRole(['admin', 'manager', 'receptionist']), updateMaintenanceTicket);

module.exports = router;
