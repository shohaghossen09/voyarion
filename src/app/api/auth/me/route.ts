import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, publicUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session?.user) return NextResponse.json({ user: null });
    return NextResponse.json({ user: publicUser(session.user) });
  } catch (e: any) {
    console.error("Me error:", e);
    return NextResponse.json({ user: null });
  }
}
