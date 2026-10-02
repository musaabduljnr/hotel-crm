const express = require('express');
const router = express.Router();
const { searchGuests, getGuestDashboard } = require('../controllers/guestCrmController');
const { requireAuth, requireAnyRole } = require('../middleware/auth');

router.use(requireAuth);

router.get('/search', requireAnyRole(['admin', 'manager', 'receptionist', 'staff']), searchGuests);
router.get('/:id/dashboard', requireAnyRole(['admin', 'manager', 'receptionist', 'staff']), getGuestDashboard);

module.exports = router;
