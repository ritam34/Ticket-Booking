import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { bookingService } from '../services';

const PENDING_TOTAL_MINUTES = 10;
const PENDING_PAY_PHASE_MINUTES = 5;

function PendingCountdown({ createdAt }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const elapsedSec = Math.floor((now - new Date(createdAt).getTime()) / 1000);
  const totalSec = PENDING_TOTAL_MINUTES * 60;
  const paySec = PENDING_PAY_PHASE_MINUTES * 60;
  const remaining = Math.max(0, totalSec - elapsedSec);
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  if (remaining === 0) {
    return <p className="text-xs text-rail-muted mb-3">Expiring — refresh to update.</p>;
  }

  const inGracePhase = elapsedSec >= paySec;
  return (
    <p className={`text-xs mb-3 font-mono ${inGracePhase ? 'text-rail-amberdark' : 'text-rail-muted'}`}>
      {inGracePhase
        ? `Grace period — ${mins}:${secs.toString().padStart(2, '0')} left before seats are released`
        : `${mins}:${secs.toString().padStart(2, '0')} left to pay`}
    </p>
  );
}

const statusStyles = {
  confirmed: 'text-rail-confirmed bg-green-50',
  pending_payment: 'text-rail-amberdark bg-amber-50',
  cancelled: 'text-rail-alert bg-red-50',
  expired: 'text-rail-muted bg-rail-platform',
};

export default function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    bookingService.myBookings().then((data) => setBookings(data.bookings)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleReleasePending = async (id) => {
    setBusyId(id);
    try {
      await bookingService.release(id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not cancel this pending booking.');
    } finally {
      setBusyId(null);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancel this booking? Refund amount depends on time to departure.')) return;
    setBusyId(id);
    try {
      await bookingService.cancel(id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not cancel booking.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDownload = async (id, pnr) => {
    setBusyId(id);
    try {
      const res = await api.get(`/tickets/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `ticket-${pnr}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Could not download ticket.');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <div className="max-w-3xl mx-auto px-6 py-16 text-rail-muted">Loading…</div>;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-rail-night mb-8">My bookings</h1>

      {bookings.length === 0 && (
        <div className="border border-rail-line rounded-sm p-8 text-center">
          <p className="text-rail-charcoal font-medium">No bookings yet.</p>
        </div>
      )}

      <div className="space-y-4">
        {bookings.map((b) => (
          <div key={b._id} className="border border-rail-line rounded-sm p-5 bg-white">
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="font-medium text-rail-charcoal">{b.schedule?.train?.name}</span>
                <span className="text-rail-muted text-sm ml-2 font-mono">
                  #{b.schedule?.train?.trainNumber}
                </span>
              </div>
              <span className={`text-xs px-2 py-1 rounded-sm font-medium ${statusStyles[b.status]}`}>
                {b.status.replace('_', ' ')}
              </span>
            </div>

            <p className="text-sm text-rail-muted mb-1">
              {b.schedule?.train?.source} → {b.schedule?.train?.destination} · {b.schedule?.date}
            </p>
            <p className="font-mono text-sm text-rail-charcoal mb-3">
              {b.classType} · Seats {b.passengers.map((p) => p.seatNumber).join(', ')} · ₹{b.totalFare}
            </p>

            {b.pnr && <p className="font-mono text-xs text-rail-muted mb-3">PNR: {b.pnr}</p>}
            {b.status === 'pending_payment' && <PendingCountdown createdAt={b.createdAt} />}
            {b.status === 'cancelled' && (
              <p className="text-sm text-rail-muted mb-3">Refund: ₹{b.refundAmount}</p>
            )}

            {b.status === 'pending_payment' && (
              <div className="flex gap-3 pt-2 border-t border-rail-line">
                <button
                  disabled={busyId === b._id}
                  onClick={() => navigate(`/payment/${b._id}`)}
                  className="text-sm text-rail-night underline"
                >
                  Resume payment
                </button>
                <button
                  disabled={busyId === b._id}
                  onClick={() => handleReleasePending(b._id)}
                  className="text-sm text-rail-alert underline"
                >
                  Cancel
                </button>
              </div>
            )}

            {b.status === 'confirmed' && (
              <div className="flex gap-3 pt-2 border-t border-rail-line">
                <button
                  disabled={busyId === b._id}
                  onClick={() => handleDownload(b._id, b.pnr)}
                  className="text-sm text-rail-night underline"
                >
                  Download ticket
                </button>
                <button
                  disabled={busyId === b._id}
                  onClick={() => handleCancel(b._id)}
                  className="text-sm text-rail-alert underline"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}