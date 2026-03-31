import { differenceInCalendarDays, parseISO } from "date-fns";
import { getDb } from "@/lib/server/db";

export type FocusSessionRecord = {
  id: string;
  startedAt: string;
  endedAt: string;
  durationMinutes: number;
  mode: "focus" | "break";
};

type FocusSummaryOptions = {
  today?: string;
};

function toDayKey(value: string) {
  return value.slice(0, 10);
}

function shiftDay(date: string, delta: number) {
  const workingDate = new Date(`${date}T12:00:00.000Z`);
  workingDate.setUTCDate(workingDate.getUTCDate() + delta);
  return workingDate.toISOString().slice(0, 10);
}

function getHeatmapLevel(minutes: number) {
  if (minutes === 0) return 0;
  if (minutes <= 15) return 1;
  if (minutes <= 30) return 2;
  if (minutes <= 60) return 3;
  return 4;
}

function toRecord(row: {
  id: string;
  started_at: string;
  ended_at: string;
  duration_minutes: number;
  mode: string;
}): FocusSessionRecord {
  return {
    id: row.id,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    durationMinutes: row.duration_minutes,
    mode: row.mode as "focus" | "break",
  };
}

export function getFocusSessions(): FocusSessionRecord[] {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM focus_sessions ORDER BY started_at ASC").all() as Array<{
    id: string;
    started_at: string;
    ended_at: string;
    duration_minutes: number;
    mode: string;
  }>;
  return rows.map(toRecord);
}

export function appendFocusSession(session: FocusSessionRecord): void {
  const db = getDb();
  db.prepare(
    "INSERT INTO focus_sessions (id, started_at, ended_at, duration_minutes, mode) VALUES (?, ?, ?, ?, ?)",
  ).run(session.id, session.startedAt, session.endedAt, session.durationMinutes, session.mode);
}

export function buildFocusSummary(
  sessions: FocusSessionRecord[],
  options: FocusSummaryOptions = {},
) {
  const today = options.today ?? new Date().toISOString().slice(0, 10);
  const focusSessions = sessions
    .filter((session) => session.mode === "focus")
    .sort((left, right) => left.startedAt.localeCompare(right.startedAt));
  const dailyMinutes = new Map<string, number>();

  for (const session of focusSessions) {
    const day = toDayKey(session.startedAt);
    dailyMinutes.set(day, (dailyMinutes.get(day) ?? 0) + session.durationMinutes);
  }

  let currentStreakDays = 0;
  let streakCursor = today;

  while ((dailyMinutes.get(streakCursor) ?? 0) > 0) {
    currentStreakDays += 1;
    streakCursor = shiftDay(streakCursor, -1);
  }

  const heatmap = [...dailyMinutes.entries()]
    .map(([date, minutes]) => ({
      date,
      minutes,
      level: getHeatmapLevel(minutes),
    }))
    .sort((left, right) => left.date.localeCompare(right.date));

  const totalMinutes = focusSessions.reduce(
    (total, session) => total + session.durationMinutes,
    0,
  );

  return {
    totalMinutes,
    totalSessions: focusSessions.length,
    todayMinutes: dailyMinutes.get(today) ?? 0,
    todaySessions: focusSessions.filter(
      (session) => toDayKey(session.startedAt) === today,
    ).length,
    currentStreakDays,
    longestSessionMinutes: focusSessions.reduce(
      (longest, session) => Math.max(longest, session.durationMinutes),
      0,
    ),
    weeklyMinutes: focusSessions.reduce((total, session) => {
      const daysAgo = differenceInCalendarDays(
        parseISO(`${today}T00:00:00.000Z`),
        parseISO(`${toDayKey(session.startedAt)}T00:00:00.000Z`),
      );

      if (daysAgo >= 0 && daysAgo < 7) {
        return total + session.durationMinutes;
      }

      return total;
    }, 0),
    heatmap,
  };
}

export function getFocusSummary() {
  const sessions = getFocusSessions();
  return buildFocusSummary(sessions);
}
