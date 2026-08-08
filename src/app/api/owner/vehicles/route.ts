import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!session.user.owner?.id) return NextResponse.json({ error: "Not an owner" }, { status: 403 });

    const cars = await db.car.findMany({
      where: { ownerId: session.user.owner.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({
      cars: cars.map((c) => ({
        ...c,
        images: JSON.parse(c.images || "[]"),
        features: JSON.parse(c.features || "[]"),
      })),
    });
  } catch (e: any) {
    console.error("Owner vehicles GET error:", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!session.user.owner?.id) return NextResponse.json({ error: "Not an owner" }, { status: 403 });

    const body = await req.json();
    const slug = `${body.brand}-${body.model}-${body.year}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    const car = await db.car.create({
      data: {
        slug: `${slug}-${Date.now().toString(36)}`,
        ownerId: session.user.owner.id,
        brand: body.brand,
        model: body.model,
        year: parseInt(body.year),
        vehicleType: body.vehicleType,
        transmission: body.transmission,
        fuelType: body.fuelType,
        seats: parseInt(body.seats),
        doors: parseInt(body.doors || "4"),
        mileage: parseInt(body.mileage || "0"),
        features: JSON.stringify(body.features || []),
        description: body.description,
        heroImage: body.images?.[0] || "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=80",
        images: JSON.stringify(body.images || []),
        locationCity: body.locationCity,
        locationCountry: body.locationCountry,
        address: body.address,
        dailyRate: parseFloat(body.dailyRate),
        weeklyRate: parseFloat(body.weeklyRate || "0") || null,
        monthlyRate: parseFloat(body.monthlyRate || "0") || null,
        weekendRate: parseFloat(body.weekendRate || "0") || null,
        securityDeposit: parseFloat(body.securityDeposit || "0"),
        minimumRental: parseInt(body.minimumRental || "1"),
        maximumRental: parseInt(body.maximumRental || "30") || null,
        mileagePerDay: parseInt(body.mileagePerDay || "250"),
        extraMileageFee: parseFloat(body.extraMileageFee || "0.45"),
        status: "PUBLISHED",
        approved: true,
      },
    });

    // Generate default availability for 60 days
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const availData = [];
    for (let d = 0; d < 60; d++) {
      const date = new Date(today);
      date.setDate(date.getDate() + d);
      availData.push({ carId: car.id, date, isAvailable: true, isBlocked: false });
    }
    await db.carAvailability.createMany({ data: availData });

    await db.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "CAR_CREATED",
        entity: "Car",
        entityId: car.id,
        metadata: JSON.stringify({ brand: car.brand, model: car.model }),
      },
    });

    return NextResponse.json({ car });
  } catch (e: any) {
    console.error("Owner vehicle POST error:", e);
    return NextResponse.json({ error: e.message || "Failed" }, { status: 500 });
  }
}
