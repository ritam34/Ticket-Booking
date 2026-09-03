const express = require('express');
const {
  lockSeatsForBooking,
  releaseBooking,
  getMyBookings,
  getBookingByPNR,
  cancelBooking,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // every booking route requires a logged-in user

router.post('/lock-seats', lockSeatsForBooking);
router.post('/:id/release', releaseBooking);
router.get('/my', getMyBookings);
router.get('/pnr/:pnr', getBookingByPNR);
router.post('/:id/cancel', cancelBooking);

module.exports = router;
