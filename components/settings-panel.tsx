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
  const [status, setStatus] = useState("Local settings");
  const [testIndex, setTestIndex] = useState(0);

  async function saveSettings() {
    setStatus("Saving settings...");

    const response = await fetch("/api/settings", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      setStatus("Could not save settings");
      return;
    }

    const payload = (await response.json()) as { settings?: TrackerSettings };

    if (payload.settings) {
      setSettings(payload.settings);
    }

    setStatus("Settings saved");
    router.refresh();
  }

  return (
    <section className="panel-shell">
      <div className="panel-metrics">
        <article>
          <span>Focus goal</span>
          <strong>{settings.weeklyFocusGoalMinutes}m</strong>
        </article>
      </div>

      <div className="panel-form-grid">
        <label className="field">
          <span>Theme</span>
          <select
            value={settings.theme}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                theme: event.target.value as "bean" | "zelda",
              }))
            }
          >
            <option value="bean">Bean</option>
            <option value="zelda">Adventure</option>
          </select>
        </label>
      </div>

      <div className="panel-form-grid">
        <label className="field">
          <span>Weekly focus goal minutes</span>
          <input
            type="number"
            min="0"
            value={settings.weeklyFocusGoalMinutes}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                weeklyFocusGoalMinutes: Number(event.target.value),
              }))
            }
          />
        </label>
      </div>

      <div className="panel-form-grid">
        <label className="field">
          <span>Notification sound</span>
          <select
            value={settings.notificationSound}
            onChange={(event) =>
              setSettings((current) => ({ ...current, notificationSound: event.target.value }))
            }
          >
            <option value="off">Off</option>
            {SOUND_LIBRARY.map((sound) => (
              <option key={sound.id} value={sound.id}>
                {sound.label}
              </option>
            ))}
          </select>
        </label>
        {settings.notificationSound !== "off" && (
          <div className="field">
            <span>Preview</span>
            <button
              type="button"
              className="secondary-button"
              onClick={() => playSound(settings.notificationSound as SoundId)}
            >
              &#9654; Play
            </button>
          </div>
        )}
        <div className="field">
          <span>Test notification</span>
          <button
            type="button"
            className="secondary-button"
            onClick={() => {
              requestNotificationPermission();
              const { title, body } = TEST_NOTIFICATIONS[testIndex];
              notify(title, body);
              setTestIndex((i) => (i + 1) % TEST_NOTIFICATIONS.length);
            }}
          >
            &#128276; {TEST_NOTIFICATIONS[testIndex].title}
          </button>
        </div>
      </div>

      <div className="panel-form-grid">
        <label className="field">
          <span>Ambient music during focus</span>
          <select
            value={settings.ambientMusic ? "on" : "off"}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                ambientMusic: event.target.value === "on",
              }))
            }
          >
            <option value="on">On</option>
            <option value="off">Off</option>
          </select>
        </label>
        <label className="field">
          <span>Break duration (minutes)</span>
          <input
            type="number"
            min="1"
            max="30"
            value={settings.breakDurationMinutes}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                breakDurationMinutes: Number(event.target.value),
              }))
            }
          />
        </label>
      </div>

      <div className="panel-list">
        {settings.focusPresets.map((preset, index) => (
          <article key={`${preset.label}-${index}`}>
            <div className="panel-form-grid">
              <label className="field">
                <span>Preset label</span>
                <input
                  value={preset.label}
                  onChange={(event) =>
                    setSettings((current) =>
                      updatePreset(current, index, { label: event.target.value }),
                    )
                  }
                />
              </label>
              <label className="field">
                <span>Minutes</span>
                <input
                  type="number"
                  min="1"
                  value={preset.minutes}
                  onChange={(event) =>
                    setSettings((current) =>
                      updatePreset(current, index, { minutes: Number(event.target.value) }),
                    )
                  }
                />
              </label>
            </div>
          </article>
        ))}
      </div>

      <div className="timer-actions">
        <button type="button" className="primary-button" onClick={() => void saveSettings()}>
          Save settings
        </button>
        <span className="focus-feedback">{status}</span>
      </div>
    </section>
  );
}
