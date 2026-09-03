const Train = require('../models/Train');
const Schedule = require('../models/Schedule');
const Booking = require('../models/Booking');
const { PENDING_BOOKING_TTL_MINUTES } = require('../utils/bookingExpiry');

// GET /api/trains/search?source=Howrah&destination=Delhi&date=2026-09-15
exports.searchTrains = async (req, res, next) => {
  try {
    const { source, destination, date } = req.query;
    if (!source || !destination || !date) {
      return res.status(400).json({ message: 'source, destination and date are required' });
    }

    const trains = await Train.find({
      source: new RegExp(`^${source}$`, 'i'),
      destination: new RegExp(`^${destination}$`, 'i'),
    });

    if (trains.length === 0) return res.json({ results: [] });

    const trainIds = trains.map((t) => t._id);
    const schedules = await Schedule.find({
      train: { $in: trainIds },
      date,
      status: 'scheduled',
    }).populate('train');

    const results = schedules.map((s) => ({
      scheduleId: s._id,
      train: {
        id: s.train._id,
        trainNumber: s.train.trainNumber,
        name: s.train.name,
        trainType: s.train.trainType,
      },
      source: s.train.source,
      destination: s.train.destination,
      date: s.date,
      departureTime: s.departureTime,
      arrivalTime: s.arrivalTime,
      durationMinutes: s.train.durationMinutes,
      classes: s.seatAvailability.map((c) => ({
        type: c.type,
        fare: c.fare,
        availableSeats: c.totalSeats - c.bookedSeats,
        totalSeats: c.totalSeats,
      })),
    }));

    res.json({ results });
  } catch (err) {
    next(err);
  }
};

exports.getScheduleById = async (req, res, next) => {
  try {
    const schedule = await Schedule.findById(req.params.id).populate('train');
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });

    // Anyone who has reached the payment step (a non-stale pending_payment
    // booking) should have their seats show as unavailable to everyone else
    // immediately — not just once someone else's lock attempt fails. This is
    // separate from bookedSeatNumbers (confirmed only) so the two seat map's
    // "booked" state matches reality throughout the whole 10-minute window,
    // not just the first 5 minutes of the underlying Redis lock.
    const activeCutoff = new Date(Date.now() - PENDING_BOOKING_TTL_MINUTES * 60000);
    const activePending = await Booking.find({
      schedule: schedule._id,
      status: 'pending_payment',
      createdAt: { $gte: activeCutoff },
    }).select('classType passengers.seatNumber');

    const heldByClass = {};
    for (const b of activePending) {
      if (!heldByClass[b.classType]) heldByClass[b.classType] = [];
      heldByClass[b.classType].push(...b.passengers.map((p) => p.seatNumber));
    }

    const scheduleObj = schedule.toObject();
    scheduleObj.seatAvailability = scheduleObj.seatAvailability.map((c) => ({
      ...c,
      heldSeatNumbers: heldByClass[c.type] || [],
    }));

    res.json({ schedule: scheduleObj });
  } catch (err) {
    next(err);
  }
};

// --- Admin CRUD ---

exports.createTrain = async (req, res, next) => {
  try {
    const train = await Train.create(req.body);
    res.status(201).json({ train });
  } catch (err) {
    next(err);
  }
};

exports.updateTrain = async (req, res, next) => {
  try {
    const train = await Train.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!train) return res.status(404).json({ message: 'Train not found' });
    res.json({ train });
  } catch (err) {
    next(err);
  }
};

exports.deleteTrain = async (req, res, next) => {
  try {
    const train = await Train.findByIdAndDelete(req.params.id);
    if (!train) return res.status(404).json({ message: 'Train not found' });
    res.json({ message: 'Train deleted' });
  } catch (err) {
    next(err);
  }
};

exports.listAllTrains = async (req, res, next) => {
  try {
    const trains = await Train.find().sort('-createdAt');
    res.json({ trains });
  } catch (err) {
    next(err);
  }
};

exports.createSchedule = async (req, res, next) => {
  try {
    const { trainId, date, departureTime, arrivalTime } = req.body;
    const train = await Train.findById(trainId);
    if (!train) return res.status(404).json({ message: 'Train not found' });

    const schedule = await Schedule.create({
      train: trainId,
      date,
      departureTime: departureTime || train.departureTime,
      arrivalTime: arrivalTime || train.arrivalTime,
      seatAvailability: train.classes.map((c) => ({
        type: c.type,
        totalSeats: c.totalSeats,
        bookedSeats: 0,
        bookedSeatNumbers: [],
        fare: c.fare,
      })),
    });

    res.status(201).json({ schedule });
  } catch (err) {
    next(err);
  }
};