import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const promotions = await db.promotion.findMany({
      where: { status: "ACTIVE", validTo: { gte: new Date() } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ promotions });
  } catch (e: any) {
    return NextResponse.json({ promotions: [] });
  }
}
