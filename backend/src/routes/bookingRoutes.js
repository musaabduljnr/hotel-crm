const express = require('express');
const router = express.Router();
const { getRooms, getBookings, createBooking, updateBookingStatus } = require('../controllers/bookingController');
const { requireAuth, requireAnyRole } = require('../middleware/auth');

router.use(requireAuth);

router.get('/rooms', requireAnyRole(['admin', 'manager', 'receptionist', 'staff']), getRooms);
router.get('/', requireAnyRole(['admin', 'manager', 'receptionist', 'staff']), getBookings);
router.post('/', requireAnyRole(['admin', 'manager', 'receptionist']), createBooking);
router.put('/:id/status', requireAnyRole(['admin', 'manager', 'receptionist']), updateBookingStatus);

module.exports = router;
