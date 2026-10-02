const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/adminController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.get('/stats', requireAuth, requireAdmin, getStats);

module.exports = router;
