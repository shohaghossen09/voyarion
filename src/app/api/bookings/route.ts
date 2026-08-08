import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import {
  calculateHotelPrice,
  calculateCarPrice,
  nightsBetween,
  daysBetween,
  generateBookingReference,
} from "@/lib/pricing";

// GET /api/bookings — list current user's bookings
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role") || "customer";
    const status = searchParams.get("status") || "";

    const where: any = {};
    if (role === "owner" && session.user.owner?.id) {
      where.ownerId = session.user.owner.id;
    } else if (role === "admin") {
      // all bookings
    } else {
      where.customerId = session.user.id;
    }
    if (status) where.bookingStatus = status;

    const bookings = await db.booking.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        hotel: true,
        hotelRoom: true,
        car: { include: { owner: true } },
        payment: true,
        customer: { select: { id: true, name: true, email: true, avatarUrl: true, phone: true } },
      },
    });

    return NextResponse.json({
      bookings: bookings.map((b) => ({
        ...b,
        hotel: b.hotel
          ? { ...b.hotel, images: JSON.parse(b.hotel.images || "[]"), amenities: JSON.parse(b.hotel.amenities || "[]") }
          : null,
        car: b.car
          ? { ...b.car, images: JSON.parse(b.car.images || "[]"), features: JSON.parse(b.car.features || "[]") }
          : null,
        hotelRoom: b.hotelRoom
          ? { ...b.hotelRoom, images: JSON.parse(b.hotelRoom.images || "[]"), amenities: JSON.parse(b.hotelRoom.amenities || "[]") }
          : null,
      })),
    });
  } catch (e: any) {
    console.error("Bookings GET error:", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// POST /api/bookings — create a booking (transactional)
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const {
      bookingType,
      hotelId,
      hotelRoomId,
      carId,
      startDate,
      endDate,
      guests = 1,
      rooms = 1,
      pickupLocation,
      dropoffLocation,
      pickupTime,
      dropoffTime,
      discountPct = 0,
      paymentMethod = "CARD",
    } = body;

    if (!startDate || !endDate) {
      return NextResponse.json({ error: "Dates are required" }, { status: 400 });
    }

    // Transaction: validate availability + create booking + create payment record
    const result = await db.$transaction(async (tx) => {
      if (bookingType === "HOTEL") {
        const hotel = await tx.hotel.findUnique({ where: { id: hotelId } });
        const room = await tx.hotelRoom.findUnique({ where: { id: hotelRoomId } });
        if (!hotel || !room) throw new Error("Hotel or room not found");
        if (!room.available) throw new Error("Room not available");

        const nights = nightsBetween(startDate, endDate);
        if (nights < 1) throw new Error("Invalid date range");

        // Check for double-booking (rooms count constraint)
        const overlapping = await tx.booking.findMany({
          where: {
            hotelRoomId,
            bookingStatus: { in: ["CONFIRMED", "PENDING"] },
            OR: [
              { startDate: { lte: new Date(endDate) }, endDate: { gte: new Date(startDate) } },
            ],
          },
        });
        if (overlapping.length >= room.maxRooms) {
          throw new Error("No rooms available for selected dates");
        }

        const price = calculateHotelPrice({
          roomRate: room.pricePerNight,
          nights,
          rooms,
          discountPct,
        });

        const reference = generateBookingReference();
        const booking = await tx.booking.create({
          data: {
            reference,
            bookingType: "HOTEL",
            customerId: session.user.id,
            hotelId,
            hotelRoomId,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            nights,
            days: nights,
            guests,
            rooms,
            basePrice: price.basePrice,
            fees: price.serviceFee,
            taxes: price.taxes,
            discount: price.discount,
            totalAmount: price.totalAmount,
            currency: "USD",
            bookingStatus: "PENDING",
            paymentStatus: "PENDING",
          },
        });

        await tx.payment.create({
          data: {
            bookingId: booking.id,
            provider: "STRIPE",
            amount: price.totalAmount,
            currency: "USD",
            status: "PENDING",
            method: paymentMethod,
            platformFee: price.totalAmount * 0.12,
          },
        });

        await tx.notification.create({
          data: {
            userId: session.user.id,
            title: "Booking Created",
            message: `Your booking ${reference} is pending payment.`,
            type: "BOOKING",
            metadata: JSON.stringify({ bookingId: booking.id }),
          },
        });

        return { booking, price };
      } else if (bookingType === "CAR") {
        const car = await tx.car.findUnique({ where: { id: carId } });
        if (!car) throw new Error("Car not found");
        if (car.status !== "PUBLISHED" || !car.approved) throw new Error("Car not available");

        const days = daysBetween(startDate, endDate);
        if (days < car.minimumRental) throw new Error(`Minimum rental is ${car.minimumRental} day(s)`);
        if (car.maximumRental && days > car.maximumRental) throw new Error(`Maximum rental is ${car.maximumRental} day(s)`);

        // Check for overlapping bookings
        const overlapping = await tx.booking.findFirst({
          where: {
            carId,
            bookingStatus: { in: ["CONFIRMED", "PENDING"] },
            OR: [
              { startDate: { lte: new Date(endDate) }, endDate: { gte: new Date(startDate) } },
            ],
          },
        });
        if (overlapping) throw new Error("Car is already booked for these dates");

        // Check blocked availability
        const start = new Date(startDate);
        const end = new Date(endDate);
        const blockedDays: Date[] = [];
        const cursor = new Date(start);
        cursor.setHours(0, 0, 0, 0);
        while (cursor <= end) {
          blockedDays.push(new Date(cursor));
          cursor.setDate(cursor.getDate() + 1);
        }
        const unavailable = await tx.carAvailability.findFirst({
          where: {
            carId,
            date: { in: blockedDays },
            isBlocked: true,
          },
        });
        if (unavailable) throw new Error("Car is not available on selected dates");

        const price = calculateCarPrice({
          dailyRate: car.dailyRate,
          days,
          weeklyRate: car.weeklyRate || undefined,
          monthlyRate: car.monthlyRate || undefined,
          weekendRate: car.weekendRate || undefined,
          securityDeposit: car.securityDeposit,
          discountPct,
        });

        const reference = generateBookingReference();
        const booking = await tx.booking.create({
          data: {
            reference,
            bookingType: "CAR",
            customerId: session.user.id,
            ownerId: car.ownerId,
            carId,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            nights: days,
            days,
            guests: 1,
            rooms: 1,
            pickupLocation,
            dropoffLocation,
            pickupTime,
            dropoffTime,
            basePrice: price.basePrice,
            fees: price.serviceFee,
            taxes: price.taxes,
            discount: price.discount,
            totalAmount: price.totalAmount,
            currency: "USD",
            bookingStatus: "PENDING",
            paymentStatus: "PENDING",
          },
        });

        await tx.payment.create({
          data: {
            bookingId: booking.id,
            provider: "STRIPE",
            amount: price.totalAmount,
            currency: "USD",
            status: "PENDING",
            method: paymentMethod,
            platformFee: price.totalAmount * 0.12,
            ownerPayout: price.totalAmount * 0.88 - (car.securityDeposit || 0),
          },
        });

        return { booking, price };
      }
      throw new Error("Invalid booking type");
    });

    return NextResponse.json({ booking: result.booking, price: result.price });
  } catch (e: any) {
    console.error("Booking POST error:", e);
    return NextResponse.json({ error: e.message || "Booking failed" }, { status: 400 });
  }
}
