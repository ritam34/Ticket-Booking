import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services';

export default function AllBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.allBookings().then((data) => setBookings(data.bookings)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <Link to="/admin" className="text-sm text-rail-night underline">
        ← Back to dashboard
      </Link>
      <h1 className="text-2xl font-semibold text-rail-night mt-2 mb-8">All bookings</h1>

      {loading ? (
        <p className="text-rail-muted">Loading…</p>
      ) : (
        <div className="border border-rail-line rounded-sm bg-white divide-y divide-rail-line">
          {bookings.map((b) => (
            <div key={b._id} className="px-4 py-3 text-sm flex items-center justify-between font-mono">
              <div>
                <span className="text-rail-charcoal">{b.user?.name}</span>
                <span className="text-rail-muted ml-2">{b.schedule?.train?.name}</span>
                <span className="text-rail-muted ml-2">
                  {b.schedule?.train?.source} → {b.schedule?.train?.destination}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-rail-muted">₹{b.totalFare}</span>
                <span
                  className={
                    b.status === 'confirmed'
                      ? 'text-rail-confirmed'
                      : b.status === 'cancelled'
                      ? 'text-rail-alert'
                      : 'text-rail-muted'
                  }
                >
                  {b.status}
                </span>
              </div>
            </div>
          ))}
          {bookings.length === 0 && (
            <p className="px-4 py-6 text-sm text-rail-muted text-center">No bookings yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
