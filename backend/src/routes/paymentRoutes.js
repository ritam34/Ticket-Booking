const express = require('express');
const { createOrder, verifyPayment, razorpayWebhook } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
// Webhook is called by Razorpay's servers directly - no user JWT, verified via signature instead
router.post('/webhook', razorpayWebhook);

module.exports = router;
