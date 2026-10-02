const express = require('express');
const router = express.Router();
const { getRooms, getBookings, createBooking, updateBookingStatus } = require('../controllers/bookingController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/rooms', getRooms);
router.get('/', getBookings);
router.post('/', createBooking);
router.put('/:id/status', updateBookingStatus);

module.exports = router;
