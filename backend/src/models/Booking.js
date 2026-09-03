const mongoose = require('mongoose');

const passengerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ['M', 'F', 'O'], required: true },
    seatNumber: { type: Number, required: true },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    schedule: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule', required: true },
    classType: { type: String, required: true },
    passengers: [passengerSchema],
    totalFare: { type: Number, required: true },
    pnr: { type: String, unique: true, sparse: true, index: true },
    status: {
      type: String,
      enum: ['pending_payment', 'confirmed', 'cancelled', 'expired'],
      default: 'pending_payment',
    },
    // Distinguishes seats currently reserved via Redis lock (see utils/seatLock.js)
    lockToken: { type: String },
    cancelledAt: { type: Date },
    refundAmount: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
