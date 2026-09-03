const Booking = require('../models/Booking');

// GET /api/admin/bookings
exports.getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate({ path: 'schedule', populate: { path: 'train' } })
      .sort('-createdAt')
      .limit(200);
    res.json({ bookings });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/revenue
exports.getRevenueReport = async (req, res, next) => {
  try {
    const report = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      {
        $group: {
          _id: { $substr: ['$createdAt', 0, 10] }, // group by date (YYYY-MM-DD)
          totalRevenue: { $sum: '$totalFare' },
          totalBookings: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 30 },
    ]);

    const totals = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalFare' }, totalBookings: { $sum: 1 } } },
    ]);

    res.json({ dailyReport: report, totals: totals[0] || { totalRevenue: 0, totalBookings: 0 } });
  } catch (err) {
    next(err);
  }
};
