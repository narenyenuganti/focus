import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isSessionTokenValid, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { readWallet, readInventory, readRoomPlacements } from "@/lib/server/economy";

export async function GET() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!isSessionTokenValid(sessionToken)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [wallet, inventory, room] = await Promise.all([
    readWallet(),
    readInventory(),
    readRoomPlacements(),
  ]);

  return NextResponse.json({ wallet, inventory, room });
}
