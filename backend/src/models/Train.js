const mongoose = require('mongoose');

const classSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['SL', 'AC3', 'AC2', 'AC1', 'GEN'], required: true },
    totalSeats: { type: Number, required: true },
    fare: { type: Number, required: true },
  },
  { _id: false }
);

const trainSchema = new mongoose.Schema(
  {
    trainNumber: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    source: { type: String, required: true, index: true },
    destination: { type: String, required: true, index: true },
    departureTime: { type: String, required: true }, // "14:30"
    arrivalTime: { type: String, required: true },
    durationMinutes: { type: Number, required: true },
    trainType: { type: String, enum: ['Express', 'Superfast', 'Passenger', 'Rajdhani', 'Shatabdi'], default: 'Express' },
    classes: [classSchema],
    runsOnDays: {
      type: [String],
      enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      default: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
  },
  { timestamps: true }
);

trainSchema.index({ source: 1, destination: 1 });

module.exports = mongoose.model('Train', trainSchema);
