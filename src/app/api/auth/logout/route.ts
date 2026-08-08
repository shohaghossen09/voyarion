import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser, destroySession, clearSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (session?.user) {
      // Remove all sessions for this user (logout everywhere) or just current
      const cookieHeader = req.headers.get("cookie") || "";
      // Just delete all sessions for this user for simplicity
      await db.session.deleteMany({ where: { userId: session.user.id } });
    }
    const res = NextResponse.json({ success: true });
    res.headers.set("Set-Cookie", clearSessionCookie());
    return res;
  } catch (e: any) {
    console.error("Logout error:", e);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
