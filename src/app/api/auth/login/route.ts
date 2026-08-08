import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword, createSession, setSessionCookie, publicUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { owner: true, profile: true },
    });
    if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    if (user.status === "SUSPENDED") return NextResponse.json({ error: "Account suspended" }, { status: 403 });
    if (!verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = await createSession(user.id);
    const res = NextResponse.json({ user: publicUser(user), token });
    res.headers.set("Set-Cookie", setSessionCookie(token));
    return res;
  } catch (e: any) {
    console.error("Login error:", e);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
