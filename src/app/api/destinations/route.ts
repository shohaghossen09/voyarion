import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const destinations = await db.destination.findMany({
      orderBy: { popularity: "desc" },
    });
    return NextResponse.json({
      destinations: destinations.map((d) => ({
        ...d,
        imageGallery: JSON.parse(d.imageGallery || "[]"),
      })),
    });
  } catch (e: any) {
    console.error("Destinations GET error:", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
