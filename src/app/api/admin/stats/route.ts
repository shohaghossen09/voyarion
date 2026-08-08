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

    const [
      totalCustomers,
      totalOwners,
      totalHotels,
      totalCars,
      totalBookings,
      totalRevenue,
      pendingPayouts,
      refunds,
      recentBookings,
      recentUsers,
      recentAuditLogs,
      last30DaysBookings,
      hotelBookingsCount,
      carBookingsCount,
    ] = await Promise.all([
      db.user.count({ where: { role: "CUSTOMER" } }),
      db.user.count({ where: { role: "OWNER" } }),
      db.hotel.count({ where: { status: "PUBLISHED" } }),
      db.car.count({ where: { status: "PUBLISHED", approved: true } }),
      db.booking.count(),
      db.payment.aggregate({ where: { status: "SUCCEEDED" }, _sum: { amount: true, platformFee: true } }),
      db.owner.aggregate({ _sum: { pendingPayouts: true } }),
      db.payment.aggregate({ where: { status: "REFUNDED" }, _sum: { refundAmount: true } }),
      db.booking.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        include: {
          customer: { select: { id: true, name: true, email: true, avatarUrl: true } },
          hotel: { select: { id: true, name: true, city: true } },
          car: { select: { id: true, brand: true, model: true, locationCity: true } },
        },
      }),
      db.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        select: { id: true, name: true, email: true, role: true, avatarUrl: true, createdAt: true },
      }),
      db.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 12,
        include: { actor: { select: { name: true, avatarUrl: true } } },
      }),
      db.booking.findMany({
        where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
        select: { id: true, totalAmount: true, createdAt: true, bookingType: true, bookingStatus: true },
      }),
      db.booking.count({ where: { bookingType: "HOTEL" } }),
      db.booking.count({ where: { bookingType: "CAR" } }),
    ]);

    // Build revenue chart data (last 30 days)
    const revenueByDay: { date: string; revenue: number; bookings: number; hotelBookings: number; carBookings: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().slice(0, 10);
      const dayBookings = last30DaysBookings.filter((b) => b.createdAt.toISOString().slice(0, 10) === dayStr);
      revenueByDay.push({
        date: dayStr,
        revenue: dayBookings.reduce((s, b) => s + b.totalAmount, 0),
        bookings: dayBookings.length,
        hotelBookings: dayBookings.filter((b) => b.bookingType === "HOTEL").length,
        carBookings: dayBookings.filter((b) => b.bookingType === "CAR").length,
      });
    }

    return NextResponse.json({
      stats: {
        totalCustomers,
        totalOwners,
        totalHotels,
        totalCars,
        totalBookings,
        totalRevenue: totalRevenue._sum.amount || 0,
        platformFees: totalRevenue._sum.platformFee || 0,
        pendingPayouts: pendingPayouts._sum.pendingPayouts || 0,
        refunds: refunds._sum.refundAmount || 0,
        hotelBookingsCount,
        carBookingsCount,
      },
      revenueChart: revenueByDay,
      recentBookings,
      recentUsers,
      auditLogs: recentAuditLogs,
    });
  } catch (e: any) {
    console.error("Admin stats error:", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
