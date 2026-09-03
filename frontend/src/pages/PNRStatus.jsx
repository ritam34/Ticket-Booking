import React, { useState } from 'react';
import { bookingService } from '../services';

export default function PNRStatus() {
  const [pnr, setPnr] = useState('');
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBooking(null);
    setLoading(true);
    try {
      const data = await bookingService.byPNR(pnr.trim());
      setBooking(data.booking);
    } catch (err) {
      setError(err.response?.data?.message || 'No booking found for this PNR.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <h1 className="text-2xl font-semibold text-rail-night mb-1">PNR status</h1>
      <p className="text-rail-muted text-sm mb-8">Enter your 10-digit PNR to check your booking.</p>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-8">
        <input
          required
          maxLength={10}
          value={pnr}
          onChange={(e) => setPnr(e.target.value)}
          placeholder="e.g. 4827193056"
          className="flex-1 border border-rail-line rounded-sm px-3 py-2 font-mono"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-rail-night text-white rounded-sm px-5 py-2 font-medium hover:bg-rail-nightlight disabled:opacity-60"
        >
          {loading ? '…' : 'Check'}
        </button>
      </form>

      {error && <p className="text-rail-alert text-sm">{error}</p>}

      {booking && (
        <div className="border border-rail-line rounded-sm p-5 bg-white">
          <p className="font-medium text-rail-charcoal">{booking.schedule?.train?.name}</p>
          <p className="text-sm text-rail-muted mb-2">
            {booking.schedule?.train?.source} → {booking.schedule?.train?.destination} · {booking.schedule?.date}
          </p>
          <p className="font-mono text-sm text-rail-charcoal">
            {booking.classType} · Seats {booking.passengers.map((p) => p.seatNumber).join(', ')}
          </p>
          <p className="text-sm mt-3 capitalize font-medium text-rail-night">{booking.status.replace('_', ' ')}</p>
        </div>
      )}
    </div>
  );
}
