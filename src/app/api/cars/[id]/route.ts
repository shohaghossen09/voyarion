import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const car = await db.car.findUnique({
      where: { id },
      include: {
        owner: { include: { user: true } },
        destination: true,
        reviews: {
          include: { reviewer: true },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });
    if (!car) {
      return NextResponse.json({ error: "Car not found" }, { status: 404 });
    }

    // Availability for next 60 days
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endWindow = new Date(today);
    endWindow.setDate(endWindow.getDate() + 60);
    const availability = await db.carAvailability.findMany({
      where: { carId: id, date: { gte: today, lte: endWindow } },
      orderBy: { date: "asc" },
    });

    return NextResponse.json({
      ...car,
      images: JSON.parse(car.images || "[]"),
      features: JSON.parse(car.features || "[]"),
      availability: availability.map((a) => ({
        date: a.date.toISOString().slice(0, 10),
        isAvailable: a.isAvailable,
        isBlocked: a.isBlocked,
      })),
    });
  } catch (e: any) {
    console.error("Car detail GET error:", e);
    return NextResponse.json({ error: "Failed to fetch car" }, { status: 500 });
  }
}
