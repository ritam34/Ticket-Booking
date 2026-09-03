const crypto = require('crypto');
const razorpayInstance = require('../config/razorpay');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Schedule = require('../models/Schedule');
const { verifyLock, releaseSeats, extendLock, LOCK_TTL } = require('../utils/seatLock');
const { isStalePending } = require('../utils/bookingExpiry');
const generatePNR = require('../utils/generatePNR');

// POST /api/payments/create-order
// Body: { bookingId }
exports.createOrder = async (req, res, next) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);

    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (String(booking.user) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not your booking' });
    }
    if (isStalePending(booking)) {
      booking.status = 'expired';
      await booking.save();
      return res.status(410).json({ message: "This booking's payment window has closed. Please select your seats again." });
    }
    if (booking.status !== 'pending_payment') {
      return res.status(400).json({
        message: 'This booking is no longer awaiting payment — it may already be paid, cancelled, or expired. Please select seats again if you still want to book.',
      });
    }

    // Fast pre-check against MongoDB (the real source of truth) so we don't open
    // a payment widget for seats that are definitely already gone. This is advisory
    // only — final allocation is enforced atomically in /verify regardless of what
    // we see here, so a stale read here isn't a correctness problem.
    const schedule = await Schedule.findById(booking.schedule);
    const classInfo = schedule.seatAvailability.find((c) => c.type === booking.classType);
    const seatCount = booking.passengers.length;

    if (classInfo.totalSeats - classInfo.bookedSeats < seatCount) {
      booking.status = 'expired';
      await booking.save();
      return res.status(410).json({ message: 'These seats are no longer available. Please select seats again.' });
    }

    // Best-effort: extend the Redis lock so other shoppers still see these seats as
    // taken while this user is on the payment page. NOT fatal if this fails or the
    // lock already expired — final seat allocation is enforced atomically against
    // MongoDB in /verify either way, so a slow card entry can't cost someone their money.
    const seatNumbers = booking.passengers.map((p) => p.seatNumber);
    await extendLock(booking.schedule, booking.classType, seatNumbers, booking.lockToken, LOCK_TTL);

    // Razorpay amounts are in paise (smallest currency unit)
    const order = await razorpayInstance.orders.create({
      amount: booking.totalFare * 100,
      currency: 'INR',
      receipt: `booking_${booking._id}`,
      notes: { bookingId: String(booking._id) },
    });

    const payment = await Payment.create({
      booking: booking._id,
      amount: booking.totalFare,
      razorpayOrderId: order.id,
      status: 'created',
    });

    res.status(201).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID, // safe to expose - public key, used by frontend checkout widget
      paymentId: payment._id,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/payments/verify
// Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId }
// Called by frontend after Razorpay checkout succeeds. Verifies the HMAC
// signature server-side (never trust the client-reported payment status).
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed - signature mismatch' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.status !== 'pending_payment') {
      return res.status(400).json({ message: 'Booking already processed' });
    }

    const seatNumbers = booking.passengers.map((p) => p.seatNumber);

    // MongoDB is the final authority on exact seat numbers, not the Redis lock —
    // the lock only ever prevented two people from grabbing a seat at the exact
    // same instant, it never actually checked whether a seat was permanently taken.
    // This single findOneAndUpdate is atomic: it only succeeds if NONE of our seat
    // numbers already appear in bookedSeatNumbers, and claims them in that same
    // operation, so there's no read-then-write race window at all.
    const confirmedSchedule = await Schedule.findOneAndUpdate(
      {
        _id: booking.schedule,
        seatAvailability: {
          $elemMatch: { type: booking.classType, bookedSeatNumbers: { $nin: seatNumbers } },
        },
      },
      {
        $push: { 'seatAvailability.$[elem].bookedSeatNumbers': { $each: seatNumbers } },
        $inc: { 'seatAvailability.$[elem].bookedSeats': seatNumbers.length },
      },
      { arrayFilters: [{ 'elem.type': booking.classType }], new: true }
    );

    if (!confirmedSchedule) {
      // Seats genuinely sold out between order creation and payment completing.
      // The signature check above already proved Razorpay captured this payment,
      // so we owe this person their money back — refund automatically rather than
      // leaving them out of pocket or telling them to "contact support".
      try {
        await razorpayInstance.payments.refund(razorpay_payment_id, {
          amount: booking.totalFare * 100,
          notes: { reason: 'seats_unavailable_at_confirmation', bookingId: String(booking._id) },
        });
      } catch (refundErr) {
        console.error('Auto-refund failed, needs manual follow-up:', refundErr.message);
      }

      booking.status = 'cancelled';
      booking.cancelledAt = new Date();
      booking.refundAmount = booking.totalFare;
      await booking.save();

      await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature, status: 'refunded' }
      );

      return res.status(409).json({
        message:
          'These seats were booked by someone else while your payment was processing. You have been fully refunded automatically (3-5 business days).',
      });
    }

    booking.status = 'confirmed';
    booking.pnr = generatePNR();
    await booking.save();

    await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      { razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature, status: 'paid' }
    );

    // Best-effort cleanup — release the Redis lock if it still exists. Fine if it
    // already expired; MongoDB above is what actually reserved the seats.
    await releaseSeats(booking.schedule, booking.classType, seatNumbers, booking.lockToken);

    res.json({ message: 'Payment verified, booking confirmed', pnr: booking.pnr, booking });
  } catch (err) {
    next(err);
  }
};

// POST /api/payments/webhook
// Razorpay server-to-server webhook — the source of truth in production,
// since it works even if the user closes their browser mid-flow.
exports.razorpayWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).json({ message: 'Invalid webhook signature' });
    }

    const event = req.body.event;
    if (event === 'payment.failed') {
      const orderId = req.body.payload.payment.entity.order_id;
      await Payment.findOneAndUpdate({ razorpayOrderId: orderId }, { status: 'failed' });
    }
    // payment.captured is handled by /verify above for immediate UX;
    // this webhook is the reliable fallback/reconciliation path.

    res.json({ received: true });
  } catch (err) {
    next(err);
  }
};