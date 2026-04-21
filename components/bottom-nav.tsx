"use client";

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
  return (
    <nav className="tabs" aria-label="Main">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`tab ${tab.id === activeTab ? "active" : ""}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
