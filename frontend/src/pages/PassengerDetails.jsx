import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { bookingService } from '../services';

export default function PassengerDetails() {
  const { scheduleId } = useParams();
  const [searchParams] = useSearchParams();
  const classType = searchParams.get('class');
  const seatNumbers = searchParams.get('seats').split(',').map(Number);
  const navigate = useNavigate();

  const [passengers, setPassengers] = useState(
    seatNumbers.map(() => ({ name: '', age: '', gender: 'M' }))
  );
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const updatePassenger = (idx, field, value) => {
    setPassengers((prev) => prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { booking, lockToken, lockExpiresInSeconds } = await bookingService.lockSeats({
        scheduleId,
        classType,
        seatNumbers,
        passengers: passengers.map((p) => ({ ...p, age: Number(p.age) })),
      });
      navigate(`/payment/${booking._id}`, { state: { lockExpiresInSeconds } });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Could not reserve these seats. Someone else may have just booked them — please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-rail-night mb-1">Passenger details</h1>
      <p className="text-rail-muted text-sm mb-8">
        Seats {seatNumbers.join(', ')} · {classType}
      </p>

      {error && (
        <div className="mb-6 text-sm text-rail-alert bg-red-50 border border-red-200 rounded-sm px-3 py-2">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {passengers.map((p, idx) => (
          <div key={idx} className="border border-rail-line rounded-sm p-4 bg-white">
            <p className="text-xs text-rail-muted mb-3 font-mono">Seat {seatNumbers[idx]}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-xs text-rail-muted mb-1">Name</label>
                <input
                  required
                  value={p.name}
                  onChange={(e) => updatePassenger(idx, 'name', e.target.value)}
                  className="w-full border border-rail-line rounded-sm px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-xs text-rail-muted mb-1">Age</label>
                <input
                  required
                  type="number"
                  min={1}
                  max={120}
                  value={p.age}
                  onChange={(e) => updatePassenger(idx, 'age', e.target.value)}
                  className="w-full border border-rail-line rounded-sm px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-xs text-rail-muted mb-1">Gender</label>
                <select
                  value={p.gender}
                  onChange={(e) => updatePassenger(idx, 'gender', e.target.value)}
                  className="w-full border border-rail-line rounded-sm px-3 py-2 bg-white"
                >
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other</option>
                </select>
              </div>
            </div>
          </div>
        ))}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-rail-night text-white rounded-sm py-3 font-medium hover:bg-rail-nightlight disabled:opacity-60"
        >
          {submitting ? 'Reserving seats…' : 'Reserve seats & continue to payment'}
        </button>
      </form>
    </div>
  );
}
