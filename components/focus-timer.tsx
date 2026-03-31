"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { TrackerSettings } from "@/lib/server/schema";
import { playSound } from "@/lib/sounds";
import type { SoundId } from "@/lib/sounds";
import { RoomView } from "@/components/room-view";
import { MuteButton } from "@/components/mute-button";
import { BreakTimer } from "@/components/break-timer";
import { createLofiPlayer } from "@/lib/lofi";
import type { BeanState } from "@/components/bean";
import type { RoomPlacements } from "@/lib/economy-types";

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
  completionSound: string;
  ambientMusic: boolean;
  breakDurationMinutes: number;
  breakEndChime: boolean;
  placements: RoomPlacements["placements"];
  onSocksEarned: (amount: number) => void;
  onNavigateToShop: () => void;
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
  completionSound,
  ambientMusic,
  breakDurationMinutes,
  breakEndChime,
  placements,
  onSocksEarned,
  onNavigateToShop,
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
  const [isPresetInfoOpen, setIsPresetInfoOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Bean + gamification state
  const [beanState, setBeanState] = useState<BeanState>("idle");
  const [socksJustEarned, setSocksJustEarned] = useState<number | null>(null);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const lofiPlayerRef = useRef<ReturnType<typeof createLofiPlayer> | null>(null);

  const activePreset = presets.find((preset) => preset.minutes === selectedMinutes) ?? presets[0];
  const activePresetGuidance = activePreset ? getPresetGuidance(activePreset.label) : null;
  const selectedMinutesRef = useRef(selectedMinutes);
  const secondsRemainingRef = useRef(secondsRemaining);
  const elapsedRunningSecondsRef = useRef(0);
  const currentRunStartedAtRef = useRef<number | null>(null);
  const saveSessionRef = useRef(
    async (_durationMinutes: number, _completedFullSession: boolean) => {},
  );
  const totalSeconds = selectedMinutes * 60;
  const progress =
    totalSeconds > 0 ? Math.min(1, Math.max(0, 1 - secondsRemaining / totalSeconds)) : 0;
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
    if (status === "running" && ambientMusic && !isMuted) {
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
  }, [status, ambientMusic, isMuted]);

  // Sync bean state with timer status
  useEffect(() => {
    if (status === "running") {
      setBeanState("focusing");
    } else if (status === "idle" && beanState !== "celebrating" && beanState !== "sad") {
      setBeanState("idle");
    }
  }, [status, beanState]);

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
        : Math.max(60, durationMinutes * 60 - secondsRemainingRef.current);
      const endedAt = new Date(new Date(sessionStartedAt).getTime() + elapsedSeconds * 1000);
      const elapsedMinutes = completedFullSession
        ? durationMinutes
        : Math.max(1, Math.round(elapsedSeconds / 60));

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
        setBeanState("idle");
        setFeedback("Could not save the session. Try again.");
        return;
      }

      const payload = (await response.json()) as {
        summary: {
          todayMinutes: number;
          todaySessions: number;
        };
      };

      // Award socks (1 per minute)
      const earnedAmount = elapsedMinutes;
      onSocksEarned(earnedAmount);
      void fetch("/api/economy/earn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: earnedAmount }),
      });

      setStatus("idle");
      setStartedAt(null);
      elapsedRunningSecondsRef.current = 0;
      currentRunStartedAtRef.current = null;
      setSecondsRemaining(selectedMinutes * 60);
      setFeedback(
        `${payload.summary.todaySessions} sessions logged today • ${payload.summary.todayMinutes} focus minutes`,
      );

      // Celebration flow
      setBeanState("celebrating");
      setSocksJustEarned(earnedAmount);

      setTimeout(() => {
        setBeanState("idle");
        setSocksJustEarned(null);
        setIsOnBreak(true);
        onNavigateToShop();
      }, 3000);

      startTransition(() => {
        router.refresh();
      });
    },
    [router, selectedMinutes, startedAt, onSocksEarned, onNavigateToShop],
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
      playSound(completionSound as SoundId);
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

  useEffect(() => {
    setIsPresetInfoOpen(false);
  }, [activePreset?.label]);

  const tooltipId = activePreset
    ? `preset-tooltip-${activePreset.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`
    : undefined;

  function handleCancelSession() {
    elapsedRunningSecondsRef.current = 0;
    currentRunStartedAtRef.current = null;
    setStatus("idle");
    setStartedAt(null);
    setSecondsRemaining(selectedMinutes * 60);
    setFeedback(
      buildIdleFeedback(todaySessions, todayMinutes, weeklyMinutes, weeklyGoalMinutes),
    );
    setBeanState("sad");
    setTimeout(() => setBeanState("idle"), 2000);
  }

  return (
    <section className="focus-panel">
      <div className="focus-panel__top">
        <div>
          <p className="eyebrow">Focus session</p>
        </div>
        <div className="focus-panel__ambient">
          <span>{weeklyGoalMinutes}m weekly goal</span>
          <span>{presets.length} presets</span>
        </div>
      </div>

      {/* Room with Bean and timer overlay */}
      <div style={{ position: "relative", width: "100%" }}>
        <RoomView
          beanState={beanState}
          socksEarned={socksJustEarned ?? undefined}
          placements={placements}
        >
          <div className="timer-display">{formatSeconds(secondsRemaining)}</div>
          {/* Progress bar */}
          <div
            style={{
              width: "80%",
              height: 6,
              borderRadius: 3,
              background: "var(--border)",
              margin: "8px auto 0",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progress * 100}%`,
                borderRadius: 3,
                background: "var(--action)",
                transition: "width 220ms linear",
              }}
            />
          </div>
        </RoomView>
        {status === "running" && (
          <MuteButton muted={isMuted} onToggle={() => setIsMuted((prev) => !prev)} />
        )}
      </div>

      <p className="focus-feedback">{feedback}</p>

      <div className="focus-preset-strip" aria-label="Focus presets">
        <div className="focus-preset-strip__copy">
          <p className="eyebrow">Preset</p>
          <div className="focus-preset-strip__headline">
            <strong>{activePreset?.label ?? "Focus block"}</strong>
            {activePreset && activePresetGuidance ? (
              <span
                className="focus-preset-strip__tooltip-shell"
                onMouseEnter={() => setIsPresetInfoOpen(true)}
                onMouseLeave={() => setIsPresetInfoOpen(false)}
              >
                <button
                  type="button"
                  className={isPresetInfoOpen ? "preset-info-button is-open" : "preset-info-button"}
                  aria-label={`About ${activePreset.label}`}
                  aria-describedby={isPresetInfoOpen ? tooltipId : undefined}
                  aria-expanded={isPresetInfoOpen}
                  onMouseEnter={() => setIsPresetInfoOpen(true)}
                  onMouseLeave={() => setIsPresetInfoOpen(false)}
                  onFocus={() => setIsPresetInfoOpen(true)}
                  onBlur={() => setIsPresetInfoOpen(false)}
                  onClick={() => setIsPresetInfoOpen(true)}
                >
                  i
                </button>
                {isPresetInfoOpen ? (
                  <span id={tooltipId} role="tooltip" className="preset-info-tooltip">
                    {activePresetGuidance}
                  </span>
                ) : null}
              </span>
            ) : null}
          </div>
          <span>
            {activePreset ? `${activePreset.minutes} minute block` : `${presets.length} options`}
          </span>
        </div>
        <label className="focus-preset-strip__control">
          <span className="sr-only">Switch focus preset</span>
          <select
            value={selectedMinutes}
            onChange={(event) => setSelectedMinutes(Number(event.target.value))}
            disabled={status !== "idle" || isPending}
            aria-label="Switch focus preset"
          >
            {presets.map((preset) => (
              <option key={`${preset.label}-${preset.minutes}`} value={preset.minutes}>
                {preset.label} • {preset.minutes}m
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className={status === "idle" ? "timer-actions is-idle" : "timer-actions"} aria-label="Timer controls">
        {status === "idle" ? (
          <button
            type="button"
            className="primary-button primary-button--focus"
            onClick={() => {
              elapsedRunningSecondsRef.current = 0;
              currentRunStartedAtRef.current = Date.now();
              setStartedAt(new Date().toISOString());
              setSecondsRemaining(selectedMinutes * 60);
              setStatus("running");
              setFeedback("Timer running. Stay with the work.");
              setBeanState("focusing");
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
          durationMinutes={breakDurationMinutes}
          onBreakEnd={() => setIsOnBreak(false)}
          onSkip={() => setIsOnBreak(false)}
          breakEndChime={breakEndChime}
        />
      )}
    </section>
  );
}
