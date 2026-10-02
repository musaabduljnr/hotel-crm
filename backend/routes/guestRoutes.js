const express = require('express');
const router = express.Router();
const { getGuests, getGuestById, createGuest, updateGuest, deleteGuest } = require('../controllers/guestController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth); // every guest-management route requires a logged-in staff/admin user

router.get('/', getGuests);
router.get('/:id', getGuestById);
router.post('/', createGuest);
router.put('/:id', updateGuest);
router.delete('/:id', deleteGuest);

module.exports = router;
