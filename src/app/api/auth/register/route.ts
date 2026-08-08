import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, createSession, setSessionCookie, publicUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, role = "CUSTOMER", phone } = await req.json();
    if (!email || !password || !name) {
      return NextResponse.json({ error: "Email, password, and name are required" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 409 });

    const validRoles = ["CUSTOMER", "OWNER"];
    const finalRole = validRoles.includes(role) ? role : "CUSTOMER";

    const user = await db.user.create({
      data: {
        email: email.toLowerCase().trim(),
        name,
        passwordHash: hashPassword(password),
        phone,
        role: finalRole,
        profile: { create: { firstName: name.split(" ")[0], lastName: name.split(" ").slice(1).join(" ") || undefined } },
        ...(finalRole === "OWNER"
          ? {
              owner: {
                create: {
                  displayName: name,
                  verified: false,
                  rating: 5.0,
                  totalEarnings: 0,
                  pendingPayouts: 0,
                  completedPayouts: 0,
                  responseRate: 100,
                  responseTime: 60,
                },
              },
            }
          : {}),
      },
      include: { owner: true, profile: true },
    });

    const token = await createSession(user.id);
    const res = NextResponse.json({ user: publicUser(user), token });
    res.headers.set("Set-Cookie", setSessionCookie(token));
    return res;
  } catch (e: any) {
    console.error("Register error:", e);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
