const PDFDocument = require('pdfkit');
const Booking = require('../models/Booking');

// GET /api/tickets/:bookingId/pdf
exports.downloadTicket = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.bookingId).populate({
      path: 'schedule',
      populate: { path: 'train' },
    });

    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (String(booking.user) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not your booking' });
    }
    if (booking.status !== 'confirmed') {
      return res.status(400).json({ message: 'Ticket only available for confirmed bookings' });
    }

    const { train } = booking.schedule;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=ticket-${booking.pnr}.pdf`);

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    doc.fontSize(20).text('E-Ticket', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`PNR: ${booking.pnr}`, { align: 'center' });
    doc.moveDown(2);

    doc.fontSize(14).text(`${train.name} (${train.trainNumber})`);
    doc.fontSize(11).text(`${booking.schedule.date}  |  ${train.source} to ${train.destination}`);
    doc.text(`Departure: ${booking.schedule.departureTime}   Arrival: ${booking.schedule.arrivalTime}`);
    doc.text(`Class: ${booking.classType}`);
    doc.moveDown();

    doc.fontSize(13).text('Passengers', { underline: true });
    booking.passengers.forEach((p, idx) => {
      doc.fontSize(11).text(`${idx + 1}. ${p.name}, Age ${p.age}, ${p.gender} — Seat ${p.seatNumber}`);
    });

    doc.moveDown();
    doc.fontSize(13).text(`Total Fare: ₹${booking.totalFare}`, { align: 'right' });
    doc.fontSize(9).fillColor('gray').text('This is a computer-generated ticket and does not require a signature.', {
      align: 'center',
    });

    doc.end();
  } catch (err) {
    next(err);
  }
};
