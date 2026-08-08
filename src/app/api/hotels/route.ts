import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const city = searchParams.get("city") || "";
    const minPrice = parseFloat(searchParams.get("minPrice") || "0");
    const maxPrice = parseFloat(searchParams.get("maxPrice") || "10000");
    const minRating = parseFloat(searchParams.get("minRating") || "0");
    const propertyType = searchParams.get("propertyType") || "";
    const amenitiesParam = searchParams.get("amenities") || "";
    const sortBy = searchParams.get("sortBy") || "recommended";
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    const featuredOnly = searchParams.get("featured") === "true";

    const amenities = amenitiesParam ? amenitiesParam.split(",").filter(Boolean) : [];

    const where: any = {
      status: "PUBLISHED",
      ...(featuredOnly ? { featured: true } : {}),
      ...(q ? { name: { contains: q } } : {}),
      ...(city ? { city: { contains: city } } : {}),
      priceFrom: { gte: minPrice, lte: maxPrice },
      reviewScore: { gte: minRating },
      ...(propertyType ? { propertyType } : {}),
    };

    let orderBy: any = { createdAt: "desc" };
    if (sortBy === "price_low") orderBy = { priceFrom: "asc" };
    else if (sortBy === "price_high") orderBy = { priceFrom: "desc" };
    else if (sortBy === "rating") orderBy = { reviewScore: "desc" };
    else if (sortBy === "reviews") orderBy = { reviewCount: "desc" };
    else if (sortBy === "recommended") orderBy = [{ featured: "desc" }, { reviewScore: "desc" }];

    const [hotels, total] = await Promise.all([
      db.hotel.findMany({
        where,
        orderBy,
        take: limit,
        skip: offset,
        include: { destination: true },
      }),
      db.hotel.count({ where }),
    ]);

    const filtered = amenities.length
      ? hotels.filter((h) => {
          const ha: string[] = JSON.parse(h.amenities || "[]");
          return amenities.every((a) => ha.includes(a));
        })
      : hotels;

    return NextResponse.json({
      hotels: filtered.map((h) => ({
        ...h,
        images: JSON.parse(h.images || "[]"),
        amenities: JSON.parse(h.amenities || "[]"),
        houseRules: JSON.parse(h.houseRules || "[]"),
      })),
      total: amenities.length ? filtered.length : total,
      offset,
      limit,
    });
  } catch (e: any) {
    console.error("Hotels GET error:", e);
    return NextResponse.json({ error: "Failed to fetch hotels" }, { status: 500 });
  }
}
