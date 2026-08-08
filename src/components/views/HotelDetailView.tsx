"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Star, MapPin, Heart, Share, ChevronLeft, Check, X, Calendar, Users, ArrowRight, Wifi, Waves, Dumbbell, Utensils, Coffee, Shield } from "lucide-react";
import { toast } from "sonner";
import { calculateHotelPrice, nightsBetween } from "@/lib/pricing";
import { cn } from "@/lib/utils";

const AMENITY_ICONS: Record<string, any> = {
  wifi: Wifi, pool: Waves, fitness: Dumbbell, restaurant: Utensils, bar: Coffee,
};

export function HotelDetailView({ hotelId }: { hotelId: string }) {
  const { setView, user, setBookingDraft, toggleFavorite, isFavorited } = useAppStore();
  const [hotel, setHotel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [galleryOpen, setGalleryOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/hotels/${hotelId}`);
        if (res.ok) {
          const data = await res.json();
          setHotel(data);
          // Default dates: next weekend
          const ci = new Date(); ci.setDate(ci.getDate() + 7);
          const co = new Date(); co.setDate(co.getDate() + 10);
          setCheckIn(ci.toISOString().slice(0, 10));
          setCheckOut(co.toISOString().slice(0, 10));
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [hotelId]);

  const nights = nightsBetween(checkIn, checkOut);
  const selectedRoomObj = hotel?.rooms?.find((r: any) => r.id === selectedRoom);
  const price = selectedRoomObj
    ? calculateHotelPrice({ roomRate: selectedRoomObj.pricePerNight, nights: nights || 1, rooms })
    : null;

  const handleReserve = () => {
    if (!user) {
      toast.info("Please sign in to continue");
      setView({ name: "auth", mode: "login" });
      return;
    }
    if (!selectedRoom) { toast.error("Please select a room"); return; }
    if (nights < 1) { toast.error("Please select valid dates"); return; }
    setBookingDraft({
      bookingType: "HOTEL",
      hotelId,
      hotelRoomId: selectedRoom,
      startDate: checkIn,
      endDate: checkOut,
      guests,
      rooms,
      price,
    });
    setView({ name: "checkout", bookingType: "HOTEL", refId: hotelId });
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-8 w-32 mb-4" />
        <Skeleton className="h-10 w-2/3 mb-2" />
        <Skeleton className="aspect-[16/9] w-full mb-8" />
        <div className="grid lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!hotel) {
    return <div className="text-center py-20">Hotel not found.</div>;
  }

  const images = hotel.images || [];
  const fav = isFavorited(hotel.id);

  return (
    <div className="bg-background pb-12">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <button onClick={() => setView({ name: "hotels" })} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ChevronLeft className="w-4 h-4" /> Back to hotels
        </button>

        {/* Title row */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="uppercase tracking-wider text-[10px]">{hotel.propertyType}</Badge>
              {hotel.featured && <Badge className="bg-gold text-gold-foreground">Featured</Badge>}
              <span className="flex items-center gap-0.5 text-xs">
                {Array.from({ length: hotel.starRating }).map((_, i) => <Star key={i} className="w-3 h-3 fill-gold text-gold" />)}
              </span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">{hotel.name}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {hotel.shortLocation}</span>
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-gold text-gold" />
                <span className="font-bold text-foreground">{hotel.reviewScore?.toFixed(1)}</span>
                <span>({hotel.reviewCount} reviews)</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => toggleFavorite({ id: hotel.id, type: "HOTEL", name: hotel.name, image: hotel.heroImage, location: hotel.shortLocation, price: hotel.priceFrom, rating: hotel.reviewScore })}>
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
            <img src={images[0]} alt={hotel.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
          </button>
          {images.slice(1, 5).map((img: string, i: number) => (
            <button key={i} onClick={() => setGalleryOpen(true)} className="aspect-[4/3] overflow-hidden bg-muted hidden lg:block">
              <img src={img} alt={`${hotel.name} ${i+2}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
            </button>
          ))}
          <button onClick={() => setGalleryOpen(true)} className="hidden lg:flex absolute bottom-4 right-4 items-center gap-2 px-3 py-1.5 rounded-lg bg-white/90 backdrop-blur text-xs font-semibold text-foreground">
            View all {images.length} photos
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <div className="bg-card border border-border/60 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-3">About this property</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{hotel.description}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border/60">
                {[
                  { label: "Check-in", value: hotel.checkInTime },
                  { label: "Check-out", value: hotel.checkOutTime },
                  { label: "Property type", value: hotel.propertyType },
                  { label: "Star rating", value: `${hotel.starRating} stars` },
                ].map(s => (
                  <div key={s.label}>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
                    <p className="text-sm font-semibold mt-0.5">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-card border border-border/60 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {hotel.amenities.map((a: string) => {
                  const Icon = AMENITY_ICONS[a];
                  const labels: any = {
                    pool: "Pool", spa: "Spa", fitness: "Fitness Center", restaurant: "Restaurant",
                    bar: "Bar", wifi: "Free WiFi", parking: "Parking", shuttle: "Airport Shuttle",
                    concierge: "Concierge", "room-service": "Room Service", business: "Business Center",
                    "pet-friendly": "Pet Friendly", beach: "Beach Access", "hot-tub": "Hot Tub",
                    sauna: "Sauna", ac: "Air Conditioning", "ocean-view": "Ocean View",
                    "mountain-view": "Mountain View", balcony: "Balcony", kitchenette: "Kitchenette",
                  };
                  return (
                    <div key={a} className="flex items-center gap-2 text-sm">
                      {Icon ? <Icon className="w-4 h-4 text-primary" /> : <Check className="w-4 h-4 text-primary" />}
                      <span>{labels[a] || a}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rooms */}
            <div className="bg-card border border-border/60 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-1">Available rooms</h2>
              <p className="text-sm text-muted-foreground mb-5">Select a room to continue with your reservation.</p>
              <div className="space-y-4">
                {hotel.rooms.map((room: any) => (
                  <div
                    key={room.id}
                    className={cn(
                      "border rounded-xl overflow-hidden transition-all cursor-pointer",
                      selectedRoom === room.id ? "border-primary ring-2 ring-primary/20" : "border-border/60 hover:border-primary/40"
                    )}
                    onClick={() => setSelectedRoom(room.id)}
                  >
                    <div className="grid sm:grid-cols-3 gap-0">
                      <div className="aspect-[4/3] sm:aspect-auto bg-muted overflow-hidden">
                        <img src={room.images[0]} alt={room.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="sm:col-span-2 p-4 lg:p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-semibold">{room.name}</h3>
                            <p className="text-xs text-muted-foreground mt-1">{room.bedConfig} · Sleeps {room.maxGuests}</p>
                          </div>
                          {selectedRoom === room.id && (
                            <Badge className="bg-primary text-primary-foreground">Selected</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{room.description}</p>
                        <div className="flex flex-wrap gap-1 mt-3">
                          {room.amenities.slice(0, 4).map((a: string) => (
                            <span key={a} className="text-[10px] px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground capitalize">{a.replace(/-/g, " ")}</span>
                          ))}
                        </div>
                        <div className="flex items-end justify-between mt-4 pt-3 border-t border-border/60">
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Per night</p>
                            <p className="font-bold text-xl">${room.pricePerNight}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Available</p>
                            <p className="text-sm font-semibold text-green-600">{room.maxRooms} rooms left</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            {hotel.reviews && hotel.reviews.length > 0 && (
              <div className="bg-card border border-border/60 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-bold">Guest reviews</h2>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 fill-gold text-gold" />
                      <span className="text-2xl font-bold">{hotel.reviewScore?.toFixed(1)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{hotel.reviewCount} reviews</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {hotel.reviews.slice(0, 4).map((r: any) => (
                    <div key={r.id} className="pb-4 border-b border-border/60 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {r.reviewer?.name?.slice(0, 2).toUpperCase() || "G"}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{r.reviewer?.name || "Anonymous"}</p>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</span>
                          </div>
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
              <h2 className="text-xl font-bold mb-4">Policies</h2>
              <Accordion type="single" collapsible defaultValue="rules">
                <AccordionItem value="rules">
                  <AccordionTrigger className="text-sm font-semibold">House rules</AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {hotel.houseRules.map((r: string, i: number) => (
                        <li key={i} className="flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />{r}</li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="cancel">
                  <AccordionTrigger className="text-sm font-semibold">Cancellation policy</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">Free cancellation up to 48 hours before check-in. After that, the first night is non-refundable. Cancellations within 24 hours of check-in are non-refundable.</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="health">
                  <AccordionTrigger className="text-sm font-semibold">Health & safety</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">This property follows enhanced cleaning protocols. Smoke detectors and first-aid kits are available on-site.</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>

          {/* Sticky booking widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-card border border-border/60 rounded-2xl p-5 lg:p-6 shadow-premium">
              <div className="flex items-baseline justify-between mb-4">
                <div>
                  <span className="text-2xl font-bold">${selectedRoomObj?.pricePerNight || hotel.priceFrom}</span>
                  <span className="text-sm text-muted-foreground"> / night</span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <Star className="w-3.5 h-3.5 fill-gold text-gold" />
                  <span className="font-semibold">{hotel.reviewScore?.toFixed(1)}</span>
                  <span className="text-muted-foreground">({hotel.reviewCount})</span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="grid grid-cols-2 gap-2">
                  <label className="block">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Check-in</span>
                    <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border text-sm premium-input" />
                  </label>
                  <label className="block">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Check-out</span>
                    <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border text-sm premium-input" />
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <label className="block">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Guests</span>
                    <select value={guests} onChange={e => setGuests(parseInt(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-border text-sm premium-input bg-card">
                      {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} {n===1?"Guest":"Guests"}</option>)}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Rooms</span>
                    <select value={rooms} onChange={e => setRooms(parseInt(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-border text-sm premium-input bg-card">
                      {[1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </label>
                </div>
              </div>

              {price && nights > 0 ? (
                <>
                  <div className="space-y-2 py-4 border-t border-border/60 text-sm">
                    <Row label={`$${price.pricePerNight} × ${nights} nights × ${rooms} rooms`} value={`$${price.basePrice.toFixed(2)}`} />
                    {price.discount > 0 && <Row label="Discount" value={`-$${price.discount.toFixed(2)}`} />}
                    <Row label="Service fee" value={`$${price.serviceFee.toFixed(2)}`} />
                    <Row label="Taxes" value={`$${price.taxes.toFixed(2)}`} />
                  </div>
                  <div className="flex items-center justify-between py-3 border-t border-border/60">
                    <span className="font-semibold">Total</span>
                    <span className="text-2xl font-bold">${price.totalAmount.toFixed(2)}</span>
                  </div>
                  <Button onClick={handleReserve} className="btn-premium w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground mt-2">
                    Reserve now
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-xs text-muted-foreground py-3 border-t border-border/60">
                    Select dates and a room to see pricing.
                  </p>
                  <Button onClick={handleReserve} className="btn-premium w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground mt-2">
                    Reserve now
                  </Button>
                </>
              )}

              <div className="mt-4 pt-4 border-t border-border/60 space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2"><Shield className="w-3.5 h-3.5 text-primary" /> Free cancellation 48h</div>
                <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary" /> Instant confirmation</div>
                <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary" /> No booking fees</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery lightbox */}
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
