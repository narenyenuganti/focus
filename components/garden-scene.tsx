"use client";

import { useState } from "react";
import { GARDEN_PALETTE as PAL } from "@/lib/garden-palette";

type GardenSceneProps = {
  timeOfDay?: number;
};

export function GardenScene({ timeOfDay = 0.5 }: GardenSceneProps) {
  const [poked, setPoked] = useState<Record<string, number>>({});
  const poke = (id: string) => setPoked((p) => ({ ...p, [id]: (p[id] ?? 0) + 1 }));
  const cls = (id: string, base: string) =>
    poked[id] ? `${base} poked poke-${poked[id] % 2}` : base;

  const isDusk = timeOfDay > 0.75;
  const isDawn = timeOfDay < 0.25;
  const skyTop = isDusk ? "#3E4A6B" : isDawn ? "#F4C4A0" : "#CFE0E8";
  const skyMid = isDusk ? "#E8906A" : isDawn ? "#F5D7A8" : "#E8E0C8";
  const skyBot = isDusk ? "#F5C89A" : isDawn ? "#F8E8C8" : "#F4EFE2";

  const sunX = 100 + timeOfDay * 800;
  const sunY = 180 - Math.sin(timeOfDay * Math.PI) * 140;

  return (
    <svg
      viewBox="0 0 1000 520"
      preserveAspectRatio="xMidYMid slice"
      className="garden-svg"
      role="img"
      aria-label="An animated garden scene"
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={skyTop} />
          <stop offset="0.55" stopColor={skyMid} />
          <stop offset="1" stopColor={skyBot} />
        </linearGradient>
        <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8FA77A" />
          <stop offset="1" stopColor="#5F7A50" />
        </linearGradient>
        <linearGradient id="hills-far" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#A8B8B0" />
          <stop offset="1" stopColor="#8A9E98" />
        </linearGradient>
        <linearGradient id="hills-mid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7E9378" />
          <stop offset="1" stopColor="#5F7A58" />
        </linearGradient>
        <linearGradient id="pond-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#B8D4E0" />
          <stop offset="1" stopColor="#7FA4B8" />
        </linearGradient>
        <radialGradient id="sun-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FFE4A8" stopOpacity="0.9" />
          <stop offset="0.5" stopColor="#F2A441" stopOpacity="0.4" />
          <stop offset="1" stopColor="#F2A441" stopOpacity="0" />
        </radialGradient>
        <filter id="soft" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
        <filter id="softer">
          <feGaussianBlur stdDeviation="2.5" />
        </filter>
        <radialGradient id="vignette" cx="0.5" cy="0.6" r="0.7">
          <stop offset="0.7" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.25" />
        </radialGradient>
      </defs>

      <rect width="1000" height="520" fill="url(#sky)" />

      {/* sun + glow */}
      <g className="sun-arc">
        <circle cx={sunX} cy={sunY} r="110" fill="url(#sun-glow)" />
        <circle cx={sunX} cy={sunY} r="42" fill="#F8C96A" />
        <circle cx={sunX} cy={sunY} r="32" fill="#F5D88A" />
      </g>

      {/* drifting clouds */}
      <g className="cloud cloud-1">
        <ellipse cx="200" cy="100" rx="70" ry="18" fill="#fff" opacity="0.85" />
        <ellipse cx="240" cy="90" rx="55" ry="15" fill="#fff" opacity="0.85" />
        <ellipse cx="280" cy="105" rx="50" ry="14" fill="#fff" opacity="0.8" />
      </g>
      <g className="cloud cloud-2">
        <ellipse cx="620" cy="60" rx="60" ry="14" fill="#fff" opacity="0.75" />
        <ellipse cx="660" cy="70" rx="40" ry="12" fill="#fff" opacity="0.75" />
      </g>
      <g className="cloud cloud-3">
        <ellipse cx="880" cy="140" rx="80" ry="18" fill="#fff" opacity="0.7" />
        <ellipse cx="920" cy="130" rx="40" ry="12" fill="#fff" opacity="0.7" />
      </g>

      {/* distant mountains */}
      <g filter="url(#softer)" opacity="0.85">
        <path
          d="M0 320 L 120 220 L 200 270 L 320 200 L 440 260 L 560 210 L 700 260 L 820 220 L 1000 280 L 1000 340 L 0 340 Z"
          fill="url(#hills-far)"
        />
      </g>

      {/* mid hills */}
      <path
        d="M0 360 Q 180 300 360 340 Q 560 380 740 320 Q 880 290 1000 330 L 1000 400 L 0 400 Z"
        fill="url(#hills-mid)"
      />

      {/* distant village silhouettes */}
      <g opacity="0.6" fill="#5A6A66">
        <rect x="380" y="320" width="14" height="20" />
        <polygon points="380,320 387,312 394,320" />
        <rect x="400" y="316" width="18" height="24" />
        <polygon points="400,316 409,306 418,316" />
        <rect x="424" y="320" width="12" height="20" />
        <polygon points="424,320 430,312 436,320" />
      </g>

      {/* tree line behind */}
      <g opacity="0.7">
        {Array.from({ length: 14 }).map((_, i) => {
          const x = 60 + i * 70 + (i % 2 ? 10 : 0);
          const h = 38 + (i * 7) % 18;
          return (
            <g key={i}>
              <rect x={x - 2} y={380 - h + h * 0.6} width="4" height={h * 0.4} fill="#4A3220" />
              <ellipse cx={x} cy={380 - h + h * 0.6} rx={h * 0.42} ry={h * 0.55} fill="#5F7A58" />
            </g>
          );
        })}
      </g>

      {/* ground plane */}
      <rect x="0" y="395" width="1000" height="125" fill="url(#ground)" />

      {/* pond with ripples + koi + lily pad creatures */}
      <g className="pond">
        <ellipse cx="720" cy="450" rx="150" ry="28" fill="#4F7388" opacity="0.9" />
        <ellipse cx="720" cy="448" rx="145" ry="25" fill="url(#pond-g)" />
        <ellipse className="ripple r1" cx="720" cy="448" rx="30" ry="5" fill="none" stroke="#fff" strokeWidth="1" opacity="0.7" />
        <ellipse className="ripple r2" cx="720" cy="448" rx="50" ry="9" fill="none" stroke="#fff" strokeWidth="1" opacity="0.5" />
        <ellipse className="ripple r3" cx="720" cy="448" rx="70" ry="13" fill="none" stroke="#fff" strokeWidth="1" opacity="0.3" />
        <ellipse
          cx={Math.min(860, Math.max(580, sunX * 0.7 + 200))}
          cy="448"
          rx="30"
          ry="4"
          fill="#F5D88A"
          opacity="0.6"
          filter="url(#soft)"
        />
        <ellipse cx="640" cy="450" rx="16" ry="5" fill="#5F7A58" />
        <ellipse cx="780" cy="455" rx="14" ry="4" fill="#5F7A58" />
        <circle cx="784" cy="453" r="2.5" fill={PAL.petal} />
        {/* koi — click makes it jump out of the water */}
        <g transform="translate(680 450)" onClick={() => poke("koi")} style={{ cursor: "pointer" }}>
          <g className={cls("koi", "koi-fish")}>
            <path d="M0 0 Q 10 -4 22 0 Q 30 4 22 6 Q 10 8 0 4 Z" fill="#F8C96A" />
            <path d="M-6 -2 L -12 -6 L -10 -2 L -12 2 Z" fill="#F5A34A" />
            <circle cx="18" cy="0" r="1" fill="#2A2725" />
          </g>
        </g>
        {/* water splash when koi jumps */}
        {poked["koi"] ? (
          <g key={`splash-${poked.koi}`} className="koi-splash">
            <circle cx="720" cy="448" r="4" fill="#fff" opacity="0.9" />
            <circle cx="710" cy="446" r="2" fill="#fff" opacity="0.7" />
            <circle cx="730" cy="446" r="2" fill="#fff" opacity="0.7" />
          </g>
        ) : null}
        {/* frog on lily pad — leaps when poked */}
        <g transform="translate(780 452)" onClick={() => poke("frog")} style={{ cursor: "pointer" }}>
          <g className={cls("frog", "frog-body")}>
            <ellipse cx="0" cy="0" rx="8" ry="5" fill="#6B8A4A" />
            <ellipse cx="0" cy="-2" rx="7" ry="4" fill="#88A860" />
            <circle cx="-3" cy="-4" r="2" fill="#88A860" />
            <circle cx="3" cy="-4" r="2" fill="#88A860" />
            <circle cx="-3" cy="-4" r="1" fill="#2A2725" />
            <circle cx="3" cy="-4" r="1" fill="#2A2725" />
            <path d="M-4 0 Q 0 2 4 0" stroke="#2A2725" strokeWidth="0.5" fill="none" />
          </g>
        </g>
        {/* duck paddling on pond — dips on click */}
        <g transform="translate(640 446)" onClick={() => poke("duck")} style={{ cursor: "pointer" }}>
          <g className={cls("duck", "duck-body")}>
            <ellipse cx="0" cy="0" rx="14" ry="6" fill="#F4EFE2" />
            <circle cx="10" cy="-5" r="5" fill="#3E6A3E" />
            <path d="M13 -4 L 18 -5 L 17 -2 L 13 -2 Z" fill="#E8B84A" />
            <circle cx="11" cy="-6" r="0.8" fill="#2A2725" />
            <path d="M-12 1 Q -16 4 -10 4" fill="#F4EFE2" />
          </g>
        </g>
      </g>

      {/* grass blades */}
      <g className="grass">
        {Array.from({ length: 70 }).map((_, i) => {
          const x = i * 15 + (i % 3) * 4;
          const h = 6 + (i * 13) % 10;
          const lean = (i % 2 ? 1 : -1) * 1.5;
          return (
            <path
              key={i}
              d={`M${x} 410 Q ${x + lean} ${410 - h * 0.5} ${x + lean * 1.4} ${410 - h}`}
              stroke="#3E5A3C"
              strokeWidth="1"
              fill="none"
              opacity="0.6"
              className="blade"
              style={{ animationDelay: `${(i % 10) * -0.3}s` }}
            />
          );
        })}
      </g>

      {/* big olive tree left */}
      <g transform="translate(130 320)">
        <g className="tree-sway">
          <rect x="-6" y="48" width="12" height="56" fill="#5A3A24" />
          <ellipse cx="-18" cy="28" rx="38" ry="44" fill="#6E8A68" />
          <ellipse cx="18" cy="18" rx="42" ry="46" fill="#7A9772" />
          <ellipse cx="0" cy="0" rx="32" ry="34" fill="#8AA782" />
          <ellipse cx="-10" cy="40" rx="6" ry="3" fill="#4A6848" opacity="0.6" />
          <ellipse cx="14" cy="44" rx="5" ry="2.5" fill="#4A6848" opacity="0.6" />
        </g>
      </g>

      {/* sakura mid-right */}
      <g transform="translate(560 320)">
        <g className="tree-sway" style={{ animationDelay: "-2s" }}>
          <rect x="-5" y="30" width="10" height="70" fill="#5A3A24" />
          <ellipse cx="-22" cy="10" rx="32" ry="32" fill="#F2C3D0" />
          <ellipse cx="18" cy="0" rx="36" ry="34" fill="#F5D0DA" />
          <ellipse cx="0" cy="-18" rx="28" ry="28" fill="#F8DCE4" />
          <ellipse cx="-30" cy="24" rx="14" ry="12" fill="#F2C3D0" opacity="0.85" />
          <ellipse cx="30" cy="28" rx="16" ry="12" fill="#F5D0DA" opacity="0.85" />
        </g>
      </g>

      {/* cypress far right */}
      <g transform="translate(900 330)">
        <g className="tree-sway" style={{ animationDelay: "-4s" }}>
          <path d="M0 -110 Q -18 -50 -22 80 Q 0 75 22 80 Q 18 -50 0 -110 Z" fill="#3E5A3C" />
          <path d="M0 -100 Q -14 -40 -16 70" stroke="#2E4A2C" strokeWidth="1.5" fill="none" opacity="0.6" />
        </g>
      </g>

      {/* second olive tree far left */}
      <g transform="translate(40 340)">
        <g className="tree-sway" style={{ animationDelay: "-3s" }}>
          <rect x="-4" y="36" width="8" height="42" fill="#5A3A24" />
          <ellipse cx="-8" cy="18" rx="22" ry="26" fill="#7A9772" opacity="0.9" />
          <ellipse cx="10" cy="10" rx="24" ry="26" fill="#8AA782" opacity="0.9" />
        </g>
      </g>

      {/* maple */}
      <g transform="translate(300 340)">
        <g className="tree-sway" style={{ animationDelay: "-1.5s" }}>
          <rect x="-3" y="30" width="6" height="48" fill="#4A3220" />
          <circle cx="-14" cy="14" r="18" fill="#C94B3A" />
          <circle cx="12" cy="8" r="22" fill="#D15A3E" />
          <circle cx="0" cy="-8" r="16" fill="#E37A44" />
          <circle cx="-20" cy="-2" r="10" fill="#B8372D" />
        </g>
      </g>

      {/* lavender patch foreground */}
      <g transform="translate(250 460)">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => {
          const x = i * 12 - 36;
          return (
            <g key={i}>
              <line x1={x} y1="10" x2={x + 1} y2="-14" stroke="#3E5A3C" strokeWidth="1.2" />
              {[0, 1, 2, 3].map((j) => (
                <circle key={j} cx={x + (j % 2 ? 0.8 : -0.8)} cy={-14 + j * 4} r="1.8" fill={j < 2 ? "#9B84C4" : "#6B5795"} />
              ))}
            </g>
          );
        })}
      </g>

      {/* foxgloves */}
      <g transform="translate(400 470)">
        {[0, 1, 2].map((i) => {
          const x = i * 14 - 14;
          return (
            <g key={i}>
              <line x1={x} y1="6" x2={x} y2="-30" stroke="#3E5A3C" strokeWidth="1.4" />
              {[0, 1, 2, 3, 4].map((j) => (
                <path
                  key={j}
                  d="M0 0 Q 3 1 3 4 Q 0 6 -3 4 Q -3 1 0 0 Z"
                  fill="#C76A8B"
                  transform={`translate(${x + (j % 2 ? 2 : -2)} ${-6 - j * 5})`}
                />
              ))}
            </g>
          );
        })}
      </g>

      {/* standing stone */}
      <g transform="translate(460 440)">
        <ellipse cx="0" cy="38" rx="22" ry="3" fill="#000" opacity="0.2" />
        <path d="M-14 36 C -14 10, -6 -18, 4 -18 C 14 -18, 18 10, 16 36 Z" fill="#B5AC9A" />
        <path d="M-14 36 C -14 22, -10 4, -4 -10" stroke="#fff" strokeWidth="1" fill="none" opacity="0.4" />
      </g>

      {/* mushrooms cluster */}
      <g transform="translate(80 475)">
        {[{ x: 0, y: 0, r: 6, h: 10 }, { x: 12, y: 4, r: 4, h: 7 }, { x: -10, y: 3, r: 3.5, h: 6 }].map((m, i) => (
          <g key={i}>
            <rect x={m.x - m.r * 0.28} y={m.y} width={m.r * 0.56} height={m.h} rx="2" fill="#F4EFE2" />
            <path d={`M${m.x - m.r} ${m.y} Q ${m.x} ${m.y - m.r * 0.9} ${m.x + m.r} ${m.y} Q ${m.x} ${m.y + m.r * 0.35} ${m.x - m.r} ${m.y} Z`} fill="#C94B3A" />
            <circle cx={m.x - m.r * 0.4} cy={m.y - m.r * 0.2} r="1" fill="#fff" />
          </g>
        ))}
      </g>

      {/* poppies scattered */}
      <g>
        {[{ x: 340, y: 478 }, { x: 820, y: 482 }, { x: 890, y: 470 }, { x: 180, y: 480 }].map((p, i) => (
          <g key={i} transform={`translate(${p.x} ${p.y})`}>
            <line x1="0" y1="8" x2="0" y2="-8" stroke="#3E5A3C" strokeWidth="1.3" />
            <path d="M-6 -8 Q 0 -14 6 -8 Q 0 -4 -6 -8 Z" fill="#C94B3A" />
            <circle cx="0" cy="-9" r="1.2" fill="#2A2725" />
          </g>
        ))}
      </g>

      {/* stone bench */}
      <g transform="translate(350 440)" opacity="0.95">
        <rect x="-22" y="16" width="44" height="4" fill="#B5AC9A" />
        <rect x="-18" y="20" width="4" height="16" fill="#8A8273" />
        <rect x="14" y="20" width="4" height="16" fill="#8A8273" />
      </g>

      {/* paper lantern hanging from sakura */}
      <g transform="translate(568 318)">
        <g className="lantern-sway">
          <line x1="0" y1="-4" x2="0" y2="10" stroke="#4A3220" strokeWidth="1" />
          <ellipse cx="0" cy="16" rx="9" ry="7" fill="#F4EFE2" stroke="#4A3220" strokeWidth="0.8" />
          <circle cx="0" cy="16" r="7" fill="#F8C96A" opacity="0.6" />
          <circle cx="0" cy="16" r="3" fill="#FFE4A8" />
        </g>
      </g>

      {/* butterflies */}
      <g className="butterflies">
        <g transform="translate(220 280)" onClick={() => poke("bfly1")} style={{ cursor: "pointer" }}>
          <g className={cls("bfly1", "bfly bfly-1")}>
            <path d="M0 0 Q -8 -6 -11 0 Q -8 4 0 3 Z" fill="#F5D88A" />
            <path d="M0 0 Q 8 -6 11 0 Q 8 4 0 3 Z" fill="#F5D88A" />
            <line x1="0" y1="-2" x2="0" y2="4" stroke="#2A2725" strokeWidth="1" />
          </g>
        </g>
        <g transform="translate(480 360)" onClick={() => poke("bfly2")} style={{ cursor: "pointer" }}>
          <g className={cls("bfly2", "bfly bfly-2")}>
            <path d="M0 0 Q -8 -6 -11 0 Q -8 4 0 3 Z" fill="#E8B4C2" />
            <path d="M0 0 Q 8 -6 11 0 Q 8 4 0 3 Z" fill="#E8B4C2" />
            <line x1="0" y1="-2" x2="0" y2="4" stroke="#2A2725" strokeWidth="1" />
          </g>
        </g>
        <g transform="translate(820 300)" onClick={() => poke("bfly3")} style={{ cursor: "pointer" }}>
          <g className={cls("bfly3", "bfly bfly-3")}>
            <path d="M0 0 Q -7 -5 -9 0 Q -7 3 0 2 Z" fill="#9FE8C5" />
            <path d="M0 0 Q 7 -5 9 0 Q 7 3 0 2 Z" fill="#9FE8C5" />
            <line x1="0" y1="-2" x2="0" y2="4" stroke="#2A2725" strokeWidth="0.8" />
          </g>
        </g>
      </g>

      {/* rabbit — hops on click */}
      <g transform="translate(220 478)" onClick={() => poke("rabbit")} style={{ cursor: "pointer" }}>
        <g className={cls("rabbit", "rabbit-body")}>
          <ellipse cx="0" cy="-3" rx="10" ry="7" fill="#F4EFE2" />
          <circle cx="8" cy="-8" r="5" fill="#F4EFE2" />
          <ellipse cx="6" cy="-15" rx="1.6" ry="5" fill="#F4EFE2" transform="rotate(-8 6 -15)" />
          <ellipse cx="10" cy="-15" rx="1.6" ry="5" fill="#F4EFE2" transform="rotate(6 10 -15)" />
          <circle cx="10" cy="-8" r="0.7" fill="#2A2725" />
          <circle cx="11" cy="-7" r="0.4" fill="#E8B4C2" />
          <circle cx="-10" cy="-3" r="2.5" fill="#F4EFE2" />
        </g>
      </g>

      {/* deer — grazes, then tosses head on click */}
      <g transform="translate(420 436)" onClick={() => poke("deer")} style={{ cursor: "pointer" }}>
        <g className={cls("deer", "deer-body")}>
          <ellipse cx="0" cy="0" rx="18" ry="10" fill="#C2905A" />
          <g className={cls("deer", "deer-head")}>
            <ellipse cx="16" cy="-6" rx="6" ry="8" fill="#C2905A" />
            <circle cx="18" cy="-14" r="4" fill="#C2905A" />
            <path d="M16 -17 L 14 -24 L 17 -20 Z" fill="#8A6240" />
            <path d="M20 -17 L 22 -24 L 19 -20 Z" fill="#8A6240" />
            <circle cx="19" cy="-14" r="0.7" fill="#2A2725" />
          </g>
          <path d="M-10 6 L -11 14 M-4 6 L -4 14 M6 6 L 6 14 M12 6 L 13 14" stroke="#8A6240" strokeWidth="2" strokeLinecap="round" />
          {[{ x: -6, y: -4 }, { x: 2, y: -6 }, { x: 8, y: -2 }].map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r="0.8" fill="#F4EFE2" />
          ))}
        </g>
      </g>

      {/* squirrel on tree trunk — scampers */}
      <g transform="translate(298 378)" onClick={() => poke("squirrel")} style={{ cursor: "pointer" }}>
        <g className={cls("squirrel", "squirrel-body")}>
          <path d="M-8 6 Q -14 -2 -10 -10 Q -4 -14 -4 -6 Q -6 0 -4 6 Z" fill="#B85A2A" />
          <ellipse cx="0" cy="2" rx="6" ry="5" fill="#C2663B" />
          <circle cx="6" cy="-4" r="4" fill="#C2663B" />
          <circle cx="8" cy="-4" r="0.7" fill="#2A2725" />
          <path d="M5 -8 L 3 -12 L 6 -10 Z" fill="#C2663B" />
        </g>
      </g>

      {/* hedgehog — curls up on click */}
      <g transform="translate(160 486)" onClick={() => poke("hedgehog")} style={{ cursor: "pointer" }}>
        <g className={cls("hedgehog", "hedgehog-body")}>
          <ellipse cx="0" cy="0" rx="10" ry="6" fill="#8A6240" />
          {Array.from({ length: 14 }).map((_, i) => {
            const a = Math.PI + (i / 14) * Math.PI;
            const x = Math.cos(a) * 8;
            const y = Math.sin(a) * 5.5;
            return <line key={i} x1={x} y1={y} x2={x + Math.cos(a) * 3} y2={y + Math.sin(a) * 3} stroke="#4A3220" strokeWidth="0.8" />;
          })}
          <circle cx="8" cy="0" r="3.5" fill="#D4B088" />
          <circle cx="10" cy="-1" r="0.5" fill="#2A2725" />
          <circle cx="10.5" cy="1" r="0.7" fill="#2A2725" />
        </g>
      </g>

      {/* snail on stone — retracts on click */}
      <g transform="translate(462 452)" onClick={() => poke("snail")} style={{ cursor: "pointer" }}>
        <g className={cls("snail", "snail-body")}>
          <path d="M-8 4 Q -10 -2 0 -2 L 10 -2 Q 14 0 12 4 Z" fill="#C8A878" />
          <circle cx="4" cy="-2" r="6" fill="#8A6240" />
          <circle cx="4" cy="-2" r="4" fill="#A87F52" />
          <circle cx="4" cy="-2" r="2" fill="#8A6240" />
          <g className={cls("snail", "snail-horns")}>
            <path d="M-6 0 Q -10 -4 -8 -7" stroke="#C8A878" strokeWidth="1" fill="none" />
            <circle cx="-8" cy="-7" r="0.6" fill="#2A2725" />
          </g>
        </g>
      </g>

      {/* ladybug on grass — flies off on click */}
      <g transform="translate(340 490)" onClick={() => poke("ladybug")} style={{ cursor: "pointer" }}>
        <g className={cls("ladybug", "ladybug-body")}>
          <ellipse cx="0" cy="0" rx="5" ry="4" fill="#C94B3A" />
          <path d="M0 -4 V4" stroke="#2A2725" strokeWidth="0.6" />
          <ellipse cx="0" cy="-3" rx="2.5" ry="1.5" fill="#2A2725" />
          <circle cx="-2" cy="0" r="0.7" fill="#2A2725" />
          <circle cx="2" cy="0" r="0.7" fill="#2A2725" />
          <circle cx="-1" cy="2" r="0.6" fill="#2A2725" />
          <circle cx="1" cy="2" r="0.6" fill="#2A2725" />
        </g>
      </g>

      {/* house cat — stretches on click */}
      <g transform="translate(368 444)" onClick={() => poke("cat")} style={{ cursor: "pointer" }}>
        <g className={cls("cat", "cat-body")}>
          <ellipse cx="0" cy="0" rx="12" ry="6" fill="#2A2725" />
          <circle cx="11" cy="-4" r="5" fill="#2A2725" />
          <path d="M7 -7 L 6 -12 L 10 -9 Z" fill="#2A2725" />
          <path d="M15 -7 L 16 -12 L 12 -9 Z" fill="#2A2725" />
          <ellipse cx="10" cy="-4" rx="0.7" ry="1.5" fill="#7BC47F" />
          <ellipse cx="13" cy="-4" rx="0.7" ry="1.5" fill="#7BC47F" />
          <path d="M-12 0 Q -18 -2 -16 -6" stroke="#2A2725" strokeWidth="2" fill="none" />
        </g>
      </g>

      {/* mouse — scurries */}
      <g transform="translate(84 492)" onClick={() => poke("mouse")} style={{ cursor: "pointer" }}>
        <g className={cls("mouse", "mouse-body")}>
          <ellipse cx="0" cy="0" rx="6" ry="3" fill="#9B8878" />
          <circle cx="5" cy="-2" r="3" fill="#9B8878" />
          <circle cx="3" cy="-4" r="1.8" fill="#B8A898" />
          <circle cx="7" cy="-4" r="1.8" fill="#B8A898" />
          <circle cx="6" cy="-2" r="0.5" fill="#2A2725" />
          <path d="M-6 0 Q -12 2 -12 -2" stroke="#9B8878" strokeWidth="1" fill="none" />
        </g>
      </g>

      {/* owl in cypress — blinks on click */}
      <g transform="translate(900 260)" onClick={() => poke("owl")} style={{ cursor: "pointer" }}>
        <g className={cls("owl", "owl-body")}>
          <ellipse cx="0" cy="0" rx="10" ry="12" fill="#8A6240" />
          <path d="M-8 -10 L -8 -15 L -4 -10 Z" fill="#8A6240" />
          <path d="M8 -10 L 8 -15 L 4 -10 Z" fill="#8A6240" />
          <circle cx="-4" cy="-3" r="3.5" fill="#F4EFE2" />
          <circle cx="4" cy="-3" r="3.5" fill="#F4EFE2" />
          <circle className={cls("owl", "owl-eye")} cx="-4" cy="-3" r="2" fill="#2A2725" />
          <circle className={cls("owl", "owl-eye")} cx="4" cy="-3" r="2" fill="#2A2725" />
          <path d="M0 0 L -2 3 L 2 3 Z" fill="#E8B84A" />
        </g>
      </g>

      {/* turtle — pulls in head on click */}
      <g transform="translate(520 495)" onClick={() => poke("turtle")} style={{ cursor: "pointer" }}>
        <g className="turtle-body">
          <ellipse cx="0" cy="0" rx="12" ry="7" fill="#5F7A4A" />
          <ellipse cx="0" cy="-1" rx="10" ry="5" fill="#7A9758" />
          {[{ x: -4, y: -1 }, { x: 4, y: -1 }, { x: 0, y: 2 }, { x: -6, y: 2 }, { x: 6, y: 2 }].map((s, i) => (
            <path
              key={i}
              d={`M${s.x} ${s.y} l -2 1 l 0 2 l 2 1 l 2 -1 l 0 -2 z`}
              fill="#5F7A4A"
              stroke="#4A6238"
              strokeWidth="0.3"
            />
          ))}
          <g className={cls("turtle", "turtle-head")}>
            <circle cx="10" cy="0" r="3" fill="#9BB870" />
            <circle cx="11.5" cy="-0.8" r="0.4" fill="#2A2725" />
          </g>
          <ellipse cx="-9" cy="4" rx="2" ry="1" fill="#9BB870" />
          <ellipse cx="9" cy="4" rx="2" ry="1" fill="#9BB870" />
        </g>
      </g>

      {/* dragonfly over pond — darts */}
      <g transform="translate(700 420)" onClick={() => poke("dfly")} style={{ cursor: "pointer" }}>
        <g className={cls("dfly", "dfly-body")}>
          <ellipse cx="0" cy="0" rx="1.2" ry="8" fill="#4A8FB8" />
          <circle cx="0" cy="-7" r="2" fill="#2B6B94" />
          <ellipse cx="-6" cy="-2" rx="6" ry="1.5" fill="#B8E0F2" opacity="0.75" />
          <ellipse cx="6" cy="-2" rx="6" ry="1.5" fill="#B8E0F2" opacity="0.75" />
          <ellipse cx="-5" cy="2" rx="5" ry="1.3" fill="#B8E0F2" opacity="0.7" />
          <ellipse cx="5" cy="2" rx="5" ry="1.3" fill="#B8E0F2" opacity="0.7" />
        </g>
      </g>

      {/* bee near lavender */}
      <g transform="translate(260 438)" onClick={() => poke("bee")} style={{ cursor: "pointer" }}>
        <g className={cls("bee", "bee-body")}>
          <ellipse cx="0" cy="0" rx="4" ry="2.8" fill="#E8B84A" />
          <rect x="-3" y="-1" width="6" height="1" fill="#2A2725" />
          <rect x="-2" y="1" width="4" height="0.8" fill="#2A2725" />
          <ellipse cx="-2" cy="-2.5" rx="3" ry="1.2" fill="#E0F2FA" opacity="0.8" />
          <ellipse cx="2" cy="-2.5" rx="3" ry="1.2" fill="#E0F2FA" opacity="0.8" />
          <circle cx="-4" cy="0" r="0.5" fill="#2A2725" />
        </g>
      </g>

      {/* falling petals */}
      <g className="petals">
        {Array.from({ length: 10 }).map((_, i) => (
          <g key={i} transform={`translate(${80 + i * 90} -20)`}>
            <ellipse className={`petal petal-${i % 5}`} cx="0" cy="0" rx="4" ry="2.2" fill="#F2C3D0" />
          </g>
        ))}
      </g>

      {/* firefly glows */}
      <g className="fireflies">
        {[{ x: 180, y: 360 }, { x: 420, y: 380 }, { x: 620, y: 350 }, { x: 300, y: 420 }, { x: 840, y: 410 }, { x: 540, y: 420 }].map((p, i) => (
          <g key={i} transform={`translate(${p.x} ${p.y})`}>
            <g className={`firefly ff-${i}`}>
              <circle r="8" fill="#F8C96A" opacity="0.3" />
              <circle r="2" fill="#F8E8A4" />
            </g>
          </g>
        ))}
      </g>

      {/* vignette */}
      <rect width="1000" height="520" fill="url(#vignette)" pointerEvents="none" />
    </svg>
  );
}
