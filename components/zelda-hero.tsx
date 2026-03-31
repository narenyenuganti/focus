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

const SILLY_FACES = ["◕‿◕", "◕‿↼", "≧◡≦", "♥‿♥", "◔‿◔", ">‿<", "⊙‿⊙"];
const MAX_EYE_OFFSET = 3;

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

function TrackingEyes({ eyeOffset }: { eyeOffset: { x: number; y: number } }) {
  return (
    <svg width="36" height="24" viewBox="0 0 36 24" style={{ display: "block", margin: "0 auto" }}>
      {/* Left eye */}
      <ellipse cx="11" cy="12" rx="6" ry="7" fill="white" />
      <circle cx={11 + eyeOffset.x} cy={12 + eyeOffset.y} r="3" fill="#1a3a5c" />
      <circle cx={11 + eyeOffset.x - 0.8} cy={12 + eyeOffset.y - 1.2} r="1" fill="white" />
      {/* Right eye */}
      <ellipse cx="25" cy="12" rx="6" ry="7" fill="white" />
      <circle cx={25 + eyeOffset.x} cy={12 + eyeOffset.y} r="3" fill="#1a3a5c" />
      <circle cx={25 + eyeOffset.x - 0.8} cy={12 + eyeOffset.y - 1.2} r="1" fill="white" />
    </svg>
  );
}

function HeroSvg() {
  return (
    <svg width="80" height="90" viewBox="0 0 80 90" style={{ display: "block" }}>
      {/* Cap */}
      <polygon points="40,2 58,28 22,28" fill="#2E7D32" stroke="#1B5E20" strokeWidth="1" />
      <polygon points="40,2 52,20 28,20" fill="#43A047" />
      {/* Head */}
      <ellipse cx="40" cy="38" rx="18" ry="16" fill="#FFDAB9" />
      {/* Ears */}
      <ellipse cx="20" cy="36" rx="5" ry="8" fill="#FFDAB9" stroke="#E8B88A" strokeWidth="0.5" transform="rotate(-15 20 36)" />
      <ellipse cx="60" cy="36" rx="5" ry="8" fill="#FFDAB9" stroke="#E8B88A" strokeWidth="0.5" transform="rotate(15 60 36)" />
      {/* Tunic body */}
      <rect x="26" y="52" width="28" height="24" rx="6" fill="#2E7D32" />
      <rect x="30" y="52" width="20" height="24" rx="4" fill="#43A047" />
      {/* Belt */}
      <rect x="28" y="64" width="24" height="4" rx="2" fill="#8D6E63" />
      <rect x="37" y="63" width="6" height="6" rx="1" fill="#FFD54F" />
      {/* Arms */}
      <rect x="16" y="54" width="10" height="4" rx="2" fill="#FFDAB9" />
      <rect x="54" y="54" width="10" height="4" rx="2" fill="#FFDAB9" />
      {/* Legs/boots */}
      <rect x="30" y="76" width="8" height="12" rx="3" fill="#5D4037" />
      <rect x="42" y="76" width="8" height="12" rx="3" fill="#5D4037" />
    </svg>
  );
}

export function ZeldaHero({ state, currencyEarned, currencyIcon, theme }: ZeldaHeroProps) {
  const [tapped, setTapped] = useState(false);
  const [sillyFace, setSillyFace] = useState<string | null>(null);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [variant, setVariant] = useState<"a" | "b">("a");
  const heroRef = useRef<HTMLDivElement>(null);
  const tapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastStateRef = useRef(state);

  // Pick random variant on each state change
  useEffect(() => {
    if (state !== lastStateRef.current) {
      setVariant(Math.random() < 0.5 ? "a" : "b");
      lastStateRef.current = state;
    }
  }, [state]);

  // Eye tracking
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
    const randomFace = SILLY_FACES[Math.floor(Math.random() * SILLY_FACES.length)];
    setSillyFace(randomFace);
    setTapped(true);
    playChirp();
    if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
    tapTimeoutRef.current = setTimeout(() => {
      setTapped(false);
      setSillyFace(null);
    }, 800);
  }, [tapped]);

  // Map state + variant to CSS class
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

  const useTextFace = tapped;
  const displayText = tapped && sillyFace ? sillyFace : "";
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
        <HeroSvg />
        {/* Face overlay positioned on the head */}
        <div style={{ position: "absolute", top: 26, left: 0, right: 0 }}>
          {useTextFace ? (
            <span className={styles.face} style={{ display: "block", textAlign: "center" }}>{displayText}</span>
          ) : (
            <div className={styles.svgFace}>
              <TrackingEyes eyeOffset={eyeOffset} />
            </div>
          )}
        </div>
        {/* Activity indicator when focusing */}
        {isFocusing && (
          <span className={styles.activityOverlay} style={{ display: "block" }}>
            {activityEmoji}
          </span>
        )}
      </div>
      {state === "celebrating" && currencyEarned != null && currencyEarned > 0 && (
        <span className={styles.currencyEarned}>+{currencyEarned} {currencyIcon}</span>
      )}
    </div>
  );
}
