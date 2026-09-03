const Schedule = require('../models/Schedule');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const razorpayInstance = require('../config/razorpay');
const { lockSeats, releaseSeats, verifyLock, extendLock, LOCK_TTL } = require('../utils/seatLock');
const { PENDING_BOOKING_TTL_MINUTES } = require('../utils/bookingExpiry');
const MAX_PENDING_BOOKINGS = 3;

// POST /api/bookings/lock-seats
// Body: { scheduleId, classType, seatNumbers: [12, 13], passengers: [...] }
// Locks seats in Redis and creates a pending_payment Booking doc.
exports.lockSeatsForBooking = async (req, res, next) => {
  try {
    const { scheduleId, classType, seatNumbers, passengers } = req.body;

    if (!scheduleId || !classType || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
      return res.status(400).json({ message: 'scheduleId, classType and seatNumbers[] are required' });
    }
    if (!Array.isArray(passengers) || passengers.length !== seatNumbers.length) {
      return res.status(400).json({ message: 'One passenger record is required per seat' });
    }

    // Clear out this user's abandoned pending bookings first (older than the
    // TTL window), then cap how many payments they can have in flight at once
    // — this is what "Booking is not awaiting payment" used to leave stuck.
    const staleCutoff = new Date(Date.now() - PENDING_BOOKING_TTL_MINUTES * 60000);
    await Booking.updateMany(
      { user: req.user._id, status: 'pending_payment', createdAt: { $lt: staleCutoff } },
      { $set: { status: 'expired' } }
    );
    const pendingCount = await Booking.countDocuments({ user: req.user._id, status: 'pending_payment' });
    if (pendingCount >= MAX_PENDING_BOOKINGS) {
      return res.status(409).json({
        message: `You have ${MAX_PENDING_BOOKINGS} payments pending already. Please complete or cancel one from My Bookings before starting another.`,
      });
    }

    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });

    const classInfo = schedule.seatAvailability.find((c) => c.type === classType);
    if (!classInfo) return res.status(400).json({ message: `Class ${classType} not available on this train` });

    // Guard against seat numbers outside the valid range for this class
    const invalidSeat = seatNumbers.find((s) => s < 1 || s > classInfo.totalSeats);
    if (invalidSeat) {
      return res.status(400).json({ message: `Seat ${invalidSeat} is out of range (1-${classInfo.totalSeats})` });
    }

    // Reject any seat that's already permanently booked by a confirmed booking —
    // this is the check that was previously missing, allowing already-booked
    // seats to be re-selected and re-booked once their Redis lock had cleared.
    const alreadyBooked = seatNumbers.find((s) => classInfo.bookedSeatNumbers.includes(s));
    if (alreadyBooked) {
      return res.status(409).json({ message: `Seat ${alreadyBooked} is already booked. Please pick a different seat.` });
    }

    // Also reject seats someone (anyone) is actively mid-checkout for, even if
    // their Redis lock has since expired — the booking record itself is the
    // real hold for the full 10-minute window (see bookingExpiry.js), Redis is
    // just a fast first line of defense for the first 5 minutes of it.
    const activeCutoff = new Date(Date.now() - PENDING_BOOKING_TTL_MINUTES * 60000);
    const conflicting = await Booking.findOne({
      schedule: scheduleId,
      classType,
      status: 'pending_payment',
      createdAt: { $gte: activeCutoff },
      'passengers.seatNumber': { $in: seatNumbers },
    });
    if (conflicting) {
      return res.status(409).json({
        message: 'One or more selected seats are currently being paid for by another booking. Please try again shortly or pick different seats.',
      });
    }

    // Atomic, all-or-nothing lock attempt in Redis
    const lockResult = await lockSeats(scheduleId, classType, seatNumbers);
    if (!lockResult.success) {
      return res.status(409).json({
        message: `Seat ${lockResult.failedSeats[0]} was just taken by another user. Please pick different seats.`,
      });
    }

    const totalFare = classInfo.fare * seatNumbers.length;

    const booking = await Booking.create({
      user: req.user._id,
      schedule: scheduleId,
      classType,
      passengers: passengers.map((p, idx) => ({ ...p, seatNumber: seatNumbers[idx] })),
      totalFare,
      status: 'pending_payment',
      lockToken: lockResult.lockToken,
    });

    res.status(201).json({
      booking,
      lockToken: lockResult.lockToken,
      lockExpiresInSeconds: LOCK_TTL,
      message: `Seats reserved for ${LOCK_TTL / 60} minutes. Complete payment to confirm.`,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/bookings/:id/release
// Called if user abandons checkout/payment before completing it.
exports.releaseBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (String(booking.user) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not your booking' });
    }
    if (booking.status !== 'pending_payment') {
      return res.status(400).json({ message: 'Only pending bookings can be released' });
    }

    const seatNumbers = booking.passengers.map((p) => p.seatNumber);
    await releaseSeats(booking.schedule, booking.classType, seatNumbers, booking.lockToken);

    booking.status = 'expired';
    await booking.save();

    res.json({ message: 'Seats released' });
  } catch (err) {
    next(err);
  }
};

// GET /api/bookings/my
exports.getMyBookings = async (req, res, next) => {
  try {
    const staleCutoff = new Date(Date.now() - PENDING_BOOKING_TTL_MINUTES * 60000);
    await Booking.updateMany(
      { user: req.user._id, status: 'pending_payment', createdAt: { $lt: staleCutoff } },
      { $set: { status: 'expired' } }
    );

    const bookings = await Booking.find({ user: req.user._id })
      .populate({ path: 'schedule', populate: { path: 'train' } })
      .sort('-createdAt');
    res.json({ bookings });
  } catch (err) {
    next(err);
  }
};

// GET /api/bookings/pnr/:pnr
exports.getBookingByPNR = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ pnr: req.params.pnr }).populate({
      path: 'schedule',
      populate: { path: 'train' },
    });
    if (!booking) return res.status(404).json({ message: 'No booking found for this PNR' });
    res.json({ booking });
  } catch (err) {
    next(err);
  }
};

// POST /api/bookings/:id/cancel
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (String(booking.user) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not your booking' });
    }
    if (booking.status !== 'confirmed') {
      return res.status(400).json({ message: 'Only confirmed bookings can be cancelled' });
    }

    // Simple time-based refund policy: >24h before departure = full refund,
    // otherwise partial. (Departure datetime comparison simplified for demo.)
    const schedule = await Schedule.findById(booking.schedule);
    const hoursToDeparture = (new Date(`${schedule.date}T${schedule.departureTime}`) - new Date()) / 36e5;
    const refundPercent = hoursToDeparture > 24 ? 1 : hoursToDeparture > 4 ? 0.5 : 0;
    const refundAmount = Math.round(booking.totalFare * refundPercent);

    if (refundAmount > 0) {
      const payment = await Payment.findOne({ booking: booking._id, status: 'paid' });
      if (payment?.razorpayPaymentId) {
        try {
          await razorpayInstance.payments.refund(payment.razorpayPaymentId, {
            amount: refundAmount * 100,
            notes: { reason: 'user_cancellation', bookingId: String(booking._id) },
          });
          payment.status = 'refunded';
          await payment.save();
        } catch (refundErr) {
          console.error('Refund failed, needs manual follow-up:', refundErr.message);
          return next(refundErr);
        }
      }
    }

    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.refundAmount = refundAmount;
    await booking.save();

    // Free up these exact seats so they can be booked by someone else — pulling
    // from bookedSeatNumbers (the real record) rather than only decrementing a
    // count, which is what let cancelled/expired seats become permanently stuck.
    const seatNumbers = booking.passengers.map((p) => p.seatNumber);
    await Schedule.updateOne(
      { _id: booking.schedule, 'seatAvailability.type': booking.classType },
      {
        $pull: { 'seatAvailability.$[elem].bookedSeatNumbers': { $in: seatNumbers } },
        $inc: { 'seatAvailability.$[elem].bookedSeats': -seatNumbers.length },
      },
      { arrayFilters: [{ 'elem.type': booking.classType }] }
    );

    res.json({ message: 'Booking cancelled', refundAmount, booking });
  } catch (err) {
    next(err);
  }
};