"use client";

type FocusDialProps = {
  totalSeconds: number;
  remaining: number;
  running: boolean;
  presetLabel?: string;
};

const R = 180;
const CIRCUMFERENCE = 2 * Math.PI * R;

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function r(n: number) {
  return Math.round(n * 1000) / 1000;
}

type Tick = { x1: number; y1: number; x2: number; y2: number };

const HOUR_TICKS: Tick[] = Array.from({ length: 12 }, (_, i) => {
  const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
  return {
    x1: r(Math.cos(a) * 186),
    y1: r(Math.sin(a) * 186),
    x2: r(Math.cos(a) * 196),
    y2: r(Math.sin(a) * 196),
  };
});

export function FocusDial({ totalSeconds, remaining, running }: FocusDialProps) {
  const pct = totalSeconds > 0 ? 1 - remaining / totalSeconds : 0;
  const offset = CIRCUMFERENCE * (1 - pct);
  const mm = pad(Math.floor(remaining / 60));
  const ss = pad(Math.floor(remaining % 60));
  const isIdle = !running && remaining === totalSeconds;

  return (
    <div className="focus-ring-wrap breathing" role="img" aria-label={`${mm}:${ss} remaining`}>
      <svg viewBox="-220 -220 440 440">
        {/* outer decorative dotted ring */}
        <circle r="210" fill="none" stroke="var(--rule)" strokeWidth="0.6" strokeDasharray="1 6" opacity="0.8" />
        <circle r="195" fill="none" stroke="var(--rule)" strokeWidth="0.4" opacity="0.5" />
        {/* hour tick marks */}
        {HOUR_TICKS.map((t, i) => (
          <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke="var(--ink-soft)" strokeWidth="0.8" />
        ))}
        {/* background arc */}
        <circle r={R} fill="none" stroke="var(--rule)" strokeWidth="1" />
        {/* progress arc */}
        <circle
          r={R}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="3"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          transform="rotate(-90)"
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s linear" }}
        />
        {/* inner ornamental ring */}
        <circle r="150" fill="none" stroke="var(--rule)" strokeWidth="0.3" opacity="0.6" />
      </svg>
      <div className="focus-time">
        <div className="time">
          {mm}
          <span style={{ opacity: 0.35, margin: "0 0.05em" }}>:</span>
          {ss}
        </div>
        <div className="sub">{running ? "in session" : isIdle ? "ready when you are" : "paused"}</div>
      </div>
    </div>
  );
}
