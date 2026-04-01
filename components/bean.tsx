"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./bean.module.css";

export type BeanState = "idle" | "focusing" | "celebrating" | "sad";

type BeanProps = {
  state: BeanState;
  socksEarned?: number;
  currencyIcon?: string;
};

const MAX_EYE_OFFSET = 2;

function playChirp() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.06);
    osc.frequency.exponentialRampToValueAtTime(1100, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.25);
    setTimeout(() => void ctx.close(), 300);
  } catch {
    /* audio not available */
  }
}

export function Bean({ state, socksEarned, currencyIcon = "🧦" }: BeanProps) {
  const [tapped, setTapped] = useState(false);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const beanRef = useRef<HTMLDivElement>(null);
  const tapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (!beanRef.current) return;
      const rect = beanRef.current.getBoundingClientRect();
      const beanCenterX = rect.left + rect.width / 2;
      const beanCenterY = rect.top + rect.height / 2;

      const dx = e.clientX - beanCenterX;
      const dy = e.clientY - beanCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 1) {
        setEyeOffset({ x: 0, y: 0 });
        return;
      }

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

  const isFocusing = state === "focusing";

  return (
    <div
      ref={beanRef}
      className={`${styles.bean} ${styles[state]} ${tapped ? styles.tapped : ""}`}
      aria-label="Bean character"
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
          {/* Body */}
          <rect x="6" y="4" width="36" height="38" rx="10" fill="#D4A017" stroke="#8B6914" strokeWidth="2" />
          {/* Body highlight */}
          <rect x="10" y="8" width="10" height="16" rx="4" fill="#E0B830" opacity="0.4" />

          {/* Eyes — pixel rects with tracking */}
          <rect x={12 + eyeOffset.x} y={16 + eyeOffset.y} width="5" height="6" rx="1" fill="#1a1a1a" />
          <rect x={31 + eyeOffset.x} y={16 + eyeOffset.y} width="5" height="6" rx="1" fill="#1a1a1a" />
          {/* Eye highlights */}
          <rect x={14 + eyeOffset.x} y={17 + eyeOffset.y} width="2" height="2" fill="#fff" />
          <rect x={33 + eyeOffset.x} y={17 + eyeOffset.y} width="2" height="2" fill="#fff" />

          {/* Rosy cheeks */}
          <rect x="7" y="24" width="5" height="3" rx="1" fill="#E8A060" opacity="0.5" />
          <rect x="36" y="24" width="5" height="3" rx="1" fill="#E8A060" opacity="0.5" />

          {/* Mouth */}
          {state === "sad" ? (
            <path d="M18,32 Q24,28 30,32" stroke="#1a1a1a" fill="none" strokeWidth="1.5" strokeLinecap="round" />
          ) : state === "celebrating" ? (
            <path d="M16,30 Q24,38 32,30" stroke="#1a1a1a" fill="none" strokeWidth="1.5" strokeLinecap="round" />
          ) : (
            <path d="M18,30 Q24,35 30,30" stroke="#1a1a1a" fill="none" strokeWidth="1.5" strokeLinecap="round" />
          )}

          {/* Feet */}
          <rect x="10" y="42" width="10" height="7" rx="2" fill="#8B6914" />
          <rect x="28" y="42" width="10" height="7" rx="2" fill="#8B6914" />

          {/* Knitting needles (shown when focusing) */}
          {isFocusing && (
            <g className={styles.knittingNeedles}>
              <rect x="2" y="36" width="2" height="18" fill="#A0A0A0" transform="rotate(-20 3 45)" />
              <rect x="44" y="36" width="2" height="18" fill="#A0A0A0" transform="rotate(20 45 45)" />
              {/* Yarn */}
              <path d="M8,52 Q24,56 40,52" stroke="#FFF" fill="none" strokeWidth="2" strokeLinecap="round" />
            </g>
          )}

          {/* Celebrating sparkles */}
          {state === "celebrating" && (
            <>
              <rect x="2" y="2" width="3" height="3" fill="#FFD700" opacity="0.8" />
              <rect x="42" y="0" width="2" height="2" fill="#FFD700" opacity="0.6" />
              <rect x="0" y="20" width="2" height="2" fill="#FFD700" opacity="0.5" />
              <rect x="46" y="18" width="2" height="2" fill="#FFD700" opacity="0.7" />
            </>
          )}
        </svg>
      </div>

      {/* Shadow */}
      <div className={styles.shadow} />

      {state === "celebrating" && socksEarned != null && (
        <span className={styles.socksEarned}>+{socksEarned} {currencyIcon}</span>
      )}
    </div>
  );
}
