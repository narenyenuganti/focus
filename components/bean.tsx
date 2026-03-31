"use client";

import { useCallback, useRef, useState } from "react";
import styles from "./bean.module.css";

export type BeanState = "idle" | "focusing" | "celebrating" | "sad";

type BeanProps = {
  state: BeanState;
  socksEarned?: number;
};

const SILLY_FACES = ["◕‿◕", "◕‿↼", "≧◡≦", "♥‿♥", "◔‿◔", ">‿<", "⊙‿⊙"];

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

export function Bean({ state, socksEarned }: BeanProps) {
  const faces: Record<BeanState, string> = {
    idle: "◡‿◡",
    focusing: "– –",
    celebrating: "◡▽◡",
    sad: "◠_◠",
  };

  const [tapped, setTapped] = useState(false);
  const [sillyFace, setSillyFace] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = useCallback(() => {
    if (tapped) return;

    const randomFace = SILLY_FACES[Math.floor(Math.random() * SILLY_FACES.length)];
    setSillyFace(randomFace);
    setTapped(true);
    playChirp();

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setTapped(false);
      setSillyFace(null);
    }, 800);
  }, [tapped]);

  const displayFace = tapped && sillyFace ? sillyFace : faces[state];

  return (
    <div
      className={`${styles.bean} ${styles[state]} ${tapped ? styles.tapped : ""}`}
      aria-label="Bean character"
      onClick={handleClick}
      style={{ cursor: "pointer" }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleClick(); }}
    >
      <div className={styles.body}>
        <span className={styles.face}>{displayFace}</span>
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
