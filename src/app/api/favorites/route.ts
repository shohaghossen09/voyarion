import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session?.user) return NextResponse.json({ favorites: [] });
    const favorites = await db.favorite.findMany({
      where: { userId: session.user.id },
      include: { hotel: true, car: true },
    });
    return NextResponse.json({
      favorites: favorites.map((f) => ({
        id: f.id,
        type: f.hotelId ? "HOTEL" : "CAR",
        hotel: f.hotel
          ? { ...f.hotel, images: JSON.parse(f.hotel.images || "[]"), amenities: JSON.parse(f.hotel.amenities || "[]") }
          : null,
        car: f.car
          ? { ...f.car, images: JSON.parse(f.car.images || "[]"), features: JSON.parse(f.car.features || "[]") }
          : null,
      })),
    });
  } catch (e: any) {
    return NextResponse.json({ favorites: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { hotelId, carId, action } = await req.json();
    if (action === "add") {
      const existing = await db.favorite.findFirst({
        where: { userId: session.user.id, hotelId: hotelId || null, carId: carId || null },
      });
      if (!existing) {
        await db.favorite.create({
          data: { userId: session.user.id, hotelId: hotelId || null, carId: carId || null },
        });
      }
    } else if (action === "remove") {
      await db.favorite.deleteMany({
        where: { userId: session.user.id, hotelId: hotelId || null, carId: carId || null },
      });
    }
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("Favorite error:", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
