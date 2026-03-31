import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { isSessionTokenValid, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { purchaseDecoration } from "@/lib/server/economy";
import { getDecoration } from "@/lib/decoration-catalog";

const purchaseSchema = z.object({
  itemId: z.string().min(1),
});

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!isSessionTokenValid(sessionToken)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = purchaseSchema.parse(await request.json());
  const decoration = getDecoration(body.itemId);
  if (!decoration) {
    return NextResponse.json({ error: "Unknown decoration" }, { status: 400 });
  }

  try {
    const result = await purchaseDecoration(body.itemId, decoration.cost);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Purchase failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
