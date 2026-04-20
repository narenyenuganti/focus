"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { TrackerSettings } from "@/lib/server/schema";
import { SOUND_LIBRARY, playSound } from "@/lib/sounds";
import type { SoundId } from "@/lib/sounds";
import { requestNotificationPermission, notify } from "@/lib/notifications";

const TEST_NOTIFICATIONS = [
  { title: "Focus session complete!", body: "Time for a break." },
  { title: "Break's over!", body: "Ready to focus." },
] as const;

type SettingsPanelProps = {
  settings: TrackerSettings;
};

function updatePreset(
  settings: TrackerSettings,
  index: number,
  patch: Partial<TrackerSettings["focusPresets"][number]>,
) {
  return {
    ...settings,
    focusPresets: settings.focusPresets.map((preset, currentIndex) =>
      currentIndex === index ? { ...preset, ...patch } : preset,
    ),
  };
}

export function SettingsPanel({ settings: initialSettings }: SettingsPanelProps) {
  const router = useRouter();
  const [settings, setSettings] = useState(initialSettings);
  const [status, setStatus] = useState("Local · not synced");
  const [testIndex, setTestIndex] = useState(0);
  const [testStatus, setTestStatus] = useState<string | null>(null);

  async function saveSettings() {
    setStatus("Saving…");
    const response = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    if (!response.ok) {
      setStatus("Could not save");
      return;
    }
    const payload = (await response.json()) as { settings?: TrackerSettings };
    if (payload.settings) {
      setSettings(payload.settings);
    }
    setStatus("Settings saved");
    router.refresh();
  }

  const soundOptions: { id: string; label: string }[] = [
    { id: "off", label: "Off" },
    ...SOUND_LIBRARY.map((sound) => ({ id: sound.id, label: sound.label })),
  ];

  return (
    <section>
      <div className="section-head">
        <h2 className="serif">
          Your <em>preferences</em>
        </h2>
        <span className="meta">Local · not synced</span>
      </div>

      <div className="settings-form">
        <div className="settings-row">
          <label>
            <strong>Theme</strong>
            <span>The whole app warms or cools with the season.</span>
          </label>
          <div className="control">
            <div className="seg" role="tablist" aria-label="Theme">
              {(["terracotta", "olive", "dusk"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  className={settings.theme === t ? "on" : ""}
                  onClick={() => setSettings((current) => ({ ...current, theme: t }))}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="settings-row">
          <label>
            <strong>Weekly goal</strong>
            <span>Target minutes of focused work each week. Used for the ring and ledger.</span>
          </label>
          <div className="control">
            <input
              className="input"
              type="number"
              min={0}
              value={settings.weeklyFocusGoalMinutes}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  weeklyFocusGoalMinutes: Number(event.target.value),
                }))
              }
            />
            <span className="unit">Minutes</span>
          </div>
        </div>

        <div className="settings-row">
          <label>
            <strong>Ambient sound</strong>
            <span>A soft drone while you focus. Starts muted.</span>
          </label>
          <div className="control">
            <div className="seg" role="tablist" aria-label="Ambient sound">
              <button
                type="button"
                className={!settings.ambientMusic ? "on" : ""}
                onClick={() => setSettings((current) => ({ ...current, ambientMusic: false }))}
              >
                Off
              </button>
              <button
                type="button"
                className={settings.ambientMusic ? "on" : ""}
                onClick={() => setSettings((current) => ({ ...current, ambientMusic: true }))}
              >
                Lo-fi
              </button>
            </div>
          </div>
        </div>

        <div className="settings-row">
          <label>
            <strong>Garden time</strong>
            <span>
              When on, the garden scene follows the wall clock. Off lets you scrub
              Dawn → Dusk manually.
            </span>
          </label>
          <div className="control">
            <div className="seg" role="tablist" aria-label="Garden time">
              <button
                type="button"
                className={settings.gardenAutoTimeOfDay ? "on" : ""}
                onClick={() =>
                  setSettings((current) => ({ ...current, gardenAutoTimeOfDay: true }))
                }
              >
                Follow real time
              </button>
              <button
                type="button"
                className={!settings.gardenAutoTimeOfDay ? "on" : ""}
                onClick={() =>
                  setSettings((current) => ({ ...current, gardenAutoTimeOfDay: false }))
                }
              >
                Manual
              </button>
            </div>
          </div>
        </div>

        <div className="settings-row">
          <label>
            <strong>End of session</strong>
            <span>What should happen when the ring closes.</span>
          </label>
          <div className="control">
            <div className="seg" role="tablist" aria-label="Notification sound">
              {soundOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={settings.notificationSound === option.id ? "on" : ""}
                  onClick={() =>
                    setSettings((current) => ({ ...current, notificationSound: option.id }))
                  }
                >
                  {option.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="btn ghost"
              onClick={async () => {
                const permission = await requestNotificationPermission();
                if ((permission ?? Notification?.permission) !== "granted") {
                  setTestStatus("Permission denied — enable in browser settings");
                  return;
                }
                setTestStatus(null);
                const { title, body } = TEST_NOTIFICATIONS[testIndex];
                notify(title, body);
                if (settings.notificationSound !== "off") {
                  playSound(settings.notificationSound as SoundId);
                }
                setTestIndex((i) => (i + 1) % TEST_NOTIFICATIONS.length);
              }}
            >
              Test
            </button>
            {testStatus ? <span className="settings-status">{testStatus}</span> : null}
          </div>
        </div>

        <div className="settings-row">
          <label>
            <strong>Break duration</strong>
            <span>Default minutes between sessions when a preset doesn't set its own.</span>
          </label>
          <div className="control">
            <input
              className="input"
              type="number"
              min={1}
              max={30}
              value={settings.breakDurationMinutes}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  breakDurationMinutes: Number(event.target.value),
                }))
              }
            />
            <span className="unit">Minutes</span>
          </div>
        </div>

        <div className="settings-row">
          <label>
            <strong>Presets</strong>
            <span>Edit your blocks. Shorter blocks favor momentum; longer blocks favor depth.</span>
          </label>
          <div className="control" style={{ flexDirection: "column", alignItems: "stretch" }}>
            <div className="preset-editor">
              {settings.focusPresets.map((preset, index) => (
                <div key={`${preset.label}-${index}`} className="preset-editor-row">
                  <input
                    className="input"
                    value={preset.label}
                    onChange={(event) =>
                      setSettings((current) =>
                        updatePreset(current, index, { label: event.target.value }),
                      )
                    }
                  />
                  <input
                    className="input"
                    type="number"
                    min={1}
                    value={preset.minutes}
                    style={{ textAlign: "right", minWidth: 0 }}
                    onChange={(event) =>
                      setSettings((current) =>
                        updatePreset(current, index, { minutes: Number(event.target.value) }),
                      )
                    }
                  />
                  <input
                    className="input"
                    type="number"
                    min={1}
                    max={60}
                    value={preset.breakMinutes ?? settings.breakDurationMinutes}
                    style={{ textAlign: "right", minWidth: 0 }}
                    onChange={(event) =>
                      setSettings((current) =>
                        updatePreset(current, index, {
                          breakMinutes: Number(event.target.value),
                        }),
                      )
                    }
                  />
                  <span className="unit">min / break</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="settings-row">
          <label>
            <strong>Data</strong>
            <span>Everything lives in this repo. Save or reset your preferences.</span>
          </label>
          <div className="control">
            <button type="button" className="btn primary" onClick={() => void saveSettings()}>
              Save
            </button>
            <span className="settings-status">{status}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
