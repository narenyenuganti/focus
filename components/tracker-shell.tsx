"use client";

import { useEffect, useMemo, useState } from "react";
import { FocusTimer } from "@/components/focus-timer";
import { SettingsPanel } from "@/components/settings-panel";
import { LedgerView } from "@/components/ledger-view";
import { ShopPanel } from "@/components/shop-panel";
import { GardenView } from "@/components/garden-view";
import { TopNav, type TabId } from "@/components/bottom-nav";
import type { getTrackerSnapshot } from "@/lib/server/dashboard";
import type { Wallet, Inventory } from "@/lib/economy-types";

type TrackerSnapshot = Awaited<ReturnType<typeof getTrackerSnapshot>>;

type TrackerShellProps = {
  snapshot: TrackerSnapshot;
};

export function TrackerShell({ snapshot }: TrackerShellProps) {
  const [activeTab, setActiveTab] = useState<TabId>("focus");
  const [wallet, setWallet] = useState<Wallet>(snapshot.economy.wallet);
  const [inventory, setInventory] = useState<Inventory>(snapshot.economy.inventory);

  const streakDays = snapshot.focus.currentStreakDays ?? 0;

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", snapshot.settings.theme);
  }, [snapshot.settings.theme]);

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

  const isGarden = activeTab === "garden";

  return (
    <div className={`app ${isGarden ? "app-garden" : ""}`}>
      <header className={`topbar ${isGarden ? "topbar-float" : ""}`}>
        <div className="mark">Focus</div>
        <TopNav activeTab={activeTab} onTabChange={setActiveTab} />
      </header>

      <main className={isGarden ? "garden-wrap" : "stage"}>
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
            theme={snapshot.settings.theme}
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
    </div>
  );
}
