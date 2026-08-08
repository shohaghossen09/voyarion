import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// GET booking details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser(req);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const booking = await db.booking.findUnique({
      where: { id },
      include: {
        hotel: true,
        hotelRoom: true,
        car: { include: { owner: { include: { user: true } } } },
        payment: true,
        customer: true,
      },
    });
    if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Authorization: customer who booked, owner of car, or admin
    if (
      booking.customerId !== session.user.id &&
      booking.ownerId !== session.user.owner?.id &&
      session.user.role !== "ADMIN" &&
      session.user.role !== "SUPER_ADMIN"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      ...booking,
      hotel: booking.hotel
        ? { ...booking.hotel, images: JSON.parse(booking.hotel.images || "[]"), amenities: JSON.parse(booking.hotel.amenities || "[]") }
        : null,
      car: booking.car
        ? { ...booking.car, images: JSON.parse(booking.car.images || "[]"), features: JSON.parse(booking.car.features || "[]") }
        : null,
      hotelRoom: booking.hotelRoom
        ? { ...booking.hotelRoom, images: JSON.parse(booking.hotelRoom.images || "[]"), amenities: JSON.parse(booking.hotelRoom.amenities || "[]") }
        : null,
    });
  } catch (e: any) {
    console.error("Booking GET error:", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// PATCH booking — confirm payment (simulate Stripe webhook)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser(req);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const { action } = body;

    if (action === "confirm_payment") {
      // Simulate Stripe webhook confirming payment succeeded
      const booking = await db.$transaction(async (tx) => {
        const existing = await tx.booking.findUnique({ where: { id }, include: { payment: true } });
        if (!existing) throw new Error("Booking not found");
        if (existing.paymentStatus === "PAID") throw new Error("Already paid");

        const updated = await tx.booking.update({
          where: { id },
          data: {
            bookingStatus: "CONFIRMED",
            paymentStatus: "PAID",
          },
        });

        if (existing.payment) {
          await tx.payment.update({
            where: { bookingId: id },
            data: {
              status: "SUCCEEDED",
              providerPaymentId: `pi_sim_${Date.now()}`,
            },
          });
        }

        // Update owner earnings if car booking
        if (existing.ownerId && existing.payment) {
          await tx.owner.update({
            where: { id: existing.ownerId },
            data: {
              pendingPayouts: { increment: existing.payment.ownerPayout || (existing.totalAmount * 0.88) },
              totalEarnings: { increment: existing.totalAmount },
            },
          });
        }

        // Block availability for car
        if (existing.carId) {
          const start = new Date(existing.startDate);
          const end = new Date(existing.endDate);
          const dates: Date[] = [];
          const c = new Date(start); c.setHours(0, 0, 0, 0);
          while (c <= end) {
            dates.push(new Date(c));
            c.setDate(c.getDate() + 1);
          }
          for (const date of dates) {
            await tx.carAvailability.upsert({
              where: { carId_date: { carId: existing.carId, date } },
              create: { carId: existing.carId, date, isAvailable: false, isBlocked: true },
              update: { isAvailable: false, isBlocked: true },
            });
          }
        }

        // Notifications
        await tx.notification.create({
          data: {
            userId: existing.customerId,
            title: "Booking Confirmed",
            message: `Your booking ${existing.reference} has been confirmed.`,
            type: "BOOKING",
            metadata: JSON.stringify({ bookingId: id }),
          },
        });
        if (existing.ownerId) {
          const owner = await tx.owner.findUnique({ where: { id: existing.ownerId } });
          if (owner) {
            await tx.notification.create({
              data: {
                userId: owner.userId,
                title: "New Booking",
                message: `You have a new booking ${existing.reference}.`,
                type: "BOOKING",
                metadata: JSON.stringify({ bookingId: id }),
              },
            });
          }
        }

        return updated;
      });

      return NextResponse.json({ booking });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e: any) {
    console.error("Booking PATCH error:", e);
    return NextResponse.json({ error: e.message || "Failed" }, { status: 400 });
  }
}
