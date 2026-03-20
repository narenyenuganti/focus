import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { isSessionTokenValid, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { readCollection, writeCollection } from "@/lib/server/data-store";
import type { WorkoutEntry } from "@/lib/server/dashboard";

const workoutEntrySchema = z.object({
  date: z.string(),
  type: z.string().min(1),
  durationMinutes: z.number().min(1),
  intensity: z.enum(["easy", "moderate", "hard"]).optional(),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  const sessionToken = (await cookies()).get(SESSION_COOKIE_NAME)?.value;

  if (!isSessionTokenValid(sessionToken)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = workoutEntrySchema.parse(await request.json());
  const currentEntries = (await readCollection("workouts/entries")) as WorkoutEntry[];
  const nextEntry: WorkoutEntry = {
    id: crypto.randomUUID(),
    ...payload,
  };

  await writeCollection("workouts/entries", [nextEntry, ...currentEntries]);

  return NextResponse.json({ ok: true, entry: nextEntry });
}
