"use client";

import { useLayoutEffect, useRef, useState } from "react";

export type TabId = "focus" | "garden" | "market" | "ledger" | "settings";

const TABS: { id: TabId; label: string }[] = [
  { id: "focus", label: "Focus" },
  { id: "garden", label: "Garden" },
  { id: "market", label: "Market" },
  { id: "ledger", label: "Stats" },
  { id: "settings", label: "Settings" },
];

type TopNavProps = {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
};

export function TopNav({ activeTab, onTabChange }: TopNavProps) {
  const navRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [underline, setUnderline] = useState({ left: 0, width: 0 });

  useLayoutEffect(() => {
    const el = navRefs.current[activeTab];
    if (!el) return;
    const parent = el.parentElement;
    if (!parent) return;
    const pr = parent.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    setUnderline({ left: r.left - pr.left, width: r.width });
  }, [activeTab]);

  return (
    <nav className="nav" aria-label="Main">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          ref={(el) => {
            navRefs.current[tab.id] = el;
          }}
          className={tab.id === activeTab ? "is-active" : ""}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
      <span
        className="nav-underline"
        style={{ transform: `translateX(${underline.left}px)`, width: underline.width }}
      />
    </nav>
  );
}
