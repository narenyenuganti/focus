export type FocusSessionInsightRecord = {
  startedAt: string;
  durationMinutes: number;
  mode?: "focus" | "break";
};

export type WorkoutInsightRecord = {
  date: string;
  type: string;
  durationMinutes: number;
};

export type InsightGoals = {
  focusMinutes: number;
  workoutMinutes: number;
  workoutCount: number;
};

export type InsightGoalProgress = {
  id: string;
  label: string;
  current: number;
  target: number;
  percent: number;
};

export type InsightBadge = {
  id: string;
  label: string;
  detail: string;
};

export type InsightsSummary = {
  focusStreakDays: number;
  focusMinutes: number;
  workoutMinutes: number;
  workoutCount: number;
  goalProgress: InsightGoalProgress[];
  milestones: InsightBadge[];
};

type BuildInsightsInput = {
  today?: string;
  focusSessions: FocusSessionInsightRecord[];
  workouts: WorkoutInsightRecord[];
  goals: InsightGoals;
};

const MILESTONE_RULES = [
  {
    id: "focus-60",
    label: "Focus 60",
    detail: "Logged 60 focus minutes",
    metric: "focusMinutes" as const,
    threshold: 60,
  },
  {
    id: "focus-120",
    label: "Focus 120",
    detail: "Logged 120 focus minutes",
    metric: "focusMinutes" as const,
    threshold: 120,
  },
  {
    id: "workout-60",
    label: "Workout 60",
    detail: "Logged 60 workout minutes",
    metric: "workoutMinutes" as const,
    threshold: 60,
  },
  {
    id: "workout-180",
    label: "Workout 180",
    detail: "Logged 180 workout minutes",
    metric: "workoutMinutes" as const,
    threshold: 180,
  },
  {
    id: "workouts-4",
    label: "4 workouts",
    detail: "Completed 4 workouts",
    metric: "workoutCount" as const,
    threshold: 4,
  },
] as const;

function toDayKey(value: string) {
  return value.slice(0, 10);
}

function shiftDay(date: string, delta: number) {
  const workingDate = new Date(`${date}T12:00:00.000Z`);
  workingDate.setUTCDate(workingDate.getUTCDate() + delta);

  return workingDate.toISOString().slice(0, 10);
}

function clampPercent(current: number, target: number) {
  if (target <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((current / target) * 100));
}

function isFocusSession(session: FocusSessionInsightRecord) {
  return session.mode !== "break";
}

export function buildInsightsSummary(input: BuildInsightsInput): InsightsSummary {
  const today = input.today ?? new Date().toISOString().slice(0, 10);
  const focusSessions = input.focusSessions.filter(isFocusSession);
  const focusMinutes = focusSessions.reduce((total, session) => total + session.durationMinutes, 0);
  const workoutMinutes = input.workouts.reduce(
    (total, workout) => total + workout.durationMinutes,
    0,
  );
  const workoutCount = input.workouts.length;
  const dailyFocusMinutes = new Map<string, number>();

  for (const session of focusSessions) {
    const day = toDayKey(session.startedAt);
    dailyFocusMinutes.set(day, (dailyFocusMinutes.get(day) ?? 0) + session.durationMinutes);
  }

  let focusStreakDays = 0;
  let streakCursor = today;

  while ((dailyFocusMinutes.get(streakCursor) ?? 0) > 0) {
    focusStreakDays += 1;
    streakCursor = shiftDay(streakCursor, -1);
  }

  const goalProgress = [
    {
      id: "focus-minutes",
      label: "Focus minutes",
      current: focusMinutes,
      target: input.goals.focusMinutes,
      percent: clampPercent(focusMinutes, input.goals.focusMinutes),
    },
    {
      id: "workout-minutes",
      label: "Workout minutes",
      current: workoutMinutes,
      target: input.goals.workoutMinutes,
      percent: clampPercent(workoutMinutes, input.goals.workoutMinutes),
    },
    {
      id: "workout-count",
      label: "Workouts",
      current: workoutCount,
      target: input.goals.workoutCount,
      percent: clampPercent(workoutCount, input.goals.workoutCount),
    },
  ];

  const milestones = MILESTONE_RULES.filter((rule) => {
    const current =
      rule.metric === "focusMinutes"
        ? focusMinutes
        : rule.metric === "workoutMinutes"
          ? workoutMinutes
          : workoutCount;

    return current >= rule.threshold;
  }).map((rule) => ({
    id: rule.id,
    label: rule.label,
    detail: rule.detail,
  }));

  return {
    focusStreakDays,
    focusMinutes,
    workoutMinutes,
    workoutCount,
    goalProgress,
    milestones,
  };
}
