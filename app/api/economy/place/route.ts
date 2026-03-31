import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { isSessionTokenValid, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { placeDecoration, removeDecoration, readInventory } from "@/lib/server/economy";

const placeSchema = z.object({
  slotId: z.string().min(1),
  itemId: z.string().min(1),
});

const removeSchema = z.object({
  slotId: z.string().min(1),
});

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!isSessionTokenValid(sessionToken)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = placeSchema.parse(await request.json());
  const inventory = await readInventory();
  if (!inventory.purchased.includes(body.itemId)) {
    return NextResponse.json({ error: "Item not owned" }, { status: 400 });
  }

  const room = await placeDecoration(body.slotId, body.itemId);
  return NextResponse.json({ room });
}

export async function DELETE(request: Request) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!isSessionTokenValid(sessionToken)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = removeSchema.parse(await request.json());
  const room = await removeDecoration(body.slotId);
  return NextResponse.json({ room });
}
