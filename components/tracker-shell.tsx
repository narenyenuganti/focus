"use client";

import { useMemo, useState } from "react";
import { logoutTracker } from "@/app/actions/auth";
import { FocusTimer } from "@/components/focus-timer";
import { SettingsPanel } from "@/components/settings-panel";
import { LedgerView } from "@/components/ledger-view";
import { ShopPanel } from "@/components/shop-panel";
import { GardenView } from "@/components/garden-view";
import { TopNav, type TabId } from "@/components/bottom-nav";
import type { getTrackerSnapshot } from "@/lib/server/dashboard";
import type { Wallet, Inventory } from "@/lib/economy-types";
import { getTheme } from "@/lib/themes";

type TrackerSnapshot = Awaited<ReturnType<typeof getTrackerSnapshot>>;

type TrackerShellProps = {
  snapshot: TrackerSnapshot;
};

export function TrackerShell({ snapshot }: TrackerShellProps) {
  const [activeTab, setActiveTab] = useState<TabId>("focus");
  const [wallet, setWallet] = useState<Wallet>(snapshot.economy.wallet);
  const [inventory, setInventory] = useState<Inventory>(snapshot.economy.inventory);
  const theme = getTheme(snapshot.settings.theme);

  const streakDays = snapshot.focus.currentStreakDays ?? 0;
  const weekMinutes = snapshot.focus.weeklyMinutes;
  const goalMinutes = snapshot.settings.weeklyFocusGoalMinutes;
  const totalSessions = snapshot.focus.totalSessions ?? 0;
  const weekPct = goalMinutes > 0
    ? Math.min(100, Math.round((weekMinutes / goalMinutes) * 100))
    : 0;

  const gardenPlantsCount = inventory.purchased.length;
  const ownedSet = useMemo(() => new Set(inventory.purchased), [inventory.purchased]);

  async function handlePurchase(itemId: string) {
    const response = await fetch("/api/economy/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId }),
    });
    if (!response.ok) return;
    const data = await response.json();
    setWallet(data.wallet);
    setInventory(data.inventory);
  }

  function handleSocksEarned(amount: number) {
    setWallet((prev) => ({
      socks: prev.socks + amount,
      totalEarned: prev.totalEarned + amount,
    }));
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="mark" aria-hidden="true" />
          <div className="wordmark serif">
            <span>Focus</span>
          </div>
        </div>
        <div className="topbar-right">
          <div className="streak" title={`${streakDays} day streak`}>
            <span>Streak</span>
            <span className="dots">
              {Array.from({ length: 7 }).map((_, i) => (
                <span key={i} className={`dot ${i < Math.min(7, streakDays) ? "on" : ""}`} />
              ))}
            </span>
            <span className="mono">{streakDays}d</span>
          </div>
          <div className="wallet">
            <span className="cur">{theme.currencyName}</span>
            <span className="num mono">{wallet.socks}</span>
          </div>
          <form action={logoutTracker}>
            <button
              type="submit"
              aria-label="Log out"
              style={{
                font: "inherit",
                background: "none",
                border: 0,
                cursor: "pointer",
                fontSize: 11,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "var(--ink-soft)",
              }}
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <TopNav activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="stage">
        {activeTab === "focus" && (
          <FocusTimer
            todayMinutes={snapshot.focus.todayMinutes}
            todaySessions={snapshot.focus.todaySessions}
            weeklyMinutes={snapshot.focus.weeklyMinutes}
            weeklyGoalMinutes={snapshot.settings.weeklyFocusGoalMinutes}
            streakDays={streakDays}
            presets={snapshot.settings.focusPresets}
            notificationSound={snapshot.settings.notificationSound}
            ambientMusic={snapshot.settings.ambientMusic}
            breakDurationMinutes={snapshot.settings.breakDurationMinutes}
            onSocksEarned={handleSocksEarned}
          />
        )}

        {activeTab === "garden" && (
          <GardenView
            seeds={wallet.socks}
            plantsCount={gardenPlantsCount}
            streakDays={streakDays}
            owned={ownedSet}
          />
        )}

        {activeTab === "market" && (
          <ShopPanel
            socks={wallet.socks}
            purchased={inventory.purchased}
            onPurchase={handlePurchase}
          />
        )}

        {activeTab === "ledger" && (
          <LedgerView
            heatmap={snapshot.focus.heatmap}
            todayMinutes={snapshot.focus.todayMinutes}
            weeklyMinutes={snapshot.focus.weeklyMinutes}
            weeklyGoalMinutes={snapshot.settings.weeklyFocusGoalMinutes}
            streakDays={streakDays}
            totalSessions={snapshot.focus.totalSessions ?? 0}
            totalMinutes={snapshot.focus.totalMinutes ?? 0}
          />
        )}

        {activeTab === "settings" && <SettingsPanel settings={snapshot.settings} />}
      </main>

      <footer className="footer">
        <div>
          v2 · <span className="mono">{weekPct}% of weekly goal</span>
        </div>
      </footer>
    </div>
  );
}
