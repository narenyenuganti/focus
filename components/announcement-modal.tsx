"use client";

import { X } from "lucide-react";
import { useState } from "react";

const HIGHLIGHTS = [
  "75 Hard",
  "Dopamine Detox",
  "100+ Routines",
  "Huberman Protocol",
  "Bryan Johnson",
  "Streak Tracking",
];

const PROMO_CARDS = [
  {
    title: "Build Unbreakable Streaks",
    detail: "Track your routines and review daily consistency.",
  },
  {
    title: "Discover Elite Routines",
    detail: "Borrow repeatable systems without leaving the shell.",
  },
  {
    title: "Level Up Every Day",
    detail: "See the habits that compound and the ones that slip.",
  },
  {
    title: "Start Your Journey Today",
    detail: "Choose a challenge and move from zero to momentum.",
  },
] as const;

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
          {PROMO_CARDS.map((card) => (
            <article key={card.title} className="announcement-card">
              <div className="announcement-card__mock">
                <div className="announcement-card__screen">
                  <span />
                  <span />
                  <span />
                  <div>
                    <em />
                    <em />
                    <em />
                    <em />
                  </div>
                </div>
              </div>
              <strong>{card.title}</strong>
              <span>{card.detail}</span>
            </article>
          ))}
        </div>
        <div className="announcement-copy">
          <p className="eyebrow">New from the tracker creator</p>
          <h2>Next Routine</h2>
          <p className="lede">
            I built this because bad habits quietly wreck momentum. This local-first
            tracker keeps focus, recovery, and consistency in one private shell.
          </p>
        </div>
        <div className="announcement-tags">
          {HIGHLIGHTS.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
        <p className="announcement-meta">iOS-style shell • local-first • single-user</p>
        <div className="announcement-actions">
          <button
            type="button"
            className="secondary-button announcement-secondary"
            onClick={() => setOpen(false)}
          >
            Jump in
          </button>
          <button
            type="button"
            className="primary-button announcement-primary"
            onClick={() => setOpen(false)}
          >
            Check it out
          </button>
        </div>
      </section>
    </div>
  );
}
