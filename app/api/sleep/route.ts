import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { isSessionTokenValid, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { readCollection, writeCollection } from "@/lib/server/data-store";
import type { SleepEntry } from "@/lib/server/dashboard";
import { parseJsonBody } from "@/lib/server/json-body";

const sleepEntrySchema = z.object({
  date: z.string(),
  hours: z.number().min(0),
  bedtime: z.string().optional(),
  wakeTime: z.string().optional(),
  quality: z.number().min(1).max(10).optional(),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  const sessionToken = (await cookies()).get(SESSION_COOKIE_NAME)?.value;

  if (!isSessionTokenValid(sessionToken)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payloadResult = await parseJsonBody(request, sleepEntrySchema);

  if (!payloadResult.ok) {
    return payloadResult.response;
  }

  const payload = payloadResult.data;
  const currentEntries = (await readCollection("sleep/entries")) as SleepEntry[];
  const nextEntry: SleepEntry = {
    id: crypto.randomUUID(),
    ...payload,
  };

  await writeCollection("sleep/entries", [nextEntry, ...currentEntries]);

  return NextResponse.json({ ok: true, entry: nextEntry });
}
