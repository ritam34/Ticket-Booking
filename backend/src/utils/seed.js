require('dotenv').config();
const mongoose = require('mongoose');
const Train = require('../models/Train');
const Schedule = require('../models/Schedule');
const User = require('../models/User');

const TODAY = new Date();
const dateStr = (offsetDays) => {
  const d = new Date(TODAY);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Clearing existing data...');

  await Promise.all([Train.deleteMany({}), Schedule.deleteMany({}), User.deleteMany({ role: 'admin' })]);

  const admin = await User.create({
    name: 'Admin',
    email: 'admin@trainbooking.com',
    password: 'admin123', // hashed automatically via pre-save hook
    role: 'admin',
  });
  console.log('Admin created: admin@trainbooking.com / admin123');

  const trains = await Train.insertMany([
    {
      trainNumber: '12301',
      name: 'Howrah Rajdhani',
      source: 'Howrah',
      destination: 'New Delhi',
      departureTime: '16:50',
      arrivalTime: '10:05',
      durationMinutes: 1035,
      trainType: 'Rajdhani',
      classes: [
        { type: 'AC1', totalSeats: 24, fare: 4500 },
        { type: 'AC2', totalSeats: 48, fare: 2800 },
        { type: 'AC3', totalSeats: 72, fare: 1900 },
      ],
    },
    {
      trainNumber: '12259',
      name: 'Sealdah Duronto',
      source: 'Sealdah',
      destination: 'New Delhi',
      departureTime: '20:20',
      arrivalTime: '15:00',
      durationMinutes: 1120,
      trainType: 'Superfast',
      classes: [
        { type: 'AC2', totalSeats: 48, fare: 2600 },
        { type: 'AC3', totalSeats: 72, fare: 1750 },
        { type: 'SL', totalSeats: 90, fare: 650 },
      ],
    },
    {
      trainNumber: '12841',
      name: 'Coromandel Express',
      source: 'Howrah',
      destination: 'Chennai',
      departureTime: '14:50',
      arrivalTime: '19:20',
      durationMinutes: 1710,
      trainType: 'Express',
      classes: [
        { type: 'AC3', totalSeats: 72, fare: 1650 },
        { type: 'SL', totalSeats: 90, fare: 580 },
        { type: 'GEN', totalSeats: 120, fare: 220 },
      ],
    },
    {
      trainNumber: '12302',
      name: 'New Delhi Rajdhani',
      source: 'New Delhi',
      destination: 'Howrah',
      departureTime: '17:00',
      arrivalTime: '09:55',
      durationMinutes: 1015,
      trainType: 'Rajdhani',
      classes: [
        { type: 'AC1', totalSeats: 24, fare: 4500 },
        { type: 'AC2', totalSeats: 48, fare: 2800 },
        { type: 'AC3', totalSeats: 72, fare: 1900 },
      ],
    },
    {
      trainNumber: '12951',
      name: 'Mumbai Rajdhani',
      source: 'Mumbai Central',
      destination: 'New Delhi',
      departureTime: '17:00',
      arrivalTime: '08:35',
      durationMinutes: 935,
      trainType: 'Rajdhani',
      classes: [
        { type: 'AC1', totalSeats: 24, fare: 4700 },
        { type: 'AC2', totalSeats: 48, fare: 2950 },
        { type: 'AC3', totalSeats: 72, fare: 2000 },
      ],
    },
    {
      trainNumber: '12009',
      name: 'Shatabdi Express',
      source: 'Mumbai Central',
      destination: 'Ahmedabad',
      departureTime: '06:25',
      arrivalTime: '13:10',
      durationMinutes: 405,
      trainType: 'Shatabdi',
      classes: [
        { type: 'AC2', totalSeats: 48, fare: 1450 },
        { type: 'AC3', totalSeats: 100, fare: 850 },
      ],
    },
    {
      trainNumber: '12002',
      name: 'Bhopal Shatabdi',
      source: 'New Delhi',
      destination: 'Bhopal',
      departureTime: '06:00',
      arrivalTime: '13:30',
      durationMinutes: 450,
      trainType: 'Shatabdi',
      classes: [
        { type: 'AC2', totalSeats: 48, fare: 1550 },
        { type: 'AC3', totalSeats: 100, fare: 900 },
      ],
    },
    {
      trainNumber: '12622',
      name: 'Tamil Nadu Express',
      source: 'New Delhi',
      destination: 'Chennai',
      departureTime: '22:30',
      arrivalTime: '07:15',
      durationMinutes: 1965,
      trainType: 'Superfast',
      classes: [
        { type: 'AC2', totalSeats: 48, fare: 2450 },
        { type: 'AC3', totalSeats: 72, fare: 1700 },
        { type: 'SL', totalSeats: 90, fare: 620 },
      ],
    },
    {
      trainNumber: '12628',
      name: 'Karnataka Express',
      source: 'New Delhi',
      destination: 'Bengaluru',
      departureTime: '20:15',
      arrivalTime: '05:30',
      durationMinutes: 2115,
      trainType: 'Superfast',
      classes: [
        { type: 'AC2', totalSeats: 48, fare: 2550 },
        { type: 'AC3', totalSeats: 72, fare: 1780 },
        { type: 'SL', totalSeats: 90, fare: 640 },
      ],
    },
    {
      trainNumber: '12839',
      name: 'Howrah Chennai Mail',
      source: 'Howrah',
      destination: 'Chennai',
      departureTime: '23:45',
      arrivalTime: '05:40',
      durationMinutes: 1795,
      trainType: 'Express',
      classes: [
        { type: 'AC3', totalSeats: 72, fare: 1600 },
        { type: 'SL', totalSeats: 90, fare: 560 },
        { type: 'GEN', totalSeats: 120, fare: 210 },
      ],
    },
    {
      trainNumber: '12305',
      name: 'Howrah Duronto',
      source: 'Howrah',
      destination: 'New Delhi',
      departureTime: '08:35',
      arrivalTime: '05:30',
      durationMinutes: 1255,
      trainType: 'Superfast',
      classes: [
        { type: 'AC1', totalSeats: 24, fare: 4600 },
        { type: 'AC2', totalSeats: 48, fare: 2900 },
        { type: 'AC3', totalSeats: 72, fare: 1950 },
      ],
    },
    {
      trainNumber: '12423',
      name: 'Dibrugarh Rajdhani',
      source: 'New Delhi',
      destination: 'Dibrugarh',
      departureTime: '15:35',
      arrivalTime: '18:30',
      durationMinutes: 2695,
      trainType: 'Rajdhani',
      classes: [
        { type: 'AC1', totalSeats: 24, fare: 5200 },
        { type: 'AC2', totalSeats: 48, fare: 3300 },
        { type: 'AC3', totalSeats: 72, fare: 2250 },
      ],
    },
    {
      trainNumber: '12435',
      name: 'Dibrugarh Rajdhani (via Guwahati)',
      source: 'Howrah',
      destination: 'Guwahati',
      departureTime: '15:50',
      arrivalTime: '08:10',
      durationMinutes: 985,
      trainType: 'Rajdhani',
      classes: [
        { type: 'AC1', totalSeats: 24, fare: 3900 },
        { type: 'AC2', totalSeats: 48, fare: 2450 },
        { type: 'AC3', totalSeats: 72, fare: 1650 },
      ],
    },
    {
      trainNumber: '12869',
      name: 'Howrah Puri Superfast',
      source: 'Howrah',
      destination: 'Puri',
      departureTime: '22:35',
      arrivalTime: '07:00',
      durationMinutes: 505,
      trainType: 'Superfast',
      classes: [
        { type: 'AC2', totalSeats: 48, fare: 1350 },
        { type: 'AC3', totalSeats: 72, fare: 950 },
        { type: 'SL', totalSeats: 90, fare: 380 },
        { type: 'GEN', totalSeats: 120, fare: 150 },
      ],
    },
    {
      trainNumber: '12925',
      name: 'Paschim Express',
      source: 'Bandra Terminus',
      destination: 'Amritsar',
      departureTime: '11:15',
      arrivalTime: '17:35',
      durationMinutes: 1820,
      trainType: 'Superfast',
      classes: [
        { type: 'AC2', totalSeats: 48, fare: 2350 },
        { type: 'AC3', totalSeats: 72, fare: 1620 },
        { type: 'SL', totalSeats: 90, fare: 600 },
      ],
    },
    {
      trainNumber: '16032',
      name: 'Andaman Express',
      source: 'Chennai',
      destination: 'Jammu Tawi',
      departureTime: '18:50',
      arrivalTime: '08:15',
      durationMinutes: 2605,
      trainType: 'Express',
      classes: [
        { type: 'AC3', totalSeats: 72, fare: 1900 },
        { type: 'SL', totalSeats: 90, fare: 700 },
        { type: 'GEN', totalSeats: 120, fare: 260 },
      ],
    },
    {
      trainNumber: '12649',
      name: 'Sampark Kranti Express',
      source: 'Bengaluru',
      destination: 'New Delhi',
      departureTime: '06:00',
      arrivalTime: '05:40',
      durationMinutes: 1420,
      trainType: 'Superfast',
      classes: [
        { type: 'AC2', totalSeats: 48, fare: 2500 },
        { type: 'AC3', totalSeats: 72, fare: 1720 },
        { type: 'SL', totalSeats: 90, fare: 630 },
      ],
    },
    {
      trainNumber: '12723',
      name: 'Telangana Express',
      source: 'Hyderabad',
      destination: 'New Delhi',
      departureTime: '18:30',
      arrivalTime: '19:35',
      durationMinutes: 1505,
      trainType: 'Superfast',
      classes: [
        { type: 'AC2', totalSeats: 48, fare: 2400 },
        { type: 'AC3', totalSeats: 72, fare: 1680 },
        { type: 'SL', totalSeats: 90, fare: 610 },
      ],
    },
  ]);
  console.log(`${trains.length} trains created`);

  // Create schedules for the next 7 days for each train
  const schedules = [];
  for (const train of trains) {
    for (let i = 0; i < 7; i++) {
      schedules.push({
        train: train._id,
        date: dateStr(i),
        departureTime: train.departureTime,
        arrivalTime: train.arrivalTime,
        seatAvailability: train.classes.map((c) => ({
          type: c.type,
          totalSeats: c.totalSeats,
          bookedSeats: 0,
          bookedSeatNumbers: [],
          fare: c.fare,
        })),
      });
    }
  }
  await Schedule.insertMany(schedules);
  console.log(`${schedules.length} schedules created (next 7 days)`);

  console.log('Seed complete.');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});