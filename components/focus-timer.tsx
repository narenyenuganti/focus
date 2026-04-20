"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { TrackerSettings } from "@/lib/server/schema";
import { playSound } from "@/lib/sounds";
import type { SoundId } from "@/lib/sounds";
import { FocusDial } from "@/components/focus-dial";
import { BreakTimer } from "@/components/break-timer";
import { createLofiPlayer, warmUpAudio } from "@/lib/lofi";
import { notify, requestNotificationPermission } from "@/lib/notifications";

const PRESET_GUIDANCE: Record<string, string> = {
  "classic pomodoro":
    "A short sprint with frequent resets. Use it when you need urgency, momentum, and a clean break before attention drifts.",
  eisenhower:
    "A longer planning-first block for important work that needs room to think. It fits tasks that are too meaningful for a rushed 25-minute pass.",
  "52 / 17":
    "A balanced rhythm of sustained focus followed by a real break. It works well when Pomodoro feels too short but a deep-work block feels excessive.",
  "deep work":
    "A long uninterrupted session for cognitively demanding work with one clear objective. Best when you can shut off notifications and stay on a single problem.",
};

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
  notificationSound: string;
  ambientMusic: boolean;
  breakDurationMinutes: number;
  onSocksEarned: (amount: number) => void;
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

function getPresetGuidance(label: string) {
  return PRESET_GUIDANCE[label.trim().toLowerCase()] ?? null;
}

export function FocusTimer({
  todayMinutes,
  todaySessions,
  weeklyMinutes,
  weeklyGoalMinutes,
  presets,
  notificationSound,
  ambientMusic,
  breakDurationMinutes,
  onSocksEarned,
}: FocusTimerProps) {
  const router = useRouter();
  const fallbackMinutes = presets[0]?.minutes ?? 25;
  const [selectedMinutes, setSelectedMinutes] = useState(fallbackMinutes);
  const [secondsRemaining, setSecondsRemaining] = useState(fallbackMinutes * 60);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "running" | "paused" | "saving">("idle");
  const [feedback, setFeedback] = useState(
    buildIdleFeedback(todaySessions, todayMinutes, weeklyMinutes, weeklyGoalMinutes),
  );
  const [isPending, startTransition] = useTransition();

  const [isOnBreak, setIsOnBreak] = useState(false);
  const lofiPlayerRef = useRef<ReturnType<typeof createLofiPlayer> | null>(null);

  const activePreset = presets.find((preset) => preset.minutes === selectedMinutes) ?? presets[0];
  const selectedMinutesRef = useRef(selectedMinutes);
  const secondsRemainingRef = useRef(secondsRemaining);
  const elapsedRunningSecondsRef = useRef(0);
  const currentRunStartedAtRef = useRef<number | null>(null);
  const saveSessionRef = useRef(
    async (_durationMinutes: number, _completedFullSession: boolean) => {},
  );
  const totalSeconds = selectedMinutes * 60;
  const controlsDisabled = status === "saving" || isPending;

  useEffect(() => {
    selectedMinutesRef.current = selectedMinutes;
  }, [selectedMinutes]);

  useEffect(() => {
    secondsRemainingRef.current = secondsRemaining;
  }, [secondsRemaining]);

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

  // Lo-fi music lifecycle
  useEffect(() => {
    if (status === "running" && ambientMusic) {
      if (!lofiPlayerRef.current) {
        lofiPlayerRef.current = createLofiPlayer();
      }
      lofiPlayerRef.current.start();
    } else {
      lofiPlayerRef.current?.stop();
    }
    return () => {
      lofiPlayerRef.current?.stop();
    };
  }, [status, ambientMusic]);

  const getCountdownSnapshot = useCallback((now = Date.now()) => {
    const totalSelectedSeconds = selectedMinutesRef.current * 60;
    const currentRunElapsedSeconds =
      currentRunStartedAtRef.current === null
        ? 0
        : Math.floor((now - currentRunStartedAtRef.current) / 1000);
    const elapsedSeconds = Math.min(
      totalSelectedSeconds,
      elapsedRunningSecondsRef.current + currentRunElapsedSeconds,
    );

    return {
      elapsedSeconds,
      secondsRemaining: Math.max(0, totalSelectedSeconds - elapsedSeconds),
    };
  }, []);

  const syncCountdown = useCallback((now = Date.now()) => {
    const snapshot = getCountdownSnapshot(now);
    setSecondsRemaining(snapshot.secondsRemaining);
    return snapshot;
  }, [getCountdownSnapshot]);

  const saveSession = useCallback(
    async (durationMinutes: number, completedFullSession = false) => {
      const sessionStartedAt = startedAt ?? new Date().toISOString();
      const elapsedSeconds = completedFullSession
        ? durationMinutes * 60
        : Math.max(0, durationMinutes * 60 - secondsRemainingRef.current);
      const endedAt = new Date(new Date(sessionStartedAt).getTime() + elapsedSeconds * 1000);
      const elapsedMinutes = completedFullSession
        ? durationMinutes
        : Math.floor(elapsedSeconds / 60);

      // Don't store sub-minute sessions
      if (elapsedMinutes < 1) {
        setStatus("idle");
        setStartedAt(null);
        elapsedRunningSecondsRef.current = 0;
        currentRunStartedAtRef.current = null;
        setSecondsRemaining(selectedMinutes * 60);
        setFeedback("Session too short to log. Try again!");
        return;
      }

      setStatus("saving");
      setFeedback("Saving your focus session...");

      const response = await fetch("/api/focus/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startedAt: sessionStartedAt,
          endedAt: endedAt.toISOString(),
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

      // Award socks (1 per full minute, rounded down)
      const earnedAmount = Math.floor(elapsedSeconds / 60);
      if (earnedAmount > 0) {
        onSocksEarned(earnedAmount);
        void fetch("/api/economy/earn", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: earnedAmount }),
        });
      }

      setStatus("idle");
      setStartedAt(null);
      elapsedRunningSecondsRef.current = 0;
      currentRunStartedAtRef.current = null;
      setSecondsRemaining(selectedMinutes * 60);
      setFeedback(
        `${payload.summary.todaySessions} sessions logged today • ${payload.summary.todayMinutes} focus minutes`,
      );

      setTimeout(() => {
        setIsOnBreak(true);
      }, 3000);

      startTransition(() => {
        router.refresh();
      });
    },
    [router, selectedMinutes, startedAt, onSocksEarned],
  );

  saveSessionRef.current = saveSession;

  useEffect(() => {
    if (status !== "running") {
      return;
    }

    let interval = 0;

    const tick = () => {
      const snapshot = syncCountdown();

      if (snapshot.secondsRemaining > 0) {
        return;
      }

      elapsedRunningSecondsRef.current = selectedMinutesRef.current * 60;
      currentRunStartedAtRef.current = null;
      window.clearInterval(interval);
      if (notificationSound !== "off") {
        playSound(notificationSound as SoundId);
        notify("Focus session complete!", "Time for a break.");
      }
      void saveSessionRef.current(selectedMinutesRef.current, true);
    };

    interval = window.setInterval(tick, 1000);
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
  }, [status, syncCountdown]);

  useEffect(() => {
    if (status === "running" || status === "paused") {
      document.title = `${formatSeconds(secondsRemaining)} — Focus`;
    } else {
      document.title = "Focus";
    }
  }, [status, secondsRemaining]);

  useEffect(() => {
    if (status !== "idle") {
      return;
    }

    setFeedback(buildIdleFeedback(todaySessions, todayMinutes, weeklyMinutes, weeklyGoalMinutes));
  }, [status, todayMinutes, todaySessions, weeklyGoalMinutes, weeklyMinutes]);

  function handleCancelSession() {
    elapsedRunningSecondsRef.current = 0;
    currentRunStartedAtRef.current = null;
    setStatus("idle");
    setStartedAt(null);
    setSecondsRemaining(selectedMinutes * 60);
    setFeedback(
      buildIdleFeedback(todaySessions, todayMinutes, weeklyMinutes, weeklyGoalMinutes),
    );
  }

  return (
    <section className="focus-wrap">
      <div className="preset-rail" role="tablist" aria-label="Focus presets">
        {presets.map((preset) => {
          const active = preset.minutes === selectedMinutes;
          return (
            <button
              key={`${preset.label}-${preset.minutes}`}
              type="button"
              role="tab"
              aria-selected={active}
              className={active ? "is-active" : ""}
              onClick={() => setSelectedMinutes(preset.minutes)}
              disabled={status !== "idle" || isPending}
              title={getPresetGuidance(preset.label) ?? preset.label}
            >
              <span className="p-label">{preset.label}</span>
              <span className="p-mins">
                {preset.minutes}
                <small>m</small>
              </span>
            </button>
          );
        })}
      </div>

      <FocusDial
        totalSeconds={totalSeconds}
        remaining={secondsRemaining}
        running={status === "running"}
        presetLabel={activePreset?.label ?? "Focus"}
      />

      <p className="focus-feedback">{feedback}</p>

      <div className={status === "idle" ? "timer-actions is-idle" : "timer-actions"} aria-label="Timer controls">
        {status === "idle" ? (
          <button
            type="button"
            className="primary-button primary-button--focus"
            onClick={() => {
              warmUpAudio();
              requestNotificationPermission();
              elapsedRunningSecondsRef.current = 0;
              currentRunStartedAtRef.current = Date.now();
              setStartedAt(new Date().toISOString());
              setSecondsRemaining(selectedMinutes * 60);
              setStatus("running");
              setFeedback("Timer running. Stay with the work.");
            }}
            disabled={controlsDisabled}
          >
            Start
          </button>
        ) : null}
        {status === "running" ? (
          <button
            type="button"
            className="secondary-button secondary-button--focus"
            onClick={() => {
              const snapshot = syncCountdown();
              elapsedRunningSecondsRef.current = snapshot.elapsedSeconds;
              currentRunStartedAtRef.current = null;
              setStatus("paused");
              setFeedback("Timer paused. Resume when ready.");
            }}
            disabled={controlsDisabled}
          >
            Pause
          </button>
        ) : null}
        {status === "paused" ? (
          <>
            <button
              type="button"
              className="primary-button primary-button--focus"
              onClick={() => {
                currentRunStartedAtRef.current = Date.now();
                setStatus("running");
                setFeedback("Timer running. Stay with the work.");
              }}
              disabled={controlsDisabled}
            >
              Resume
            </button>
            <button
              type="button"
              className="secondary-button secondary-button--focus"
              onClick={() => {
                void saveSession(selectedMinutes, false);
              }}
              disabled={controlsDisabled}
            >
              Finish Session
            </button>
            <button
              type="button"
              className="ghost-button ghost-button--focus"
              onClick={handleCancelSession}
              disabled={controlsDisabled}
            >
              Reset
            </button>
          </>
        ) : null}
      </div>

      {/* Break timer */}
      {isOnBreak && (
        <BreakTimer
          durationMinutes={activePreset?.breakMinutes ?? breakDurationMinutes}
          onBreakEnd={() => setIsOnBreak(false)}
          onSkip={() => setIsOnBreak(false)}
          notificationSound={notificationSound}
        />
      )}
    </section>
  );
}
