const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/adminController');
const { requireAuth, requireAnyRole } = require('../middleware/auth');

router.get('/stats', requireAuth, requireAnyRole(['admin', 'manager']), getStats);

module.exports = router;
