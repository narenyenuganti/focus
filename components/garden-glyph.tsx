import { GARDEN_PALETTE as PAL } from "@/lib/garden-palette";

export type GlyphKind =
  | "fern" | "lavender" | "foxglove" | "poppy" | "iris" | "mushroom"
  | "thistle" | "rose" | "tulip" | "sunflower" | "hydrangea" | "wisteria"
  | "bamboo" | "moss" | "clover" | "orchid"
  | "olive" | "maple" | "willow" | "cypress" | "sakura" | "oak"
  | "birch" | "pine" | "ginkgo" | "apple" | "redwood" | "bonsai"
  | "stone" | "cairn" | "bench" | "torii" | "stepping" | "boulder"
  | "birdbath" | "sundial" | "zen" | "statue"
  | "lantern" | "firefly" | "moonlamp" | "candle" | "torch"
  | "string" | "glowworm" | "starlantern" | "bonfire"
  | "pond" | "stream" | "fountain"
  | "butterfly" | "bird" | "koi" | "fox"
  | "rabbit" | "deer" | "turtle" | "frog" | "squirrel" | "hedgehog"
  | "dragonfly" | "snail" | "ladybug" | "cat" | "mouse" | "owl" | "bee" | "duck"
  | "sun" | "clouds" | "moon" | "stars" | "aurora"
  | "petals" | "snow" | "autumn";

type GlyphProps = { kind: GlyphKind; size?: number };

export function GardenGlyph({ kind, size = 80 }: GlyphProps) {
  const s = size;
  const base = { width: s, height: s, viewBox: "0 0 80 80", overflow: "visible" as const };

  switch (kind) {
    case "fern":
      return (
        <svg {...base}>
          <path d="M40 74 V28" stroke={PAL.bark} strokeWidth="1.8" strokeLinecap="round" fill="none" />
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const y = 30 + i * 7;
            const w = 16 - i * 1.8;
            return (
              <g key={i} transform={`translate(40 ${y})`}>
                <path d={`M0 0 C -${w} -3 -${w + 2} -9 -${w - 3} -13 Q -${w - 1} -8 -0.5 -1 Z`} fill={PAL.leaf} />
                <path d={`M0 0 C  ${w} -3  ${w + 2} -9  ${w - 3} -13 Q  ${w - 1} -8  0.5 -1 Z`} fill={PAL.leafDark} />
              </g>
            );
          })}
        </svg>
      );
    case "lavender":
      return (
        <svg {...base}>
          {[24, 40, 56].map((x, i) => (
            <g key={i}>
              <path d={`M${x} 74 V${36 - (i === 1 ? 6 : 0)}`} stroke={PAL.leafDark} strokeWidth="1.6" strokeLinecap="round" fill="none" />
              {[0, 1, 2, 3, 4].map((j) => (
                <circle key={j} cx={x + (j % 2 ? 1.2 : -1.2)} cy={(i === 1 ? 30 : 34) - j * 5} r="2.6" fill={j < 3 ? PAL.lav : PAL.lavDark} />
              ))}
              <circle cx={x} cy={i === 1 ? 20 : 24} r="2" fill={PAL.lavDark} />
            </g>
          ))}
          <ellipse cx="40" cy="76" rx="22" ry="2" fill={PAL.leafDark} opacity="0.3" />
        </svg>
      );
    case "foxglove":
      return (
        <svg {...base}>
          <path d="M40 74 V22" stroke={PAL.leafDark} strokeWidth="1.8" fill="none" />
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i} transform={`translate(${40 + (i % 2 ? 4 : -4)} ${26 + i * 7})`}>
              <path d="M0 0 Q 3 2 3 5 Q 0 7 -3 5 Q -3 2 0 0 Z" fill={PAL.petalDeep} />
              <circle cx="0" cy="2" r="0.8" fill="#fff" opacity="0.6" />
            </g>
          ))}
          <path d="M34 62 Q 30 58 34 54" stroke={PAL.leaf} strokeWidth="2" fill="none" />
          <path d="M46 66 Q 50 62 46 58" stroke={PAL.leaf} strokeWidth="2" fill="none" />
        </svg>
      );
    case "poppy":
      return (
        <svg {...base}>
          {[28, 42, 54].map((x, i) => (
            <g key={i}>
              <path d={`M${x} 74 Q ${x - 1} 50 ${x} ${30 - (i === 1 ? 4 : 0)}`} stroke={PAL.leaf} strokeWidth="1.6" fill="none" />
              <path
                d={`M${x - 8} ${30 - (i === 1 ? 4 : 0)} Q ${x} ${18 - (i === 1 ? 4 : 0)} ${x + 8} ${30 - (i === 1 ? 4 : 0)} Q ${x} ${34 - (i === 1 ? 4 : 0)} ${x - 8} ${30 - (i === 1 ? 4 : 0)} Z`}
                fill={PAL.red}
              />
              <circle cx={x} cy={28 - (i === 1 ? 4 : 0)} r="2" fill={PAL.trim} />
            </g>
          ))}
        </svg>
      );
    case "iris":
      return (
        <svg {...base}>
          <path d="M40 74 V30" stroke={PAL.leafDark} strokeWidth="1.6" fill="none" />
          <path d="M34 72 Q 28 50 34 28" stroke={PAL.leaf} strokeWidth="2" fill="none" />
          <path d="M46 72 Q 52 50 46 28" stroke={PAL.leaf} strokeWidth="2" fill="none" />
          <path d="M40 30 Q 30 22 32 14 Q 40 18 40 30 Z" fill={PAL.lav} />
          <path d="M40 30 Q 50 22 48 14 Q 40 18 40 30 Z" fill={PAL.lavDark} />
          <path d="M40 30 Q 36 24 40 18 Q 44 24 40 30 Z" fill={PAL.yellow} />
        </svg>
      );
    case "mushroom":
      return (
        <svg {...base}>
          {[[24, 56, 10, 14], [40, 50, 16, 18], [58, 58, 9, 12]].map(([x, y, r, h], i) => (
            <g key={i}>
              <ellipse cx={x} cy={y + h} rx={r * 0.6} ry="2" fill={PAL.bark} opacity="0.3" />
              <rect x={x - r * 0.28} y={y} width={r * 0.56} height={h} rx="2" fill={PAL.cloud} />
              <path d={`M${x - r} ${y} Q ${x} ${y - r * 0.9} ${x + r} ${y} Q ${x} ${y + r * 0.35} ${x - r} ${y} Z`} fill={PAL.red} />
              <circle cx={x - r * 0.4} cy={y - r * 0.2} r="1.5" fill="#fff" />
              <circle cx={x + r * 0.3} cy={y - r * 0.1} r="1.2" fill="#fff" />
            </g>
          ))}
        </svg>
      );
    case "thistle":
      return (
        <svg {...base}>
          <path d="M40 74 V40" stroke={PAL.leafDark} strokeWidth="1.6" fill="none" />
          <circle cx="40" cy="34" r="9" fill={PAL.lav} />
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return (
              <line
                key={i}
                x1={40 + Math.cos(a) * 9}
                y1={34 + Math.sin(a) * 9}
                x2={40 + Math.cos(a) * 14}
                y2={34 + Math.sin(a) * 14}
                stroke={PAL.lavDark}
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            );
          })}
          <path d="M34 66 Q 28 62 32 56" stroke={PAL.leaf} strokeWidth="2" fill="none" />
        </svg>
      );
    case "rose":
      return (
        <svg {...base}>
          <path d="M40 74 Q 36 50 40 28" stroke={PAL.leafDark} strokeWidth="1.8" fill="none" />
          {[{ x: 30, y: 48, r: 4 }, { x: 48, y: 42, r: 5 }, { x: 34, y: 32, r: 6 }, { x: 46, y: 24, r: 7 }].map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={p.r} fill={PAL.rose} />
              <circle cx={p.x - 1} cy={p.y - 1} r={p.r * 0.6} fill={PAL.petal} />
            </g>
          ))}
          <path d="M30 60 Q 24 58 26 52" stroke={PAL.leaf} strokeWidth="2" fill="none" />
          <path d="M50 54 Q 56 52 54 46" stroke={PAL.leaf} strokeWidth="2" fill="none" />
        </svg>
      );
    case "tulip":
      return (
        <svg {...base}>
          {[{ x: 20, c: "#C94B3A" }, { x: 32, c: "#E8B4C2" }, { x: 44, c: "#E8B84A" }, { x: 56, c: "#C76A8B" }].map((t, i) => (
            <g key={i}>
              <path d={`M${t.x} 72 V38`} stroke={PAL.leafDark} strokeWidth="1.6" fill="none" />
              <path d={`M${t.x - 5} 38 Q ${t.x} 22 ${t.x + 5} 38 Q ${t.x} 34 ${t.x - 5} 38 Z`} fill={t.c} />
              <path d={`M${t.x - 5} 38 Q ${t.x - 2} 30 ${t.x} 38`} fill={t.c} opacity="0.7" />
              <path d={`M${t.x - 4} 54 Q ${t.x - 10} 48 ${t.x - 6} 42`} stroke={PAL.leaf} strokeWidth="1.8" fill="none" />
            </g>
          ))}
        </svg>
      );
    case "sunflower":
      return (
        <svg {...base}>
          <path d="M40 74 V36" stroke={PAL.leafDark} strokeWidth="2" fill="none" />
          <path d="M32 60 Q 22 58 22 50 Q 32 52 34 58 Z" fill={PAL.leaf} />
          <path d="M48 52 Q 58 50 58 42 Q 48 44 46 50 Z" fill={PAL.leaf} />
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return (
              <ellipse
                key={i}
                cx={40 + Math.cos(a) * 14}
                cy={30 + Math.sin(a) * 14}
                rx="6"
                ry="3"
                fill={PAL.yellow}
                transform={`rotate(${(a * 180) / Math.PI} ${40 + Math.cos(a) * 14} ${30 + Math.sin(a) * 14})`}
              />
            );
          })}
          <circle cx="40" cy="30" r="7" fill="#6B4A24" />
          <circle cx="40" cy="30" r="4" fill="#4A3018" />
        </svg>
      );
    case "hydrangea":
      return (
        <svg {...base}>
          <path d="M40 74 V42" stroke={PAL.leafDark} strokeWidth="1.8" fill="none" />
          {[{ x: 30, y: 30 }, { x: 40, y: 24 }, { x: 50, y: 30 }, { x: 34, y: 38 }, { x: 46, y: 38 }, { x: 40, y: 34 }].map((p, i) => (
            <g key={i}>
              {[0, 1, 2, 3].map((j) => {
                const a = (j / 4) * Math.PI * 2;
                return (
                  <circle key={j} cx={p.x + Math.cos(a) * 2.5} cy={p.y + Math.sin(a) * 2.5} r="2" fill={i % 2 ? "#8FB4D8" : "#C8D6E8"} />
                );
              })}
              <circle cx={p.x} cy={p.y} r="1.2" fill="#6B8EB8" />
            </g>
          ))}
          <path d="M32 58 Q 22 52 24 44" stroke={PAL.leaf} strokeWidth="2" fill="none" />
          <path d="M48 58 Q 58 52 56 44" stroke={PAL.leaf} strokeWidth="2" fill="none" />
        </svg>
      );
    case "wisteria":
      return (
        <svg {...base}>
          <path d="M10 18 Q 40 14 70 18" stroke={PAL.bark} strokeWidth="2" fill="none" />
          {[18, 30, 42, 54, 66].map((x, i) => (
            <g key={i}>
              <path d={`M${x} 20 V${40 + (i % 2 ? 8 : 4)}`} stroke={PAL.leafDark} strokeWidth="0.8" fill="none" />
              {[0, 1, 2, 3, 4].map((j) => (
                <circle key={j} cx={x + (j % 2 ? 0.8 : -0.8)} cy={22 + j * 4} r={2 - j * 0.2} fill={j < 2 ? "#B8A4D8" : "#8F77B8"} />
              ))}
            </g>
          ))}
        </svg>
      );
    case "bamboo":
      return (
        <svg {...base}>
          {[20, 34, 48, 60].map((x, i) => (
            <g key={i}>
              <rect x={x - 1.5} y="8" width="3" height="64" fill={i % 2 ? "#3E5A3C" : "#4A6848"} />
              {[20, 36, 52].map((y, j) => <rect key={j} x={x - 2} y={y} width="4" height="1.5" fill="#2A3A28" />)}
              <path d={`M${x} ${20 + i * 4} Q ${x + 10} ${18 + i * 4} ${x + 14} ${24 + i * 4}`} stroke={PAL.leaf} strokeWidth="2" fill="none" />
            </g>
          ))}
        </svg>
      );
    case "moss":
      return (
        <svg {...base}>
          <ellipse cx="40" cy="60" rx="30" ry="12" fill="#5F7A58" />
          <ellipse cx="40" cy="58" rx="28" ry="10" fill="#7A9772" />
          {Array.from({ length: 20 }).map((_, i) => {
            const x = 14 + (i * 17) % 52;
            const y = 54 + (i * 7) % 10;
            return <circle key={i} cx={x} cy={y} r="1.6" fill={i % 2 ? "#8AA782" : "#6E8A68"} />;
          })}
        </svg>
      );
    case "clover":
      return (
        <svg {...base}>
          <path d="M40 72 V50" stroke={PAL.leafDark} strokeWidth="1.6" fill="none" />
          {[{ dx: -10, dy: -6 }, { dx: 10, dy: -6 }, { dx: -10, dy: 6 }, { dx: 10, dy: 6 }].map((p, i) => (
            <path
              key={i}
              d={`M${40 + p.dx} ${42 + p.dy} Q ${40 + p.dx * 1.4} ${42 + p.dy - 6} ${40 + p.dx * 0.6} ${42 + p.dy - 8} Q ${40 + p.dx * 0.3} ${42 + p.dy - 3} ${40 + p.dx} ${42 + p.dy} Z`}
              fill={PAL.leaf}
            />
          ))}
          <circle cx="40" cy="42" r="2" fill={PAL.leafDark} />
        </svg>
      );
    case "orchid":
      return (
        <svg {...base}>
          <path d="M40 74 Q 36 54 40 30" stroke={PAL.leafDark} strokeWidth="1.6" fill="none" />
          {[{ y: 28, s: 1 }, { y: 44, s: 0.85 }, { y: 58, s: 0.7 }].map((o, i) => (
            <g key={i} transform={`translate(40 ${o.y}) scale(${o.s})`}>
              <path d="M0 0 Q -10 -4 -8 4 Q -4 6 0 2 Z" fill="#F4EFE2" />
              <path d="M0 0 Q 10 -4 8 4 Q 4 6 0 2 Z" fill="#F4EFE2" />
              <path d="M0 -2 Q -4 -10 0 -12 Q 4 -10 0 -2 Z" fill="#F4EFE2" />
              <circle cx="0" cy="0" r="2" fill="#C76A8B" />
            </g>
          ))}
        </svg>
      );
    case "olive":
      return (
        <svg {...base}>
          <path d="M38 74 Q 36 60 38 40 Q 40 32 42 40 Q 44 60 42 74" fill={PAL.bark} />
          {[{ x: 24, y: 28, r: 12 }, { x: 56, y: 24, r: 14 }, { x: 40, y: 18, r: 11 }, { x: 32, y: 14, r: 9 }, { x: 50, y: 14, r: 10 }].map((b, i) => (
            <ellipse key={i} cx={b.x} cy={b.y} rx={b.r} ry={b.r * 0.75} fill={i % 2 ? PAL.leafLight : PAL.leaf} />
          ))}
          {[{ x: 22, y: 30 }, { x: 58, y: 26 }, { x: 42, y: 18 }].map((d, i) => (
            <circle key={i} cx={d.x} cy={d.y} r="1.5" fill={PAL.leafDark} />
          ))}
        </svg>
      );
    case "maple":
      return (
        <svg {...base}>
          <path d="M39 74 Q 37 58 39 46 Q 41 58 41 74 Z" fill={PAL.barkDark} />
          {[
            { x: 26, y: 36, r: 11, c: "#C94B3A" },
            { x: 54, y: 32, r: 13, c: "#D15A3E" },
            { x: 40, y: 22, r: 10, c: "#E37A44" },
            { x: 32, y: 18, r: 8, c: "#C94B3A" },
            { x: 50, y: 18, r: 9, c: "#E37A44" },
            { x: 40, y: 42, r: 12, c: "#B8372D" },
          ].map((b, i) => (
            <circle key={i} cx={b.x} cy={b.y} r={b.r} fill={b.c} />
          ))}
        </svg>
      );
    case "willow":
      return (
        <svg {...base}>
          <path d="M40 74 V42" stroke={PAL.bark} strokeWidth="2.2" fill="none" />
          {Array.from({ length: 14 }).map((_, i) => {
            const x = 18 + i * 3.5;
            const drop = 18 + Math.sin(i * 0.5) * 6;
            return <path key={i} d={`M${x} 36 Q ${x - 1} ${36 + drop * 0.5} ${x} ${36 + drop}`} stroke={PAL.leafLight} strokeWidth="1.2" fill="none" />;
          })}
          <ellipse cx="40" cy="32" rx="26" ry="8" fill={PAL.leaf} opacity="0.75" />
        </svg>
      );
    case "cypress":
      return (
        <svg {...base}>
          <ellipse cx="40" cy="76" rx="10" ry="2" fill={PAL.bark} opacity="0.35" />
          <path d="M40 10 Q 32 30 30 74 Q 40 70 50 74 Q 48 30 40 10 Z" fill={PAL.leafDark} />
          <path d="M40 12 Q 36 30 36 68" stroke={PAL.leaf} strokeWidth="1.2" fill="none" opacity="0.6" />
        </svg>
      );
    case "sakura":
      return (
        <svg {...base}>
          <path d="M38 74 Q 36 56 38 44" stroke={PAL.barkDark} strokeWidth="2.4" fill="none" />
          {[
            { x: 22, y: 34, r: 11 },
            { x: 58, y: 28, r: 13 },
            { x: 40, y: 20, r: 10 },
            { x: 30, y: 18, r: 8 },
            { x: 52, y: 14, r: 9 },
            { x: 42, y: 40, r: 10 },
          ].map((b, i) => (
            <g key={i}>
              <circle cx={b.x} cy={b.y} r={b.r} fill={PAL.petal} />
              <circle cx={b.x - 2} cy={b.y - 2} r={b.r * 0.6} fill="#F8D4DE" />
            </g>
          ))}
          {[{ x: 18, y: 52 }, { x: 62, y: 48 }, { x: 36, y: 62 }].map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="1.5" fill={PAL.petal} />
          ))}
        </svg>
      );
    case "oak":
      return (
        <svg {...base}>
          <path d="M34 74 Q 30 54 34 38 Q 38 32 40 38 Q 42 32 46 38 Q 50 54 46 74 Z" fill={PAL.barkDark} />
          {[
            { x: 22, y: 30, r: 13 },
            { x: 58, y: 26, r: 15 },
            { x: 40, y: 14, r: 13 },
            { x: 30, y: 12, r: 10 },
            { x: 52, y: 10, r: 11 },
          ].map((b, i) => (
            <circle key={i} cx={b.x} cy={b.y} r={b.r} fill={i % 2 ? PAL.leaf : PAL.leafDark} />
          ))}
          <path d="M34 50 Q 30 42 28 36" stroke={PAL.barkDark} strokeWidth="1.5" fill="none" />
          <path d="M46 50 Q 50 42 52 34" stroke={PAL.barkDark} strokeWidth="1.5" fill="none" />
        </svg>
      );
    case "birch":
      return (
        <svg {...base}>
          <rect x="38" y="14" width="4" height="60" fill="#F4EFE2" />
          {[24, 34, 44, 54, 64].map((y, i) => (
            <rect key={i} x="37.5" y={y} width="5" height="1.5" fill="#2A2725" />
          ))}
          <ellipse cx="26" cy="22" rx="12" ry="10" fill="#E8B84A" />
          <ellipse cx="52" cy="18" rx="14" ry="11" fill="#E8B84A" />
          <ellipse cx="42" cy="10" rx="10" ry="8" fill="#F2C85A" />
        </svg>
      );
    case "pine":
      return (
        <svg {...base}>
          <rect x="38" y="50" width="4" height="24" fill="#4A3220" />
          <path d="M20 52 L 40 38 L 60 52 Z" fill="#3E5A3C" />
          <path d="M24 42 L 40 28 L 56 42 Z" fill="#4A6848" />
          <path d="M28 32 L 40 18 L 52 32 Z" fill="#5A7A58" />
        </svg>
      );
    case "ginkgo":
      return (
        <svg {...base}>
          <rect x="38" y="44" width="4" height="30" fill="#5A3A24" />
          <ellipse cx="40" cy="30" rx="26" ry="20" fill="#F2C85A" />
          <ellipse cx="30" cy="24" rx="12" ry="10" fill="#F5D88A" />
          <ellipse cx="50" cy="22" rx="10" ry="9" fill="#E8B84A" />
          {[{ x: 18, y: 60 }, { x: 58, y: 64 }, { x: 34, y: 66 }].map((l, i) => (
            <path key={i} d={`M${l.x} ${l.y} Q ${l.x - 3} ${l.y - 4} ${l.x} ${l.y - 6} Q ${l.x + 3} ${l.y - 4} ${l.x} ${l.y} Z`} fill="#F2C85A" />
          ))}
        </svg>
      );
    case "apple":
      return (
        <svg {...base}>
          <rect x="38" y="48" width="4" height="26" fill="#5A3A24" />
          <circle cx="40" cy="30" r="22" fill="#5F7A58" />
          <circle cx="30" cy="24" r="12" fill="#7A9772" />
          <circle cx="50" cy="22" r="10" fill="#8AA782" />
          {[{ x: 26, y: 34 }, { x: 48, y: 30 }, { x: 40, y: 42 }, { x: 54, y: 40 }].map((a, i) => (
            <g key={i}>
              <circle cx={a.x} cy={a.y} r="3" fill="#C94B3A" />
              <circle cx={a.x - 1} cy={a.y - 1} r="1" fill="#fff" opacity="0.4" />
            </g>
          ))}
        </svg>
      );
    case "redwood":
      return (
        <svg {...base}>
          <path d="M36 74 Q 34 40 38 14 Q 40 6 42 14 Q 46 40 44 74 Z" fill="#5A3A24" />
          <path d="M40 14 Q 20 26 22 40 Q 30 36 40 28 Z" fill="#3E5A3C" />
          <path d="M40 14 Q 60 26 58 40 Q 50 36 40 28 Z" fill="#4A6848" />
          <path d="M40 28 Q 24 40 28 54 Q 36 50 40 42 Z" fill="#3E5A3C" />
          <path d="M40 28 Q 56 40 52 54 Q 44 50 40 42 Z" fill="#4A6848" />
          <path d="M40 42 Q 28 54 32 66 Q 38 62 40 54 Z" fill="#3E5A3C" />
          <path d="M40 42 Q 52 54 48 66 Q 42 62 40 54 Z" fill="#4A6848" />
        </svg>
      );
    case "bonsai":
      return (
        <svg {...base}>
          <ellipse cx="40" cy="70" rx="22" ry="4" fill="#5A3A24" />
          <rect x="22" y="62" width="36" height="8" fill="#6B4A32" />
          <rect x="26" y="60" width="28" height="3" fill="#4A3220" />
          <path d="M40 62 Q 32 50 38 40 Q 46 38 44 30" stroke="#5A3A24" strokeWidth="3" fill="none" />
          <ellipse cx="32" cy="42" rx="10" ry="6" fill={PAL.leafDark} />
          <ellipse cx="46" cy="32" rx="12" ry="7" fill={PAL.leaf} />
          <ellipse cx="40" cy="24" rx="8" ry="5" fill={PAL.leafLight} />
        </svg>
      );
    case "stone":
      return (
        <svg {...base}>
          <ellipse cx="40" cy="76" rx="20" ry="2.5" fill={PAL.stoneDark} opacity="0.35" />
          <path d="M22 72 C 22 44, 30 16, 44 16 C 58 16, 62 42, 60 72 Z" fill={PAL.stone} />
          <path d="M30 30 Q 38 34 44 30 M46 40 Q 52 44 54 38" stroke={PAL.stoneDark} strokeWidth="1.3" fill="none" opacity="0.6" />
          <path d="M22 72 C 22 56, 28 38, 34 26" stroke="#fff" strokeWidth="1" fill="none" opacity="0.3" />
        </svg>
      );
    case "cairn":
      return (
        <svg {...base}>
          <ellipse cx="40" cy="76" rx="22" ry="2.5" fill={PAL.stoneDark} opacity="0.35" />
          <ellipse cx="40" cy="68" rx="22" ry="6" fill={PAL.stone} />
          <ellipse cx="40" cy="56" rx="16" ry="5" fill={PAL.stoneDark} />
          <ellipse cx="40" cy="45" rx="12" ry="4.5" fill={PAL.stone} />
          <ellipse cx="40" cy="36" rx="8" ry="3.5" fill={PAL.stoneDark} />
          <ellipse cx="40" cy="28" rx="5" ry="2.5" fill={PAL.stone} />
        </svg>
      );
    case "bench":
      return (
        <svg {...base}>
          <ellipse cx="40" cy="74" rx="28" ry="2" fill={PAL.stoneDark} opacity="0.35" />
          <rect x="14" y="48" width="52" height="6" rx="1" fill={PAL.stone} />
          <rect x="18" y="54" width="6" height="18" fill={PAL.stoneDark} />
          <rect x="56" y="54" width="6" height="18" fill={PAL.stoneDark} />
          <rect x="14" y="46" width="52" height="2" fill={PAL.stoneDark} />
        </svg>
      );
    case "torii":
      return (
        <svg {...base}>
          <ellipse cx="40" cy="76" rx="28" ry="2" fill={PAL.barkDark} opacity="0.35" />
          <rect x="14" y="20" width="52" height="6" fill={PAL.red} />
          <rect x="10" y="14" width="60" height="6" fill={PAL.red} />
          <rect x="18" y="26" width="6" height="48" fill={PAL.red} />
          <rect x="56" y="26" width="6" height="48" fill={PAL.red} />
          <rect x="22" y="40" width="36" height="4" fill={PAL.red} />
        </svg>
      );
    case "stepping":
      return (
        <svg {...base}>
          {[{ x: 20, y: 64, r: 8 }, { x: 38, y: 50, r: 9 }, { x: 54, y: 36, r: 8 }, { x: 66, y: 22, r: 7 }].map((st, i) => (
            <g key={i}>
              <ellipse cx={st.x + 1} cy={st.y + 3} rx={st.r} ry={st.r * 0.4} fill="#000" opacity="0.2" />
              <ellipse cx={st.x} cy={st.y} rx={st.r} ry={st.r * 0.5} fill={PAL.stone} />
              <ellipse cx={st.x - st.r * 0.3} cy={st.y - st.r * 0.2} rx={st.r * 0.4} ry={st.r * 0.2} fill="#fff" opacity="0.35" />
            </g>
          ))}
        </svg>
      );
    case "boulder":
      return (
        <svg {...base}>
          <ellipse cx="40" cy="70" rx="30" ry="4" fill="#000" opacity="0.25" />
          <path d="M12 66 Q 10 38 28 20 Q 48 12 62 26 Q 74 44 66 66 Z" fill={PAL.stone} />
          <path d="M12 66 Q 10 50 22 34" stroke="#fff" strokeWidth="1.2" fill="none" opacity="0.35" />
          <ellipse cx="30" cy="22" rx="8" ry="3" fill="#5F7A58" />
          <ellipse cx="50" cy="18" rx="10" ry="3" fill="#7A9772" />
          <circle cx="44" cy="40" r="1.2" fill={PAL.leaf} />
          <circle cx="24" cy="50" r="1.2" fill={PAL.leaf} />
        </svg>
      );
    case "birdbath":
      return (
        <svg {...base}>
          <ellipse cx="40" cy="76" rx="22" ry="2" fill="#000" opacity="0.3" />
          <rect x="36" y="38" width="8" height="36" fill={PAL.stone} />
          <ellipse cx="40" cy="38" rx="24" ry="5" fill={PAL.stoneDark} />
          <ellipse cx="40" cy="36" rx="22" ry="4" fill={PAL.water} />
          <path d="M22 36 Q 40 32 58 36" stroke="#fff" strokeWidth="0.8" fill="none" opacity="0.6" />
        </svg>
      );
    case "sundial":
      return (
        <svg {...base}>
          <ellipse cx="40" cy="72" rx="20" ry="2" fill="#000" opacity="0.3" />
          <rect x="36" y="48" width="8" height="24" fill={PAL.stone} />
          <ellipse cx="40" cy="48" rx="22" ry="6" fill="#B8923A" />
          <ellipse cx="40" cy="46" rx="22" ry="5" fill="#D4A850" />
          <path d="M40 46 L 52 36 L 44 46 Z" fill="#8A6A24" />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
            const a = (i / 8) * Math.PI * 2;
            return (
              <line key={i} x1={40 + Math.cos(a) * 16} y1={46 + Math.sin(a) * 4} x2={40 + Math.cos(a) * 20} y2={46 + Math.sin(a) * 5} stroke="#8A6A24" strokeWidth="0.8" />
            );
          })}
        </svg>
      );
    case "zen":
      return (
        <svg {...base}>
          <rect x="8" y="22" width="64" height="44" fill="#D4C8A8" />
          <rect x="8" y="22" width="64" height="44" fill="none" stroke="#6B4A32" strokeWidth="1.2" />
          {[28, 34, 40, 46, 52, 58].map((y, i) => (
            <path key={i} d={`M 10 ${y} Q 30 ${y - 1.5} 50 ${y} Q 65 ${y + 1.5} 70 ${y}`} stroke="#B8A070" strokeWidth="0.8" fill="none" />
          ))}
          <circle cx="26" cy="38" r="5" fill={PAL.stoneDark} />
          <circle cx="52" cy="50" r="7" fill={PAL.stone} />
          <circle cx="60" cy="30" r="3" fill={PAL.stoneDark} />
        </svg>
      );
    case "statue":
      return (
        <svg {...base}>
          <ellipse cx="40" cy="74" rx="18" ry="2" fill="#000" opacity="0.3" />
          <rect x="28" y="66" width="24" height="8" fill={PAL.stoneDark} />
          <path d="M32 66 L 34 40 Q 36 30 40 30 Q 44 30 46 40 L 48 66 Z" fill={PAL.stone} />
          <circle cx="40" cy="22" r="7" fill={PAL.stone} />
          <path d="M40 15 Q 36 16 35 22 Q 36 20 40 20 Q 44 20 45 22 Q 44 16 40 15" fill={PAL.stoneDark} />
          <circle cx="40" cy="24" r="1" fill={PAL.stoneDark} opacity="0.5" />
          <ellipse cx="36" cy="48" rx="3" ry="1.5" fill="#5F7A58" opacity="0.7" />
          <ellipse cx="44" cy="56" rx="3" ry="1.5" fill="#5F7A58" opacity="0.7" />
        </svg>
      );
    case "lantern":
      return (
        <svg {...base}>
          <circle cx="40" cy="40" r="16" fill={PAL.yellow} opacity="0.35" />
          <path d="M30 22 H50 V24 Q 50 42 40 46 Q 30 42 30 24 Z" fill={PAL.cloud} stroke={PAL.barkDark} strokeWidth="1.2" />
          <path d="M30 30 H50 M30 38 H50" stroke={PAL.barkDark} strokeWidth="0.8" opacity="0.5" />
          <rect x="28" y="20" width="24" height="2.5" fill={PAL.barkDark} />
          <path d="M40 18 V12" stroke={PAL.barkDark} strokeWidth="1.2" />
          <circle cx="40" cy="10" r="1.5" fill={PAL.barkDark} />
          <path d="M40 46 V58" stroke={PAL.barkDark} strokeWidth="1.2" />
        </svg>
      );
    case "firefly":
      return (
        <svg {...base}>
          {[{ x: 20, y: 20 }, { x: 50, y: 16 }, { x: 30, y: 40 }, { x: 60, y: 40 }, { x: 42, y: 56 }, { x: 18, y: 58 }].map((f, i) => (
            <g key={i}>
              <circle cx={f.x} cy={f.y} r="5" fill={PAL.yellow} opacity="0.25" />
              <circle cx={f.x} cy={f.y} r="1.8" fill={PAL.yellow} />
              <circle cx={f.x} cy={f.y} r="0.8" fill="#fff" />
            </g>
          ))}
        </svg>
      );
    case "moonlamp":
      return (
        <svg {...base}>
          <circle cx="40" cy="38" r="24" fill={PAL.moon} opacity="0.4" />
          <circle cx="40" cy="38" r="16" fill={PAL.moon} />
          <circle cx="34" cy="34" r="2" fill={PAL.stoneDark} opacity="0.4" />
          <circle cx="44" cy="40" r="1.5" fill={PAL.stoneDark} opacity="0.4" />
          <rect x="32" y="54" width="16" height="4" fill={PAL.stoneDark} />
          <rect x="36" y="58" width="8" height="10" fill={PAL.stoneDark} />
        </svg>
      );
    case "candle":
      return (
        <svg {...base}>
          <circle cx="40" cy="22" r="14" fill={PAL.yellow} opacity="0.2" />
          <rect x="34" y="30" width="12" height="32" rx="1" fill="#F4EFE2" />
          <rect x="34" y="30" width="12" height="3" fill="#D4C8A8" />
          <path d="M40 30 Q 38 24 40 16 Q 42 24 40 30 Z" fill={PAL.sun} />
          <path d="M40 20 Q 39 18 40 16 Q 41 18 40 20 Z" fill="#fff" />
          <rect x="32" y="62" width="16" height="4" fill="#6B4A32" />
        </svg>
      );
    case "torch":
      return (
        <svg {...base}>
          <circle cx="40" cy="18" r="10" fill={PAL.sun} opacity="0.3" />
          <path d="M36 20 Q 34 12 40 6 Q 46 12 44 20 Z" fill="#F2A441" />
          <path d="M38 18 Q 38 14 40 10 Q 42 14 42 18 Z" fill="#F5D88A" />
          <rect x="36" y="20" width="8" height="6" fill="#6B4A32" />
          <rect x="38" y="26" width="4" height="48" fill="#4A3220" />
        </svg>
      );
    case "string":
      return (
        <svg {...base}>
          <path d="M6 20 Q 40 44 74 20" stroke="#2A2725" strokeWidth="0.8" fill="none" />
          {[10, 22, 34, 46, 58, 70].map((x, i) => {
            const y = 20 + Math.sin(((x - 6) / 68) * Math.PI) * 24;
            const colors = ["#F2A441", "#F5D88A", "#E8B4C2", "#9FE8C5", "#C76A8B", "#F2C85A"];
            return (
              <g key={i}>
                <line x1={x} y1={y} x2={x} y2={y + 4} stroke="#2A2725" strokeWidth="0.6" />
                <circle cx={x} cy={y + 8} r="4.5" fill={colors[i]} opacity="0.4" />
                <circle cx={x} cy={y + 8} r="2.5" fill={colors[i]} />
              </g>
            );
          })}
        </svg>
      );
    case "glowworm":
      return (
        <svg {...base}>
          <path d="M6 30 Q 10 12 40 10 Q 70 12 74 30 L 74 74 L 6 74 Z" fill="#1C2028" />
          <path d="M6 30 Q 10 12 40 10 Q 70 12 74 30" stroke="#2A2725" strokeWidth="1" fill="none" />
          {Array.from({ length: 18 }).map((_, i) => {
            const x = 10 + (i * 37) % 60;
            const y = 20 + (i * 23) % 40;
            return (
              <g key={i}>
                <circle cx={x} cy={y} r="2.5" fill="#9FE8C5" opacity="0.4" />
                <circle cx={x} cy={y} r="0.8" fill="#E0FFF0" />
              </g>
            );
          })}
        </svg>
      );
    case "starlantern":
      return (
        <svg {...base}>
          <circle cx="40" cy="38" r="22" fill={PAL.yellow} opacity="0.2" />
          <path d="M40 14 L 44 30 L 60 32 L 48 42 L 52 58 L 40 50 L 28 58 L 32 42 L 20 32 L 36 30 Z" fill="#F5D88A" stroke="#6B4A32" strokeWidth="1" />
          <circle cx="40" cy="40" r="4" fill={PAL.sun} />
          <path d="M40 60 V70" stroke="#6B4A32" strokeWidth="0.8" />
          {[{ x: 30, y: 66 }, { x: 40, y: 72 }, { x: 50, y: 66 }].map((t, i) => (
            <line key={i} x1="40" y1="60" x2={t.x} y2={t.y} stroke="#6B4A32" strokeWidth="0.6" />
          ))}
        </svg>
      );
    case "bonfire":
      return (
        <svg {...base}>
          <ellipse cx="40" cy="70" rx="22" ry="4" fill={PAL.sun} opacity="0.3" />
          <path d="M20 66 L 60 62 L 56 68 L 24 70 Z" fill="#6B4A32" />
          <path d="M22 68 L 58 64" stroke="#4A3220" strokeWidth="1" />
          <path d="M30 64 Q 26 54 32 44 Q 34 52 38 50 Q 36 40 44 32 Q 42 44 48 46 Q 44 54 52 52 Q 50 62 54 64 Z" fill="#F2A441" />
          <path d="M34 60 Q 32 50 38 42 Q 38 50 42 48 Q 40 40 44 38 Q 44 46 48 48 Q 46 56 50 58 Z" fill="#F5D88A" />
          <path d="M38 56 Q 38 48 42 44 Q 42 50 44 52 Z" fill="#fff" opacity="0.7" />
        </svg>
      );
    case "pond":
      return (
        <svg {...base}>
          <ellipse cx="40" cy="46" rx="34" ry="12" fill={PAL.waterDark} />
          <ellipse cx="40" cy="44" rx="30" ry="10" fill={PAL.water} />
          <path d="M16 46 Q 40 40 64 46" stroke="#fff" strokeWidth="0.8" fill="none" opacity="0.6" />
          <path d="M22 50 Q 40 48 58 50" stroke="#fff" strokeWidth="0.6" fill="none" opacity="0.4" />
          <ellipse cx="22" cy="44" rx="6" ry="2" fill={PAL.leaf} />
          <ellipse cx="54" cy="48" rx="5" ry="1.8" fill={PAL.leaf} />
        </svg>
      );
    case "stream":
      return (
        <svg {...base}>
          <path d="M10 70 Q 30 50 40 46 Q 54 42 70 20" stroke={PAL.water} strokeWidth="8" fill="none" strokeLinecap="round" />
          <path d="M10 70 Q 30 50 40 46 Q 54 42 70 20" stroke="#fff" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.5" />
          <circle cx="22" cy="62" r="3" fill={PAL.stone} />
          <circle cx="46" cy="46" r="4" fill={PAL.stoneDark} />
          <circle cx="58" cy="32" r="3" fill={PAL.stone} />
        </svg>
      );
    case "fountain":
      return (
        <svg {...base}>
          <ellipse cx="40" cy="66" rx="24" ry="6" fill={PAL.water} />
          <ellipse cx="40" cy="64" rx="24" ry="5" fill={PAL.waterDark} />
          <rect x="34" y="40" width="12" height="24" fill={PAL.stone} />
          <ellipse cx="40" cy="40" rx="10" ry="3" fill={PAL.stoneDark} />
          <path d="M40 40 Q 34 30 32 22" stroke={PAL.water} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7" />
          <path d="M40 40 Q 46 30 48 22" stroke={PAL.water} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7" />
          <path d="M40 40 V20" stroke={PAL.water} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7" />
        </svg>
      );
    case "butterfly":
      return (
        <svg {...base}>
          <path d="M40 46 V58" stroke={PAL.trim} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M40 46 Q 20 30 16 42 Q 14 54 40 52 Z" fill={PAL.yellow} />
          <path d="M40 46 Q 60 30 64 42 Q 66 54 40 52 Z" fill={PAL.yellow} />
          <circle cx="22" cy="40" r="2" fill={PAL.trim} opacity="0.5" />
          <circle cx="58" cy="40" r="2" fill={PAL.trim} opacity="0.5" />
          <path d="M40 44 V40" stroke={PAL.trim} strokeWidth="1" />
          <circle cx="38" cy="40" r="0.8" fill={PAL.trim} />
          <circle cx="42" cy="40" r="0.8" fill={PAL.trim} />
        </svg>
      );
    case "bird":
      return (
        <svg {...base}>
          <ellipse cx="40" cy="44" rx="18" ry="12" fill={PAL.bark} />
          <circle cx="52" cy="36" r="9" fill={PAL.bark} />
          <path d="M32 44 Q 38 54 30 52 Z" fill={PAL.barkDark} />
          <ellipse cx="44" cy="46" rx="10" ry="6" fill={PAL.red} />
          <circle cx="55" cy="34" r="1.3" fill={PAL.trim} />
          <path d="M60 36 L 64 36 L 60 38 Z" fill={PAL.yellow} />
          <path d="M36 56 L34 62 M42 56 L40 62" stroke={PAL.barkDark} strokeWidth="1.2" />
        </svg>
      );
    case "koi":
      return (
        <svg {...base}>
          <path d="M14 42 Q 20 30 36 32 Q 56 34 62 42 Q 56 50 36 52 Q 20 54 14 42 Z" fill={PAL.cloud} />
          <path d="M24 38 Q 30 34 38 36 Q 34 44 26 44 Z" fill={PAL.koi} />
          <path d="M46 36 Q 54 38 56 44 Q 48 46 44 42 Z" fill={PAL.koi} />
          <circle cx="58" cy="40" r="1.2" fill={PAL.trim} />
          <path d="M14 42 L 6 36 L 8 42 L 6 48 Z" fill={PAL.koi} />
        </svg>
      );
    case "fox":
      return (
        <svg {...base}>
          <ellipse cx="40" cy="56" rx="22" ry="10" fill={PAL.fox} />
          <circle cx="58" cy="44" r="9" fill={PAL.fox} />
          <path d="M50 40 L 48 30 L 54 36 Z" fill={PAL.fox} />
          <path d="M66 40 L 68 30 L 62 36 Z" fill={PAL.fox} />
          <path d="M50 40 L 48 32 L 52 36 Z" fill={PAL.red} opacity="0.5" />
          <circle cx="56" cy="44" r="1" fill={PAL.trim} />
          <circle cx="62" cy="44" r="1" fill={PAL.trim} />
          <path d="M60 48 L 58 50 L 62 50 Z" fill={PAL.trim} />
          <path d="M18 54 Q 10 48 6 54 Q 10 58 18 56 Z" fill={PAL.fox} />
          <path d="M10 54 Q 8 52 10 50" stroke="#fff" strokeWidth="1.2" fill="none" />
          <path d="M24 60 L 22 68 M32 62 L 32 70 M46 62 L 46 70 M58 60 L 60 68" stroke={PAL.fox} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "rabbit":
      return (
        <svg {...base}>
          <ellipse cx="40" cy="70" rx="20" ry="2" fill={PAL.trim} opacity="0.25" />
          <ellipse cx="40" cy="54" rx="18" ry="14" fill="#F4EFE2" />
          <circle cx="54" cy="44" r="10" fill="#F4EFE2" />
          <ellipse cx="48" cy="28" rx="3.5" ry="10" fill="#F4EFE2" transform="rotate(-10 48 28)" />
          <ellipse cx="48" cy="30" rx="1.8" ry="7" fill="#E8B4C2" transform="rotate(-10 48 30)" />
          <ellipse cx="60" cy="28" rx="3.5" ry="10" fill="#F4EFE2" transform="rotate(8 60 28)" />
          <ellipse cx="60" cy="30" rx="1.8" ry="7" fill="#E8B4C2" transform="rotate(8 60 30)" />
          <circle cx="50" cy="44" r="1.4" fill={PAL.trim} />
          <circle cx="58" cy="44" r="1.4" fill={PAL.trim} />
          <path d="M54 48 L 52 50 L 56 50 Z" fill="#E8B4C2" />
          <circle cx="22" cy="52" r="5" fill="#F4EFE2" />
        </svg>
      );
    case "deer":
      return (
        <svg {...base}>
          <ellipse cx="40" cy="74" rx="22" ry="2" fill={PAL.trim} opacity="0.25" />
          <ellipse cx="36" cy="50" rx="20" ry="12" fill="#C2905A" />
          <ellipse cx="58" cy="40" rx="8" ry="10" fill="#C2905A" />
          <circle cx="62" cy="30" r="6" fill="#C2905A" />
          <path d="M60 26 L 58 16 L 62 22 Z" fill="#8A6240" />
          <path d="M64 26 L 66 16 L 62 22 Z" fill="#8A6240" />
          <path d="M58 22 L 55 18" stroke="#8A6240" strokeWidth="1" />
          <path d="M66 22 L 69 18" stroke="#8A6240" strokeWidth="1" />
          <circle cx="64" cy="30" r="1" fill={PAL.trim} />
          <circle cx="60" cy="32" r="0.8" fill={PAL.trim} />
          <path d="M28 60 L 26 72 M36 62 L 36 72 M44 62 L 46 72 M52 60 L 54 72" stroke="#8A6240" strokeWidth="2.5" strokeLinecap="round" />
          {[{ x: 30, y: 46 }, { x: 38, y: 42 }, { x: 46, y: 44 }, { x: 42, y: 52 }, { x: 32, y: 54 }].map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r="1.2" fill="#F4EFE2" />
          ))}
          <path d="M20 48 Q 16 46 18 44" stroke="#C2905A" strokeWidth="3" fill="none" strokeLinecap="round" />
        </svg>
      );
    case "turtle":
      return (
        <svg {...base}>
          <ellipse cx="40" cy="68" rx="26" ry="3" fill={PAL.trim} opacity="0.25" />
          <ellipse cx="40" cy="52" rx="24" ry="14" fill="#5F7A4A" />
          <ellipse cx="40" cy="50" rx="22" ry="12" fill="#7A9758" />
          {[{ x: 30, y: 46 }, { x: 46, y: 44 }, { x: 36, y: 54 }, { x: 50, y: 54 }, { x: 40, y: 50 }].map((s, i) => (
            <path
              key={i}
              d={`M${s.x} ${s.y} l -4 2 l 0 4 l 4 2 l 4 -2 l 0 -4 z`}
              fill="#5F7A4A"
              stroke="#4A6238"
              strokeWidth="0.6"
            />
          ))}
          <circle cx="62" cy="52" r="5" fill="#9BB870" />
          <circle cx="64" cy="50" r="1" fill={PAL.trim} />
          <path d="M64 54 Q 66 54 66 52" stroke={PAL.trim} strokeWidth="0.6" fill="none" />
          <ellipse cx="22" cy="62" rx="4" ry="2" fill="#9BB870" />
          <ellipse cx="58" cy="62" rx="4" ry="2" fill="#9BB870" />
          <ellipse cx="32" cy="64" rx="3" ry="1.5" fill="#9BB870" />
        </svg>
      );
    case "frog":
      return (
        <svg {...base}>
          <ellipse cx="40" cy="68" rx="22" ry="3" fill={PAL.trim} opacity="0.25" />
          <ellipse cx="40" cy="56" rx="22" ry="12" fill="#6B8A4A" />
          <ellipse cx="40" cy="52" rx="20" ry="10" fill="#88A860" />
          <circle cx="28" cy="40" r="7" fill="#88A860" />
          <circle cx="52" cy="40" r="7" fill="#88A860" />
          <circle cx="28" cy="40" r="4" fill="#F4EFE2" />
          <circle cx="52" cy="40" r="4" fill="#F4EFE2" />
          <circle cx="29" cy="41" r="2.2" fill={PAL.trim} />
          <circle cx="53" cy="41" r="2.2" fill={PAL.trim} />
          <path d="M32 56 Q 40 62 48 56" stroke={PAL.trim} strokeWidth="1" fill="none" />
          <ellipse cx="20" cy="62" rx="6" ry="3" fill="#6B8A4A" transform="rotate(-20 20 62)" />
          <ellipse cx="60" cy="62" rx="6" ry="3" fill="#6B8A4A" transform="rotate(20 60 62)" />
          <ellipse cx="40" cy="52" rx="4" ry="2" fill="#A8C280" opacity="0.6" />
        </svg>
      );
    case "squirrel":
      return (
        <svg {...base}>
          <path d="M20 70 Q 6 60 10 40 Q 18 28 24 40 Q 20 50 26 60 Z" fill="#B85A2A" />
          <path d="M14 44 Q 10 32 16 24" stroke="#8A3F18" strokeWidth="1" fill="none" />
          <ellipse cx="38" cy="58" rx="14" ry="12" fill="#C2663B" />
          <circle cx="52" cy="42" r="9" fill="#C2663B" />
          <path d="M48 36 L 46 28 L 50 32 Z" fill="#C2663B" />
          <path d="M56 36 L 58 28 L 54 32 Z" fill="#C2663B" />
          <circle cx="55" cy="42" r="1.2" fill={PAL.trim} />
          <path d="M52 46 L 50 48 L 54 48 Z" fill={PAL.trim} />
          <ellipse cx="48" cy="54" rx="4" ry="3" fill="#6B4A2A" />
          <circle cx="46" cy="53" r="1.5" fill="#F4EFE2" />
          <path d="M32 68 L 30 74 M42 68 L 42 74" stroke="#8A3F18" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "hedgehog":
      return (
        <svg {...base}>
          <ellipse cx="40" cy="70" rx="24" ry="2.5" fill={PAL.trim} opacity="0.25" />
          <ellipse cx="40" cy="56" rx="22" ry="14" fill="#8A6240" />
          {Array.from({ length: 30 }).map((_, i) => {
            const a = Math.PI + (i / 30) * Math.PI;
            const r = 16;
            const x = 40 + Math.cos(a) * r;
            const y = 56 + Math.sin(a) * r * 0.9;
            return (
              <line key={i} x1={x} y1={y} x2={x + Math.cos(a) * 6} y2={y + Math.sin(a) * 6} stroke="#4A3220" strokeWidth="1.2" />
            );
          })}
          <ellipse cx="60" cy="56" rx="8" ry="9" fill="#D4B088" />
          <circle cx="64" cy="54" r="1.2" fill={PAL.trim} />
          <circle cx="66" cy="58" r="1.5" fill={PAL.trim} />
          <path d="M66 58 L 68 58" stroke={PAL.trim} strokeWidth="0.8" />
        </svg>
      );
    case "dragonfly":
      return (
        <svg {...base}>
          <ellipse cx="40" cy="42" rx="3" ry="18" fill="#4A8FB8" />
          {[0, 1, 2, 3].map((i) => {
            const y = 32 + i * 4;
            return <circle key={i} cx="40" cy={y} r="2" fill="#2B6B94" />;
          })}
          <circle cx="40" cy="28" r="4" fill="#2B6B94" />
          <circle cx="38" cy="27" r="1" fill="#9FE8F5" />
          <circle cx="42" cy="27" r="1" fill="#9FE8F5" />
          <ellipse cx="28" cy="36" rx="14" ry="4" fill="#B8E0F2" opacity="0.7" transform="rotate(-10 28 36)" />
          <ellipse cx="52" cy="36" rx="14" ry="4" fill="#B8E0F2" opacity="0.7" transform="rotate(10 52 36)" />
          <ellipse cx="26" cy="46" rx="12" ry="3.5" fill="#B8E0F2" opacity="0.65" transform="rotate(15 26 46)" />
          <ellipse cx="54" cy="46" rx="12" ry="3.5" fill="#B8E0F2" opacity="0.65" transform="rotate(-15 54 46)" />
        </svg>
      );
    case "snail":
      return (
        <svg {...base}>
          <ellipse cx="40" cy="68" rx="24" ry="2" fill={PAL.trim} opacity="0.2" />
          <path d="M12 64 Q 10 56 20 56 L 54 56 Q 60 56 62 60 L 62 66 L 12 66 Z" fill="#C8A878" />
          <circle cx="44" cy="48" r="16" fill="#8A6240" />
          <circle cx="44" cy="48" r="12" fill="#A87F52" />
          <circle cx="44" cy="48" r="8" fill="#8A6240" />
          <circle cx="44" cy="48" r="4" fill="#A87F52" />
          <path d="M44 48 Q 48 44 46 40" stroke="#6B4A2A" strokeWidth="1" fill="none" />
          <path d="M16 60 Q 12 50 18 44" stroke="#C8A878" strokeWidth="2" fill="none" />
          <path d="M18 44 L 16 42 M18 44 L 20 42" stroke="#C8A878" strokeWidth="1.5" />
          <circle cx="16" cy="41" r="1" fill={PAL.trim} />
          <circle cx="20" cy="41" r="1" fill={PAL.trim} />
        </svg>
      );
    case "ladybug":
      return (
        <svg {...base}>
          <ellipse cx="40" cy="68" rx="22" ry="2" fill={PAL.trim} opacity="0.25" />
          <ellipse cx="40" cy="48" rx="22" ry="18" fill="#C94B3A" />
          <path d="M40 30 L 40 66" stroke={PAL.trim} strokeWidth="1.5" />
          <ellipse cx="40" cy="32" rx="10" ry="7" fill={PAL.trim} />
          <circle cx="36" cy="31" r="2" fill="#F4EFE2" />
          <circle cx="44" cy="31" r="2" fill="#F4EFE2" />
          {[{ x: 30, y: 44 }, { x: 50, y: 44 }, { x: 32, y: 56 }, { x: 48, y: 56 }, { x: 40, y: 52 }].map((d, i) => (
            <circle key={i} cx={d.x} cy={d.y} r="2.5" fill={PAL.trim} />
          ))}
          <path d="M34 28 L 30 22 M46 28 L 50 22" stroke={PAL.trim} strokeWidth="1" />
          <circle cx="30" cy="22" r="1.5" fill={PAL.trim} />
          <circle cx="50" cy="22" r="1.5" fill={PAL.trim} />
        </svg>
      );
    case "cat":
      return (
        <svg {...base}>
          <ellipse cx="40" cy="70" rx="22" ry="2" fill={PAL.trim} opacity="0.25" />
          <ellipse cx="36" cy="54" rx="20" ry="12" fill="#2A2725" />
          <circle cx="56" cy="40" r="10" fill="#2A2725" />
          <path d="M48 34 L 46 24 L 52 32 Z" fill="#2A2725" />
          <path d="M64 34 L 66 24 L 60 32 Z" fill="#2A2725" />
          <path d="M48 32 L 48 26 L 51 30 Z" fill="#E8B4C2" opacity="0.7" />
          <path d="M64 32 L 64 26 L 61 30 Z" fill="#E8B4C2" opacity="0.7" />
          <ellipse cx="53" cy="40" rx="1.2" ry="2.5" fill="#7BC47F" />
          <ellipse cx="59" cy="40" rx="1.2" ry="2.5" fill="#7BC47F" />
          <ellipse cx="53" cy="40" rx="0.5" ry="2" fill={PAL.trim} />
          <ellipse cx="59" cy="40" rx="0.5" ry="2" fill={PAL.trim} />
          <path d="M56 44 L 54 46 L 58 46 Z" fill="#E8B4C2" />
          <path d="M46 42 L 38 40 M46 44 L 38 44 M66 42 L 74 40 M66 44 L 74 44" stroke="#6E665C" strokeWidth="0.5" />
          <path d="M16 58 Q 8 54 4 58 Q 8 62 16 60" fill="#2A2725" />
        </svg>
      );
    case "mouse":
      return (
        <svg {...base}>
          <ellipse cx="40" cy="66" rx="18" ry="2" fill={PAL.trim} opacity="0.25" />
          <ellipse cx="38" cy="56" rx="16" ry="10" fill="#9B8878" />
          <circle cx="52" cy="50" r="8" fill="#9B8878" />
          <circle cx="46" cy="44" r="5" fill="#B8A898" />
          <circle cx="56" cy="44" r="5" fill="#B8A898" />
          <circle cx="46" cy="44" r="2" fill="#E8B4C2" />
          <circle cx="56" cy="44" r="2" fill="#E8B4C2" />
          <circle cx="54" cy="50" r="1" fill={PAL.trim} />
          <path d="M58 52 L 56 54 L 60 54 Z" fill="#E8B4C2" />
          <path d="M50 52 L 44 50 M50 54 L 44 54 M58 52 L 64 50 M58 54 L 64 54" stroke="#6E665C" strokeWidth="0.4" />
          <path d="M22 60 Q 10 64 6 60" stroke="#9B8878" strokeWidth="2" fill="none" />
        </svg>
      );
    case "owl":
      return (
        <svg {...base}>
          <ellipse cx="40" cy="72" rx="18" ry="2" fill={PAL.trim} opacity="0.25" />
          <ellipse cx="40" cy="52" rx="22" ry="22" fill="#8A6240" />
          <path d="M22 34 L 22 24 L 30 32 Z" fill="#8A6240" />
          <path d="M58 34 L 58 24 L 50 32 Z" fill="#8A6240" />
          {Array.from({ length: 6 }).map((_, i) => (
            <ellipse key={i} cx={24 + (i % 3) * 8} cy={52 + Math.floor(i / 3) * 8} rx="3" ry="2" fill="#6B4A2A" opacity="0.6" />
          ))}
          <circle cx="30" cy="44" r="8" fill="#F4EFE2" />
          <circle cx="50" cy="44" r="8" fill="#F4EFE2" />
          <circle cx="30" cy="44" r="5" fill="#E8B84A" />
          <circle cx="50" cy="44" r="5" fill="#E8B84A" />
          <circle cx="30" cy="44" r="3" fill={PAL.trim} />
          <circle cx="50" cy="44" r="3" fill={PAL.trim} />
          <circle cx="31" cy="43" r="1" fill="#fff" />
          <circle cx="51" cy="43" r="1" fill="#fff" />
          <path d="M40 50 L 36 56 L 44 56 Z" fill="#E8B84A" />
          <path d="M30 68 L 30 74 M50 68 L 50 74" stroke="#E8B84A" strokeWidth="2" />
        </svg>
      );
    case "bee":
      return (
        <svg {...base}>
          <ellipse cx="40" cy="46" rx="14" ry="10" fill="#E8B84A" />
          <rect x="30" y="42" width="20" height="4" fill={PAL.trim} />
          <rect x="32" y="50" width="16" height="3" fill={PAL.trim} />
          <circle cx="28" cy="44" r="3" fill={PAL.trim} />
          <circle cx="27" cy="43" r="1" fill="#fff" />
          <path d="M26 42 L 22 36 M26 46 L 22 48" stroke={PAL.trim} strokeWidth="1" strokeLinecap="round" />
          <ellipse cx="36" cy="36" rx="10" ry="5" fill="#E0F2FA" opacity="0.7" />
          <ellipse cx="46" cy="36" rx="10" ry="5" fill="#E0F2FA" opacity="0.7" />
        </svg>
      );
    case "duck":
      return (
        <svg {...base}>
          <ellipse cx="40" cy="68" rx="24" ry="3" fill={PAL.water} opacity="0.4" />
          <ellipse cx="38" cy="54" rx="22" ry="12" fill="#F4EFE2" />
          <circle cx="58" cy="44" r="8" fill="#3E6A3E" />
          <circle cx="60" cy="42" r="1.2" fill={PAL.trim} />
          <path d="M62 48 L 70 46 L 68 50 L 62 50 Z" fill="#E8B84A" />
          <path d="M54 42 Q 58 38 62 42" stroke="#2E5A2E" strokeWidth="0.8" fill="none" />
          <path d="M22 50 L 16 46 L 16 52 L 22 54 Z" fill="#F4EFE2" />
          <path d="M36 60 Q 44 62 52 60" stroke="#D4C8A8" strokeWidth="0.8" fill="none" />
        </svg>
      );
    case "sun":
      return (
        <svg {...base}>
          <circle cx="40" cy="40" r="22" fill={PAL.sun} opacity="0.25" />
          <circle cx="40" cy="40" r="14" fill={PAL.sun} />
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return (
              <line key={i} x1={40 + Math.cos(a) * 20} y1={40 + Math.sin(a) * 20} x2={40 + Math.cos(a) * 26} y2={40 + Math.sin(a) * 26} stroke={PAL.sun} strokeWidth="1.8" strokeLinecap="round" />
            );
          })}
        </svg>
      );
    case "clouds":
      return (
        <svg {...base}>
          <ellipse cx="26" cy="30" rx="12" ry="6" fill={PAL.cloud} />
          <ellipse cx="36" cy="26" rx="14" ry="7" fill={PAL.cloud} />
          <ellipse cx="50" cy="30" rx="12" ry="6" fill={PAL.cloud} />
          <ellipse cx="52" cy="52" rx="10" ry="5" fill={PAL.cloud} opacity="0.8" />
          <ellipse cx="64" cy="50" rx="8" ry="4" fill={PAL.cloud} opacity="0.8" />
        </svg>
      );
    case "moon":
      return (
        <svg {...base}>
          <circle cx="44" cy="36" r="20" fill={PAL.moon} opacity="0.25" />
          <path d="M50 22 A 18 18 0 1 0 50 50 A 14 14 0 1 1 50 22 Z" fill={PAL.moon} />
        </svg>
      );
    case "stars":
      return (
        <svg {...base}>
          {[{ x: 18, y: 18, r: 2 }, { x: 40, y: 12, r: 2.4 }, { x: 60, y: 22, r: 1.8 }, { x: 26, y: 38, r: 1.6 }, { x: 52, y: 42, r: 2 }, { x: 36, y: 58, r: 1.6 }, { x: 64, y: 58, r: 2 }].map((st, i) => (
            <g key={i}>
              <circle cx={st.x} cy={st.y} r={st.r * 2} fill={PAL.moon} opacity="0.25" />
              <circle cx={st.x} cy={st.y} r={st.r} fill={PAL.moon} />
            </g>
          ))}
        </svg>
      );
    case "aurora": {
      const id = `aur${size}`;
      return (
        <svg {...base}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#9FE8C5" />
              <stop offset="0.5" stopColor="#7FA4B8" />
              <stop offset="1" stopColor="#C76A8B" />
            </linearGradient>
          </defs>
          <path d="M10 20 Q 30 8 40 22 Q 54 34 70 14 Q 64 36 50 46 Q 32 54 14 44 Q 4 32 10 20 Z" fill={`url(#${id})`} opacity="0.7" />
          {[{ x: 22, y: 56 }, { x: 48, y: 60 }, { x: 62, y: 52 }].map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r="1.2" fill={PAL.moon} />
          ))}
        </svg>
      );
    }
    case "petals":
      return (
        <svg {...base}>
          {[{ x: 18, y: 18 }, { x: 40, y: 22 }, { x: 58, y: 14 }, { x: 26, y: 40 }, { x: 48, y: 44 }, { x: 62, y: 38 }, { x: 22, y: 58 }, { x: 42, y: 62 }, { x: 58, y: 56 }].map((p, i) => (
            <ellipse key={i} cx={p.x} cy={p.y} rx="3" ry="1.6" fill={PAL.petal} transform={`rotate(${i * 40} ${p.x} ${p.y})`} />
          ))}
        </svg>
      );
    case "snow":
      return (
        <svg {...base}>
          {Array.from({ length: 14 }).map((_, i) => {
            const x = 10 + (i * 51) % 68;
            const y = 12 + (i * 37) % 60;
            return <circle key={i} cx={x} cy={y} r={1.4 + ((i * 7) % 3) * 0.6} fill={PAL.cloud} />;
          })}
        </svg>
      );
    case "autumn":
      return (
        <svg {...base}>
          {[{ x: 18, y: 20, c: "#C94B3A" }, { x: 40, y: 16, c: "#E37A44" }, { x: 58, y: 24, c: "#E8B84A" }, { x: 26, y: 44, c: "#E37A44" }, { x: 50, y: 42, c: "#C94B3A" }, { x: 20, y: 62, c: "#E8B84A" }, { x: 44, y: 60, c: "#E37A44" }, { x: 62, y: 58, c: "#C94B3A" }].map((p, i) => (
            <ellipse key={i} cx={p.x} cy={p.y} rx="5" ry="3" fill={p.c} transform={`rotate(${(i * 47) % 360} ${p.x} ${p.y})`} />
          ))}
        </svg>
      );
    default:
      return null;
  }
}
