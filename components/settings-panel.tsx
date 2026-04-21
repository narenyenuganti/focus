"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import type { TrackerSettings } from "@/lib/server/schema";
import { SOUND_LIBRARY, playSound } from "@/lib/sounds";
import type { SoundId } from "@/lib/sounds";
import { requestNotificationPermission, notify } from "@/lib/notifications";
import { logoutTracker } from "@/app/actions/auth";

const TEST_NOTIFICATIONS = [
  { title: "Focus session complete!", body: "Time for a break." },
  { title: "Break's over!", body: "Ready to focus." },
] as const;

const THEMES = ["terracotta", "olive", "dusk"] as const;
const THEME_COLOR: Record<(typeof THEMES)[number], string> = {
  terracotta: "#b85a3a",
  olive: "#8b6f28",
  dusk: "#d48b58",
};

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

  return (
    <section className="view">
      <h2 className="settings-head">Preferences.</h2>

      <div className="settings-list">
        <Row
          name="Theme"
          hint="Visual tone"
          description="The whole app warms or cools with the season."
        >
          <div className="theme-picker">
            {THEMES.map((t) => (
              <button
                key={t}
                type="button"
                className={settings.theme === t ? "on" : ""}
                style={{ background: THEME_COLOR[t] }}
                aria-label={t}
                title={t}
                onClick={() => setSettings((current) => ({ ...current, theme: t }))}
              >
                {t}
              </button>
            ))}
          </div>
        </Row>

        <Row
          name="Weekly goal"
          hint="Target minutes"
          description="Drives the stats view."
        >
          <input
            type="number"
            min={0}
            className="number-input"
            value={settings.weeklyFocusGoalMinutes}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                weeklyFocusGoalMinutes: Number(event.target.value),
              }))
            }
          />
          <span className="label" style={{ letterSpacing: "0.2em" }}>min</span>
        </Row>

        <Row
          name="Break duration"
          hint="Default"
          description="Minutes between sessions when a preset doesn't set its own."
        >
          <input
            type="number"
            min={1}
            max={30}
            className="number-input"
            value={settings.breakDurationMinutes}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                breakDurationMinutes: Number(event.target.value),
              }))
            }
          />
          <span className="label" style={{ letterSpacing: "0.2em" }}>min</span>
        </Row>

        <Row
          name="Ambient sound"
          hint="Lo-fi drone"
          description="A barely-there hum beneath the session."
        >
          <Toggle
            on={settings.ambientMusic}
            onChange={() =>
              setSettings((current) => ({
                ...current,
                ambientMusic: !current.ambientMusic,
              }))
            }
          />
        </Row>

        <Row
          name="Garden time"
          hint="Time of day"
          description="When on, the garden follows the wall clock. Off lets you scrub manually."
        >
          <Toggle
            on={settings.gardenAutoTimeOfDay}
            onChange={() =>
              setSettings((current) => ({
                ...current,
                gardenAutoTimeOfDay: !current.gardenAutoTimeOfDay,
              }))
            }
          />
        </Row>

        <Row
          name="Chime"
          hint="End of session"
          description="A single, slow bell — or silence."
        >
          <select
            className="number-input"
            style={{ width: 160, textAlign: "left" }}
            value={settings.notificationSound}
            onChange={(event) =>
              setSettings((current) => ({ ...current, notificationSound: event.target.value }))
            }
          >
            <option value="off">Silent</option>
            {SOUND_LIBRARY.map((sound) => (
              <option key={sound.id} value={sound.id}>
                {sound.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn-ghost"
            style={{ padding: "8px 12px", fontSize: 10 }}
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
          {testStatus ? <span className="label">{testStatus}</span> : null}
        </Row>

        <Row
          name="Presets"
          hint="Focus blocks"
          description="Shorter blocks favor momentum; longer blocks favor depth."
          multiline
        >
          <div style={{ display: "grid", gap: 8, width: "100%", minWidth: 320 }}>
            {settings.focusPresets.map((preset, index) => (
              <div
                key={`${preset.label}-${index}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 80px 80px",
                  gap: 10,
                  alignItems: "center",
                }}
              >
                <input
                  className="number-input"
                  style={{ textAlign: "left", width: "100%" }}
                  value={preset.label}
                  onChange={(event) =>
                    setSettings((current) =>
                      updatePreset(current, index, { label: event.target.value }),
                    )
                  }
                />
                <input
                  type="number"
                  min={1}
                  className="number-input"
                  value={preset.minutes}
                  onChange={(event) =>
                    setSettings((current) =>
                      updatePreset(current, index, { minutes: Number(event.target.value) }),
                    )
                  }
                  title="Focus minutes"
                />
                <input
                  type="number"
                  min={1}
                  max={60}
                  className="number-input"
                  value={preset.breakMinutes ?? settings.breakDurationMinutes}
                  onChange={(event) =>
                    setSettings((current) =>
                      updatePreset(current, index, {
                        breakMinutes: Number(event.target.value),
                      }),
                    )
                  }
                  title="Break minutes"
                />
              </div>
            ))}
          </div>
        </Row>

        <Row name="Data" hint="Save" description="Everything lives in this repo.">
          <button type="button" className="btn-primary" onClick={() => void saveSettings()}>
            Save settings
            <svg className="arrow" viewBox="0 0 14 10" fill="none" aria-hidden="true">
              <path
                d="M1 5h12m0 0L9 1m4 4L9 9"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <span className="label">{status}</span>
        </Row>

        <Row name="Session" hint="Sign out" description="Clear the local session and return to sign-in.">
          <form action={logoutTracker}>
            <button type="submit" className="btn-ghost" style={{ padding: "10px 20px" }}>
              Sign out
            </button>
          </form>
        </Row>
      </div>
    </section>
  );
}

function Row({
  name,
  hint,
  description,
  children,
  multiline,
}: {
  name: string;
  hint: string;
  description: string;
  children: ReactNode;
  multiline?: boolean;
}) {
  return (
    <div
      className="settings-row-v4"
      style={multiline ? { alignItems: "start" } : undefined}
    >
      <div className="k">
        <div className="name">{name}</div>
        <div className="hint">{hint}</div>
      </div>
      <div className="d">{description}</div>
      <div className="ctrl">{children}</div>
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      className={`toggle ${on ? "on" : ""}`}
      role="switch"
      aria-checked={on}
      onClick={onChange}
    >
      <span className="dot" />
    </button>
  );
}
