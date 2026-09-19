import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const todayStr = () => new Date().toISOString().split('T')[0];

const POPULAR_ROUTES = [
  { source: 'Howrah', destination: 'New Delhi' },
  { source: 'Sealdah', destination: 'New Delhi' },
  { source: 'Howrah', destination: 'Chennai' },
];

const FEATURES = [
  {
    title: 'Real-time seat locking',
    copy: "Once you pick a seat, it's held just for you — no double-booking, no surprises at checkout.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
        <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
      </svg>
    ),
  },
  {
    title: 'Instant PNR & e-ticket',
    copy: 'Get your PNR the moment payment clears, with a downloadable ticket ready right away.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 8.5A2.5 2.5 0 0 1 5.5 6h13A2.5 2.5 0 0 1 21 8.5v1a1.5 1.5 0 0 0 0 3v1A2.5 2.5 0 0 1 18.5 16h-13A2.5 2.5 0 0 1 3 13.5v-1a1.5 1.5 0 0 0 0-3v-1Z" />
        <path d="M9.5 6v10" strokeDasharray="2.2 2.2" />
      </svg>
    ),
  },
  {
    title: 'Secure payments',
    copy: 'Every payment is verified server-side, and refunds are automatic if anything goes wrong.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3.5 5 6.5V11c0 4.5 2.9 7.9 7 9.5 4.1-1.6 7-5 7-9.5V6.5L12 3.5Z" />
        <path d="m9.3 12 1.9 1.9 3.5-3.8" />
      </svg>
    ),
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ source: '', destination: '', date: todayStr() });

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(form);
    navigate(`/search?${params.toString()}`);
  };

  const fillRoute = (route) => {
    setForm((f) => ({ ...f, source: route.source, destination: route.destination }));
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-rail-night">
        <img
          src="/watermark-white.png"
          alt=""
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[135%] max-w-none opacity-[0.06] pointer-events-none select-none"
        />
        {/* faint rail-line texture */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-24 opacity-[0.08]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, transparent 0 22px, rgba(255,255,255,0.6) 22px 24px)',
          }}
        />

        <div className="max-w-5xl mx-auto px-6 pt-20 pb-24 relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-mono text-white/70 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-rail-amber" />
            Live seat availability · Instant confirmation
          </span>

          <h1 className="font-mono text-4xl sm:text-6xl text-white tracking-tight leading-[1.05] max-w-2xl">
            Where to, <span className="text-rail-amber">next?</span>
          </h1>
          <p className="text-white/60 mt-4 max-w-md text-[15px]">
            Search trains across the network, pick your seats on a real seat map, and walk away with a ticket in minutes.
          </p>
        </div>
      </section>

      {/* Search card — overlaps hero/body seam */}
      <section className="max-w-5xl mx-auto px-6">
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-rail-line rounded-md p-6 sm:p-7 -mt-12 relative shadow-lg shadow-black/5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-1">
              <label className="block text-xs font-medium text-rail-muted mb-1.5 uppercase tracking-wide" htmlFor="source">
                From
              </label>
              <input
                id="source"
                required
                placeholder="Howrah"
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                className="w-full border border-rail-line rounded-sm px-3 py-2.5 text-rail-charcoal placeholder:text-rail-muted/60 focus:border-rail-night transition-colors"
              />
            </div>
            <div className="sm:col-span-1">
              <label className="block text-xs font-medium text-rail-muted mb-1.5 uppercase tracking-wide" htmlFor="destination">
                To
              </label>
              <input
                id="destination"
                required
                placeholder="New Delhi"
                value={form.destination}
                onChange={(e) => setForm({ ...form, destination: e.target.value })}
                className="w-full border border-rail-line rounded-sm px-3 py-2.5 text-rail-charcoal placeholder:text-rail-muted/60 focus:border-rail-night transition-colors"
              />
            </div>
            <div className="sm:col-span-1">
              <label className="block text-xs font-medium text-rail-muted mb-1.5 uppercase tracking-wide" htmlFor="date">
                Date
              </label>
              <input
                id="date"
                type="date"
                required
                min={todayStr()}
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full border border-rail-line rounded-sm px-3 py-2.5 text-rail-charcoal focus:border-rail-night transition-colors"
              />
            </div>
            <div className="sm:col-span-1 flex items-end">
              <button
                type="submit"
                className="w-full bg-rail-amber text-rail-night font-semibold rounded-sm py-2.5 hover:bg-rail-amberdark transition-colors"
              >
                Search trains
              </button>
            </div>
          </div>

          {/* Quick-fill popular routes */}
          <div className="flex flex-wrap items-center gap-2 mt-5 pt-5 border-t border-rail-line">
            <span className="text-xs text-rail-muted mr-1">Popular:</span>
            {POPULAR_ROUTES.map((r) => (
              <button
                key={`${r.source}-${r.destination}`}
                type="button"
                onClick={() => fillRoute(r)}
                className="text-xs font-mono text-rail-charcoal bg-rail-platform border border-rail-line rounded-full px-3 py-1.5 hover:border-rail-night hover:text-rail-night transition-colors"
              >
                {r.source} <span className="text-rail-amberdark">→</span> {r.destination}
              </button>
            ))}
          </div>
        </form>
      </section>

      
    </div>
  );
}
