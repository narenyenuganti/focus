"use client";

type FocusDialProps = {
  totalSeconds: number;
  remaining: number;
  running: boolean;
  presetLabel: string;
};

const SIZE = 440;
const CENTER = SIZE / 2;
const RADIUS = 180;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function pad(n: number) {
  return String(n).padStart(2, "0");
}

type Tick = { x1: number; y1: number; x2: number; y2: number; major: boolean };

// Round tick coordinates so server and client serialize identical attribute
// strings (Math.cos/sin output can differ in the last significant digit on
// re-evaluation, tripping React's hydration check).
function r(n: number) {
  return Math.round(n * 1000) / 1000;
}

const TICKS: Tick[] = Array.from({ length: 60 }, (_, i) => {
  const angle = (i / 60) * Math.PI * 2 - Math.PI / 2;
  const major = i % 5 === 0;
  const outer = major ? 196 : 198;
  const length = major ? 10 : 4;
  return {
    x1: r(CENTER + Math.cos(angle) * outer),
    y1: r(CENTER + Math.sin(angle) * outer),
    x2: r(CENTER + Math.cos(angle) * (outer - length)),
    y2: r(CENTER + Math.sin(angle) * (outer - length)),
    major,
  };
});

export function FocusDial({ totalSeconds, remaining, running, presetLabel }: FocusDialProps) {
  const pct = totalSeconds > 0 ? 1 - remaining / totalSeconds : 0;
  const offset = CIRCUMFERENCE * (1 - pct);
  const mm = pad(Math.floor(remaining / 60));
  const ss = pad(Math.floor(remaining % 60));
  const isIdle = !running && remaining === totalSeconds;

  return (
    <div className="dial-wrap" role="img" aria-label={`${mm}:${ss} remaining`}>
      <svg className="dial-svg" viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <circle
          className={`dial-breath ${running ? "on" : ""}`}
          cx={CENTER}
          cy={CENTER}
          r={210}
        />
        <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" stroke="var(--rule)" strokeWidth="1" />
        <circle
          className="dial-progress"
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${CENTER} ${CENTER})`}
          stroke="var(--accent)"
          strokeWidth="2"
          fill="none"
        />
        <g stroke="var(--ink)" strokeLinecap="round">
          {TICKS.map((t, i) => (
            <line
              key={i}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              strokeWidth={t.major ? 1.4 : 0.8}
              opacity={t.major ? 0.9 : 0.45}
            />
          ))}
        </g>
      </svg>
      <div className="dial-content">
        <div className="dial-eyebrow">
          {running ? "In session" : isIdle ? "Ready" : "Paused"} · {presetLabel}
        </div>
        <div className={`timer-digits mono ${isIdle ? "is-idle" : ""}`}>
          <span>{mm}</span>
          <span className="colon">:</span>
          <span>{ss}</span>
        </div>
        <div className="timer-sub">
          {running ? "attend to the work" : isIdle ? "press begin" : "pick up where you left off"}
        </div>
      </div>
    </div>
  );
}
