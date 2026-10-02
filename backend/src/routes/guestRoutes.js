const express = require('express');
const router = express.Router();
const { getGuests, getGuestById, createGuest, updateGuest, deleteGuest } = require('../controllers/guestController');
const { requireAuth, requireAnyRole } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', requireAnyRole(['admin', 'manager', 'receptionist', 'staff']), getGuests);
router.get('/:id', requireAnyRole(['admin', 'manager', 'receptionist', 'staff']), getGuestById);
router.post('/', requireAnyRole(['admin', 'manager', 'receptionist', 'staff']), createGuest);
router.put('/:id', requireAnyRole(['admin', 'manager', 'receptionist']), updateGuest);
router.delete('/:id', requireAnyRole(['admin']), deleteGuest);

module.exports = router;
