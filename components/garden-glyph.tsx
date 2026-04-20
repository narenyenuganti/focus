type GlyphKind =
  | "fern"
  | "lavender"
  | "tree"
  | "maple"
  | "stone"
  | "lantern"
  | "pond"
  | "bench"
  | "vine";

type GardenGlyphProps = {
  kind: GlyphKind;
  size?: number;
  stroke?: string;
};

export function GardenGlyph({ kind, size = 80, stroke = "currentColor" }: GardenGlyphProps) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 80 80",
    fill: "none" as const,
    stroke,
    strokeWidth: 1.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (kind) {
    case "fern":
      return (
        <svg {...common}>
          <path d="M40 72 V20" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <g key={i} transform={`translate(40 ${22 + i * 8})`}>
              <path d={`M0 0 C -${14 - i * 1.6} -4 -${16 - i * 1.6} -10 -${12 - i * 1.6} -14`} />
              <path d={`M0 0 C  ${14 - i * 1.6} -4  ${16 - i * 1.6} -10  ${12 - i * 1.6} -14`} />
            </g>
          ))}
        </svg>
      );
    case "lavender":
      return (
        <svg {...common}>
          <path d="M26 72 V40" />
          <path d="M40 72 V32" />
          <path d="M54 72 V44" />
          {[26, 40, 54].map((x, i) => (
            <g key={i}>
              {[0, 1, 2, 3].map((j) => (
                <circle
                  key={j}
                  cx={x}
                  cy={(i === 1 ? 32 : i === 0 ? 40 : 44) - j * 6}
                  r="2"
                />
              ))}
            </g>
          ))}
        </svg>
      );
    case "tree":
      return (
        <svg {...common}>
          <path d="M40 72 V44" />
          <path d="M40 44 L26 30 M40 44 L54 32 M40 36 L30 22 M40 36 L52 24" />
          <circle cx="26" cy="24" r="10" />
          <circle cx="52" cy="20" r="12" />
          <circle cx="40" cy="14" r="9" />
        </svg>
      );
    case "maple":
      return (
        <svg {...common}>
          <path d="M40 72 V46" />
          <path d="M40 46 L22 34 L14 18 M40 46 L58 32 L66 16 M40 42 L32 24 M40 42 L48 22 M40 38 L40 20" />
          <path d="M22 34 L30 42 M58 32 L50 40" />
        </svg>
      );
    case "stone":
      return (
        <svg {...common}>
          <path d="M18 68 C 18 40, 30 14, 44 14 C 58 14, 64 38, 64 68 Z" />
          <path d="M30 30 L40 34 M48 26 L54 32" />
        </svg>
      );
    case "lantern":
      return (
        <svg {...common}>
          <path d="M30 20 H50" />
          <path d="M40 20 V14" />
          <path d="M28 28 Q 28 44 40 48 Q 52 44 52 28 Z" />
          <path d="M28 30 H52 M28 38 H52 M28 44 H52" />
          <path d="M40 48 V58" />
        </svg>
      );
    case "pond":
      return (
        <svg {...common}>
          <ellipse cx="40" cy="50" rx="28" ry="10" />
          <ellipse cx="40" cy="50" rx="18" ry="6" opacity="0.5" />
          <path d="M20 42 Q 40 36 60 42" opacity="0.4" />
        </svg>
      );
    case "bench":
      return (
        <svg {...common}>
          <path d="M16 52 H64 V56 H16 Z" />
          <path d="M22 56 V68 M58 56 V68" />
          <path d="M16 46 H64" />
        </svg>
      );
    case "vine":
      return (
        <svg {...common}>
          <path d="M14 14 Q 30 30, 26 50 Q 22 68, 40 70" />
          <path d="M66 14 Q 50 30, 54 50 Q 58 68, 40 70" />
          {[0, 1, 2, 3].map((i) => (
            <circle key={i} cx={28 + i * 4} cy={30 + i * 8} r="2.5" />
          ))}
          {[0, 1, 2, 3].map((i) => (
            <circle key={i} cx={52 - i * 4} cy={30 + i * 8} r="2.5" />
          ))}
        </svg>
      );
    default:
      return null;
  }
}

export type { GlyphKind };
