import { differenceInCalendarDays, parseISO } from "date-fns";
import { buildFocusSummary, getFocusSessions, type FocusSessionRecord } from "@/lib/server/focus";
import { buildInsightsSummary } from "@/lib/server/insights";
import { readSettings } from "@/lib/server/settings";
import { readWallet, readInventory, readRoomPlacements, readRoomState } from "@/lib/server/economy";
import type { Wallet, Inventory, RoomPlacements } from "@/lib/economy-types";
import type { TrackerSettings } from "@/lib/server/schema";

export type SleepEntry = {
  id?: string;
  date: string;
  hours: number;
  bedtime?: string;
  wakeTime?: string;
  quality?: number;
  notes?: string;
};

export type WorkoutEntry = {
  id?: string;
  date: string;
  type: string;
  durationMinutes: number;
  intensity?: "easy" | "moderate" | "hard";
  notes?: string;
};

export type HealthMetric = {
  id?: string;
  date: string;
  weight?: number;
  restingHeartRate?: number;
  energy?: number;
  notes?: string;
};

export type DailyLogEntry = {
  id?: string;
  date: string;
  mood?: number;
  gratitude: string[];
  wins: string[];
  notes?: string;
};

type DashboardInput = {
  focusSessions: FocusSessionRecord[];
  sleepEntries: SleepEntry[];
  workouts: WorkoutEntry[];
  healthMetrics: HealthMetric[];
  dailyLogs: DailyLogEntry[];
  settings: TrackerSettings;
};

function sortByDateDescending<T extends { date: string }>(entries: T[]) {
  return [...entries].sort((left, right) => right.date.localeCompare(left.date));
}

function getCurrentDay() {
  return new Date().toISOString().slice(0, 10);
}

function isInRollingWeek(date: string, today: string) {
  const daysAgo = differenceInCalendarDays(
    parseISO(`${today}T00:00:00.000Z`),
    parseISO(`${date}T00:00:00.000Z`),
  );

  return daysAgo >= 0 && daysAgo < 7;
}

export function buildDashboardSnapshot(input: DashboardInput) {
  const today = getCurrentDay();
  const focus = buildFocusSummary(input.focusSessions, { today });
  const sleepEntries = sortByDateDescending(input.sleepEntries);
  const workouts = sortByDateDescending(input.workouts);
  const healthMetrics = sortByDateDescending(input.healthMetrics);
  const dailyLogs = sortByDateDescending(input.dailyLogs);
  const settings = input.settings;

  const sleepAverageHours =
    sleepEntries.length > 0
      ? Math.round(
          (sleepEntries.reduce((total, entry) => total + entry.hours, 0) / sleepEntries.length) *
            10,
        ) / 10
      : 0;

  const weeklyWorkouts = workouts.filter((workout) => isInRollingWeek(workout.date, today));
  const weeklyFocusSessions = input.focusSessions.filter((session) =>
    isInRollingWeek(session.startedAt.slice(0, 10), today),
  );
  const insights = {
    ...buildInsightsSummary({
      today,
      focusSessions: weeklyFocusSessions,
      workouts: weeklyWorkouts,
      goals: {
        focusMinutes: settings.weeklyFocusGoalMinutes,
        workoutMinutes: 0,
        workoutCount: 0,
      },
    }),
    focusStreakDays: focus.currentStreakDays,
  };

  const latestHealth = healthMetrics[0];
  const latestSleep = sleepEntries[0];
  const latestLog = dailyLogs[0];

  return {
    topMetrics: [
      {
        label: "day streak",
        value: `${focus.currentStreakDays}`,
        tone: "amber",
      },
      {
        label: "sessions",
        value: `${focus.totalSessions}`,
        tone: "emerald",
      },
      {
        label: "focused",
        value: `${focus.totalMinutes}m`,
        tone: "sky",
      },
    ],
    focus,
    settings,
    insights,
    sleep: {
      averageHours: sleepAverageHours,
      lastNightHours: latestSleep?.hours ?? 0,
      latestQuality: latestSleep?.quality ?? 0,
      recentEntries: sleepEntries.slice(0, 4),
    },
    workouts: {
      weeklyMinutes: weeklyWorkouts.reduce(
        (total, workout) => total + workout.durationMinutes,
        0,
      ),
      weeklyCount: weeklyWorkouts.length,
      latestType: workouts[0]?.type ?? "No workouts yet",
      recentEntries: workouts.slice(0, 4),
    },
    health: {
      latestWeight: latestHealth?.weight ?? 0,
      restingHeartRate: latestHealth?.restingHeartRate ?? 0,
      energy: latestHealth?.energy ?? 0,
      recentEntries: healthMetrics.slice(0, 4),
    },
    dailyLog: {
      latestMood: latestLog?.mood ?? 0,
      gratitudeCount: latestLog?.gratitude?.length ?? 0,
      winsCount: latestLog?.wins?.length ?? 0,
      recentEntries: dailyLogs.slice(0, 4),
    },
  };
}

export async function getTrackerSnapshot() {
  const settings = await readSettings();
  const focusSessions = getFocusSessions();
  const wallet = readWallet();
  const inventory = readInventory();
  const room = readRoomPlacements();
  const sleepEntries: SleepEntry[] = [];
  const workouts: WorkoutEntry[] = [];
  const healthMetrics: HealthMetric[] = [];
  const dailyLogs: DailyLogEntry[] = [];

  const dashboard = buildDashboardSnapshot({
    focusSessions,
    sleepEntries,
    workouts,
    healthMetrics,
    dailyLogs,
    settings,
  });

  const roomState = readRoomState();

  return { ...dashboard, economy: { wallet, inventory, room, roomState } };
}
