import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { isSessionTokenValid, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import {
  appendFocusSession,
  buildFocusSummary,
  getFocusSessions,
  type FocusSessionRecord,
} from "@/lib/server/focus";

const createFocusSessionSchema = z.object({
  startedAt: z.string(),
  endedAt: z.string(),
  durationMinutes: z.number().min(1),
  mode: z.enum(["focus", "break"]).default("focus"),
});

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!isSessionTokenValid(sessionToken)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = createFocusSessionSchema.parse(await request.json());
  const record: FocusSessionRecord = {
    id: crypto.randomUUID(),
    ...body,
  };

  await appendFocusSession(record);

  const sessions = getFocusSessions();
  const summary = buildFocusSummary(sessions);

  return NextResponse.json({
    session: record,
    summary,
  });
}
