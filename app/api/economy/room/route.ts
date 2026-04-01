import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { isSessionTokenValid, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { unlockRoom, selectRoom } from "@/lib/server/economy";

const unlockSchema = z.object({
  roomId: z.string().min(1),
});

const selectSchema = z.object({
  roomId: z.string().min(1),
});

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!isSessionTokenValid(sessionToken)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = unlockSchema.parse(await request.json());

  try {
    const result = unlockRoom(body.roomId);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unlock failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!isSessionTokenValid(sessionToken)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = selectSchema.parse(await request.json());

  try {
    const roomState = selectRoom(body.roomId);
    return NextResponse.json({ roomState });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Select failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
