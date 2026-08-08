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
    const bookingType = searchParams.get("bookingType") || "";
    const status = searchParams.get("status") || "";
    const paymentStatus = searchParams.get("paymentStatus") || "";

    const where: any = {};
    if (bookingType) where.bookingType = bookingType;
    if (status) where.bookingStatus = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;

    const bookings = await db.booking.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        customer: { select: { id: true, name: true, email: true, avatarUrl: true } },
        hotel: { select: { id: true, name: true, city: true } },
        car: { select: { id: true, brand: true, model: true, locationCity: true }, include: { owner: { include: { user: true } } } },
        payment: true,
      },
    });

    return NextResponse.json({ bookings });
  } catch (e: any) {
    console.error("Admin bookings error:", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
