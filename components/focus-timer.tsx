"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { TrackerSettings } from "@/lib/server/schema";

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
  weeklyMinutes: number;
  weeklyGoalMinutes: number;
  presets: TrackerSettings["focusPresets"];
};

function buildIdleFeedback(
  todaySessions: number,
  todayMinutes: number,
  weeklyMinutes: number,
  weeklyGoalMinutes: number,
) {
  if (weeklyGoalMinutes <= 0) {
    return `${todaySessions} sessions logged today • ${todayMinutes} focus minutes`;
  }

  const weeklyProgress = Math.min(100, Math.round((weeklyMinutes / weeklyGoalMinutes) * 100));

  return `${todaySessions} sessions logged today • ${todayMinutes} focus minutes • ${weeklyProgress}% of weekly goal`;
}

export function FocusTimer({
  todayMinutes,
  todaySessions,
  weeklyMinutes,
  weeklyGoalMinutes,
  presets,
}: FocusTimerProps) {
  const router = useRouter();
  const fallbackMinutes = presets[0]?.minutes ?? 25;
  const [selectedMinutes, setSelectedMinutes] = useState(fallbackMinutes);
  const [secondsRemaining, setSecondsRemaining] = useState(fallbackMinutes * 60);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "running" | "saving">("idle");
  const [feedback, setFeedback] = useState(
    buildIdleFeedback(todaySessions, todayMinutes, weeklyMinutes, weeklyGoalMinutes),
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
    const selectedPresetStillExists = presets.some((preset) => preset.minutes === selectedMinutes);

    if (selectedPresetStillExists) {
      return;
    }

    const nextMinutes = presets[0]?.minutes ?? 25;
    setSelectedMinutes(nextMinutes);
    setSecondsRemaining(nextMinutes * 60);
  }, [presets, selectedMinutes]);

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

  useEffect(() => {
    if (status !== "idle") {
      return;
    }

    setFeedback(buildIdleFeedback(todaySessions, todayMinutes, weeklyMinutes, weeklyGoalMinutes));
  }, [status, todayMinutes, todaySessions, weeklyGoalMinutes, weeklyMinutes]);

  return (
    <section className="focus-panel">
      <div className="focus-panel__top">
        <div>
          <p className="eyebrow">Focus session</p>
          <h2>FOCUS SESSION</h2>
        </div>
        <div className="focus-panel__ambient">
          <span>{weeklyGoalMinutes}m weekly goal</span>
          <span>{presets.length} presets</span>
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
        {presets.map((preset) => (
          <button
            key={`${preset.label}-${preset.minutes}`}
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
            setFeedback(buildIdleFeedback(todaySessions, todayMinutes, weeklyMinutes, weeklyGoalMinutes));
          }}
          disabled={status === "saving" || isPending}
        >
          Reset
        </button>
      </div>
    </section>
  );
}
