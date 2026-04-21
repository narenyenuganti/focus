"use client";

import { useEffect, useMemo, useState } from "react";

type GardenSceneProps = {
  theme?: string;
  owned?: ReadonlySet<string>;
};

const INK = "#2a1f16";

function getDayT() {
  const d = new Date();
  return (d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600) / 24;
}

function sunPosition(t: number) {
  const p = (t - 0.25) / 0.5;
  const aboveHorizon = p >= 0 && p <= 1;
  const x = 80 + p * 840;
  const y = 440 - Math.sin(Math.max(0, Math.min(1, p)) * Math.PI) * 380;
  return { x, y, aboveHorizon };
}

function moonPosition(t: number) {
  let p: number;
  if (t >= 0.75) p = (t - 0.75) / 0.5;
  else if (t < 0.25) p = (t + 0.25) / 0.5;
  else p = -1;
  const aboveHorizon = p >= 0 && p <= 1;
  const x = 80 + (p < 0 ? 0.5 : p) * 840;
  const y = 440 - Math.sin(Math.max(0, Math.min(1, p)) * Math.PI) * 360;
  return { x, y, aboveHorizon };
}

function hexToRgb(h: string): [number, number, number] {
  const m = h.replace("#", "");
  return [
    parseInt(m.slice(0, 2), 16),
    parseInt(m.slice(2, 4), 16),
    parseInt(m.slice(4, 6), 16),
  ];
}

function mix(a: string, b: string, f: number) {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  const r = Math.round(r1 + (r2 - r1) * f);
  const g = Math.round(g1 + (g2 - g1) * f);
  const bl = Math.round(b1 + (b2 - b1) * f);
  return `rgb(${r},${g},${bl})`;
}

type GradientNode = [number, string, string];
const SKY_NODES: GradientNode[] = [
  [0.0, "#1a1420", "#2a1f28"],
  [0.22, "#3a2a3a", "#b85a3a"],
  [0.28, "#e8a878", "#f0c8a8"],
  [0.4, "#d8c8a8", "#f2ebe0"],
  [0.5, "#c8b898", "#ece3d3"],
  [0.65, "#d8a878", "#e8c8a0"],
  [0.75, "#b85a3a", "#e8986a"],
  [0.82, "#3a2a48", "#6a3a38"],
  [0.92, "#1a1420", "#2a1f28"],
  [1.0, "#1a1420", "#2a1f28"],
];

function skyGradient(t: number) {
  for (let i = 0; i < SKY_NODES.length - 1; i += 1) {
    const [t1, top1, bot1] = SKY_NODES[i];
    const [t2, top2, bot2] = SKY_NODES[i + 1];
    if (t >= t1 && t <= t2) {
      const f = (t - t1) / (t2 - t1);
      return { top: mix(top1, top2, f), bot: mix(bot1, bot2, f) };
    }
  }
  return { top: SKY_NODES[0][1], bot: SKY_NODES[0][2] };
}

function darknessAt(t: number) {
  if (t >= 0.3 && t <= 0.72) return 0;
  if (t > 0.22 && t < 0.3) return 1 - (t - 0.22) / 0.08;
  if (t > 0.72 && t < 0.78) return (t - 0.72) / 0.06;
  if (t >= 0.78 || t < 0.22) return 1;
  return 0;
}

function formatTime(t: number) {
  const h = Math.floor(t * 24);
  const m = Math.floor((t * 24 - h) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// ── Scene props ──────────────────────────────────────────────────

function OakTree({ x, y, scale = 1, darkness }: { x: number; y: number; scale?: number; darkness: number }) {
  const fade = 1 - darkness * 0.5;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} style={{ filter: `brightness(${fade})` }}>
      <ellipse cx="0" cy="122" rx="56" ry="6" fill={INK} opacity="0.2" />
      <path
        d="M -8 122 Q -10 100 -6 80 Q -4 70 -8 60 L 8 60 Q 4 70 6 80 Q 10 100 8 122 Z"
        fill="#7a4a2a"
        stroke={INK}
        strokeWidth="1.8"
      />
      <line x1="-4" y1="80" x2="-3" y2="116" stroke={INK} strokeWidth="0.8" opacity="0.5" />
      <line x1="3" y1="82" x2="4" y2="116" stroke={INK} strokeWidth="0.8" opacity="0.5" />
      <circle cx="0" cy="20" r="54" fill="#5a8a4a" stroke={INK} strokeWidth="2" />
      <circle cx="-34" cy="10" r="30" fill="#6a9a5a" stroke={INK} strokeWidth="1.8" />
      <circle cx="32" cy="0" r="34" fill="#6a9a5a" stroke={INK} strokeWidth="1.8" />
      <circle cx="14" cy="34" r="26" fill="#7ba866" stroke={INK} strokeWidth="1.6" />
      <ellipse cx="-28" cy="-4" rx="9" ry="5" fill="#a3c47a" opacity="0.7" />
      <ellipse cx="22" cy="-12" rx="10" ry="5" fill="#a3c47a" opacity="0.7" />
      <ellipse cx="-6" cy="14" rx="7" ry="4" fill="#a3c47a" opacity="0.6" />
    </g>
  );
}

function PineTree({ x, y, scale = 1, darkness }: { x: number; y: number; scale?: number; darkness: number }) {
  const fade = 1 - darkness * 0.5;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} style={{ filter: `brightness(${fade})` }}>
      <ellipse cx="0" cy="96" rx="32" ry="4" fill={INK} opacity="0.2" />
      <rect x="-5" y="80" width="10" height="16" fill="#7a4a2a" stroke={INK} strokeWidth="1.5" />
      <path d="M 0 -10 L 26 30 L -26 30 Z" fill="#4a7a4a" stroke={INK} strokeWidth="1.8" />
      <path d="M 0 14 L 32 54 L -32 54 Z" fill="#5a8a5a" stroke={INK} strokeWidth="1.8" />
      <path d="M 0 40 L 38 80 L -38 80 Z" fill="#6a9a6a" stroke={INK} strokeWidth="1.8" />
      <path d="M 0 -10 L 8 4 L -8 4 Z" fill="#a3c47a" opacity="0.7" />
    </g>
  );
}

function PineFar({ x, y, scale = 1, darkness }: { x: number; y: number; scale?: number; darkness: number }) {
  const fade = 1 - darkness * 0.5;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} style={{ filter: `brightness(${fade})` }}>
      <ellipse cx="0" cy="80" rx="26" ry="3" fill={INK} opacity="0.2" />
      <rect x="-4" y="66" width="8" height="14" fill="#7a4a2a" stroke={INK} strokeWidth="1.4" />
      <path d="M 0 -4 L 20 26 L -20 26 Z" fill="#4a7a4a" stroke={INK} strokeWidth="1.6" />
      <path d="M 0 14 L 26 44 L -26 44 Z" fill="#5a8a5a" stroke={INK} strokeWidth="1.6" />
      <path d="M 0 34 L 30 66 L -30 66 Z" fill="#6a9a6a" stroke={INK} strokeWidth="1.6" />
    </g>
  );
}

function CherryTree({ x, y, scale = 1, darkness }: { x: number; y: number; scale?: number; darkness: number }) {
  const fade = 1 - darkness * 0.5;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} style={{ filter: `brightness(${fade})` }}>
      <ellipse cx="0" cy="100" rx="40" ry="5" fill={INK} opacity="0.2" />
      <rect x="-6" y="56" width="12" height="44" fill="#7a4a2a" stroke={INK} strokeWidth="1.5" />
      <circle cx="0" cy="20" r="40" fill="#f2c4cf" stroke={INK} strokeWidth="1.8" />
      <circle cx="-24" cy="10" r="22" fill="#f7d6df" stroke={INK} strokeWidth="1.6" />
      <circle cx="26" cy="6" r="24" fill="#f7d6df" stroke={INK} strokeWidth="1.6" />
      <circle cx="14" cy="34" r="18" fill="#eab2c0" stroke={INK} strokeWidth="1.4" />
      {[[-18, -6], [14, -14], [2, 22], [-6, 8], [28, 24]].map(([dx, dy], i) => (
        <g key={i}>
          <circle cx={dx} cy={dy} r="3" fill="#e88ca0" stroke={INK} strokeWidth="0.6" />
          <circle cx={dx} cy={dy} r="0.8" fill="#b85a3a" />
        </g>
      ))}
    </g>
  );
}

function Bush({
  x,
  y,
  scale = 1,
  darkness,
  color = "#6a9a5a",
}: {
  x: number;
  y: number;
  scale?: number;
  darkness: number;
  color?: string;
}) {
  const fade = 1 - darkness * 0.5;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} style={{ filter: `brightness(${fade})` }}>
      <ellipse cx="0" cy="20" rx="28" ry="4" fill={INK} opacity="0.18" />
      <circle cx="-12" cy="8" r="14" fill={color} stroke={INK} strokeWidth="1.5" />
      <circle cx="10" cy="4" r="16" fill={color} stroke={INK} strokeWidth="1.5" />
      <circle cx="0" cy="14" r="12" fill={color} stroke={INK} strokeWidth="1.4" />
      <ellipse cx="-10" cy="-2" rx="4" ry="2" fill="#b5d08a" opacity="0.7" />
      <ellipse cx="10" cy="-6" rx="5" ry="2" fill="#b5d08a" opacity="0.7" />
    </g>
  );
}

function Mushroom({ x, y, scale = 1, darkness }: { x: number; y: number; scale?: number; darkness: number }) {
  const fade = 1 - darkness * 0.5;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} style={{ filter: `brightness(${fade})` }}>
      <rect x="-3" y="0" width="6" height="10" fill="#f0e0c0" stroke={INK} strokeWidth="1" />
      <path d="M -10 0 Q -10 -10 0 -12 Q 10 -10 10 0 Z" fill="#b85a3a" stroke={INK} strokeWidth="1.2" />
      <circle cx="-4" cy="-5" r="1.5" fill="#f4ede1" />
      <circle cx="4" cy="-3" r="1" fill="#f4ede1" />
    </g>
  );
}

function StoneLantern({
  x,
  y,
  scale = 1,
  darkness,
  isNight,
}: {
  x: number;
  y: number;
  scale?: number;
  darkness: number;
  isNight: boolean;
}) {
  const fade = 1 - darkness * 0.35;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} style={{ filter: `brightness(${fade})` }}>
      {isNight && <circle cx="0" cy="0" r="50" fill="#ffb068" opacity="0.25" />}
      <rect x="-14" y="30" width="28" height="6" fill="#5a4838" stroke={INK} strokeWidth="1.3" />
      <rect x="-10" y="36" width="20" height="4" fill="#4a3828" stroke={INK} strokeWidth="1.2" />
      <path d="M -12 -8 L 12 -8 L 10 30 L -10 30 Z" fill="#6b5544" stroke={INK} strokeWidth="1.5" />
      <rect
        x="-6"
        y="0"
        width="12"
        height="18"
        fill={isNight ? "#ffb068" : "#b85a3a"}
        stroke={INK}
        strokeWidth="1.2"
      />
      <line x1="0" y1="0" x2="0" y2="18" stroke={INK} strokeWidth="0.8" />
      <line x1="-6" y1="9" x2="6" y2="9" stroke={INK} strokeWidth="0.8" />
      <path d="M -16 -8 L 16 -8 L 12 -16 L -12 -16 Z" fill="#5a4838" stroke={INK} strokeWidth="1.4" />
      <rect x="-2" y="-22" width="4" height="6" fill="#5a4838" stroke={INK} strokeWidth="1" />
    </g>
  );
}

type Mote = { id: number; x: number; y: number; delay: number; dur: number };

// ── Scene ────────────────────────────────────────────────────────

export function GardenScene({ owned }: GardenSceneProps) {
  const [dayT, setDayT] = useState(0.5);
  const [simulating, setSimulating] = useState(false);
  const [motes, setMotes] = useState<Mote[]>([]);

  useEffect(() => {
    setDayT(getDayT());
  }, []);

  useEffect(() => {
    if (simulating) return;
    const id = window.setInterval(() => setDayT(getDayT()), 30_000);
    return () => window.clearInterval(id);
  }, [simulating]);

  useEffect(() => {
    if (!simulating) return;
    const id = window.setInterval(() => {
      setDayT((t) => (t + 0.003) % 1);
    }, 40);
    return () => window.clearInterval(id);
  }, [simulating]);

  useEffect(() => {
    setMotes(
      Array.from({ length: 16 }, (_, i) => ({
        id: i,
        x: Math.random() * 1000,
        y: 120 + Math.random() * 240,
        delay: Math.random() * 6,
        dur: 16 + Math.random() * 12,
      })),
    );
  }, []);

  const sun = useMemo(() => sunPosition(dayT), [dayT]);
  const moon = useMemo(() => moonPosition(dayT), [dayT]);
  const sky = useMemo(() => skyGradient(dayT), [dayT]);
  const darkness = useMemo(() => darknessAt(dayT), [dayT]);
  const isNight = darkness > 0.5;

  const ownCat = !owned || owned.has("cat");
  const ownFrog = !owned || owned.has("frog");
  const ownSnail = !owned || owned.has("snail");
  const ownFox = !owned || owned.has("fox");
  const ownOwl = !owned || owned.has("owl");

  return (
    <div className="garden-full">
      <svg className="garden-sky" viewBox="0 0 1000 560" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="sky-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={sky.top} />
            <stop offset="1" stopColor={sky.bot} />
          </linearGradient>
          <radialGradient id="sun-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#ffb068" stopOpacity="0.45" />
            <stop offset="1" stopColor="#ffb068" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="moon-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#f0e4d2" stopOpacity="0.3" />
            <stop offset="1" stopColor="#f0e4d2" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="ground-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8fa86a" />
            <stop offset="1" stopColor="#5a7a4a" />
          </linearGradient>
        </defs>

        <rect width="1000" height="560" fill="url(#sky-grad)" />

        {isNight &&
          Array.from({ length: 40 }, (_, i) => {
            const x = (i * 97) % 1000;
            const y = (i * 53) % 340;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={0.8 + (i % 3) * 0.4}
                fill="#f0e4d2"
                opacity={0.4 + (i % 5) * 0.12}
              >
                <animate
                  attributeName="opacity"
                  values={`${0.3 + (i % 3) * 0.1};0.8;${0.3 + (i % 3) * 0.1}`}
                  dur={`${3 + (i % 5)}s`}
                  repeatCount="indefinite"
                />
              </circle>
            );
          })}

        {sun.aboveHorizon && (
          <g>
            <circle cx={sun.x} cy={sun.y} r="110" fill="url(#sun-glow)" />
            <circle
              cx={sun.x}
              cy={sun.y}
              r="46"
              fill="#f4a860"
              stroke="#b85a3a"
              strokeWidth="1.5"
              opacity="0.95"
            />
          </g>
        )}
        {moon.aboveHorizon && (
          <g>
            <circle cx={moon.x} cy={moon.y} r="90" fill="url(#moon-glow)" />
            <circle
              cx={moon.x}
              cy={moon.y}
              r="32"
              fill="#f0e4d2"
              stroke="#d4c490"
              strokeWidth="1.2"
              opacity="0.95"
            />
            <circle cx={moon.x - 8} cy={moon.y - 6} r="5" fill="#c8b8a2" opacity="0.5" />
            <circle cx={moon.x + 10} cy={moon.y + 8} r="3" fill="#c8b8a2" opacity="0.4" />
          </g>
        )}

        {!isNight &&
          [
            [140, 110, 0.9],
            [520, 80, 1.1],
            [760, 140, 0.8],
          ].map(([cx, cy, s], i) => (
            <g key={i} opacity={0.7 - darkness * 0.3}>
              <ellipse cx={cx} cy={cy} rx={30 * s} ry={10 * s} fill="#ffffff" opacity="0.7" />
              <ellipse cx={cx - 14 * s} cy={cy + 3} rx={20 * s} ry={8 * s} fill="#ffffff" opacity="0.7" />
              <ellipse cx={cx + 16 * s} cy={cy + 2} rx={18 * s} ry={7 * s} fill="#ffffff" opacity="0.7" />
            </g>
          ))}

        <path
          d="M 0 380 Q 200 330 420 360 Q 640 390 860 340 Q 930 325 1000 335 L 1000 460 L 0 460 Z"
          fill="#9b7a5a"
          opacity={0.55 + darkness * 0.25}
        />
        <path
          d="M 0 380 Q 200 330 420 360 Q 640 390 860 340 Q 930 325 1000 335"
          stroke={INK}
          strokeWidth="1.3"
          fill="none"
          opacity={0.4 - darkness * 0.2}
        />

        <path
          d="M 0 430 Q 280 390 560 420 Q 780 440 1000 410 L 1000 470 L 0 470 Z"
          fill="#7a8a5a"
          opacity={0.75 + darkness * 0.15}
        />
        <path
          d="M 0 430 Q 280 390 560 420 Q 780 440 1000 410"
          stroke={INK}
          strokeWidth="1.3"
          fill="none"
          opacity={0.5 - darkness * 0.25}
        />

        <PineFar x={880} y={412} scale={0.6} darkness={darkness + 0.3} />
        <PineFar x={920} y={420} scale={0.5} darkness={darkness + 0.3} />
        <Bush x={720} y={416} scale={0.7} darkness={darkness + 0.2} color="#7a9a6a" />
        <Bush x={80} y={418} scale={0.8} darkness={darkness + 0.2} color="#7a9a6a" />

        <rect
          y="460"
          width="1000"
          height="100"
          fill="url(#ground-grad)"
          style={{ filter: `brightness(${1 - darkness * 0.55})` }}
        />
        <path d="M 0 460 L 1000 460" stroke={INK} strokeWidth="1.3" opacity={0.4 - darkness * 0.2} />

        <path
          d="M 440 560 Q 500 520 520 490 Q 540 470 580 464 L 620 464 Q 660 470 680 490 Q 700 520 760 560 Z"
          fill="#c9a878"
          stroke={INK}
          strokeWidth="1.2"
          opacity={0.85 - darkness * 0.3}
        />
        {[[480, 520], [540, 500], [620, 500], [680, 520], [560, 540]].map(([x, y], i) => (
          <ellipse key={i} cx={x} cy={y} rx="4" ry="2" fill="#8a7868" opacity={0.7 - darkness * 0.3} />
        ))}

        <OakTree x={180} y={350} scale={1.1} darkness={darkness} />
        <CherryTree x={780} y={380} scale={0.85} darkness={darkness} />
        <PineTree x={880} y={400} scale={0.9} darkness={darkness} />
        <PineTree x={940} y={420} scale={0.7} darkness={darkness} />

        <Bush x={60} y={482} scale={1.1} darkness={darkness} color="#5a8a4a" />
        <Bush x={340} y={490} scale={0.9} darkness={darkness} color="#6a9a5a" />
        <Bush x={860} y={490} scale={0.85} darkness={darkness} color="#5a8a4a" />

        <Mushroom x={280} y={500} scale={1.2} darkness={darkness} />
        <Mushroom x={300} y={508} scale={0.9} darkness={darkness} />
        <Mushroom x={420} y={518} scale={1.1} darkness={darkness} />

        <StoneLantern x={120} y={470} scale={1.15} darkness={darkness} isNight={isNight} />

        <g>
          <ellipse
            cx="600"
            cy="510"
            rx="140"
            ry="16"
            fill={isNight ? "#1a2838" : "#7ab5c9"}
            stroke={INK}
            strokeWidth="1.3"
            opacity="0.95"
          />
          <ellipse cx="600" cy="508" rx="120" ry="10" fill={isNight ? "#2a3848" : "#a8d0de"} opacity="0.7" />
          <path d="M 540 506 Q 560 504 580 506" stroke="#f4ede1" strokeWidth="0.8" fill="none" opacity="0.7" />
          <path d="M 610 510 Q 630 508 650 510" stroke="#f4ede1" strokeWidth="0.8" fill="none" opacity="0.5" />
          <ellipse cx="550" cy="508" rx="10" ry="3" fill="#5a8a4a" stroke={INK} strokeWidth="1" />
          <circle cx="550" cy="506" r="2" fill="#f2c4cf" stroke={INK} strokeWidth="0.5" />
        </g>
        {moon.aboveHorizon && (
          <ellipse cx="600" cy="508" rx="18" ry="2.5" fill="#f0e4d2" opacity="0.55">
            <animate attributeName="rx" values="14;22;14" dur="5s" repeatCount="indefinite" />
          </ellipse>
        )}

        {([[240, 498, "#b85a3a"], [260, 508, "#e88ca0"], [380, 516, "#e8c040"], [460, 508, "#b85a3a"], [740, 510, "#e8c040"], [820, 520, "#e88ca0"]] as const).map(
          ([x, y, c], i) => (
            <g key={i} style={{ filter: `brightness(${1 - darkness * 0.5})` }}>
              <line x1={x} y1={y} x2={x} y2={y + 10} stroke="#5a8a4a" strokeWidth="1" />
              <circle cx={x} cy={y} r="3" fill={c} stroke={INK} strokeWidth="0.7" />
              <circle cx={x} cy={y} r="0.8" fill={INK} />
            </g>
          ),
        )}

        {Array.from({ length: 30 }, (_, i) => {
          const x = (i * 37) % 1000;
          const y = 472 + ((i * 13) % 70);
          const h = 5 + (i % 4) * 2;
          return (
            <path
              key={i}
              d={`M ${x} ${y} Q ${x - 1} ${y - h} ${x + 2} ${y - h}`}
              stroke="#5a7a4a"
              strokeWidth="1"
              fill="none"
              opacity={0.6 - darkness * 0.3}
              style={{ filter: `brightness(${1 - darkness * 0.4})` }}
            />
          );
        })}

        {motes.map((m) => (
          <circle
            key={m.id}
            cx={m.x}
            cy={m.y}
            r={isNight ? 2.4 : 1.4}
            fill={isNight ? "#ffd080" : "#f4ede1"}
            opacity={isNight ? 0.95 : 0.55}
          >
            <animate
              attributeName="cx"
              values={`${m.x};${m.x + 80};${m.x - 40};${m.x}`}
              dur={`${m.dur}s`}
              repeatCount="indefinite"
              begin={`-${m.delay}s`}
            />
            <animate
              attributeName="cy"
              values={`${m.y};${m.y - 60};${m.y + 30};${m.y}`}
              dur={`${m.dur}s`}
              repeatCount="indefinite"
              begin={`-${m.delay}s`}
            />
            {isNight && (
              <animate
                attributeName="opacity"
                values="0.2;1;0.4;0.9;0.2"
                dur="3.5s"
                repeatCount="indefinite"
                begin={`-${m.delay}s`}
              />
            )}
          </circle>
        ))}
      </svg>

      {/* creature layer */}
      {ownCat && <WanderingCreature id="cat" path="left" isNight={isNight} />}
      {ownFox && <WanderingCreature id="fox" path="right" isNight={isNight} />}
      {ownFrog && <HoppingFrog isNight={isNight} />}
      {ownSnail && <CrawlingSnail isNight={isNight} />}
      {ownOwl && <FlyingOwl isNight={isNight} />}
      <FlyingVisitor kind="butterfly" isNight={isNight} />
      <FlyingVisitor kind="bee" isNight={isNight} />

      <div className="garden-hud">
        <div className="hud-time">{formatTime(dayT)}</div>
        <button type="button" className="hud-sim" onClick={() => setSimulating((s) => !s)}>
          {simulating ? "Pause" : "Simulate day"}
        </button>
      </div>
    </div>
  );
}

// ── Animated creatures ──

function WanderingCreature({
  id,
  path,
  isNight,
}: {
  id: "cat" | "fox";
  path: "left" | "right";
  isNight: boolean;
}) {
  const size = id === "cat" ? 90 : 96;
  const speedSec = id === "cat" ? 140 : 130;
  const bottom = path === "left" ? "14%" : "18%";
  return (
    <div
      style={{
        position: "absolute",
        bottom,
        width: size,
        height: size,
        animation: `wander-ground-${path} ${speedSec}s ease-in-out infinite`,
        zIndex: 2,
        cursor: "pointer",
        filter: isNight ? "brightness(0.78)" : undefined,
      }}
      aria-label={id}
      title={id}
    >
      <div style={{ animation: "bob 2.6s ease-in-out infinite" }}>
        <CreatureArt id={id} />
      </div>
    </div>
  );
}

function HoppingFrog({ isNight }: { isNight: boolean }) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "10%",
        width: 74,
        height: 74,
        animation: "frog-hop 22s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        zIndex: 2,
        cursor: "pointer",
        filter: isNight ? "brightness(0.78)" : undefined,
      }}
      aria-label="frog"
      title="frog"
    >
      <CreatureArt id="frog" />
    </div>
  );
}

function CrawlingSnail({ isNight }: { isNight: boolean }) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "9%",
        width: 76,
        height: 76,
        animation: "snail-crawl 280s linear infinite",
        zIndex: 2,
        cursor: "pointer",
        filter: isNight ? "brightness(0.78)" : undefined,
      }}
      aria-label="snail"
      title="snail"
    >
      <div style={{ animation: "snail-sway 7s ease-in-out infinite" }}>
        <CreatureArt id="snail" />
      </div>
    </div>
  );
}

function FlyingOwl({ isNight }: { isNight: boolean }) {
  if (!isNight) {
    return (
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "16%",
          width: 70,
          height: 70,
          zIndex: 2,
          cursor: "pointer",
          animation: "perch-bob 6s ease-in-out infinite",
        }}
        aria-label="owl"
        title="owl"
      >
        <CreatureArt id="owl" />
      </div>
    );
  }
  return (
    <div
      style={{
        position: "absolute",
        width: 70,
        height: 70,
        animation: "owl-path 90s linear infinite",
        zIndex: 2,
        cursor: "pointer",
        filter: "brightness(0.85)",
      }}
      aria-label="owl"
      title="owl"
    >
      <div style={{ animation: "flap-owl 1.8s ease-in-out infinite" }}>
        <CreatureArt id="owl" />
      </div>
    </div>
  );
}

function FlyingVisitor({ kind, isNight }: { kind: "butterfly" | "bee"; isNight: boolean }) {
  if (isNight) return null;
  const cfg =
    kind === "butterfly"
      ? { size: 40, dur: 70, path: "butterfly-path", flap: "flap-fast", flapDur: "1.2s" }
      : { size: 36, dur: 55, path: "bee-path", flap: "flap-fast", flapDur: "1s" };
  return (
    <div
      style={{
        position: "absolute",
        width: cfg.size,
        height: cfg.size,
        animation: `${cfg.path} ${cfg.dur}s linear infinite`,
        zIndex: 2,
        cursor: "pointer",
      }}
      aria-label={kind}
      title={kind}
    >
      <div style={{ animation: `${cfg.flap} ${cfg.flapDur} ease-in-out infinite` }}>
        <VisitorArt kind={kind} />
      </div>
    </div>
  );
}

function VisitorArt({ kind }: { kind: "butterfly" | "bee" }) {
  if (kind === "butterfly") {
    return (
      <svg viewBox="0 0 100 100">
        <ellipse cx="50" cy="52" rx="3" ry="18" fill={INK} />
        <path
          d="M 50 42 Q 20 20 24 48 Q 28 62 50 54 Z"
          fill="#e88ca0"
          stroke={INK}
          strokeWidth="1.2"
        />
        <path
          d="M 50 42 Q 80 20 76 48 Q 72 62 50 54 Z"
          fill="#e88ca0"
          stroke={INK}
          strokeWidth="1.2"
        />
        <path
          d="M 50 58 Q 30 68 30 80 Q 36 76 50 68 Z"
          fill="#f2c4cf"
          stroke={INK}
          strokeWidth="1.1"
        />
        <path
          d="M 50 58 Q 70 68 70 80 Q 64 76 50 68 Z"
          fill="#f2c4cf"
          stroke={INK}
          strokeWidth="1.1"
        />
        <circle cx="33" cy="40" r="2" fill="#b85a3a" />
        <circle cx="67" cy="40" r="2" fill="#b85a3a" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 100 100">
      <ellipse cx="50" cy="56" rx="22" ry="14" fill="#e8c040" stroke={INK} strokeWidth="1.4" />
      <rect x="34" y="46" width="8" height="20" fill={INK} opacity="0.85" />
      <rect x="56" y="46" width="10" height="20" fill={INK} opacity="0.85" />
      <ellipse cx="40" cy="40" rx="14" ry="8" fill="#f4ede1" stroke={INK} strokeWidth="1" opacity="0.85" />
      <ellipse cx="60" cy="40" rx="14" ry="8" fill="#f4ede1" stroke={INK} strokeWidth="1" opacity="0.85" />
      <circle cx="30" cy="50" r="1.4" fill={INK} />
      <line x1="22" y1="42" x2="18" y2="36" stroke={INK} strokeWidth="1" strokeLinecap="round" />
      <line x1="24" y1="44" x2="20" y2="40" stroke={INK} strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

function CreatureArt({ id }: { id: "cat" | "frog" | "snail" | "fox" | "owl" }) {
  switch (id) {
    case "cat":
      return (
        <svg viewBox="0 0 100 100">
          <ellipse cx="50" cy="70" rx="28" ry="16" fill={INK} />
          <circle cx="32" cy="58" r="14" fill={INK} />
          <path d="M 22 52 L 26 42 L 32 50 Z M 38 50 L 42 42 L 44 52 Z" fill={INK} />
          <path d="M 78 72 Q 88 60 84 48" stroke={INK} strokeWidth="5" fill="none" strokeLinecap="round" />
          <circle cx="28" cy="56" r="1.2" fill="#b85a3a" />
          <circle cx="36" cy="56" r="1.2" fill="#b85a3a" />
        </svg>
      );
    case "frog":
      return (
        <svg viewBox="0 0 100 100">
          <ellipse cx="50" cy="66" rx="30" ry="18" fill="#6a9a5a" stroke={INK} strokeWidth="1.2" />
          <ellipse cx="34" cy="48" rx="10" ry="9" fill="#6a9a5a" stroke={INK} strokeWidth="1" />
          <ellipse cx="66" cy="48" rx="10" ry="9" fill="#6a9a5a" stroke={INK} strokeWidth="1" />
          <circle cx="34" cy="46" r="4" fill="#f4ede1" />
          <circle cx="66" cy="46" r="4" fill="#f4ede1" />
          <circle cx="34" cy="47" r="2" fill={INK} />
          <circle cx="66" cy="47" r="2" fill={INK} />
          <path d="M 40 70 Q 50 76 60 70" stroke={INK} strokeWidth="1.2" fill="none" strokeLinecap="round" />
        </svg>
      );
    case "snail":
      return (
        <svg viewBox="0 0 100 100">
          <path
            d="M 16 78 Q 50 78 76 72 Q 80 68 76 64"
            stroke="#a5624a"
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="56" cy="50" r="22" fill="#c99443" stroke={INK} strokeWidth="1" />
          <path
            d="M 56 50 m -14 0 a 14 14 0 1 1 28 0 a 10 10 0 1 1 -20 0 a 6 6 0 1 1 12 0"
            stroke="#a5624a"
            strokeWidth="1.4"
            fill="none"
          />
          <line x1="20" y1="74" x2="14" y2="64" stroke="#a5624a" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="14" cy="63" r="1.5" fill={INK} />
          <line x1="26" y1="72" x2="22" y2="62" stroke="#a5624a" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="22" cy="61" r="1.5" fill={INK} />
        </svg>
      );
    case "fox":
      return (
        <svg viewBox="0 0 100 100">
          <path
            d="M 70 70 Q 88 62 82 42"
            stroke="#b85a3a"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 82 44 Q 88 40 84 36"
            stroke="#f4ede1"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          <ellipse cx="48" cy="66" rx="26" ry="14" fill="#b85a3a" stroke={INK} strokeWidth="1" />
          <circle cx="34" cy="52" r="14" fill="#b85a3a" stroke={INK} strokeWidth="1" />
          <path d="M 24 46 L 26 34 L 34 46 Z M 36 46 L 42 34 L 42 46 Z" fill="#b85a3a" stroke={INK} strokeWidth="0.8" />
          <path d="M 30 54 Q 34 56 38 54 L 34 58 Z" fill="#f4ede1" />
          <circle cx="28" cy="50" r="1.3" fill={INK} />
          <circle cx="38" cy="50" r="1.3" fill={INK} />
          <circle cx="34" cy="56" r="1" fill={INK} />
        </svg>
      );
    case "owl":
      return (
        <svg viewBox="0 0 100 100">
          <ellipse cx="50" cy="58" rx="24" ry="28" fill="#a5624a" stroke={INK} strokeWidth="1.2" />
          <path
            d="M 28 38 L 34 46 M 72 38 L 66 46"
            stroke="#a5624a"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <circle cx="40" cy="52" r="9" fill="#f4ede1" />
          <circle cx="60" cy="52" r="9" fill="#f4ede1" />
          <circle cx="40" cy="53" r="4" fill={INK} />
          <circle cx="60" cy="53" r="4" fill={INK} />
          <path d="M 46 62 L 50 68 L 54 62 Z" fill="#c99443" />
          <path
            d="M 40 76 L 42 84 M 60 76 L 58 84"
            stroke="#c99443"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    default:
      return null;
  }
}
