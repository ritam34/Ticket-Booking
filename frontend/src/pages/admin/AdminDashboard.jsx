import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services';

export default function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    adminService.revenue().then(setData);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-rail-night">Admin</h1>
        <div className="flex gap-4 text-sm">
          <Link to="/admin/trains" className="text-rail-night underline">
            Manage trains
          </Link>
          <Link to="/admin/bookings" className="text-rail-night underline">
            All bookings
          </Link>
        </div>
      </div>

      {!data ? (
        <p className="text-rail-muted">Loading…</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="border border-rail-line rounded-sm p-5 bg-white">
              <p className="text-xs text-rail-muted uppercase tracking-wide mb-1">Total revenue</p>
              <p className="font-mono text-2xl text-rail-night">₹{data.totals.totalRevenue || 0}</p>
            </div>
            <div className="border border-rail-line rounded-sm p-5 bg-white">
              <p className="text-xs text-rail-muted uppercase tracking-wide mb-1">Confirmed bookings</p>
              <p className="font-mono text-2xl text-rail-night">{data.totals.totalBookings || 0}</p>
            </div>
          </div>

          <h2 className="text-sm font-medium text-rail-charcoal mb-3">Daily breakdown (last 30 days)</h2>
          <div className="border border-rail-line rounded-sm bg-white divide-y divide-rail-line">
            {data.dailyReport.map((d) => (
              <div key={d._id} className="flex items-center justify-between px-4 py-2.5 text-sm font-mono">
                <span className="text-rail-muted">{d._id}</span>
                <span className="text-rail-charcoal">{d.totalBookings} bookings</span>
                <span className="text-rail-night">₹{d.totalRevenue}</span>
              </div>
            ))}
            {data.dailyReport.length === 0 && (
              <p className="px-4 py-6 text-sm text-rail-muted text-center">No confirmed bookings yet.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
