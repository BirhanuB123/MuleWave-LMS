const express = require('express');
const router = express.Router();
const {
  createPayment,
  executePayment,
  getMyPayments
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.post('/create', protect, createPayment);
router.post('/execute', protect, executePayment);
router.get('/', protect, getMyPayments);

module.exports = router;

