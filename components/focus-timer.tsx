"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

const PRESETS = [
  { label: "Classic Pomodoro", minutes: 25 },
  { label: "Eisenhower", minutes: 50 },
  { label: "52 / 17", minutes: 52 },
  { label: "Deep Work", minutes: 90 },
];

function formatSeconds(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${seconds}`;
}

type FocusTimerProps = {
  todayMinutes: number;
  todaySessions: number;
};

export function FocusTimer({ todayMinutes, todaySessions }: FocusTimerProps) {
  const router = useRouter();
  const [selectedMinutes, setSelectedMinutes] = useState(PRESETS[0].minutes);
  const [secondsRemaining, setSecondsRemaining] = useState(PRESETS[0].minutes * 60);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "running" | "saving">("idle");
  const [feedback, setFeedback] = useState(
    `${todaySessions} sessions logged today • ${todayMinutes} focus minutes`,
  );
  const [isPending, startTransition] = useTransition();
  const selectedMinutesRef = useRef(selectedMinutes);
  const saveSessionRef = useRef(
    async (_durationMinutes: number, _completedFullSession: boolean) => {},
  );

  useEffect(() => {
    selectedMinutesRef.current = selectedMinutes;
  }, [selectedMinutes]);

  useEffect(() => {
    if (status !== "idle") {
      return;
    }

    setSecondsRemaining(selectedMinutes * 60);
  }, [selectedMinutes, status]);

  const saveSession = useCallback(
    async (durationMinutes: number, completedFullSession = false) => {
      const sessionStartedAt = startedAt ?? new Date().toISOString();
      const now = new Date();
      const elapsedMinutes = completedFullSession
        ? durationMinutes
        : Math.max(
            1,
            Math.round((now.getTime() - new Date(sessionStartedAt).getTime()) / 60000),
          );

      setStatus("saving");
      setFeedback("Saving your focus session...");

      const response = await fetch("/api/focus/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startedAt: sessionStartedAt,
          endedAt: now.toISOString(),
          durationMinutes: elapsedMinutes,
          mode: "focus",
        }),
      });

      if (!response.ok) {
        setStatus("idle");
        setFeedback("Could not save the session. Try again.");
        return;
      }

      const payload = (await response.json()) as {
        summary: {
          todayMinutes: number;
          todaySessions: number;
        };
      };

      setStatus("idle");
      setStartedAt(null);
      setSecondsRemaining(selectedMinutes * 60);
      setFeedback(
        `${payload.summary.todaySessions} sessions logged today • ${payload.summary.todayMinutes} focus minutes`,
      );

      startTransition(() => {
        router.refresh();
      });
    },
    [router, selectedMinutes, startedAt],
  );

  saveSessionRef.current = saveSession;

  useEffect(() => {
    if (status !== "running") {
      return;
    }

    const interval = window.setInterval(() => {
      setSecondsRemaining((current) => {
        if (current <= 1) {
          window.clearInterval(interval);
          void saveSessionRef.current(selectedMinutesRef.current, true);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [status]);

  return (
    <section className="focus-panel">
      <div className="focus-panel__top">
        <div>
          <p className="eyebrow">Focus session</p>
          <h2>FOCUS SESSION</h2>
        </div>
        <div className="focus-panel__ambient">
          <span>Lofi Girl</span>
          <span>Bell</span>
        </div>
      </div>

      <div className="focus-ring">
        <div>
          <div className="timer-display">{formatSeconds(secondsRemaining)}</div>
          <p className="focus-label">FOCUS SESSION</p>
        </div>
      </div>
      <p className="focus-feedback">{feedback}</p>

      <div className="preset-grid">
        {PRESETS.map((preset) => (
          <button
            key={preset.minutes}
            type="button"
            className={
              preset.minutes === selectedMinutes ? "preset-button is-active" : "preset-button"
            }
            onClick={() => setSelectedMinutes(preset.minutes)}
            disabled={status === "running" || status === "saving" || isPending}
          >
            <span>{preset.label}</span>
            <strong>{preset.minutes}m</strong>
          </button>
        ))}
      </div>

      <div className="timer-actions">
        <button
          type="button"
          className="primary-button"
          onClick={() => {
            setStartedAt(new Date().toISOString());
            setStatus("running");
            setFeedback("Timer running. Stay with the work.");
          }}
          disabled={status === "running" || status === "saving" || isPending}
        >
          Start
        </button>
        <button
          type="button"
          className="secondary-button"
          onClick={() => {
            void saveSession(selectedMinutes, false);
          }}
          disabled={status !== "running" || isPending}
        >
          Finish Session
        </button>
        <button
          type="button"
          className="ghost-button"
          onClick={() => {
            setStatus("idle");
            setStartedAt(null);
            setSecondsRemaining(selectedMinutes * 60);
            setFeedback(
              `${todaySessions} sessions logged today • ${todayMinutes} focus minutes`,
            );
          }}
          disabled={status === "saving" || isPending}
        >
          Reset
        </button>
      </div>
    </section>
  );
}
