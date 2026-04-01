"use client";

import { useState } from "react";
import { logoutTracker } from "@/app/actions/auth";
import { FocusTimer } from "@/components/focus-timer";
import { SettingsPanel } from "@/components/settings-panel";
import { StatsOverview } from "@/components/stats-overview";
import { ShopPanel } from "@/components/shop-panel";
import { RoomEditor } from "@/components/room-editor";
import { BottomNav, type TabId } from "@/components/bottom-nav";
import type { getTrackerSnapshot } from "@/lib/server/dashboard";
import type { Wallet, Inventory, RoomPlacements, RoomState } from "@/lib/economy-types";
import { getTheme } from "@/lib/themes";
import { getDecorationsForTheme } from "@/lib/decoration-catalog";

type TrackerSnapshot = Awaited<ReturnType<typeof getTrackerSnapshot>>;

type TrackerShellProps = {
  snapshot: TrackerSnapshot;
};

export function TrackerShell({ snapshot }: TrackerShellProps) {
  const [activeTab, setActiveTab] = useState<TabId>("focus");
  const [wallet, setWallet] = useState<Wallet>(snapshot.economy.wallet);
  const [inventory, setInventory] = useState<Inventory>(snapshot.economy.inventory);
  const [room, setRoom] = useState<RoomPlacements>(snapshot.economy.room);
  const [roomState, setRoomState] = useState<RoomState>(snapshot.economy.roomState);
  const theme = getTheme(snapshot.settings.theme);

  const statisticsCards = [
    {
      label: "today",
      value: `${snapshot.focus.todayMinutes}m`,
      detail: `${snapshot.focus.todaySessions} focus sessions`,
    },
    {
      label: "this week",
      value: `${snapshot.focus.weeklyMinutes}m`,
      detail: `${snapshot.insights.goalProgress[0]?.percent ?? 0}% of ${snapshot.settings.weeklyFocusGoalMinutes}m goal`,
    },
  ];

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

  async function handlePlace(slotId: string, itemId: string) {
    const response = await fetch("/api/economy/place", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slotId, itemId }),
    });
    if (!response.ok) return;
    const data = await response.json();
    setRoom(data.room);
  }

  async function handleRemove(slotId: string) {
    const response = await fetch("/api/economy/place", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slotId }),
    });
    if (!response.ok) return;
    const data = await response.json();
    setRoom(data.room);
  }

  async function handleUnlockRoom(roomId: string) {
    const response = await fetch("/api/economy/room", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId }),
    });
    if (!response.ok) return;
    const data = await response.json();
    setWallet(data.wallet);
    setRoomState(data.roomState);
  }

  async function handleSelectRoom(roomId: string) {
    const response = await fetch("/api/economy/room", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId }),
    });
    if (!response.ok) return;
    const data = await response.json();
    setRoomState(data.roomState);
  }

  function handleSocksEarned(amount: number) {
    setWallet((prev) => ({
      socks: prev.socks + amount,
      totalEarned: prev.totalEarned + amount,
    }));
  }

  return (
    <div className="hub-shell">
      {/* Top bar */}
      <header className="hub-topbar">
        {snapshot.topMetrics.map((metric) => (
          <article key={metric.label} className={`metric-pill tone-${metric.tone}`}>
            <strong>{metric.value}</strong>
            <span>{metric.label}</span>
          </article>
        ))}
        <article className="metric-pill tone-emerald">
          <strong>{theme.currencyIcon} {wallet.socks}</strong>
          <span>{theme.currencyName}</span>
        </article>
      </header>

      {/* Main content area */}
      <main className="hub-main">
        <section className="hub-focus-column" style={{ display: activeTab === "focus" ? undefined : "none" }}>
          <FocusTimer
            todayMinutes={snapshot.focus.todayMinutes}
            todaySessions={snapshot.focus.todaySessions}
            weeklyMinutes={snapshot.focus.weeklyMinutes}
            weeklyGoalMinutes={snapshot.settings.weeklyFocusGoalMinutes}
            presets={snapshot.settings.focusPresets}
            completionSound={snapshot.settings.completionSound}
            ambientMusic={snapshot.settings.ambientMusic}
            breakDurationMinutes={snapshot.settings.breakDurationMinutes}
            breakEndChime={snapshot.settings.breakEndChime}
            placements={room.placements}
            theme={theme}
            roomId={roomState.selectedRoom}
            onSocksEarned={handleSocksEarned}
          />
        </section>

        {activeTab === "room" && (
          <section className="hub-focus-column">
            <RoomEditor
              placements={room.placements}
              purchased={inventory.purchased}
              onPlace={handlePlace}
              onRemove={handleRemove}
            />
          </section>
        )}

        {activeTab === "shop" && (
          <section className="hub-focus-column">
            <ShopPanel
              socks={wallet.socks}
              purchased={inventory.purchased}
              onPurchase={handlePurchase}
              themeId={theme.id}
              currencyIcon={theme.currencyIcon}
              unlockedRooms={roomState.unlockedRooms}
              selectedRoom={roomState.selectedRoom}
              onUnlockRoom={handleUnlockRoom}
              onSelectRoom={handleSelectRoom}
            />
          </section>
        )}

        {activeTab === "stats" && (
          <section className="hub-focus-column">
            <StatsOverview cards={statisticsCards} />
          </section>
        )}

        {activeTab === "settings" && (
          <section className="hub-focus-column">
            <SettingsPanel settings={snapshot.settings} />
          </section>
        )}
      </main>

      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={logoutTracker}
      />
    </div>
  );
}
