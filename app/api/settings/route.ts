import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isSessionTokenValid, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { parseJsonBody } from "@/lib/server/json-body";
import { readSettings, updateSettings } from "@/lib/server/settings";
import { settingsPatchSchema } from "@/lib/server/schema";

export async function GET() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!isSessionTokenValid(sessionToken)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await readSettings();

  return NextResponse.json({ ok: true, settings });
}

export async function PUT(request: Request) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!isSessionTokenValid(sessionToken)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payloadResult = await parseJsonBody(request, settingsPatchSchema);

  if (!payloadResult.ok) {
    return payloadResult.response;
  }

  const settings = await updateSettings(payloadResult.data);

  return NextResponse.json({ ok: true, settings });
}
