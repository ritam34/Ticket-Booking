import React from 'react';

/**
 * Visual seat grid. `bookedSeatNumbers` is the exact list of taken seats,
 * as recorded by the backend — not inferred from a count.
 */
export default function SeatMap({ totalSeats, bookedSeatNumbers, selectedSeats, onToggle, maxSelectable }) {
  const seats = Array.from({ length: totalSeats }, (_, i) => i + 1);
  const bookedSet = new Set(bookedSeatNumbers);

  return (
    <div>
      <div className="flex items-center gap-4 mb-3 text-xs text-rail-muted">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 border border-rail-line rounded-sm inline-block" /> Available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-rail-night rounded-sm inline-block" /> Selected
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-rail-line rounded-sm inline-block" /> Booked
        </span>
      </div>

      <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
        {seats.map((num) => {
          const isBooked = bookedSet.has(num);
          const isSelected = selectedSeats.includes(num);
          const disabled = isBooked || (!isSelected && selectedSeats.length >= maxSelectable);

          return (
            <button
              key={num}
              type="button"
              disabled={disabled}
              onClick={() => onToggle(num)}
              aria-label={`Seat ${num}${isBooked ? ', booked' : isSelected ? ', selected' : ', available'}`}
              className={`
                h-10 rounded-sm text-sm font-mono border transition-colors
                ${isBooked ? 'bg-rail-line text-rail-muted border-rail-line cursor-not-allowed' : ''}
                ${isSelected ? 'bg-rail-night text-white border-rail-night' : ''}
                ${!isBooked && !isSelected ? 'border-rail-line text-rail-charcoal hover:border-rail-night' : ''}
                ${disabled && !isBooked && !isSelected ? 'opacity-40 cursor-not-allowed hover:border-rail-line' : ''}
              `}
            >
              {num}
            </button>
          );
        })}
      </div>
    </div>
  );
}