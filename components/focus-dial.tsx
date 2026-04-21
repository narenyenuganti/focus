"use client";

type FocusDialProps = {
  totalSeconds: number;
  remaining: number;
  running: boolean;
  presetLabel?: string;
};

const R = 200;
const CIRCUMFERENCE = 2 * Math.PI * R;

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function FocusDial({ totalSeconds, remaining, running }: FocusDialProps) {
  const pct = totalSeconds > 0 ? 1 - remaining / totalSeconds : 0;
  const offset = CIRCUMFERENCE * (1 - pct);
  const mm = pad(Math.floor(remaining / 60));
  const ss = pad(Math.floor(remaining % 60));
  const isIdle = !running && remaining === totalSeconds;

  return (
    <div className="focus-ring-wrap breathing" role="img" aria-label={`${mm}:${ss} remaining`}>
      <svg viewBox="-240 -240 480 480">
        <circle r={R} fill="none" stroke="var(--rule)" strokeWidth="1" />
        <circle
          r={R}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="1.5"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          transform="rotate(-90)"
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s linear" }}
        />
      </svg>
      <div className="focus-time">
        <div className="time">
          {mm}
          <span className="colon">:</span>
          {ss}
        </div>
        <div className="sub">{running ? "in session" : isIdle ? "ready" : "paused"}</div>
      </div>
    </div>
  );
}
