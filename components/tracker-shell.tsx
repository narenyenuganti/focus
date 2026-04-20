"use client";

import { useState } from "react";
import { logoutTracker } from "@/app/actions/auth";
import { FocusTimer } from "@/components/focus-timer";
import { SettingsPanel } from "@/components/settings-panel";
import { StatsOverview } from "@/components/stats-overview";
import { ShopPanel } from "@/components/shop-panel";
import { RoomEditor } from "@/components/room-editor";
import { TopNav, type TabId } from "@/components/bottom-nav";
import type { getTrackerSnapshot } from "@/lib/server/dashboard";
import type { Wallet, Inventory, RoomPlacements, RoomState } from "@/lib/economy-types";
import { getTheme } from "@/lib/themes";

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

  const streakDays = snapshot.focus.currentStreakDays ?? 0;
  const weekMinutes = snapshot.focus.weeklyMinutes;
  const goalMinutes = snapshot.settings.weeklyFocusGoalMinutes;
  const weekPct = goalMinutes > 0
    ? Math.min(100, Math.round((weekMinutes / goalMinutes) * 100))
    : 0;

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
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="mark" aria-hidden="true" />
          <div className="wordmark serif">
            <span>Focus</span> <em>— 2026</em>
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
          <RoomEditor
            placements={room.placements}
            purchased={inventory.purchased}
            onPlace={handlePlace}
            onRemove={handleRemove}
          />
        )}

        {activeTab === "market" && (
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
        )}

        {activeTab === "ledger" && <StatsOverview cards={statisticsCards} />}

        {activeTab === "settings" && <SettingsPanel settings={snapshot.settings} />}
      </main>

      <footer className="footer">
        <div className="colophon">
          Set in <em className="serif">Instrument Serif</em> · Local-first · Quietly yours
        </div>
        <div>
          <span className="mono">{weekPct}% of weekly goal</span>
        </div>
      </footer>
    </div>
  );
}
