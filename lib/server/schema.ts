import { z } from "zod";

const focusSessionSchema = z.object({
  id: z.string(),
  startedAt: z.string(),
  endedAt: z.string(),
  durationMinutes: z.number(),
  mode: z.enum(["focus", "break"]).default("focus"),
});

const healthMetricSchema = z.object({
  date: z.string(),
  weight: z.number().optional(),
  restingHeartRate: z.number().optional(),
  energy: z.number().min(1).max(10).optional(),
  notes: z.string().optional(),
});

const sleepEntrySchema = z.object({
  date: z.string(),
  hours: z.number(),
  bedtime: z.string().optional(),
  wakeTime: z.string().optional(),
  quality: z.number().min(1).max(10).optional(),
  notes: z.string().optional(),
});

const workoutEntrySchema = z.object({
  date: z.string(),
  type: z.string(),
  durationMinutes: z.number(),
  intensity: z.enum(["easy", "moderate", "hard"]).optional(),
  notes: z.string().optional(),
});

const dailyLogSchema = z.object({
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
