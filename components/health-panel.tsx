"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { HealthMetric } from "@/lib/server/dashboard";

type HealthPanelProps = {
  summary: {
    latestWeight: number;
    restingHeartRate: number;
    energy: number;
    recentEntries: HealthMetric[];
  };
};

export function HealthPanel({ summary }: HealthPanelProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    weight: summary.latestWeight ? String(summary.latestWeight) : "",
    restingHeartRate: summary.restingHeartRate
      ? String(summary.restingHeartRate)
      : "",
    energy: summary.energy ? String(summary.energy) : "7",
    notes: "",
  });

  async function submit() {
    await fetch("/api/health", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        date: form.date,
        weight: form.weight ? Number(form.weight) : undefined,
        restingHeartRate: form.restingHeartRate
          ? Number(form.restingHeartRate)
          : undefined,
        energy: form.energy ? Number(form.energy) : undefined,
        notes: form.notes || undefined,
      }),
    });

    router.refresh();
  }

  return (
    <section className="panel-shell">
      <div className="panel-metrics">
        <article>
          <span>Weight</span>
          <strong>{summary.latestWeight || "-"} </strong>
        </article>
        <article>
          <span>RHR</span>
          <strong>{summary.restingHeartRate || "-"} bpm</strong>
        </article>
        <article>
          <span>Energy</span>
          <strong>{summary.energy || "-"}</strong>
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
          <span>Weight</span>
          <input
            type="number"
            step="0.1"
            value={form.weight}
            onChange={(event) =>
              setForm((current) => ({ ...current, weight: event.target.value }))
            }
          />
        </label>
        <label className="field">
          <span>Resting heart rate</span>
          <input
            type="number"
            value={form.restingHeartRate}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                restingHeartRate: event.target.value,
              }))
            }
          />
        </label>
        <label className="field">
          <span>Energy</span>
          <input
            type="number"
            min="1"
            max="10"
            value={form.energy}
            onChange={(event) =>
              setForm((current) => ({ ...current, energy: event.target.value }))
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
        Save health metric
      </button>
      <div className="panel-list">
        {summary.recentEntries.map((entry) => (
          <article key={entry.id ?? entry.date}>
            <strong>{entry.date}</strong>
            <span>
              {entry.weight ? `${entry.weight} lb` : "No weight"} •{" "}
              {entry.restingHeartRate ? `${entry.restingHeartRate} bpm` : "No RHR"}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
