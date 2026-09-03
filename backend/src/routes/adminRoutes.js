const express = require('express');
const { getAllBookings, getRevenueReport } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.use(protect, adminOnly);

router.get('/bookings', getAllBookings);
router.get('/revenue', getRevenueReport);

module.exports = router;
