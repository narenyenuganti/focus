"use client";

import { X } from "lucide-react";
import { useState } from "react";

const HIGHLIGHTS = [
  "Focus",
  "Sleep",
  "Workouts",
  "Health",
  "Daily Log",
  "Git Sync",
];

export function AnnouncementModal() {
  const [open, setOpen] = useState(true);

  if (!open) {
    return null;
  }

  return (
    <div className="announcement-backdrop" role="presentation">
      <section className="announcement-modal" aria-label="Tracker announcement">
        <button
          type="button"
          className="utility-button announcement-close"
          aria-label="Close announcement"
          onClick={() => setOpen(false)}
        >
          <X size={16} />
        </button>
        <div className="announcement-visual">
          <div />
          <div />
          <div />
        </div>
        <div className="announcement-copy">
          <p className="eyebrow">Repo-native tracker announcement</p>
          <h2>Everything that matters, one private hub.</h2>
          <p className="lede">
            This build keeps your focus sessions, recovery, workouts, and health
            metrics in a local-first workspace that syncs through git history.
          </p>
        </div>
        <div className="announcement-tags">
          {HIGHLIGHTS.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
        <p className="announcement-meta">Local-first • manual sync • single-user</p>
        <button type="button" className="primary-button" onClick={() => setOpen(false)}>
          Jump in
        </button>
      </section>
    </div>
  );
}
