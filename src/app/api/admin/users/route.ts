import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role") || "";
    const q = searchParams.get("q") || "";

    const where: any = {};
    if (role) where.role = role;
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { email: { contains: q } },
      ];
    }

    const users = await db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { owner: true, profile: true },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        avatarUrl: true,
        phone: true,
        createdAt: true,
        owner: true,
        profile: true,
        _count: { select: { bookings: true } },
      },
    });

    return NextResponse.json({ users });
  } catch (e: any) {
    console.error("Admin users error:", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// PATCH user status
export async function PATCH(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId, action } = await req.json();
    if (!userId || !action) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    let newStatus: string | undefined;
    if (action === "suspend") newStatus = "SUSPENDED";
    else if (action === "reactivate") newStatus = "ACTIVE";
    else return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    const updated = await db.user.update({
      where: { id: userId },
      data: { status: newStatus },
    });

    await db.auditLog.create({
      data: {
        actorId: session.user.id,
        action: action === "suspend" ? "USER_SUSPENDED" : "USER_REACTIVATED",
        entity: "User",
        entityId: userId,
        metadata: JSON.stringify({ newStatus }),
      },
    });

    return NextResponse.json({ user: updated });
  } catch (e: any) {
    console.error("Admin user PATCH error:", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
