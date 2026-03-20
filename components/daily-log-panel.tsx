"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { DailyLogEntry } from "@/lib/server/dashboard";

type DailyLogPanelProps = {
  summary: {
    latestMood: number;
    gratitudeCount: number;
    winsCount: number;
    recentEntries: DailyLogEntry[];
  };
};

export function DailyLogPanel({ summary }: DailyLogPanelProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    mood: summary.latestMood ? String(summary.latestMood) : "7",
    gratitude: "",
    wins: "",
    notes: "",
  });

  async function submit() {
    await fetch("/api/daily-log", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        date: form.date,
        mood: form.mood ? Number(form.mood) : undefined,
        gratitude: form.gratitude
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        wins: form.wins
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        notes: form.notes || undefined,
      }),
    });

    router.refresh();
  }

  return (
    <section className="panel-shell">
      <div className="panel-metrics">
        <article>
          <span>Mood</span>
          <strong>{summary.latestMood || "-"}</strong>
        </article>
        <article>
          <span>Gratitude</span>
          <strong>{summary.gratitudeCount}</strong>
        </article>
        <article>
          <span>Wins</span>
          <strong>{summary.winsCount}</strong>
        </article>
      </div>
      <div className="panel-form-grid">
        <label className="field">
          <span>Date</span>
          <input
            type="date"
            value={form.date}
            onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
          />
        </label>
        <label className="field">
          <span>Mood</span>
          <input
            type="number"
            min="1"
            max="10"
            value={form.mood}
            onChange={(event) => setForm((current) => ({ ...current, mood: event.target.value }))}
          />
        </label>
        <label className="field field--wide">
          <span>Gratitude (comma separated)</span>
          <input
            value={form.gratitude}
            onChange={(event) =>
              setForm((current) => ({ ...current, gratitude: event.target.value }))
            }
          />
        </label>
        <label className="field field--wide">
          <span>Wins (comma separated)</span>
          <input
            value={form.wins}
            onChange={(event) =>
              setForm((current) => ({ ...current, wins: event.target.value }))
            }
          />
        </label>
        <label className="field field--wide">
          <span>Notes</span>
          <textarea
            value={form.notes}
            onChange={(event) =>
              setForm((current) => ({ ...current, notes: event.target.value }))
            }
          />
        </label>
      </div>
      <button type="button" className="primary-button" onClick={() => void submit()}>
        Save daily log
      </button>
      <div className="panel-list">
        {summary.recentEntries.map((entry) => (
          <article key={entry.id ?? entry.date}>
            <strong>{entry.date}</strong>
            <span>
              Mood {entry.mood ?? "-"} • {(entry.gratitude ?? []).length} gratitude items
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
