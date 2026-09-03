import React, { useState, useEffect } from 'react';

export default function CountdownTimer({ seconds, onExpire }) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (remaining <= 0) {
      onExpire?.();
      return;
    }
    const timer = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(timer);
  }, [remaining, onExpire]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const isLow = remaining <= 60;

  return (
    <span className={`font-mono text-sm ${isLow ? 'text-rail-alert' : 'text-rail-muted'}`}>
      Seats held for {mins}:{secs.toString().padStart(2, '0')}
    </span>
  );
}
