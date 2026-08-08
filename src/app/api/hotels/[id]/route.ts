import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const hotel = await db.hotel.findUnique({
      where: { id },
      include: {
        rooms: true,
        destination: true,
        reviews: {
          include: { reviewer: true },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });
    if (!hotel) {
      return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
    }
    return NextResponse.json({
      ...hotel,
      images: JSON.parse(hotel.images || "[]"),
      amenities: JSON.parse(hotel.amenities || "[]"),
      houseRules: JSON.parse(hotel.houseRules || "[]"),
      rooms: hotel.rooms.map((r) => ({
        ...r,
        images: JSON.parse(r.images || "[]"),
        amenities: JSON.parse(r.amenities || "[]"),
      })),
    });
  } catch (e: any) {
    console.error("Hotel detail GET error:", e);
    return NextResponse.json({ error: "Failed to fetch hotel" }, { status: 500 });
  }
}
