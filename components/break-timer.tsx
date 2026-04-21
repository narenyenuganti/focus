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
  const totalSeconds = durationMinutes * 60;
  const [secondsRemaining, setSecondsRemaining] = useState(totalSeconds);
  const breakStartedAtRef = useRef(Date.now());
  const totalSecondsRef = useRef(totalSeconds);
  const hasEndedRef = useRef(false);
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
    breakStartedAtRef.current = Date.now();
    totalSecondsRef.current = totalSeconds;
    hasEndedRef.current = false;
    setSecondsRemaining(totalSeconds);
  }, [totalSeconds]);

  const syncCountdown = useCallback((now = Date.now()) => {
    const elapsedSeconds = Math.min(
      totalSecondsRef.current,
      Math.floor((now - breakStartedAtRef.current) / 1000),
    );
    const nextSecondsRemaining = Math.max(0, totalSecondsRef.current - elapsedSeconds);
    setSecondsRemaining(nextSecondsRemaining);
    return nextSecondsRemaining;
  }, []);

  useEffect(() => {
    const tick = () => {
      syncCountdown();
    };

    const interval = window.setInterval(tick, 1000);
    tick();

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        tick();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [syncCountdown]);

  useEffect(() => {
    if (secondsRemaining === 0 && !hasEndedRef.current) {
      hasEndedRef.current = true;
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
