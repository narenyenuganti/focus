"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { playBreakEndChime } from "@/lib/sounds";

type BreakTimerProps = {
  durationMinutes: number;
  onBreakEnd: () => void;
  onSkip: () => void;
  breakEndChime: boolean;
  notificationSounds: boolean;
};

function formatBreakTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function BreakTimer({ durationMinutes, onBreakEnd, onSkip, breakEndChime, notificationSounds }: BreakTimerProps) {
  const [secondsRemaining, setSecondsRemaining] = useState(durationMinutes * 60);
  const onBreakEndRef = useRef(onBreakEnd);
  onBreakEndRef.current = onBreakEnd;

  const handleEnd = useCallback(() => {
    if (breakEndChime && notificationSounds) {
      playBreakEndChime();
    }
    onBreakEndRef.current();
  }, [breakEndChime]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [handleEnd]);

  return (
    <div style={{ textAlign: "center", padding: 16 }}>
      <p style={{ fontSize: 14, color: "var(--accent)", fontWeight: 600, marginBottom: 8 }}>
        Break time! Browse the shop while you rest.
      </p>
      <p style={{ fontSize: 32, fontWeight: 300, color: "var(--text)", letterSpacing: 2 }}>
        {formatBreakTime(secondsRemaining)}
      </p>
      <button
        type="button"
        className="secondary-button"
        onClick={onSkip}
        aria-label="Skip break"
        style={{ marginTop: 12 }}
      >
        Skip Break
      </button>
    </div>
  );
}
