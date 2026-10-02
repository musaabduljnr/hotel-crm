const express = require('express');
const router = express.Router();
const { getComplaints, createComplaint, respondToComplaint } = require('../controllers/complaintController');
const { requireAuth, requireAnyRole } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', requireAnyRole(['admin', 'manager', 'receptionist', 'staff']), getComplaints);
router.post('/', requireAnyRole(['admin', 'manager', 'receptionist', 'staff']), createComplaint);
router.put('/:id/respond', requireAnyRole(['admin', 'manager', 'receptionist']), respondToComplaint);

module.exports = router;
