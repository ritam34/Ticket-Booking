const express = require('express');
const { downloadTicket } = require('../controllers/ticketController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/:bookingId/pdf', protect, downloadTicket);

module.exports = router;
