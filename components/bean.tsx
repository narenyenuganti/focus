"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./bean.module.css";

export type BeanState = "idle" | "focusing" | "celebrating" | "sad";

type BeanProps = {
  state: BeanState;
  socksEarned?: number;
};

const SILLY_FACES = ["◕‿◕", "◕‿↼", "≧◡≦", "♥‿♥", "◔‿◔", ">‿<", "⊙‿⊙"];

const MAX_EYE_OFFSET = 3;

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

function TrackingEyes({ eyeOffset }: { eyeOffset: { x: number; y: number } }) {
  return (
    <svg width="40" height="28" viewBox="0 0 40 28" style={{ display: "block", margin: "0 auto" }}>
      {/* Left eye */}
      <ellipse cx="12" cy="14" rx="7" ry="8" fill="white" />
      <circle cx={12 + eyeOffset.x} cy={14 + eyeOffset.y} r="3.5" fill="#333" />
      <circle cx={12 + eyeOffset.x - 1} cy={14 + eyeOffset.y - 1.5} r="1.2" fill="white" />
      {/* Right eye */}
      <ellipse cx="28" cy="14" rx="7" ry="8" fill="white" />
      <circle cx={28 + eyeOffset.x} cy={14 + eyeOffset.y} r="3.5" fill="#333" />
      <circle cx={28 + eyeOffset.x - 1} cy={14 + eyeOffset.y - 1.5} r="1.2" fill="white" />
    </svg>
  );
}

function Mouth({ state }: { state: BeanState }) {
  if (state === "sad") {
    return (
      <svg width="20" height="10" viewBox="0 0 20 10" style={{ display: "block", margin: "2px auto 0" }}>
        <path d="M4,8 Q10,2 16,8" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="20" height="10" viewBox="0 0 20 10" style={{ display: "block", margin: "2px auto 0" }}>
      <path d="M4,3 Q10,10 16,3" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Bean({ state, socksEarned }: BeanProps) {
  const textFaces: Record<BeanState, string> = {
    idle: "◡‿◡",
    focusing: "– –",
    celebrating: "◡▽◡",
    sad: "◠_◠",
  };

  const [tapped, setTapped] = useState(false);
  const [sillyFace, setSillyFace] = useState<string | null>(null);
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

  // Use text face for tapped/focusing states, SVG eyes for idle/celebrating/sad
  const useTextFace = tapped || state === "focusing";
  const displayText = tapped && sillyFace ? sillyFace : textFaces[state];

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
        {useTextFace ? (
          <span className={styles.face}>{displayText}</span>
        ) : (
          <div className={styles.svgFace}>
            <TrackingEyes eyeOffset={eyeOffset} />
            <Mouth state={state} />
          </div>
        )}
        <div className={styles.needles}>
          <div className={styles.needle} />
          <div className={styles.needle} />
        </div>
        <div className={styles.yarn} />
        <svg className={styles.unravelYarn} viewBox="0 0 30 30">
          <path className={styles.unravelStrand} d="M5,5 Q15,15 10,25 Q5,20 20,15 Q25,10 15,5" />
        </svg>
      </div>
      {state === "celebrating" && socksEarned != null && (
        <span className={styles.socksEarned}>+{socksEarned} 🧦</span>
      )}
    </div>
  );
}
