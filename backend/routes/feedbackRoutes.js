const express = require('express');
const router = express.Router();
const { getFeedback, getFeedbackSummary, createFeedback } = require('../controllers/feedbackController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', getFeedback);
router.get('/summary', getFeedbackSummary);
router.post('/', createFeedback);

module.exports = router;
