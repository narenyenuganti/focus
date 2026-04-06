import { z } from "zod";

export const focusPresetSchema = z.object({
  label: z.string().min(1),
  minutes: z.number().int().min(1),
});

export const settingsSchema = z.object({
  displayName: z.string().min(1).default("Naren"),
  weeklyFocusGoalMinutes: z.number().int().min(0).default(1200),
  focusPresets: z.array(focusPresetSchema).default([
    { label: "Classic Pomodoro", minutes: 25 },
    { label: "Eisenhower", minutes: 50 },
    { label: "52 / 17", minutes: 52 },
    { label: "Deep Work", minutes: 90 },
  ]),
  notificationSound: z.string().default("secret-discovered"),
  ambientMusic: z.boolean().default(true),
  breakDurationMinutes: z.number().int().min(1).max(30).default(5),
  theme: z.enum(["bean", "zelda"]).default("bean"),
});

export const settingsPatchSchema = z.object({
  displayName: z.string().min(1).optional(),
  weeklyFocusGoalMinutes: z.number().int().min(0).optional(),
  focusPresets: z.array(focusPresetSchema).optional(),
  notificationSound: z.string().optional(),
  ambientMusic: z.boolean().optional(),
  breakDurationMinutes: z.number().int().min(1).max(30).optional(),
  theme: z.enum(["bean", "zelda"]).optional(),
});

const focusSessionSchema = z.object({
  id: z.string().optional(),
  startedAt: z.string(),
  endedAt: z.string(),
  durationMinutes: z.number(),
  mode: z.enum(["focus", "break"]).default("focus"),
});

const healthMetricSchema = z.object({
  id: z.string().optional(),
  date: z.string(),
  weight: z.number().optional(),
  restingHeartRate: z.number().optional(),
  energy: z.number().min(1).max(10).optional(),
  notes: z.string().optional(),
});

const sleepEntrySchema = z.object({
  id: z.string().optional(),
  date: z.string(),
  hours: z.number(),
  bedtime: z.string().optional(),
  wakeTime: z.string().optional(),
  quality: z.number().min(1).max(10).optional(),
  notes: z.string().optional(),
});

const workoutEntrySchema = z.object({
  id: z.string().optional(),
  date: z.string(),
  type: z.string(),
  durationMinutes: z.number(),
  intensity: z.enum(["easy", "moderate", "hard"]).optional(),
  notes: z.string().optional(),
});

const dailyLogSchema = z.object({
  id: z.string().optional(),
  date: z.string(),
  mood: z.number().min(1).max(10).optional(),
  gratitude: z.array(z.string()).default([]),
  wins: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

export const collectionDefinitions = {
  "focus/sessions": z.array(focusSessionSchema),
  "health/metrics": z.array(healthMetricSchema),
  "sleep/entries": z.array(sleepEntrySchema),
  "workouts/entries": z.array(workoutEntrySchema),
  "journal/daily": z.array(dailyLogSchema),
};

export type CollectionName = keyof typeof collectionDefinitions;
export type TrackerSettings = z.infer<typeof settingsSchema>;
