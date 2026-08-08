"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { SearchWidget } from "@/components/site/SearchWidget";
import { HotelCard, type HotelCardData } from "@/components/site/HotelCard";
import { CarCard, type CarCardData } from "@/components/site/CarCard";
import { DestinationCard, type DestinationCardData } from "@/components/site/DestinationCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShieldCheck, CreditCard, Award, Headphones, Search, GitCompare, CalendarCheck, PartyPopper,
  Star, Quote, TrendingUp, Sparkles, ArrowRight, CheckCircle2,
} from "lucide-react";

export function HomeView() {
  const { setView } = useAppStore();
  const [hotels, setHotels] = useState<HotelCardData[]>([]);
  const [cars, setCars] = useState<CarCardData[]>([]);
  const [destinations, setDestinations] = useState<DestinationCardData[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [hRes, cRes, dRes, pRes] = await Promise.all([
          fetch("/api/hotels?featured=true&limit=6"),
          fetch("/api/cars?featured=true&limit=6"),
          fetch("/api/destinations"),
          fetch("/api/promotions"),
        ]);
        const [h, c, d, p] = await Promise.all([hRes.json(), cRes.json(), dRes.json(), pRes.json()]);
        setHotels(h.hotels || []);
        setCars(c.cars || []);
        setDestinations((d.destinations || []).slice(0, 6));
        setPromotions(p.promotions || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="animate-fade-in">
      {/* ============== HERO ============== */}
      <section className="relative min-h-[680px] lg:min-h-[760px] flex items-center">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1920&q=80"
            alt="Premium travel destinations"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 hero-overlay" />
        </div>

        <div className="relative mx-auto max-w-[1400px] w-full px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-medium mb-6">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              <span>250,000+ travelers · 1,800+ verified partners</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-white leading-[1.05]">
              Find Your Perfect
              <span className="block mt-1">
                <span className="text-gradient-gold">Stay & Ride</span>
              </span>
            </h1>
            <p className="mt-6 text-base lg:text-lg text-white/80 max-w-2xl leading-relaxed">
              Discover handpicked hotels and rental cars from trusted partners worldwide. Compare, book, and travel with confidence — all in one premium marketplace.
            </p>
          </div>

          <div className="mt-8 lg:mt-10">
            <SearchWidget variant="hero" />
          </div>

          {/* Trust badges */}
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-white/80 text-sm">
            {[
              { icon: ShieldCheck, label: "Secure payments" },
              { icon: Award, label: "Verified partners" },
              { icon: CreditCard, label: "Free cancellation" },
              { icon: Headphones, label: "24/7 support" },
            ].map((t) => (
              <div key={t.label} className="flex items-center gap-2">
                <t.icon className="w-4 h-4 text-gold" />
                <span>{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============== STATS STRIP ============== */}
      <section className="border-y border-border/60 bg-card">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { stat: "1,800+", label: "Verified partners" },
              { stat: "92", label: "Countries covered" },
              { stat: "4.9/5", label: "Average rating" },
              { stat: "$2.4B+", label: "Bookings processed" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl lg:text-4xl font-bold text-gradient-teal">{s.stat}</p>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============== FEATURED HOTELS ============== */}
      <section className="section-pad">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Premium Stays"
            title="Featured Hotels"
            description="Hand-selected properties offering exceptional experiences, from cliffside villas to private island resorts."
            onAction={() => setView({ name: "hotels" })}
            actionLabel="Browse all hotels"
          />
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotels.map(h => <HotelCard key={h.id} hotel={h} />)}
            </div>
          )}
        </div>
      </section>

      {/* ============== FEATURED CARS ============== */}
      <section className="section-pad bg-muted/30 border-y border-border/60">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Drive in Style"
            title="Featured Cars"
            description="From luxury sedans to electric supercars — rent directly from trusted owners with full insurance coverage."
            onAction={() => setView({ name: "cars" })}
            actionLabel="Browse all cars"
          />
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="aspect-[16/10] rounded-2xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cars.map(c => <CarCard key={c.id} car={c} />)}
            </div>
          )}
        </div>
      </section>

      {/* ============== DESTINATIONS ============== */}
      <section className="section-pad">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Explore the World"
            title="Popular Destinations"
            description="Discover trending cities and hidden gems loved by our community of travelers."
            onAction={() => setView({ name: "destinations" })}
            actionLabel="View all destinations"
          />
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {destinations.map((d, i) => (
                <DestinationCard key={d.id} destination={d} large={i === 0} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============== OFFERS ============== */}
      {promotions.length > 0 && (
        <section className="section-pad bg-foreground text-background">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-10">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/10 border border-background/20 text-xs font-medium mb-4">
                  <TrendingUp className="w-3.5 h-3.5 text-gold" />
                  <span>Limited time</span>
                </div>
                <h2 className="text-3xl lg:text-5xl font-bold tracking-tight">Special Offers</h2>
                <p className="mt-3 text-background/70 max-w-xl">
                  Save up to 25% on featured properties and 15% on weekend car rentals. Members get more.
                </p>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {promotions.map((p) => (
                <div key={p.id} className="relative overflow-hidden rounded-2xl bg-background/5 border border-background/15 hover:border-gold/40 transition-colors p-6 lg:p-8 group">
                  <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-gold/10 blur-2xl group-hover:bg-gold/20 transition-colors" />
                  <Badge className="bg-gold text-gold-foreground border-0">{p.discountPct > 0 ? `${p.discountPct}% OFF` : `$${p.discountAmt} OFF`}</Badge>
                  <h3 className="mt-4 text-xl font-bold">{p.title}</h3>
                  <p className="mt-2 text-sm text-background/70 line-clamp-2">{p.description}</p>
                  <div className="mt-5 flex items-center justify-between">
                    <code className="px-3 py-1.5 rounded-lg bg-background/10 text-gold font-mono text-sm font-bold">{p.code}</code>
                    <Button variant="ghost" size="sm" className="text-gold hover:text-gold hover:bg-gold/10" onClick={() => setView(p.type === "HOTEL" ? { name: "hotels" } : p.type === "CAR" ? { name: "cars" } : { name: "deals" })}>
                      Apply <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============== WHY CHOOSE US ============== */}
      <section className="section-pad">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="The Voyarion Difference"
            title="Why Choose Us"
            description="A premium marketplace built on trust, transparency, and exceptional experiences."
            center
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
            {[
              { icon: ShieldCheck, title: "Secure Payments", desc: "Bank-grade encryption and PCI-compliant processing protect every transaction. We never store your card details." },
              { icon: Award, title: "Verified Partners", desc: "Every hotel and car owner goes through a rigorous verification process. Travel with confidence, every time." },
              { icon: CreditCard, title: "Best-Value Listings", desc: "Our price-match promise ensures you get the best available rate. Find a lower price? We'll match it." },
              { icon: CalendarCheck, title: "Easy Booking", desc: "Search, compare, and book in under 60 seconds. Free cancellation on most listings with instant confirmation." },
              { icon: Headphones, title: "24/7 Support", desc: "Real humans, available around the clock. Multilingual support via chat, email, and phone — wherever you are." },
              { icon: Star, title: "Reviewed by Travelers", desc: "Genuine reviews from verified guests. Make informed decisions with detailed ratings on every property." },
            ].map((f) => (
              <div key={f.title} className="group p-6 rounded-2xl border border-border/60 bg-card hover:border-primary/30 hover:shadow-premium transition-all">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============== HOW IT WORKS ============== */}
      <section className="section-pad bg-muted/30 border-y border-border/60">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Simple & Fast"
            title="How It Works"
            description="Book your next stay or ride in four simple steps."
            center
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10 relative">
            {[
              { step: "01", icon: Search, title: "Search", desc: "Enter your destination, dates, and preferences to discover curated matches." },
              { step: "02", icon: GitCompare, title: "Compare", desc: "Filter by price, amenities, ratings, and reviews to find the perfect match." },
              { step: "03", icon: CalendarCheck, title: "Book", desc: "Reserve instantly with secure payment. Get immediate confirmation." },
              { step: "04", icon: PartyPopper, title: "Enjoy", desc: "Show up, check in, and enjoy your stay or drive. We've got the rest covered." },
            ].map((s, i) => (
              <div key={s.step} className="relative">
                {i < 3 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] w-full h-px border-t-2 border-dashed border-border" />
                )}
                <div className="relative bg-card border border-border/60 rounded-2xl p-6 text-center">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-primary to-teal-deep flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                    <s.icon className="w-6 h-6" />
                  </div>
                  <div className="mt-3 text-[10px] uppercase tracking-[0.2em] text-gold font-bold">Step {s.step}</div>
                  <h3 className="mt-1 font-semibold text-lg">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============== TESTIMONIALS ============== */}
      <section className="section-pad">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Loved by Travelers"
            title="What Our Guests Say"
            description="Real reviews from real travelers who booked through Voyarion."
            center
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
            {[
              { name: "Marco Bianchi", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80", location: "San Francisco, USA", text: "Booked a hotel in Santorini and a Mercedes S-Class for the same trip. The whole experience was seamless. The concierge even helped with restaurant reservations!", rating: 5 },
              { name: "Sophia Lindqvist", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80", location: "Stockholm, Sweden", text: "Voyarion is my go-to for travel. The verified partner badge gives me peace of mind, and the prices are consistently better than other platforms.", rating: 5 },
              { name: "Amelia Tanaka", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80", location: "Tokyo, Japan", text: "Rented a Tesla Model S for a weekend in LA. The owner was incredibly responsive and the car was immaculate. Will definitely use Voyarion again.", rating: 5 },
            ].map((r) => (
              <div key={r.name} className="p-6 rounded-2xl border border-border/60 bg-card hover:shadow-premium transition-shadow">
                <Quote className="w-8 h-8 text-gold/30" />
                <div className="flex items-center gap-0.5 mt-3">
                  {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="w-4 h-4 fill-gold text-gold" />)}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-foreground/80">"{r.text}"</p>
                <div className="mt-5 flex items-center gap-3">
                  <img src={r.avatar} alt={r.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-semibold">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============== CTA ============== */}
      <section className="section-pad bg-gradient-to-br from-primary via-teal-deep to-primary">
        <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-white/10 text-white border-0 backdrop-blur">Get Started Today</Badge>
          <h2 className="mt-4 text-3xl lg:text-5xl font-bold tracking-tight text-white">
            Ready to begin your next adventure?
          </h2>
          <p className="mt-4 text-white/80 max-w-2xl mx-auto">
            Join thousands of travelers who trust Voyarion for premium stays and rides. Sign up free and unlock member-only deals.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" className="btn-premium bg-gold hover:bg-gold/90 text-gold-foreground h-12 px-8" onClick={() => setView({ name: "auth", mode: "register" })}>
              Create free account
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white h-12 px-8" onClick={() => setView({ name: "hotels" })}>
              Browse listings
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-white/70 text-sm">
            {["No credit card required", "Free cancellation", "Instant confirmation"].map(t => (
              <span key={t} className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-gold" />{t}</span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHeader({
  eyebrow, title, description, actionLabel, onAction, center,
}: { eyebrow: string; title: string; description?: string; actionLabel?: string; onAction?: () => void; center?: boolean }) {
  return (
    <div className={`mb-8 lg:mb-12 ${center ? "text-center max-w-2xl mx-auto" : "flex flex-col lg:flex-row lg:items-end justify-between gap-4"}`}>
      <div>
        <div className={`inline-flex items-center gap-2 ${center ? "justify-center" : ""}`}>
          <span className="text-xs uppercase tracking-[0.2em] text-gold font-bold">{eyebrow}</span>
          <span className="w-8 h-px bg-gold" />
        </div>
        <h2 className="mt-2 text-3xl lg:text-5xl font-bold tracking-tight">{title}</h2>
        {description && <p className="mt-3 text-muted-foreground lg:text-lg max-w-2xl">{description}</p>}
      </div>
      {actionLabel && onAction && (
        <Button variant="outline" onClick={onAction} className="hidden lg:flex">
          {actionLabel}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      )}
    </div>
  );
}
