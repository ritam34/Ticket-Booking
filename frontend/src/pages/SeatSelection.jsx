import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { trainService } from '../services';
import SeatMap from '../components/SeatMap';
import RouteLine from '../components/RouteLine';

const MAX_PASSENGERS = 6;

export default function SeatSelection() {
  const { scheduleId } = useParams();
  const [searchParams] = useSearchParams();
  const classType = searchParams.get('class');
  const navigate = useNavigate();

  const [schedule, setSchedule] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    trainService
      .getSchedule(scheduleId)
      .then((data) => setSchedule(data.schedule))
      .catch(() => setError('Could not load this train.'))
      .finally(() => setLoading(false));
  }, [scheduleId]);

  if (loading) return <div className="max-w-3xl mx-auto px-6 py-16 text-rail-muted">Loading seat map…</div>;
  if (error) return <div className="max-w-3xl mx-auto px-6 py-16 text-rail-alert">{error}</div>;
  if (!schedule) return null;

  const classInfo = schedule.seatAvailability.find((c) => c.type === classType);
  if (!classInfo) {
    return <div className="max-w-3xl mx-auto px-6 py-16 text-rail-alert">Class not found on this train.</div>;
  }

  const toggleSeat = (num) => {
    setSelectedSeats((prev) =>
      prev.includes(num) ? prev.filter((s) => s !== num) : [...prev, num]
    );
  };

  const handleContinue = () => {
    navigate(`/passenger-details/${scheduleId}?class=${classType}&seats=${selectedSeats.join(',')}`);
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="border border-rail-line rounded-sm p-5 bg-white mb-8">
        <div className="mb-4">
          <span className="font-medium text-rail-charcoal">{schedule.train.name}</span>
          <span className="text-rail-muted text-sm ml-2 font-mono">#{schedule.train.trainNumber}</span>
        </div>
        <RouteLine
          source={schedule.train.source}
          destination={schedule.train.destination}
          departureTime={schedule.departureTime}
          arrivalTime={schedule.arrivalTime}
          durationMinutes={schedule.train.durationMinutes}
        />
      </div>

      <h2 className="text-lg font-semibold text-rail-night mb-1">
        Select seats — {classType} · ₹{classInfo.fare} each
      </h2>
      <p className="text-sm text-rail-muted mb-6">Choose up to {MAX_PASSENGERS} seats.</p>

      <SeatMap
        totalSeats={classInfo.totalSeats}
        bookedSeatNumbers={[...(classInfo.bookedSeatNumbers || []), ...(classInfo.heldSeatNumbers || [])]}
        selectedSeats={selectedSeats}
        onToggle={toggleSeat}
        maxSelectable={MAX_PASSENGERS}
      />

      <div className="mt-8 flex items-center justify-between border-t border-rail-line pt-6">
        <div>
          <span className="text-sm text-rail-muted">
            {selectedSeats.length} seat{selectedSeats.length === 1 ? '' : 's'} selected
          </span>
          {selectedSeats.length > 0 && (
            <div className="font-mono text-lg text-rail-night">
              ₹{classInfo.fare * selectedSeats.length}
            </div>
          )}
        </div>
        <button
          disabled={selectedSeats.length === 0}
          onClick={handleContinue}
          className="bg-rail-night text-white rounded-sm px-6 py-2.5 font-medium hover:bg-rail-nightlight disabled:opacity-40"
        >
          Continue
        </button>
      </div>
    </div>
  );
}