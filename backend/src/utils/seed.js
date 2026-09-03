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