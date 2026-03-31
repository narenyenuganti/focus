"use client";

import { Timer, Home, ShoppingBag, BarChart3, Settings, LogOut } from "lucide-react";

export type TabId = "focus" | "room" | "shop" | "stats" | "settings";

const TABS: { id: TabId; label: string; icon: typeof Timer }[] = [
  { id: "focus", label: "Focus", icon: Timer },
  { id: "room", label: "Room", icon: Home },
  { id: "shop", label: "Shop", icon: ShoppingBag },
  { id: "stats", label: "Stats", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
];

type BottomNavProps = {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  onLogout: () => void;
};

export function BottomNav({ activeTab, onTabChange, onLogout }: BottomNavProps) {
  return (
    <footer className="hub-bottombar">
      <nav className="nav-cluster" aria-label="Main navigation" style={{ flex: 1, justifyContent: "center" }}>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              className={active ? "nav-pill is-active" : "nav-pill"}
              onClick={() => onTabChange(tab.id)}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="utility-cluster">
        <form action={onLogout}>
          <button type="submit" className="utility-button danger" aria-label="Log out">
            <LogOut size={16} />
          </button>
        </form>
      </div>
    </footer>
  );
}
