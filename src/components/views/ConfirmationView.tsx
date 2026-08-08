"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Calendar, Users, MapPin, Download, Home, CalendarDays, Copy, PartyPopper, Clock } from "lucide-react";
import { toast } from "sonner";

export function ConfirmationView({ bookingId }: { bookingId: string }) {
  const { setView } = useAppStore();
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
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        <Skeleton className="h-12 w-12 mx-auto rounded-full mb-4" />
        <Skeleton className="h-8 w-48 mx-auto mb-2" />
        <Skeleton className="h-4 w-72 mx-auto mb-8" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!booking) return <div className="text-center py-20">Booking not found.</div>;

  const listing = booking.hotel || booking.car;
  const img = booking.hotel?.heroImage || booking.car?.heroImage;
  const name = booking.hotel?.name || `${booking.car?.brand} ${booking.car?.model}`;
  const location = booking.hotel?.shortLocation || `${booking.car?.locationCity}, ${booking.car?.locationCountry}`;

  return (
    <div className="min-h-screen bg-background py-8 lg:py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Success header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4 animate-scale-in">
            <CheckCircle2 className="w-9 h-9 text-green-600" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">Booking confirmed!</h1>
          <p className="mt-2 text-muted-foreground">
            Your reservation is confirmed. A confirmation has been sent to your email.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/30">
            <PartyPopper className="w-4 h-4 text-gold" />
            <span className="text-sm font-semibold text-gold-foreground">Enjoy your trip!</span>
          </div>
        </div>

        {/* Booking card */}
        <div className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-premium">
          <div className="relative aspect-[16/7] bg-surface">
            <img src={img} alt={name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
              <div className="text-white">
                <Badge className="bg-white/15 text-white border-0 backdrop-blur">{booking.bookingType}</Badge>
                <h2 className="text-2xl font-bold mt-2">{name}</h2>
                <p className="text-sm opacity-90 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {location}</p>
              </div>
            </div>
          </div>

          <div className="p-6 lg:p-8">
            {/* Booking ref */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-surface/40 mb-6">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Booking reference</p>
                <p className="font-mono font-bold text-lg">{booking.reference}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(booking.reference); toast.success("Reference copied"); }}>
                <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy
              </Button>
            </div>

            {/* Details */}
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <Detail icon={Calendar} label="Check-in / Pickup" value={new Date(booking.startDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })} />
              <Detail icon={Calendar} label="Check-out / Return" value={new Date(booking.endDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })} />
              <Detail icon={Clock} label={booking.bookingType === "HOTEL" ? "Nights" : "Days"} value={`${booking.nights} ${booking.bookingType === "HOTEL" ? "nights" : "days"}`} />
              {booking.bookingType === "HOTEL" ? (
                <Detail icon={Users} label="Guests & rooms" value={`${booking.guests} guests · ${booking.rooms} rooms`} />
              ) : (
                <>
                  <Detail icon={MapPin} label="Pickup location" value={booking.pickupLocation || "N/A"} />
                  <Detail icon={Clock} label="Pickup time" value={booking.pickupTime || "10:00"} />
                </>
              )}
            </div>

            {/* Price breakdown */}
            <div className="p-4 rounded-xl bg-surface/30 mb-6">
              <h3 className="text-sm font-semibold mb-3">Price breakdown</h3>
              <div className="space-y-2 text-sm">
                <Row label="Base price" value={`$${booking.basePrice.toFixed(2)}`} />
                {booking.discount > 0 && <Row label="Discount" value={`-$${booking.discount.toFixed(2)}`} highlight />}
                <Row label="Service fee" value={`$${booking.fees.toFixed(2)}`} />
                <Row label="Taxes" value={`$${booking.taxes.toFixed(2)}`} />
                <div className="flex items-center justify-between pt-2 border-t border-border/60">
                  <span className="font-semibold">Total paid</span>
                  <span className="text-2xl font-bold">${booking.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Status badges */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <Badge className="bg-green-100 text-green-700">{booking.bookingStatus}</Badge>
              <Badge className="bg-green-100 text-green-700">{booking.paymentStatus}</Badge>
              <Badge variant="outline">Paid via Stripe</Badge>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" className="flex-1" onClick={() => toast.success("Confirmation downloaded")}>
                <Download className="w-4 h-4 mr-2" /> Download voucher
              </Button>
              <Button variant="outline" className="flex-1 border-gold/30 text-gold hover:bg-gold/10 hover:text-gold" onClick={() => setView({ name: "booking-tracking", bookingId })}>
                <CalendarDays className="w-4 h-4 mr-2" /> Track booking
              </Button>
              <Button className="btn-gold flex-1" onClick={() => setView({ name: "home" })}>
                <Home className="w-4 h-4 mr-2" /> Back to home
              </Button>
            </div>
          </div>
        </div>

        {/* What's next */}
        <div className="mt-6 bg-card border border-border/60 rounded-2xl p-6">
          <h3 className="font-bold mb-3">What's next?</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-gold mt-0.5 shrink-0" /> You'll receive a confirmation email shortly with all the details.</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-gold mt-0.5 shrink-0" /> Add the booking to your calendar so you don't miss it.</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-gold mt-0.5 shrink-0" /> Free cancellation is available up to 48 hours before your start date.</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-gold mt-0.5 shrink-0" /> Need help? Our 24/7 support team is one click away.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function Detail({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="p-3 rounded-xl bg-surface/30 flex items-start gap-3">
      <Icon className="w-4 h-4 text-gold mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold mt-0.5 truncate">{value}</p>
      </div>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-medium ${highlight ? "text-green-600" : ""}`}>{value}</span>
    </div>
  );
}
