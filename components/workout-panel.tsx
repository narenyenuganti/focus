"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { WorkoutEntry } from "@/lib/server/dashboard";

type WorkoutPanelProps = {
  summary: {
    weeklyMinutes: number;
    weeklyCount: number;
    latestType: string;
    recentEntries: WorkoutEntry[];
  };
};

export function WorkoutPanelContent({ summary }: WorkoutPanelProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    type: "Lift",
    durationMinutes: "60",
    intensity: "moderate",
    notes: "",
  });

  async function submit() {
    await fetch("/api/workouts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        date: form.date,
        type: form.type,
        durationMinutes: Number(form.durationMinutes),
        intensity: form.intensity,
        notes: form.notes || undefined,
      }),
    });

    router.refresh();
  }

  return (
    <>
      <div className="panel-metrics">
        <article>
          <span>This week</span>
          <strong>{summary.weeklyMinutes}m</strong>
        </article>
        <article>
          <span>Sessions</span>
          <strong>{summary.weeklyCount}</strong>
        </article>
        <article>
          <span>Latest</span>
          <strong>{summary.latestType}</strong>
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
          <span>Workout type</span>
          <input
            value={form.type}
            onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}
          />
        </label>
        <label className="field">
          <span>Duration</span>
          <input
            type="number"
            min="1"
            value={form.durationMinutes}
            onChange={(event) =>
              setForm((current) => ({ ...current, durationMinutes: event.target.value }))
            }
          />
        </label>
        <label className="field">
          <span>Intensity</span>
          <select
            value={form.intensity}
            onChange={(event) =>
              setForm((current) => ({ ...current, intensity: event.target.value }))
            }
          >
            <option value="easy">Easy</option>
            <option value="moderate">Moderate</option>
            <option value="hard">Hard</option>
          </select>
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
        Save workout
      </button>
      <div className="panel-list">
        {summary.recentEntries.map((entry) => (
          <article key={entry.id ?? `${entry.date}-${entry.type}`}>
            <strong>{entry.type}</strong>
            <span>
              {entry.date} • {entry.durationMinutes}m
            </span>
          </article>
        ))}
      </div>
    </>
  );
}

export function WorkoutPanel({ summary }: WorkoutPanelProps) {
  return (
    <section className="panel-shell">
      <WorkoutPanelContent summary={summary} />
    </section>
  );
}
