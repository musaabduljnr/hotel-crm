const express = require('express');
const router = express.Router();
const { getComplaints, createComplaint, respondToComplaint } = require('../controllers/complaintController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', getComplaints);
router.post('/', createComplaint);
router.put('/:id/respond', respondToComplaint);

module.exports = router;
