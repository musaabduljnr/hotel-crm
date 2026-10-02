const express = require('express');
const router = express.Router();
const { getFeedback, getFeedbackSummary, createFeedback } = require('../controllers/feedbackController');
const { requireAuth, requireAnyRole } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', requireAnyRole(['admin', 'manager', 'receptionist', 'staff']), getFeedback);
router.get('/summary', requireAnyRole(['admin', 'manager']), getFeedbackSummary);
router.post('/', requireAnyRole(['admin', 'manager', 'receptionist', 'staff']), createFeedback);

module.exports = router;
