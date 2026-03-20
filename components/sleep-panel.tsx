"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SleepEntry } from "@/lib/server/dashboard";

type SleepPanelProps = {
  summary: {
    averageHours: number;
    lastNightHours: number;
    latestQuality: number;
    recentEntries: SleepEntry[];
  };
};

export function SleepPanel({ summary }: SleepPanelProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    hours: "8",
    quality: "8",
    bedtime: "",
    wakeTime: "",
    notes: "",
  });

  async function submit() {
    await fetch("/api/sleep", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        date: form.date,
        hours: Number(form.hours),
        quality: Number(form.quality),
        bedtime: form.bedtime || undefined,
        wakeTime: form.wakeTime || undefined,
        notes: form.notes || undefined,
      }),
    });

    router.refresh();
  }

  return (
    <section className="panel-shell">
      <div className="panel-metrics">
        <article>
          <span>Average</span>
          <strong>{summary.averageHours}h</strong>
        </article>
        <article>
          <span>Last night</span>
          <strong>{summary.lastNightHours}h</strong>
        </article>
        <article>
          <span>Quality</span>
          <strong>{summary.latestQuality || "-"}</strong>
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
          <span>Hours</span>
          <input
            type="number"
            min="0"
            step="0.5"
            value={form.hours}
            onChange={(event) =>
              setForm((current) => ({ ...current, hours: event.target.value }))
            }
          />
        </label>
        <label className="field">
          <span>Quality</span>
          <input
            type="number"
            min="1"
            max="10"
            value={form.quality}
            onChange={(event) =>
              setForm((current) => ({ ...current, quality: event.target.value }))
            }
          />
        </label>
        <label className="field">
          <span>Bedtime</span>
          <input
            type="time"
            value={form.bedtime}
            onChange={(event) =>
              setForm((current) => ({ ...current, bedtime: event.target.value }))
            }
          />
        </label>
        <label className="field">
          <span>Wake time</span>
          <input
            type="time"
            value={form.wakeTime}
            onChange={(event) =>
              setForm((current) => ({ ...current, wakeTime: event.target.value }))
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
        Save sleep entry
      </button>
      <div className="panel-list">
        {summary.recentEntries.map((entry) => (
          <article key={entry.id ?? entry.date}>
            <strong>{entry.hours}h</strong>
            <span>{entry.date}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
