import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// POST /api/bookings/[id]/cancel
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser(req);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const reason = body.reason || "Customer cancellation";

    const booking = await db.$transaction(async (tx) => {
      const existing = await tx.booking.findUnique({ where: { id }, include: { payment: true, car: true } });
      if (!existing) throw new Error("Booking not found");

      const isOwner = existing.ownerId && existing.ownerId === session.user.owner?.id;
      const isCustomer = existing.customerId === session.user.id;
      const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";
      if (!isOwner && !isCustomer && !isAdmin) throw new Error("Forbidden");

      const updated = await tx.booking.update({
        where: { id },
        data: {
          bookingStatus: "CANCELLED",
          paymentStatus: existing.paymentStatus === "PAID" ? "REFUNDED" : existing.paymentStatus,
          cancellationReason: reason,
          cancelledAt: new Date(),
        },
      });

      if (existing.payment && existing.payment.status === "SUCCEEDED") {
        await tx.payment.update({
          where: { bookingId: id },
          data: {
            status: "REFUNDED",
            refundAmount: existing.payment.amount,
          },
        });
      }

      // Unblock car availability if was blocked
      if (existing.carId) {
        const start = new Date(existing.startDate);
        const end = new Date(existing.endDate);
        const dates: Date[] = [];
        const c = new Date(start); c.setHours(0, 0, 0, 0);
        while (c <= end) {
          dates.push(new Date(c));
          c.setDate(c.getDate() + 1);
        }
        await tx.carAvailability.updateMany({
          where: { carId: existing.carId, date: { in: dates } },
          data: { isAvailable: true, isBlocked: false },
        });
      }

      await tx.notification.create({
        data: {
          userId: existing.customerId,
          title: "Booking Cancelled",
          message: `Your booking ${existing.reference} has been cancelled.`,
          type: "BOOKING",
          metadata: JSON.stringify({ bookingId: id }),
        },
      });

      return updated;
    });

    return NextResponse.json({ booking });
  } catch (e: any) {
    console.error("Cancel error:", e);
    return NextResponse.json({ error: e.message || "Failed" }, { status: 400 });
  }
}
