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

    const logs = await db.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { actor: { select: { id: true, name: true, avatarUrl: true, email: true } } },
    });

    return NextResponse.json({
      logs: logs.map((l) => ({
        ...l,
        metadata: l.metadata ? JSON.parse(l.metadata) : null,
      })),
    });
  } catch (e: any) {
    console.error("Admin audit error:", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
