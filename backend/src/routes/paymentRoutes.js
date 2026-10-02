const express = require('express');
const router = express.Router();
const { getPayments, createPayment, updatePaymentStatus } = require('../controllers/paymentController');
const { requireAuth, requireAnyRole } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', requireAnyRole(['admin', 'manager', 'receptionist']), getPayments);
router.post('/', requireAnyRole(['admin', 'manager', 'receptionist']), createPayment);
router.put('/:id/status', requireAnyRole(['admin', 'manager', 'receptionist']), updatePaymentStatus);

module.exports = router;
