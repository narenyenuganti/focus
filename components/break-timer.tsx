"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { playBreakEndChime } from "@/lib/sounds";
import { notify } from "@/lib/notifications";

type BreakTimerProps = {
  durationMinutes: number;
  onBreakEnd: () => void;
  onSkip: () => void;
  notificationSound: string;
};

function formatBreakTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function BreakTimer({ durationMinutes, onBreakEnd, onSkip, notificationSound }: BreakTimerProps) {
  const [secondsRemaining, setSecondsRemaining] = useState(durationMinutes * 60);
  const onBreakEndRef = useRef(onBreakEnd);
  onBreakEndRef.current = onBreakEnd;

  const handleEnd = useCallback(() => {
    if (notificationSound !== "off") {
      playBreakEndChime();
      notify("Break's over!", "Ready to focus.");
    }
    onBreakEndRef.current();
  }, [notificationSound]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [handleEnd]);

  useEffect(() => {
    if (secondsRemaining === 0) {
      handleEnd();
    }
  }, [secondsRemaining, handleEnd]);

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
