"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const PROOF_CHIPS = ["75 Hard", "Dopamine Detox", "Huberman Protocol", "Streak Tracking"];
const STAGE_CHIPS = ["Focus", "Recovery", "Momentum"];

export function AnnouncementModal() {
  const [open, setOpen] = useState(true);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    closeButtonRef.current?.focus();
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div className="announcement-backdrop" role="presentation">
      <div
        className="announcement-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="announcement-dialog-label"
        aria-describedby="announcement-description"
      >
        <h2 id="announcement-dialog-label" className="sr-only">
          Tracker announcement
        </h2>
        <button
          ref={closeButtonRef}
          type="button"
          className="utility-button announcement-close"
          aria-label="Close announcement"
          onClick={() => setOpen(false)}
        >
          <X size={16} />
        </button>
        <div className="announcement-visual">
          <div className="announcement-stage">
            <div className="announcement-stage__header">
              <span className="announcement-stage__eyebrow">Live preview</span>
              <span className="announcement-stage__status">Local-first</span>
            </div>
            <div className="announcement-stage__frame">
              <div className="announcement-stage__screen">
                <div className="announcement-stage__screen-top">
                  <span className="announcement-stage__screen-title">Next Routine</span>
                  <span className="announcement-stage__screen-pill">Session 04</span>
                </div>
                <div className="announcement-stage__stack">
                  <div className="announcement-stage__row is-primary">
                    <span>Focus block</span>
                    <strong>42 min</strong>
                    <div className="announcement-stage__meter">
                      <span />
                    </div>
                  </div>
                  <div className="announcement-stage__row">
                    <span>Recovery</span>
                    <strong>Sleep + hydrate</strong>
                    <div className="announcement-stage__meter">
                      <span className="is-mid" />
                    </div>
                  </div>
                  <div className="announcement-stage__row">
                    <span>Momentum</span>
                    <strong>6-day streak</strong>
                    <div className="announcement-stage__meter">
                      <span className="is-low" />
                    </div>
                  </div>
                </div>
                <div className="announcement-stage__timeline">
                  <span className="is-active" />
                  <span />
                  <span />
                  <span />
                </div>
              </div>
              <div className="announcement-stage__rail">
                <article className="announcement-stage__rail-card">
                  <span>Consistency</span>
                  <strong>100+ routines</strong>
                  <p>Curated systems that compound without leaving the shell.</p>
                </article>
                <article className="announcement-stage__rail-card announcement-stage__rail-card--compact">
                  <span>Signal</span>
                  <strong>1 private workspace</strong>
                  <p>Everything stays local and easy to return to tomorrow.</p>
                </article>
              </div>
            </div>
            <div className="announcement-stage__chips" aria-label="Product cues">
              {STAGE_CHIPS.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="announcement-copy">
          <p className="eyebrow">New from the tracker creator</p>
          <h2 id="announcement-title">Next Routine</h2>
          <p id="announcement-description" className="lede">
            I built this because bad habits quietly wreck momentum. This local-first
            tracker keeps focus, recovery, and consistency in one private shell.
          </p>
        </div>
        <div className="announcement-tags" aria-label="Included challenges">
          {PROOF_CHIPS.map((item) => (
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
      </div>
    </div>
  );
}
