"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, MapPin, Heart, Share, ChevronLeft, Check, Users, Cog, Fuel, Settings, Calendar, Shield, Award, ArrowRight, X } from "lucide-react";
import { toast } from "sonner";
import { calculateCarPrice, daysBetween } from "@/lib/pricing";
import { cn } from "@/lib/utils";

export function CarDetailView({ carId }: { carId: string }) {
  const { setView, user, setBookingDraft, toggleFavorite, isFavorited } = useAppStore();
  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [pickupLocation, setPickupLocation] = useState("");
  const [returnLocation, setReturnLocation] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [pickupTime, setPickupTime] = useState("10:00");
  const [returnTime, setReturnTime] = useState("10:00");
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/cars/${carId}`);
        if (res.ok) {
          const data = await res.json();
          setCar(data);
          setPickupLocation(`${data.locationCity}, ${data.locationCountry}`);
          setReturnLocation(`${data.locationCity}, ${data.locationCountry}`);
          const ci = new Date(); ci.setDate(ci.getDate() + 7);
          const co = new Date(); co.setDate(co.getDate() + 10);
          setPickupDate(ci.toISOString().slice(0, 10));
          setReturnDate(co.toISOString().slice(0, 10));
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [carId]);

  const days = daysBetween(pickupDate, returnDate);
  const price = days > 0 ? calculateCarPrice({
    dailyRate: car?.dailyRate || 0,
    days,
    weeklyRate: car?.weeklyRate || undefined,
    monthlyRate: car?.monthlyRate || undefined,
    weekendRate: car?.weekendRate || undefined,
    securityDeposit: car?.securityDeposit || 0,
  }) : null;

  const handleBook = () => {
    if (!user) {
      toast.info("Please sign in to continue");
      setView({ name: "auth", mode: "login" });
      return;
    }
    if (days < 1) { toast.error("Please select valid dates"); return; }
    if (car.minimumRental && days < car.minimumRental) {
      toast.error(`Minimum rental is ${car.minimumRental} day(s)`);
      return;
    }
    setBookingDraft({
      bookingType: "CAR",
      carId,
      startDate: pickupDate,
      endDate: returnDate,
      pickupLocation, returnLocation,
      pickupTime, dropoffTime: returnTime,
      price,
    });
    setView({ name: "checkout", bookingType: "CAR", refId: carId });
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-8 w-32 mb-4" />
        <Skeleton className="aspect-[16/9] w-full mb-8" />
        <div className="grid lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!car) return <div className="text-center py-20">Car not found.</div>;

  const images = car.images || [];
  const fav = isFavorited(car.id);

  return (
    <div className="bg-background pb-12">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6">
        <button onClick={() => setView({ name: "cars" })} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ChevronLeft className="w-4 h-4" /> Back to cars
        </button>

        {/* Title */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="uppercase tracking-wider text-[10px]">{car.vehicleType}</Badge>
              {car.featured && <Badge className="bg-gold text-gold-foreground">Featured</Badge>}
              {car.owner?.verified && <Badge variant="secondary" className="text-[10px]"><Check className="w-3 h-3 mr-1" /> Verified owner</Badge>}
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">{car.brand} {car.model}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span>{car.year}</span>
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {car.locationCity}, {car.locationCountry}</span>
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-gold text-gold" />
                <span className="font-bold text-foreground">{car.rating?.toFixed(1)}</span>
                <span>({car.reviewCount} reviews)</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => toggleFavorite({ id: car.id, type: "CAR", name: `${car.brand} ${car.model}`, image: car.heroImage, location: `${car.locationCity}, ${car.locationCountry}`, price: car.dailyRate, rating: car.rating })}>
              <Heart className={cn("w-4 h-4 mr-2", fav ? "fill-destructive text-destructive" : "")} /> {fav ? "Saved" : "Save"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => toast.success("Link copied to clipboard")}>
              <Share className="w-4 h-4 mr-2" /> Share
            </Button>
          </div>
        </div>

        {/* Gallery */}
        <div className="grid lg:grid-cols-4 gap-2 mb-8 rounded-2xl overflow-hidden">
          <button onClick={() => setGalleryOpen(true)} className="lg:col-span-2 lg:row-span-2 aspect-[4/3] lg:aspect-auto overflow-hidden bg-muted">
            <img src={images[0]} alt={`${car.brand} ${car.model}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
          </button>
          {images.slice(1, 5).map((img: string, i: number) => (
            <button key={i} onClick={() => setGalleryOpen(true)} className="aspect-[4/3] overflow-hidden bg-muted hidden lg:block">
              <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Specs */}
            <div className="bg-card border border-border/60 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">Vehicle specifications</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Spec icon={Users} label="Seats" value={car.seats} />
                <Spec icon={Settings} label="Doors" value={car.doors} />
                <Spec icon={Cog} label="Transmission" value={car.transmission === "AUTOMATIC" ? "Automatic" : "Manual"} />
                <Spec icon={Fuel} label="Fuel" value={car.fuelType.charAt(0) + car.fuelType.slice(1).toLowerCase()} />
              </div>
              {car.mileage && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-border/60">
                  <SpecItem label="Mileage" value={`${car.mileage.toLocaleString()} mi`} />
                  <SpecItem label="Daily mileage" value={`${car.mileagePerDay || 250} mi`} />
                  <SpecItem label="Extra mileage" value={`$${car.extraMileageFee || 0.45}/mi`} />
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-card border border-border/60 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-3">About this vehicle</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{car.description}</p>
            </div>

            {/* Features */}
            <div className="bg-card border border-border/60 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">Features & equipment</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {car.features.map((f: string) => (
                  <div key={f} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    <span className="capitalize">{f.replace(/-/g, " ")}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Owner */}
            {car.owner && (
              <div className="bg-card border border-border/60 rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-4">Meet your host</h2>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-teal-deep flex items-center justify-center text-primary-foreground font-bold">
                    {car.owner.displayName?.slice(0, 2).toUpperCase() || "O"}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{car.owner.displayName}</p>
                      {car.owner.verified && <Badge variant="secondary" className="text-[10px]"><Check className="w-3 h-3 mr-1" /> Verified</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">⭐ {car.owner.rating?.toFixed(2)} · Responds in {car.owner.responseTime} min</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border/60 text-center">
                  <div><p className="text-lg font-bold">{car.owner.responseRate}%</p><p className="text-xs text-muted-foreground">Response rate</p></div>
                  <div><p className="text-lg font-bold">${car.owner.totalEarnings?.toLocaleString()}</p><p className="text-xs text-muted-foreground">Total earnings</p></div>
                  <div><p className="text-lg font-bold">{new Date(car.owner.joinedAt).getFullYear()}</p><p className="text-xs text-muted-foreground">Joined</p></div>
                </div>
              </div>
            )}

            {/* Availability Calendar */}
            <div className="bg-card border border-border/60 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">Availability calendar</h2>
              <CalendarMini month={calendarMonth} setMonth={setCalendarMonth} availability={car.availability || []} />
              <p className="text-xs text-muted-foreground mt-3 flex items-center gap-2">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-green-100 border border-green-300" /> Available</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-100 border border-red-300" /> Booked</span>
              </p>
            </div>

            {/* Reviews */}
            {car.reviews && car.reviews.length > 0 && (
              <div className="bg-card border border-border/60 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-bold">Customer reviews</h2>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 fill-gold text-gold" />
                      <span className="text-2xl font-bold">{car.rating?.toFixed(1)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{car.reviewCount} reviews</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {car.reviews.slice(0, 4).map((r: any) => (
                    <div key={r.id} className="pb-4 border-b border-border/60 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {r.reviewer?.name?.slice(0, 2).toUpperCase() || "G"}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{r.reviewer?.name || "Anonymous"}</p>
                          <p className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="ml-auto flex items-center gap-0.5">
                          {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="w-3 h-3 fill-gold text-gold" />)}
                        </div>
                      </div>
                      <p className="font-medium text-sm">{r.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">{r.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Policies */}
            <div className="bg-card border border-border/60 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">Rental policies</h2>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <PolicyRow label="Minimum rental" value={`${car.minimumRental} day(s)`} />
                <PolicyRow label="Maximum rental" value={car.maximumRental ? `${car.maximumRental} day(s)` : "No limit"} />
                <PolicyRow label="Security deposit" value={`$${car.securityDeposit} (refundable)`} />
                <PolicyRow label="Daily mileage" value={`${car.mileagePerDay || 250} miles`} />
                <PolicyRow label="Extra mileage fee" value={`$${car.extraMileageFee || 0.45}/mile`} />
                <PolicyRow label="Cancellation" value="Free up to 48h before pickup" />
              </div>
            </div>
          </div>

          {/* Booking widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-card border border-border/60 rounded-2xl p-5 lg:p-6 shadow-premium">
              <div className="flex items-baseline justify-between mb-4">
                <div>
                  <span className="text-2xl font-bold">${car.dailyRate}</span>
                  <span className="text-sm text-muted-foreground"> / day</span>
                </div>
                {car.weeklyRate && <Badge variant="outline" className="text-[10px]">${car.weeklyRate}/week</Badge>}
              </div>

              <div className="space-y-2 mb-4">
                <label className="block">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Pickup location</span>
                  <input type="text" value={pickupLocation} onChange={e => setPickupLocation(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border text-sm premium-input" />
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="block">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Pickup date</span>
                    <input type="date" value={pickupDate} onChange={e => setPickupDate(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border text-sm premium-input" />
                  </label>
                  <label className="block">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Time</span>
                    <input type="time" value={pickupTime} onChange={e => setPickupTime(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border text-sm premium-input" />
                  </label>
                </div>
                <label className="block">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Return location</span>
                  <input type="text" value={returnLocation} onChange={e => setReturnLocation(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border text-sm premium-input" />
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="block">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Return date</span>
                    <input type="date" value={returnDate} onChange={e => setReturnDate(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border text-sm premium-input" />
                  </label>
                  <label className="block">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Time</span>
                    <input type="time" value={returnTime} onChange={e => setReturnTime(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border text-sm premium-input" />
                  </label>
                </div>
              </div>

              {price && days > 0 ? (
                <>
                  <div className="space-y-2 py-4 border-t border-border/60 text-sm">
                    <Row label={`$${price.pricePerDay} × ${days} days`} value={`$${price.basePrice.toFixed(2)}`} />
                    {price.discount > 0 && <Row label="Discount" value={`-$${price.discount.toFixed(2)}`} />}
                    <Row label="Service fee" value={`$${price.serviceFee.toFixed(2)}`} />
                    <Row label="Taxes" value={`$${price.taxes.toFixed(2)}`} />
                    {price.securityDeposit > 0 && <Row label="Security deposit" value={`$${price.securityDeposit.toFixed(2)}`} muted />}
                  </div>
                  <div className="flex items-center justify-between py-3 border-t border-border/60">
                    <span className="font-semibold">Total</span>
                    <span className="text-2xl font-bold">${price.totalAmount.toFixed(2)}</span>
                  </div>
                  <Button onClick={handleBook} className="btn-premium w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground mt-2">
                    Book now
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-xs text-muted-foreground py-3 border-t border-border/60">Select dates to see pricing.</p>
                  <Button onClick={handleBook} className="btn-premium w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground mt-2">Book now</Button>
                </>
              )}

              <div className="mt-4 pt-4 border-t border-border/60 space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2"><Shield className="w-3.5 h-3.5 text-primary" /> Free cancellation 48h</div>
                <div className="flex items-center gap-2"><Award className="w-3.5 h-3.5 text-primary" /> Insurance included</div>
                <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary" /> Verified owner</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {galleryOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setGalleryOpen(false)}>
          <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center" onClick={() => setGalleryOpen(false)}>
            <X className="w-5 h-5" />
          </button>
          <img src={images[activeImage]} alt="" className="max-w-full max-h-full object-contain" />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((img: string, i: number) => (
              <button key={i} onClick={(e) => { e.stopPropagation(); setActiveImage(i); }} className={cn("w-16 h-12 rounded-lg overflow-hidden border-2", activeImage === i ? "border-gold" : "border-transparent")}>
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Spec({ icon: Icon, label, value }: any) {
  return (
    <div className="flex flex-col items-center text-center p-3 rounded-xl bg-muted/40">
      <Icon className="w-5 h-5 text-primary mb-2" />
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold mt-0.5">{value}</p>
    </div>
  );
}

function SpecItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold mt-0.5">{value}</p>
    </div>
  );
}

function PolicyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={muted ? "text-muted-foreground italic" : "font-medium"}>{value}</span>
    </div>
  );
}

function CalendarMini({ month, setMonth, availability }: { month: Date; setMonth: (d: Date) => void; availability: any[] }) {
  const year = month.getFullYear();
  const m = month.getMonth();
  const firstDay = new Date(year, m, 1);
  const lastDay = new Date(year, m + 1, 0);
  const startWeekday = (firstDay.getDay() + 6) % 7; // Mon=0
  const daysInMonth = lastDay.getDate();

  const availMap: Record<string, any> = {};
  availability.forEach((a) => { availMap[a.date] = a; });

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setMonth(new Date(year, m - 1, 1))} className="px-2 py-1 text-sm hover:bg-muted rounded">‹</button>
        <span className="text-sm font-semibold">{month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
        <button onClick={() => setMonth(new Date(year, m + 1, 1))} className="px-2 py-1 text-sm hover:bg-muted rounded">›</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-muted-foreground mb-1">
        {["Mo","Tu","We","Th","Fr","Sa","Su"].map(d => <div key={d} className="font-semibold">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (d === null) return <div key={i} />;
          const dateObj = new Date(year, m, d);
          const dateStr = dateObj.toISOString().slice(0, 10);
          const isPast = dateObj < today;
          const avail = availMap[dateStr];
          const isBlocked = avail?.isBlocked || (isPast);
          return (
            <div key={i} className={cn(
              "aspect-square flex items-center justify-center rounded-md text-xs font-medium border",
              isPast ? "bg-muted/30 text-muted-foreground/40 border-transparent" :
              isBlocked ? "bg-red-50 border-red-200 text-red-700 line-through" :
              "bg-green-50 border-green-200 text-green-700"
            )}>
              {d}
            </div>
          );
        })}
      </div>
    </div>
  );
}
