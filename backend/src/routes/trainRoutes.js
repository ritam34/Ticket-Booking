const express = require('express');
const {
  searchTrains,
  getScheduleById,
  createTrain,
  updateTrain,
  deleteTrain,
  listAllTrains,
  createSchedule,
} = require('../controllers/trainController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Public
router.get('/search', searchTrains);
router.get('/schedules/:id', getScheduleById);

// Admin only
router.get('/', protect, adminOnly, listAllTrains);
router.post('/', protect, adminOnly, createTrain);
router.put('/:id', protect, adminOnly, updateTrain);
router.delete('/:id', protect, adminOnly, deleteTrain);
router.post('/schedules', protect, adminOnly, createSchedule);

module.exports = router;
