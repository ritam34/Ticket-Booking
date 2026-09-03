// A pending_payment booking that's older than this is considered abandoned.
// The Redis seat-hold already self-expires at SEAT_LOCK_TTL_SECONDS (5 min),
// freeing the seat for others — this is the separate, slightly longer window
// after which we stop treating the Booking *record itself* as payable, so
// stale entries don't linger forever and block a user's pending-booking cap.
const PENDING_BOOKING_TTL_MINUTES = 10;

function isStalePending(booking) {
  if (booking.status !== 'pending_payment') return false;
  const ageMinutes = (Date.now() - new Date(booking.createdAt).getTime()) / 60000;
  return ageMinutes > PENDING_BOOKING_TTL_MINUTES;
}

module.exports = { PENDING_BOOKING_TTL_MINUTES, isStalePending };