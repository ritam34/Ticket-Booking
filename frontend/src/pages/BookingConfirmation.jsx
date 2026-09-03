import React, { useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import api from '../services/api';

export default function BookingConfirmation() {
  const { bookingId } = useParams();
  const location = useLocation();
  const pnr = location.state?.pnr;
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await api.get(`/tickets/${bookingId}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `ticket-${pnr || bookingId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Could not download ticket. Please try again from My Bookings.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-16 text-center">
      <div className="w-12 h-12 rounded-full bg-rail-confirmed/10 flex items-center justify-center mx-auto mb-6">
        <span className="text-rail-confirmed text-2xl">✓</span>
      </div>
      <h1 className="text-2xl font-semibold text-rail-night mb-2">Booking confirmed</h1>
      <p className="text-rail-muted mb-8">Your ticket is booked. Have a safe journey.</p>

      {pnr && (
        <div className="border border-rail-line rounded-sm py-4 mb-8">
          <p className="text-xs text-rail-muted uppercase tracking-wide mb-1">PNR</p>
          <p className="font-mono text-2xl text-rail-night">{pnr}</p>
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="block w-full bg-rail-night text-white rounded-sm py-2.5 font-medium hover:bg-rail-nightlight disabled:opacity-60"
        >
          {downloading ? 'Preparing ticket…' : 'Download e-ticket'}
        </button>
        <Link
          to="/my-bookings"
          className="block w-full border border-rail-line rounded-sm py-2.5 font-medium text-rail-charcoal hover:border-rail-night"
        >
          View my bookings
        </Link>
      </div>
    </div>
  );
}
