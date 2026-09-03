import React from 'react';

function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

/**
 * Horizontal departure→arrival visual: two stations connected by a line,
 * with the duration sitting on the line itself. Used instead of a generic
 * card layout so the journey itself reads visually, station-board style.
 */
export default function RouteLine({ source, destination, departureTime, arrivalTime, durationMinutes }) {
  return (
    <div className="flex items-center gap-4 font-mono">
      <div className="text-right">
        <div className="text-lg font-semibold text-rail-night">{departureTime}</div>
        <div className="text-xs text-rail-muted mt-0.5 max-w-[7rem] truncate">{source}</div>
      </div>

      <div className="flex-1 flex items-center min-w-[4rem]">
        <span className="w-2 h-2 rounded-full bg-rail-night shrink-0" />
        <span className="flex-1 h-px bg-rail-line relative">
          <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[11px] text-rail-muted whitespace-nowrap">
            {formatDuration(durationMinutes)}
          </span>
        </span>
        <span className="w-2 h-2 rounded-full bg-rail-amber shrink-0" />
      </div>

      <div className="text-left">
        <div className="text-lg font-semibold text-rail-night">{arrivalTime}</div>
        <div className="text-xs text-rail-muted mt-0.5 max-w-[7rem] truncate">{destination}</div>
      </div>
    </div>
  );
}
