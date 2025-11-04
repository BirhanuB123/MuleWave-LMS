const express = require('express');
const Router = express.Router();
const {
  createPayment,
  executePayment,
  getMyPayments
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

Router.post('/create', protect, createPayment);
Router.post('/execute', protect, executePayment);
Router.get('/', protect, getMyPayments);

module.exports = Router;

