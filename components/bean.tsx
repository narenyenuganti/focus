"use client";

import styles from "./bean.module.css";

export type BeanState = "idle" | "focusing" | "celebrating" | "sad";

type BeanProps = {
  state: BeanState;
  socksEarned?: number;
};

export function Bean({ state, socksEarned }: BeanProps) {
  const faces: Record<BeanState, string> = {
    idle: "◡‿◡",
    focusing: "– –",
    celebrating: "◡▽◡",
    sad: "◠_◠",
  };

  return (
    <div className={`${styles.bean} ${styles[state]}`} aria-label="Bean character">
      <div className={styles.body}>
        <span className={styles.face}>{faces[state]}</span>
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
