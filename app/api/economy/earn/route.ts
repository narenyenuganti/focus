import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { isSessionTokenValid, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { earnSocks } from "@/lib/server/economy";

const earnSchema = z.object({
  amount: z.number().int().min(1),
});

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!isSessionTokenValid(sessionToken)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = earnSchema.parse(await request.json());
  const wallet = await earnSocks(body.amount);
  return NextResponse.json({ wallet });
}
