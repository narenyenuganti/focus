import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { isSessionTokenValid, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { readCollection, writeCollection } from "@/lib/server/data-store";
import type { DailyLogEntry } from "@/lib/server/dashboard";
import { parseJsonBody } from "@/lib/server/json-body";

const dailyLogSchema = z.object({
  date: z.string(),
  mood: z.number().min(1).max(10).optional(),
  gratitude: z.array(z.string()).default([]),
  wins: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  const sessionToken = (await cookies()).get(SESSION_COOKIE_NAME)?.value;

  if (!isSessionTokenValid(sessionToken)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payloadResult = await parseJsonBody(request, dailyLogSchema);

  if (!payloadResult.ok) {
    return payloadResult.response;
  }

  const payload = payloadResult.data;
  const currentEntries = (await readCollection("journal/daily")) as DailyLogEntry[];
  const nextEntry: DailyLogEntry = {
    id: crypto.randomUUID(),
    ...payload,
  };

  await writeCollection("journal/daily", [nextEntry, ...currentEntries]);

  return NextResponse.json({ ok: true, entry: nextEntry });
}
