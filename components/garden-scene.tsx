"use client";

import { useEffect, useState } from "react";

type GardenSceneProps = {
  theme?: string;
  owned?: ReadonlySet<string>;
};

const FIREFLY_COUNT = 14;
const CREATURE_IDS = ["cat", "frog", "snail", "fox", "owl"] as const;
type CreatureId = (typeof CREATURE_IDS)[number];

type CreaturePlacement = {
  id: CreatureId;
  left: string;
  bottom?: string;
  top?: string;
  size: number;
};

const PLACEMENTS: CreaturePlacement[] = [
  { id: "cat", left: "12%", bottom: "22%", size: 80 },
  { id: "frog", left: "62%", bottom: "12%", size: 60 },
  { id: "snail", left: "36%", bottom: "16%", size: 70 },
  { id: "fox", left: "78%", bottom: "32%", size: 74 },
  { id: "owl", left: "14%", top: "24%", size: 58 },
];

export function GardenScene({ theme = "terracotta", owned }: GardenSceneProps) {
  const isDusk = theme === "dusk";
  const [fireflies, setFireflies] = useState<
    Array<{ id: number; x: number; y: number; delay: number; dur: number }>
  >([]);

  useEffect(() => {
    setFireflies(
      Array.from({ length: FIREFLY_COUNT }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: 20 + Math.random() * 60,
        delay: Math.random() * 8,
        dur: 12 + Math.random() * 10,
      })),
    );
  }, []);

  const has = (id: CreatureId) => !owned || owned.has(id);

  return (
    <div className={`garden-frame ${isDusk ? "mood-dusk" : ""}`}>
      <svg className="garden-svg" viewBox="0 0 1000 560" preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id="garden-paper" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" />
            <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.08 0" />
            <feComposite in2="SourceGraphic" operator="in" />
          </filter>
          <linearGradient id="sky-fade" x1="0" y1="0" x2="0" y2="1">
            {isDusk ? (
              <>
                <stop offset="0" stopColor="#4a3a40" />
                <stop offset="0.6" stopColor="#2a2120" />
                <stop offset="1" stopColor="#1a1412" />
              </>
            ) : (
              <>
                <stop offset="0" stopColor="var(--paper-3)" stopOpacity="0.9" />
                <stop offset="0.5" stopColor="var(--paper-2)" stopOpacity="0.4" />
                <stop offset="1" stopColor="var(--paper-2)" stopOpacity="0" />
              </>
            )}
          </linearGradient>
        </defs>

        {/* sky wash */}
        <rect width="1000" height="340" fill="url(#sky-fade)" />

        {/* sun / moon */}
        {isDusk ? (
          <g>
            <circle cx="820" cy="110" r="40" fill="#e8d0a0" opacity="0.85" />
            <circle cx="820" cy="110" r="70" fill="#e8d0a0" opacity="0.15" />
            <circle cx="810" cy="100" r="6" fill="#3a2a28" opacity="0.3" />
            <circle cx="830" cy="120" r="4" fill="#3a2a28" opacity="0.25" />
          </g>
        ) : (
          <g>
            <circle cx="780" cy="120" r="52" fill="var(--ochre)" opacity="0.3" />
            <circle cx="780" cy="120" r="36" fill="var(--ochre)" opacity="0.55" />
          </g>
        )}

        {/* far mountains */}
        <g opacity={isDusk ? 0.6 : 0.45}>
          <path
            d="M 0 300 L 120 220 L 240 280 L 380 200 L 520 270 L 680 210 L 820 280 L 1000 240 L 1000 340 L 0 340 Z"
            fill={isDusk ? "#342826" : "var(--ink-muted)"}
            opacity="0.6"
          />
          <path
            d="M 0 320 L 160 260 L 320 310 L 500 250 L 680 305 L 860 270 L 1000 300 L 1000 360 L 0 360 Z"
            fill={isDusk ? "#2a1f1e" : "var(--ink-soft)"}
            opacity="0.4"
          />
        </g>

        {/* mid trees silhouette row */}
        <g opacity={isDusk ? 0.85 : 0.75}>
          {Array.from({ length: 14 }).map((_, i) => {
            const x = i * 72 + 10;
            const h = 60 + (i % 3) * 14;
            const color = isDusk ? "#1a1210" : "var(--moss-deep)";
            return (
              <g key={i} transform={`translate(${x}, ${360 - h})`}>
                <path
                  d={`M 20 0 L 36 22 L 28 22 L 40 42 L 30 42 L 44 ${h} L -4 ${h} L 10 42 L 0 42 L 12 22 L 4 22 Z`}
                  fill={color}
                />
              </g>
            );
          })}
        </g>

        {/* ground */}
        <path
          d="M 0 360 Q 500 340 1000 360 L 1000 560 L 0 560 Z"
          fill={isDusk ? "#1a1412" : "var(--paper-2)"}
          filter="url(#garden-paper)"
        />
        <path
          d="M 0 380 Q 500 360 1000 380 L 1000 460 L 0 460 Z"
          fill={isDusk ? "#221815" : "color-mix(in oklab, var(--moss) 20%, var(--paper-2))"}
          opacity="0.5"
        />

        {/* pond */}
        <ellipse
          cx="720"
          cy="480"
          rx="160"
          ry="36"
          fill={isDusk ? "#2a3438" : "color-mix(in oklab, var(--moss-deep) 30%, var(--paper-2))"}
          opacity="0.7"
        />
        <ellipse
          cx="720"
          cy="478"
          rx="150"
          ry="28"
          fill={isDusk ? "#3a4a50" : "color-mix(in oklab, var(--moss) 40%, var(--paper-3))"}
          opacity="0.5"
        />
        <ellipse
          cx="720"
          cy="478"
          rx="40"
          ry="8"
          fill="none"
          stroke={isDusk ? "#5a6a70" : "rgba(255,255,255,0.3)"}
          strokeWidth="0.6"
        />
        <ellipse
          cx="720"
          cy="478"
          rx="80"
          ry="16"
          fill="none"
          stroke={isDusk ? "#4a5a60" : "rgba(255,255,255,0.2)"}
          strokeWidth="0.5"
        />

        {/* path */}
        <path
          d="M 200 560 Q 300 500 420 480 Q 540 460 560 440"
          stroke={isDusk ? "#3a2a26" : "var(--paper-3)"}
          strokeWidth="44"
          fill="none"
          strokeLinecap="round"
          opacity="0.6"
        />

        {/* foreground grass tufts */}
        {Array.from({ length: 40 }).map((_, i) => {
          const x = ((i * 227) % 1000);
          const y = 380 + ((i * 71) % 170);
          const h = 6 + ((i * 13) % 10);
          return (
            <path
              key={i}
              d={`M ${x} ${y} Q ${x - 1} ${y - h} ${x + 2} ${y - h - 2} M ${x} ${y} Q ${x + 2} ${y - h + 2} ${x + 4} ${y - h}`}
              stroke={isDusk ? "#3a4028" : "var(--moss)"}
              strokeWidth="0.8"
              fill="none"
              strokeLinecap="round"
              opacity={0.5 + ((i * 23) % 40) / 100}
            />
          );
        })}

        {/* stone lantern */}
        <g transform="translate(140, 380)">
          <rect x="-4" y="60" width="8" height="18" fill={isDusk ? "#4a3a34" : "var(--ink-soft)"} />
          <rect x="-14" y="48" width="28" height="14" rx="2" fill={isDusk ? "#5a4a42" : "var(--ink-muted)"} />
          <rect x="-10" y="24" width="20" height="24" fill={isDusk ? "#3a2a26" : "var(--ink)"} opacity="0.8" />
          <rect x="-6" y="30" width="12" height="12" fill={isDusk ? "#ffb060" : "var(--ochre)"} opacity={isDusk ? 0.9 : 0.6} />
          <path d="M -18 24 L 18 24 L 14 16 L -14 16 Z" fill={isDusk ? "#4a3a34" : "var(--ink-soft)"} />
          <rect x="-4" y="8" width="8" height="10" fill={isDusk ? "#4a3a34" : "var(--ink-soft)"} />
          {isDusk ? <circle cx="0" cy="36" r="34" fill="#ffb060" opacity="0.15" /> : null}
        </g>

        {/* big tree left */}
        <g transform="translate(160, 240)" filter="url(#garden-paper)">
          <path d="M -4 140 Q -6 80 -2 20 Q 0 10 2 20 Q 4 80 6 140 Z" fill={isDusk ? "#2a1a14" : "var(--clay)"} />
          <ellipse cx="0" cy="20" rx="70" ry="50" fill={isDusk ? "#2a3020" : "var(--moss-deep)"} opacity="0.9" />
          <ellipse cx="-30" cy="30" rx="38" ry="28" fill={isDusk ? "#2a3020" : "var(--moss)"} opacity="0.8" />
          <ellipse cx="30" cy="10" rx="36" ry="30" fill={isDusk ? "#1a2418" : "var(--moss-deep)"} opacity="0.85" />
        </g>

        {/* small plants scattered */}
        <g transform="translate(340, 460)">
          <path
            d="M 0 0 Q -4 -16 -10 -24 M 0 0 Q 4 -18 10 -22 M 0 0 Q 0 -20 0 -28"
            stroke={isDusk ? "#4a5028" : "var(--moss)"}
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
        </g>
        <g transform="translate(520, 490)">
          <ellipse cx="0" cy="0" rx="22" ry="8" fill={isDusk ? "#2a3020" : "var(--moss)"} opacity="0.7" />
          <ellipse cx="-8" cy="-6" rx="10" ry="8" fill={isDusk ? "#3a4028" : "var(--moss)"} />
          <ellipse cx="8" cy="-5" rx="12" ry="9" fill={isDusk ? "#3a4028" : "var(--moss-deep)"} />
        </g>
        <g transform="translate(860, 430)">
          <rect x="-2" y="0" width="4" height="30" fill={isDusk ? "#2a1a14" : "var(--clay)"} />
          <circle cx="0" cy="-4" r="14" fill={isDusk ? "#2a3020" : "var(--moss)"} />
          <circle cx="-8" cy="-2" r="8" fill={isDusk ? "#2a3020" : "var(--moss)"} />
          <circle cx="8" cy="-6" r="7" fill={isDusk ? "#3a4028" : "var(--moss-deep)"} />
        </g>

        {/* stones by pond */}
        <g transform="translate(600, 484)">
          <ellipse cx="0" cy="0" rx="14" ry="6" fill={isDusk ? "#3a2e2a" : "var(--clay)"} />
          <ellipse cx="0" cy="-2" rx="12" ry="5" fill={isDusk ? "#4a3a34" : "var(--paper-3)"} />
        </g>
        <g transform="translate(850, 500)">
          <ellipse cx="0" cy="0" rx="18" ry="8" fill={isDusk ? "#3a2e2a" : "var(--clay)"} />
          <ellipse cx="0" cy="-2" rx="16" ry="7" fill={isDusk ? "#4a3a34" : "var(--paper-3)"} />
        </g>

        {/* fireflies (dusk) / pollen (day) */}
        {fireflies.map((f) => (
          <circle
            key={f.id}
            cx={f.x * 10}
            cy={f.y * 5.6}
            r={isDusk ? 1.8 : 1}
            fill={isDusk ? "#ffd080" : "var(--ochre)"}
            opacity={isDusk ? 0.9 : 0.4}
          >
            <animate
              attributeName="cx"
              values={`${f.x * 10};${f.x * 10 + 40};${f.x * 10 - 20};${f.x * 10}`}
              dur={`${f.dur}s`}
              repeatCount="indefinite"
              begin={`-${f.delay}s`}
            />
            <animate
              attributeName="cy"
              values={`${f.y * 5.6};${f.y * 5.6 - 30};${f.y * 5.6 + 10};${f.y * 5.6}`}
              dur={`${f.dur}s`}
              repeatCount="indefinite"
              begin={`-${f.delay}s`}
            />
            {isDusk ? (
              <animate
                attributeName="opacity"
                values="0.2;1;0.4;0.9;0.2"
                dur="3s"
                repeatCount="indefinite"
                begin={`-${f.delay}s`}
              />
            ) : null}
          </circle>
        ))}
      </svg>

      {/* caption */}
      <div className="garden-caption">{isDusk ? "The garden at dusk" : "The garden, midday"}</div>

      {/* clickable creatures */}
      {PLACEMENTS.map((p) => (has(p.id) ? <CreatureSlot key={p.id} placement={p} isDusk={isDusk} /> : null))}
    </div>
  );
}

function CreatureSlot({
  placement,
  isDusk,
}: {
  placement: CreaturePlacement;
  isDusk: boolean;
}) {
  const [bounce, setBounce] = useState(false);
  const onClick = () => {
    setBounce(true);
    setTimeout(() => setBounce(false), 600);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`creature-btn ${bounce ? "bounce" : ""}`}
      style={{
        left: placement.left,
        bottom: placement.bottom,
        top: placement.top,
        width: placement.size,
        height: placement.size,
        filter: isDusk ? "brightness(0.85)" : undefined,
      }}
      aria-label={placement.id}
      title={placement.id}
    >
      <CreatureArt id={placement.id} />
    </button>
  );
}

function CreatureArt({ id }: { id: CreatureId }) {
  switch (id) {
    case "cat":
      return (
        <svg viewBox="0 0 100 100">
          <g>
            <ellipse cx="50" cy="70" rx="28" ry="16" fill="var(--ink)" />
            <circle cx="32" cy="58" r="14" fill="var(--ink)" />
            <path d="M 22 52 L 26 42 L 32 50 Z M 38 50 L 42 42 L 44 52 Z" fill="var(--ink)" />
            <path
              d="M 78 72 Q 88 60 84 48"
              stroke="var(--ink)"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
            />
            <circle cx="28" cy="56" r="1.2" fill="var(--accent)" />
            <circle cx="36" cy="56" r="1.2" fill="var(--accent)" />
          </g>
        </svg>
      );
    case "frog":
      return (
        <svg viewBox="0 0 100 100">
          <g>
            <ellipse cx="50" cy="66" rx="30" ry="18" fill="var(--moss)" />
            <ellipse cx="34" cy="48" rx="10" ry="9" fill="var(--moss)" />
            <ellipse cx="66" cy="48" rx="10" ry="9" fill="var(--moss)" />
            <circle cx="34" cy="46" r="4" fill="var(--paper)" />
            <circle cx="66" cy="46" r="4" fill="var(--paper)" />
            <circle cx="34" cy="47" r="2" fill="var(--ink)" />
            <circle cx="66" cy="47" r="2" fill="var(--ink)" />
            <path
              d="M 40 70 Q 50 76 60 70"
              stroke="var(--ink)"
              strokeWidth="1.2"
              fill="none"
              strokeLinecap="round"
            />
          </g>
        </svg>
      );
    case "snail":
      return (
        <svg viewBox="0 0 100 100">
          <g>
            <path
              d="M 16 78 Q 50 78 76 72 Q 80 68 76 64"
              stroke="var(--clay)"
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
            />
            <circle cx="56" cy="50" r="22" fill="var(--ochre)" />
            <path
              d="M 56 50 m -14 0 a 14 14 0 1 1 28 0 a 10 10 0 1 1 -20 0 a 6 6 0 1 1 12 0"
              stroke="var(--clay)"
              strokeWidth="1.4"
              fill="none"
            />
            <line x1="20" y1="74" x2="14" y2="64" stroke="var(--clay)" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="14" cy="63" r="1.5" fill="var(--ink)" />
            <line x1="26" y1="72" x2="22" y2="62" stroke="var(--clay)" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="22" cy="61" r="1.5" fill="var(--ink)" />
          </g>
        </svg>
      );
    case "fox":
      return (
        <svg viewBox="0 0 100 100">
          <g>
            <path
              d="M 70 70 Q 88 62 82 42"
              stroke="var(--accent)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M 82 44 Q 88 40 84 36"
              stroke="var(--paper)"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
            <ellipse cx="48" cy="66" rx="26" ry="14" fill="var(--accent)" />
            <circle cx="34" cy="52" r="14" fill="var(--accent)" />
            <path d="M 24 46 L 26 34 L 34 46 Z M 36 46 L 42 34 L 42 46 Z" fill="var(--accent)" />
            <path d="M 30 54 Q 34 56 38 54 L 34 58 Z" fill="var(--paper)" />
            <circle cx="28" cy="50" r="1.3" fill="var(--ink)" />
            <circle cx="38" cy="50" r="1.3" fill="var(--ink)" />
            <circle cx="34" cy="56" r="1" fill="var(--ink)" />
          </g>
        </svg>
      );
    case "owl":
      return (
        <svg viewBox="0 0 100 100">
          <g>
            <ellipse cx="50" cy="58" rx="24" ry="28" fill="var(--clay)" />
            <path
              d="M 28 38 L 34 46 M 72 38 L 66 46"
              stroke="var(--clay)"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <circle cx="40" cy="52" r="9" fill="var(--paper)" />
            <circle cx="60" cy="52" r="9" fill="var(--paper)" />
            <circle cx="40" cy="53" r="4" fill="var(--ink)" />
            <circle cx="60" cy="53" r="4" fill="var(--ink)" />
            <path d="M 46 62 L 50 68 L 54 62 Z" fill="var(--ochre)" />
            <path
              d="M 40 76 L 42 84 M 60 76 L 58 84"
              stroke="var(--ochre)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
        </svg>
      );
    default:
      return null;
  }
}
