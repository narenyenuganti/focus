"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { TrackerSettings } from "@/lib/server/schema";
import { SOUND_LIBRARY, playSound } from "@/lib/sounds";
import type { SoundId } from "@/lib/sounds";

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
          <span>Name</span>
          <strong>{settings.displayName}</strong>
        </article>
        <article>
          <span>Focus goal</span>
          <strong>{settings.weeklyFocusGoalMinutes}m</strong>
        </article>
      </div>

      <div className="panel-form-grid">
        <label className="field field--wide">
          <span>Display name</span>
          <input
            value={settings.displayName}
            onChange={(event) =>
              setSettings((current) => ({ ...current, displayName: event.target.value }))
            }
          />
        </label>
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

      <div className="field">
        <span>Completion sound</span>
        <div className="sound-picker">
          <select
            value={settings.completionSound}
            onChange={(event) =>
              setSettings((current) => ({ ...current, completionSound: event.target.value }))
            }
          >
            {SOUND_LIBRARY.map((sound) => (
              <option key={sound.id} value={sound.id}>
                {sound.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="secondary-button"
            onClick={() => playSound(settings.completionSound as SoundId)}
          >
            &#9654; Play
          </button>
        </div>
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
