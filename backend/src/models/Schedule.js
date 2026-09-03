const mongoose = require('mongoose');

// Tracks per-class seat availability for one train on one specific date.
// availableSeats is decremented only on CONFIRMED bookings (Redis handles
// short-term locking during the booking flow — see utils/seatLock.js).
const seatAvailabilitySchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    totalSeats: { type: Number, required: true },
    bookedSeats: { type: Number, default: 0 },
    // The actual source of truth for which seats are taken. bookedSeats above is
    // a denormalized count kept in sync with this array's length, purely so search
    // results can show "N seats left" without loading the full array.
    bookedSeatNumbers: { type: [Number], default: [] },
    fare: { type: Number, required: true },
  },
  { _id: false }
);

const scheduleSchema = new mongoose.Schema(
  {
    train: { type: mongoose.Schema.Types.ObjectId, ref: 'Train', required: true },
    date: { type: String, required: true, index: true }, // "2026-09-15"
    departureTime: { type: String, required: true },
    arrivalTime: { type: String, required: true },
    seatAvailability: [seatAvailabilitySchema],
    status: { type: String, enum: ['scheduled', 'departed', 'cancelled'], default: 'scheduled' },
  },
  { timestamps: true }
);

scheduleSchema.index({ train: 1, date: 1 }, { unique: true });

scheduleSchema.methods.availableCount = function (classType) {
  const cls = this.seatAvailability.find((c) => c.type === classType);
  return cls ? cls.totalSeats - cls.bookedSeats : 0;
};

module.exports = mongoose.model('Schedule', scheduleSchema);