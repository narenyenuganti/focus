import {
  differenceInCalendarDays,
  parseISO,
} from "date-fns";
import { readCollection, writeCollection } from "@/lib/server/data-store";

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
  if (minutes === 0) {
    return 0;
  }

  if (minutes <= 15) {
    return 1;
  }

  if (minutes <= 30) {
    return 2;
  }

  if (minutes <= 60) {
    return 3;
  }

  return 4;
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

export async function getFocusSummary() {
  const sessions = await readCollection("focus/sessions");
  return buildFocusSummary(sessions as FocusSessionRecord[]);
}

export async function appendFocusSession(session: FocusSessionRecord) {
  const sessions = (await readCollection("focus/sessions")) as FocusSessionRecord[];
  return writeCollection("focus/sessions", [...sessions, session]);
}
