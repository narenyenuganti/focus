import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { isSessionTokenValid, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { readCollection, writeCollection } from "@/lib/server/data-store";
import type { HealthMetric } from "@/lib/server/dashboard";

const healthMetricSchema = z.object({
  date: z.string(),
  weight: z.number().optional(),
  restingHeartRate: z.number().optional(),
  energy: z.number().min(1).max(10).optional(),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  const sessionToken = (await cookies()).get(SESSION_COOKIE_NAME)?.value;

  if (!isSessionTokenValid(sessionToken)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = healthMetricSchema.parse(await request.json());
  const currentEntries = (await readCollection("health/metrics")) as HealthMetric[];
  const nextEntry: HealthMetric = {
    id: crypto.randomUUID(),
    ...payload,
  };

  await writeCollection("health/metrics", [nextEntry, ...currentEntries]);

  return NextResponse.json({ ok: true, entry: nextEntry });
}
