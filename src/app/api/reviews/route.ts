import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// POST /api/reviews — create a review for a completed booking
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { bookingId, rating, title, content, cleanliness, location, service, value, condition, ownerExperience, accuracy, pickupExperience } = body;

    if (!bookingId || !rating || !title || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const booking = await db.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    if (booking.customerId !== session.user.id) {
      return NextResponse.json({ error: "You can only review your own bookings" }, { status: 403 });
    }
    if (booking.bookingStatus !== "COMPLETED" && booking.bookingStatus !== "CONFIRMED") {
      return NextResponse.json({ error: "Booking must be completed to review" }, { status: 400 });
    }
    const existing = await db.review.findUnique({ where: { bookingId } });
    if (existing) return NextResponse.json({ error: "Already reviewed" }, { status: 400 });

    const review = await db.review.create({
      data: {
        reviewerId: session.user.id,
        bookingId,
        hotelId: booking.hotelId,
        carId: booking.carId,
        rating: parseInt(rating),
        title,
        content,
        cleanliness: cleanliness ? parseInt(cleanliness) : null,
        location: location ? parseInt(location) : null,
        service: service ? parseInt(service) : null,
        value: value ? parseInt(value) : null,
        condition: condition ? parseInt(condition) : null,
        ownerExperience: ownerExperience ? parseInt(ownerExperience) : null,
        accuracy: accuracy ? parseInt(accuracy) : null,
        pickupExperience: pickupExperience ? parseInt(pickupExperience) : null,
      },
    });

    // Update listing's review score
    if (booking.hotelId) {
      const reviews = await db.review.findMany({ where: { hotelId: booking.hotelId } });
      const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
      await db.hotel.update({
        where: { id: booking.hotelId },
        data: { reviewScore: Math.round(avg * 100) / 100, reviewCount: reviews.length },
      });
    }
    if (booking.carId) {
      const reviews = await db.review.findMany({ where: { carId: booking.carId } });
      const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
      await db.car.update({
        where: { id: booking.carId },
        data: { reviewScore: Math.round(avg * 100) / 100, reviewCount: reviews.length, rating: Math.round(avg * 100) / 100 },
      });
    }

    return NextResponse.json({ review });
  } catch (e: any) {
    console.error("Review POST error:", e);
    return NextResponse.json({ error: e.message || "Failed" }, { status: 500 });
  }
}
