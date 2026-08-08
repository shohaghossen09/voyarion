import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const city = searchParams.get("city") || "";
    const minPrice = parseFloat(searchParams.get("minPrice") || "0");
    const maxPrice = parseFloat(searchParams.get("maxPrice") || "2000");
    const minRating = parseFloat(searchParams.get("minRating") || "0");
    const vehicleType = searchParams.get("vehicleType") || "";
    const transmission = searchParams.get("transmission") || "";
    const fuelType = searchParams.get("fuelType") || "";
    const brand = searchParams.get("brand") || "";
    const minSeats = parseInt(searchParams.get("minSeats") || "0");
    const featuresParam = searchParams.get("features") || "";
    const sortBy = searchParams.get("sortBy") || "recommended";
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    const featuredOnly = searchParams.get("featured") === "true";
    const ownerId = searchParams.get("ownerId") || "";

    const features = featuresParam ? featuresParam.split(",").filter(Boolean) : [];

    const where: any = {
      status: "PUBLISHED",
      approved: true,
      ...(featuredOnly ? { featured: true } : {}),
      ...(ownerId ? { ownerId } : {}),
      AND: [
        { dailyRate: { gte: minPrice } },
        { dailyRate: { lte: maxPrice } },
        { rating: { gte: minRating } },
      ],
    };
    if (q) {
      where.OR = [
        { brand: { contains: q } },
        { model: { contains: q } },
      ];
    }
    if (city) where.locationCity = { contains: city };
    if (vehicleType) where.vehicleType = vehicleType;
    if (transmission) where.transmission = transmission;
    if (fuelType) where.fuelType = fuelType;
    if (brand) where.brand = { contains: brand };
    if (minSeats) where.seats = { gte: minSeats };

    let orderBy: any = { createdAt: "desc" };
    if (sortBy === "price_low") orderBy = { dailyRate: "asc" };
    else if (sortBy === "price_high") orderBy = { dailyRate: "desc" };
    else if (sortBy === "rating") orderBy = { rating: "desc" };
    else if (sortBy === "reviews") orderBy = { reviewCount: "desc" };
    else if (sortBy === "recommended") orderBy = [{ featured: "desc" }, { rating: "desc" }];

    const [cars, total] = await Promise.all([
      db.car.findMany({
        where,
        orderBy,
        take: limit,
        skip: offset,
        include: { owner: { include: { user: true } }, destination: true },
      }),
      db.car.count({ where }),
    ]);

    const filtered = features.length
      ? cars.filter((c) => {
          const cf: string[] = JSON.parse(c.features || "[]");
          return features.every((f) => cf.includes(f));
        })
      : cars;

    return NextResponse.json({
      cars: filtered.map((c) => ({
        ...c,
        images: JSON.parse(c.images || "[]"),
        features: JSON.parse(c.features || "[]"),
      })),
      total: features.length ? filtered.length : total,
      offset,
      limit,
    });
  } catch (e: any) {
    console.error("Cars GET error:", e);
    return NextResponse.json({ error: "Failed to fetch cars" }, { status: 500 });
  }
}
