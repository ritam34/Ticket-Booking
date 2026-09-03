import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { trainService } from '../services';
import RouteLine from '../components/RouteLine';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const source = searchParams.get('source');
  const destination = searchParams.get('destination');
  const date = searchParams.get('date');

  useEffect(() => {
    setLoading(true);
    setError('');
    trainService
      .search({ source, destination, date })
      .then((data) => setResults(data.results))
      .catch(() => setError('Could not load trains. Please try again.'))
      .finally(() => setLoading(false));
  }, [source, destination, date]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <p className="text-sm text-rail-muted mb-1">
        {source} → {destination} · {date}
      </p>
      <h1 className="text-2xl font-semibold text-rail-night mb-8">
        {loading ? 'Searching…' : `${results.length} train${results.length === 1 ? '' : 's'} found`}
      </h1>

      {error && <p className="text-rail-alert">{error}</p>}

      {!loading && !error && results.length === 0 && (
        <div className="border border-rail-line rounded-sm p-8 text-center">
          <p className="text-rail-charcoal font-medium">No trains found for this route or date.</p>
          <p className="text-rail-muted text-sm mt-1">Try a different date, or check the station names.</p>
        </div>
      )}

      <div className="space-y-4">
        {results.map((r) => (
          <div key={r.scheduleId} className="border border-rail-line rounded-sm p-5 bg-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="font-medium text-rail-charcoal">{r.train.name}</span>
                <span className="text-rail-muted text-sm ml-2 font-mono">#{r.train.trainNumber}</span>
              </div>
              <span className="text-xs text-rail-muted uppercase tracking-wide">{r.train.trainType}</span>
            </div>

            <RouteLine
              source={r.source}
              destination={r.destination}
              departureTime={r.departureTime}
              arrivalTime={r.arrivalTime}
              durationMinutes={r.durationMinutes}
            />

            <div className="mt-5 pt-4 border-t border-rail-line flex flex-wrap gap-3">
              {r.classes.map((c) => (
                <button
                  key={c.type}
                  disabled={c.availableSeats === 0}
                  onClick={() => navigate(`/select-seats/${r.scheduleId}?class=${c.type}`)}
                  className={`
                    flex-1 min-w-[9rem] text-left border rounded-sm px-4 py-3 transition-colors
                    ${
                      c.availableSeats === 0
                        ? 'border-rail-line bg-rail-platform text-rail-muted cursor-not-allowed'
                        : 'border-rail-line hover:border-rail-night'
                    }
                  `}
                >
                  <div className="font-mono text-sm text-rail-charcoal">{c.type}</div>
                  <div className="font-mono text-lg text-rail-night">₹{c.fare}</div>
                  <div className="text-xs text-rail-muted">
                    {c.availableSeats === 0 ? 'Sold out' : `${c.availableSeats} left`}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
