import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!session.user.owner?.id) return NextResponse.json({ error: "Not an owner" }, { status: 403 });

    const ownerId = session.user.owner.id;
    const [
      totalVehicles,
      activeListings,
      pendingBookings,
      confirmedBookings,
      upcomingBookings,
      completedBookings,
      cancelledBookings,
      earningsAgg,
      owner,
      recentBookings,
      last30DaysBookings,
    ] = await Promise.all([
      db.car.count({ where: { ownerId } }),
      db.car.count({ where: { ownerId, status: "PUBLISHED" } }),
      db.booking.count({ where: { ownerId, bookingStatus: "PENDING" } }),
      db.booking.count({ where: { ownerId, bookingStatus: "CONFIRMED" } }),
      db.booking.count({
        where: {
          ownerId,
          bookingStatus: "CONFIRMED",
          startDate: { gte: new Date() },
        },
      }),
      db.booking.count({ where: { ownerId, bookingStatus: "COMPLETED" } }),
      db.booking.count({ where: { ownerId, bookingStatus: "CANCELLED" } }),
      db.payment.aggregate({
        where: { booking: { ownerId }, status: "SUCCEEDED" },
        _sum: { amount: true, ownerPayout: true, platformFee: true },
      }),
      db.owner.findUnique({ where: { id: ownerId } }),
      db.booking.findMany({
        where: { ownerId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { customer: { select: { id: true, name: true, avatarUrl: true } }, car: true, payment: true },
      }),
      db.booking.findMany({
        where: {
          ownerId,
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
        select: { id: true, totalAmount: true, createdAt: true, bookingStatus: true },
      }),
    ]);

    // Build revenue chart data (last 30 days)
    const revenueByDay: { date: string; revenue: number; bookings: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().slice(0, 10);
      const dayBookings = last30DaysBookings.filter((b) => b.createdAt.toISOString().slice(0, 10) === dayStr);
      revenueByDay.push({
        date: dayStr,
        revenue: dayBookings.reduce((s, b) => s + b.totalAmount, 0),
        bookings: dayBookings.length,
      });
    }

    // Vehicle performance
    const vehicles = await db.car.findMany({
      where: { ownerId },
      include: {
        bookings: { where: { bookingStatus: { in: ["CONFIRMED", "COMPLETED"] } }, select: { totalAmount: true } },
      },
    });
    const vehiclePerformance = vehicles.map((v) => ({
      id: v.id,
      name: `${v.brand} ${v.model}`,
      year: v.year,
      revenue: v.bookings.reduce((s, b) => s + b.totalAmount, 0),
      bookings: v.bookings.length,
    })).sort((a, b) => b.revenue - a.revenue);

    return NextResponse.json({
      stats: {
        totalVehicles,
        activeListings,
        pendingBookings,
        confirmedBookings,
        upcomingBookings,
        completedBookings,
        cancelledBookings,
        totalEarnings: earningsAgg._sum.amount || 0,
        netEarnings: earningsAgg._sum.ownerPayout || 0,
        platformFees: earningsAgg._sum.platformFee || 0,
        pendingPayouts: owner?.pendingPayouts || 0,
        completedPayouts: owner?.completedPayouts || 0,
        rating: owner?.rating || 0,
        responseRate: owner?.responseRate || 0,
      },
      revenueChart: revenueByDay,
      vehiclePerformance,
      recentBookings: recentBookings.map((b) => ({
        ...b,
        car: b.car ? { ...b.car, images: JSON.parse(b.car.images || "[]") } : null,
      })),
    });
  } catch (e: any) {
    console.error("Owner stats error:", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
