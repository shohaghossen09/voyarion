"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft, Calendar, Users, MapPin, Clock, Download, CheckCircle2, Circle,
  Package, CreditCard, Car, Building2, Star, MessageSquare, AlertCircle, Phone, Mail,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const TIMELINE_STEPS = [
  { key: "PENDING", label: "Booking initiated", icon: Circle, desc: "Your reservation request has been received" },
  { key: "CONFIRMED", label: "Booking confirmed", icon: CheckCircle2, desc: "Payment successful, listing reserved for you" },
  { key: "ACTIVE", label: "Stay/trip active", icon: Package, desc: "You've checked in / picked up the vehicle" },
  { key: "COMPLETED", label: "Completed", icon: CheckCircle2, desc: "Your booking has been completed — leave a review!" },
];

export function BookingTrackingView({ bookingId }: { bookingId: string }) {
  const { setView, user } = useAppStore();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/bookings/${bookingId}`);
        if (res.ok) setBooking(await res.json());
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-8 w-32 mb-4" />
        <Skeleton className="h-64 w-full rounded-2xl mb-6" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (!booking) return <div className="text-center py-20 text-muted-foreground">Booking not found.</div>;

  const isCancelled = booking.bookingStatus === "CANCELLED";
  const isRefunded = booking.paymentStatus === "REFUNDED";

  // Determine current step index
  let currentStepIndex = 0;
  if (booking.bookingStatus === "CONFIRMED") currentStepIndex = 1;
  else if (booking.bookingStatus === "COMPLETED") currentStepIndex = 3;
  else if (booking.bookingStatus === "PENDING") currentStepIndex = 0;

  // Check if currently active (between start and end date)
  const now = new Date();
  const start = new Date(booking.startDate);
  const end = new Date(booking.endDate);
  const isActive = booking.bookingStatus === "CONFIRMED" && now >= start && now <= end;
  if (isActive) currentStepIndex = 2;

  const listing = booking.hotel || booking.car;
  const img = booking.hotel?.heroImage || booking.car?.heroImage;
  const name = booking.hotel?.name || `${booking.car?.brand} ${booking.car?.model}`;
  const location = booking.hotel?.shortLocation || `${booking.car?.locationCity}, ${booking.car?.locationCountry}`;

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6">
        <button onClick={() => setView({ name: "customer-dashboard", tab: "bookings" })} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ChevronLeft className="w-4 h-4" /> Back to my bookings
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground" style={{ fontFamily: "var(--font-playfair), serif" }}>Booking tracking</h1>
              {isCancelled && <Badge className="bg-red-500/15 text-red-400 border border-red-500/30">CANCELLED</Badge>}
              {isRefunded && !isCancelled && <Badge className="bg-purple-500/15 text-purple-400 border border-purple-500/30">REFUNDED</Badge>}
            </div>
            <p className="text-sm text-muted-foreground">Reference: <span className="font-mono font-semibold text-foreground">{booking.reference}</span></p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="border-border-subtle" onClick={() => toast.success("Confirmation downloaded")}>
              <Download className="w-4 h-4 mr-1.5" /> Voucher
            </Button>
            <Button variant="outline" size="sm" className="border-border-subtle" onClick={() => toast.success("Support contacted — we'll reply within 2h")}>
              <MessageSquare className="w-4 h-4 mr-1.5" /> Contact support
            </Button>
          </div>
        </div>

        {/* Listing summary card */}
        <div className="bg-card border border-border-subtle rounded-2xl overflow-hidden mb-6">
          <div className="flex flex-col sm:flex-row">
            <div className="sm:w-56 aspect-[4/3] sm:aspect-auto bg-surface shrink-0">
              <img src={img} alt={name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-[10px] border-border-subtle text-muted-foreground">{booking.bookingType}</Badge>
                {booking.hotel?.starRating && (
                  <span className="flex items-center gap-0.5">
                    {Array.from({ length: booking.hotel.starRating }).map((_, i) => <Star key={i} className="w-3 h-3 fill-gold text-gold" />)}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-playfair), serif" }}>{name}</h2>
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-gold/70" /> {location}</p>

              <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5 text-gold/70" />
                  <div>
                    <p className="text-[10px] uppercase tracking-wider">Start</p>
                    <p className="text-foreground font-medium">{new Date(booking.startDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5 text-gold/70" />
                  <div>
                    <p className="text-[10px] uppercase tracking-wider">End</p>
                    <p className="text-foreground font-medium">{new Date(booking.endDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</p>
                  </div>
                </div>
                {booking.bookingType === "HOTEL" && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-3.5 h-3.5 text-gold/70" />
                    <div>
                      <p className="text-[10px] uppercase tracking-wider">Guests</p>
                      <p className="text-foreground font-medium">{booking.guests} guests · {booking.rooms} rooms</p>
                    </div>
                  </div>
                )}
                {booking.bookingType === "CAR" && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-3.5 h-3.5 text-gold/70" />
                    <div>
                      <p className="text-[10px] uppercase tracking-wider">Pickup time</p>
                      <p className="text-foreground font-medium">{booking.pickupTime}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-3.5 h-3.5 text-gold/70" />
                  <div>
                    <p className="text-[10px] uppercase tracking-wider">Duration</p>
                    <p className="text-foreground font-medium">{booking.nights} {booking.bookingType === "HOTEL" ? "nights" : "days"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status timeline */}
        <div className="bg-card border border-border-subtle rounded-2xl p-6 mb-6">
          <h3 className="font-bold text-foreground mb-1" style={{ fontFamily: "var(--font-playfair), serif" }}>Booking status</h3>
          <p className="text-xs text-muted-foreground mb-6">Track your booking from initiation to completion</p>

          {isCancelled ? (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <div>
                <p className="font-semibold text-foreground text-sm">Booking cancelled</p>
                <p className="text-xs text-muted-foreground">
                  {booking.cancellationReason || "Customer cancellation"}
                  {isRefunded && " · Refund processed to original payment method"}
                </p>
              </div>
            </div>
          ) : (
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-border-subtle" />

              <div className="space-y-6">
                {TIMELINE_STEPS.map((step, i) => {
                  const isCompleted = i < currentStepIndex;
                  const isCurrent = i === currentStepIndex;
                  const isFuture = i > currentStepIndex;
                  const Icon = step.icon;

                  return (
                    <div key={step.key} className="relative flex items-start gap-4">
                      <div
                        className={cn(
                          "relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all shrink-0",
                          isCompleted && "bg-gold border-gold text-background",
                          isCurrent && "bg-gold/10 border-gold text-gold pulse-gold",
                          isFuture && "bg-card border-border-subtle text-muted-foreground"
                        )}
                      >
                        <Icon className={cn("w-4 h-4", isCompleted && "fill-background")} />
                      </div>
                      <div className="flex-1 pt-1.5">
                        <p className={cn(
                          "font-semibold text-sm",
                          isCompleted || isCurrent ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {step.label}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                        {isCurrent && (
                          <p className="text-[10px] text-gold mt-1 font-medium uppercase tracking-wider">In progress</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Two-column: Payment + Contact */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Payment summary */}
          <div className="bg-card border border-border-subtle rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-4 h-4 text-gold" />
              <h3 className="font-bold text-foreground" style={{ fontFamily: "var(--font-playfair), serif" }}>Payment summary</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Base price</span>
                <span className="text-foreground font-medium">${booking.basePrice.toFixed(2)}</span>
              </div>
              {booking.discount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="text-green-500 font-medium">-${booking.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Service fee</span>
                <span className="text-foreground font-medium">${booking.fees.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Taxes</span>
                <span className="text-foreground font-medium">${booking.taxes.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-border-subtle">
                <span className="font-semibold text-foreground">Total paid</span>
                <span className="text-xl font-bold text-foreground">${booking.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-muted-foreground">Status</span>
                <Badge className={cn(
                  "text-[10px]",
                  booking.paymentStatus === "PAID" && "bg-green-500/15 text-green-400 border border-green-500/30",
                  booking.paymentStatus === "PENDING" && "bg-amber-500/15 text-amber-400 border border-amber-500/30",
                  booking.paymentStatus === "REFUNDED" && "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                )}>
                  {booking.paymentStatus}
                </Badge>
              </div>
            </div>
          </div>

          {/* Contact info */}
          <div className="bg-card border border-border-subtle rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Phone className="w-4 h-4 text-gold" />
              <h3 className="font-bold text-foreground" style={{ fontFamily: "var(--font-playfair), serif" }}>Need help?</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Our 24/7 concierge team is here to assist with any questions about your booking.</p>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border-subtle">
                <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center">
                  <Phone className="w-4 h-4 text-gold" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone support</p>
                  <p className="text-sm font-semibold text-foreground">+1 (415) 555-0100</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border-subtle">
                <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-gold" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email support</p>
                  <p className="text-sm font-semibold text-foreground">support@voyarion.com</p>
                </div>
              </div>
            </div>

            {!isCancelled && (
              <Button
                variant="outline"
                className="w-full mt-4 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-400"
                onClick={() => {
                  if (confirm("Cancel this booking? Refund will be processed.")) {
                    fetch(`/api/bookings/${bookingId}/cancel`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reason: "Customer cancelled" }) })
                      .then(r => r.json())
                      .then(() => { toast.success("Booking cancelled"); setView({ name: "customer-dashboard", tab: "bookings" }); });
                  }
                }}
              >
                Cancel booking
              </Button>
            )}
          </div>
        </div>

        {/* Action bar */}
        {booking.bookingStatus === "COMPLETED" && (
          <div className="mt-6 bg-gradient-to-r from-gold/10 to-transparent border border-gold/20 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gold/15 flex items-center justify-center">
                <Star className="w-6 h-6 text-gold" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-foreground" style={{ fontFamily: "var(--font-playfair), serif" }}>Share your experience</h3>
                <p className="text-sm text-muted-foreground">Help other travelers by leaving a review</p>
              </div>
              <Button className="btn-gold" onClick={() => toast.success("Review form coming soon")}>
                Write a review
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
