import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const todayStr = () => new Date().toISOString().split('T')[0];

export default function Home() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ source: '', destination: '', date: todayStr() });

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(form);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div>
      <section className="border-b border-rail-line bg-rail-night">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <h1 className="font-mono text-4xl sm:text-5xl text-white tracking-tight">
            Where to, next?
          </h1>
          <p className="text-white/60 mt-3 max-w-md">
            Search trains across the network, pick your seats, and get a ticket in minutes.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6">
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-rail-line rounded-sm p-6 -mt-8 relative shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-4"
        >
          <div className="sm:col-span-1">
            <label className="block text-xs text-rail-muted mb-1" htmlFor="source">
              From
            </label>
            <input
              id="source"
              required
              placeholder="Howrah"
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
              className="w-full border border-rail-line rounded-sm px-3 py-2"
            />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-xs text-rail-muted mb-1" htmlFor="destination">
              To
            </label>
            <input
              id="destination"
              required
              placeholder="New Delhi"
              value={form.destination}
              onChange={(e) => setForm({ ...form, destination: e.target.value })}
              className="w-full border border-rail-line rounded-sm px-3 py-2"
            />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-xs text-rail-muted mb-1" htmlFor="date">
              Date
            </label>
            <input
              id="date"
              type="date"
              required
              min={todayStr()}
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full border border-rail-line rounded-sm px-3 py-2"
            />
          </div>
          <div className="sm:col-span-1 flex items-end">
            <button
              type="submit"
              className="w-full bg-rail-amber text-rail-night font-medium rounded-sm py-2.5 hover:bg-rail-amberdark"
            >
              Search trains
            </button>
          </div>
        </form>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-16 text-sm text-rail-muted">
        <p>Try: Howrah → New Delhi, Sealdah → New Delhi, or Howrah → Chennai.</p>
      </section>
    </div>
  );
}
