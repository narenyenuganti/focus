"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./zelda-hero.module.css";
import type { BeanState } from "@/components/bean";
import { getCurrentFocusActivity } from "@/lib/themes";
import type { ThemeConfig } from "@/lib/themes";

type ZeldaHeroProps = {
  state: BeanState;
  currencyEarned?: number;
  currencyIcon: string;
  theme: ThemeConfig;
};

const MAX_EYE_OFFSET = 2;

const ACTIVITY_EMOJIS: Record<string, string> = {
  spellbook: "📖",
  forging: "⚒️",
  meditating: "🔺",
  training: "⚔️",
};

function playChirp() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(660, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(990, ctx.currentTime + 0.05);
    osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.22);
    setTimeout(() => void ctx.close(), 300);
  } catch {
    /* audio not available */
  }
}

export function ZeldaHero({ state, currencyEarned, currencyIcon, theme }: ZeldaHeroProps) {
  const [tapped, setTapped] = useState(false);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [variant, setVariant] = useState<"a" | "b">("a");
  const heroRef = useRef<HTMLDivElement>(null);
  const tapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastStateRef = useRef(state);

  useEffect(() => {
    if (state !== lastStateRef.current) {
      setVariant(Math.random() < 0.5 ? "a" : "b");
      lastStateRef.current = state;
    }
  }, [state]);

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 1) { setEyeOffset({ x: 0, y: 0 }); return; }
      const scale = Math.min(MAX_EYE_OFFSET / distance, 1);
      setEyeOffset({
        x: Math.round(dx * scale * 10) / 10,
        y: Math.round(dy * scale * 10) / 10,
      });
    }
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleClick = useCallback(() => {
    if (tapped) return;
    setTapped(true);
    playChirp();
    if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
    tapTimeoutRef.current = setTimeout(() => {
      setTapped(false);
    }, 800);
  }, [tapped]);

  function getStateClass(): string {
    if (tapped) return styles.tapped;
    if (variant === "b") {
      const bClasses: Partial<Record<BeanState, string>> = {
        idle: styles.idleB,
        focusing: styles.focusingB,
        celebrating: styles.celebratingB,
        sad: styles.sadB,
      };
      return bClasses[state] ?? styles[state];
    }
    return styles[state] ?? "";
  }

  const activity = getCurrentFocusActivity(theme);
  const activityEmoji = ACTIVITY_EMOJIS[activity.id] ?? "📖";
  const isFocusing = state === "focusing";

  return (
    <div
      ref={heroRef}
      className={`${styles.hero} ${getStateClass()}`}
      aria-label="Hero character"
      onClick={handleClick}
      style={{ cursor: "pointer" }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleClick(); }}
    >
      <div className={styles.body}>
        <svg
          width="48"
          height="56"
          viewBox="0 0 48 56"
          style={{ imageRendering: "pixelated", display: "block" }}
          shapeRendering="crispEdges"
        >
          {/* Cap */}
          <polygon points="24,0 36,16 12,16" fill="#2E7D32" stroke="#1B5E20" strokeWidth="1" />
          <polygon points="24,2 32,14 16,14" fill="#43A047" />

          {/* Head */}
          <rect x="12" y="14" width="24" height="16" rx="4" fill="#FFDAB9" />
          {/* Ears */}
          <rect x="8" y="18" width="4" height="8" rx="2" fill="#FFDAB9" />
          <rect x="36" y="18" width="4" height="8" rx="2" fill="#FFDAB9" />

          {/* Eyes — pixel rects with tracking */}
          <rect x={16 + eyeOffset.x} y={20 + eyeOffset.y} width="5" height="5" rx="1" fill="#1a3a5c" />
          <rect x={27 + eyeOffset.x} y={20 + eyeOffset.y} width="5" height="5" rx="1" fill="#1a3a5c" />
          {/* Eye highlights */}
          <rect x={18 + eyeOffset.x} y={21 + eyeOffset.y} width="2" height="2" fill="#fff" />
          <rect x={29 + eyeOffset.x} y={21 + eyeOffset.y} width="2" height="2" fill="#fff" />

          {/* Tunic */}
          <rect x="14" y="30" width="20" height="14" rx="3" fill="#2E7D32" />
          <rect x="17" y="30" width="14" height="14" rx="2" fill="#43A047" />

          {/* Belt */}
          <rect x="15" y="36" width="18" height="3" rx="1" fill="#8D6E63" />
          <rect x="22" y="35" width="4" height="5" rx="1" fill="#FFD54F" />

          {/* Arms */}
          <rect x="8" y="32" width="6" height="4" rx="2" fill="#FFDAB9" />
          <rect x="34" y="32" width="6" height="4" rx="2" fill="#FFDAB9" />

          {/* Boots */}
          <rect x="16" y="44" width="6" height="8" rx="2" fill="#5D4037" />
          <rect x="26" y="44" width="6" height="8" rx="2" fill="#5D4037" />

          {/* Celebrating sword raise */}
          {state === "celebrating" && (
            <g>
              <rect x="38" y="8" width="2" height="20" fill="#C0C0C0" />
              <rect x="35" y="26" width="8" height="2" rx="1" fill="#8B7355" />
              <polygon points="38,8 40,8 39,4" fill="#C0C0C0" />
            </g>
          )}
        </svg>

        {/* Activity indicator when focusing */}
        {isFocusing && (
          <span className={styles.activityOverlay}>
            {activityEmoji}
          </span>
        )}
      </div>

      {/* Shadow */}
      <div className={styles.shadow} />

      {state === "celebrating" && currencyEarned != null && currencyEarned > 0 && (
        <span className={styles.currencyEarned}>+{currencyEarned} {currencyIcon}</span>
      )}
    </div>
  );
}
