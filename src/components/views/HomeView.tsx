"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useI18n } from "@/lib/i18n";
import { SearchWidget } from "@/components/site/SearchWidget";
import { RecentlyViewed } from "@/components/site/RecentlyViewed";
import { SmartImage } from "@/components/site/SmartImage";
import { ScrollAnimation, StaggerContainer, StaggerItem } from "@/components/site/ScrollAnimation";
import {
  TrendingDestinationsSection,
  TravelCategoriesSection,
  PremiumExperiencesSection,
  StatsAwardsSection,
  MobileAppSection,
} from "@/components/views/HomeSections";
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
  const { t } = useI18n();
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
          <SmartImage
            src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1920&q=80"
            alt="Premium travel destinations"
            loading="eager"
            className="w-full h-full object-cover"
            fallbackText="Voyarion"
          />
          <div className="absolute inset-0 hero-overlay" />
        </div>

        <div className="relative mx-auto max-w-[1400px] w-full px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <ScrollAnimation variant="fadeInUp">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card-light text-white text-xs font-medium mb-6">
                <Sparkles className="w-3.5 h-3.5 text-gold" />
                <span>250,000+ travelers · 1,800+ verified partners</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-white leading-[1.05]" style={{ fontFamily: "var(--font-playfair), serif" }}>
                {t("hero.title1")}
                <span className="block mt-1 gold-shimmer-text">
                  {t("hero.title2")}
                </span>
              </h1>
              <p className="mt-6 text-base lg:text-lg text-white/80 max-w-2xl leading-relaxed">
                {t("hero.subtitle")}
              </p>
            </div>
          </ScrollAnimation>

          <ScrollAnimation variant="fadeInUp" delay={0.2}>
            <div className="mt-8 lg:mt-10">
              <SearchWidget variant="hero" />
            </div>
          </ScrollAnimation>

          {/* Trust badges */}
          <ScrollAnimation variant="fadeInUp" delay={0.4}>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-white/80 text-sm">
              {[
                { icon: ShieldCheck, key: "hero.trust.secure" },
                { icon: Award, key: "hero.trust.verified" },
                { icon: CreditCard, key: "hero.trust.cancellation" },
                { icon: Headphones, key: "hero.trust.support" },
              ].map((trust) => (
                <div key={trust.key} className="flex items-center gap-2">
                  <trust.icon className="w-4 h-4 text-gold" />
                  <span>{t(trust.key)}</span>
                </div>
              ))}
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* ============== STATS STRIP ============== */}
      <section className="border-y border-border-subtle bg-surface">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-8">
          <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.1}>
            {[
              { stat: "1,800+", key: "stats.partners" },
              { stat: "92", key: "stats.countries" },
              { stat: "4.9/5", key: "stats.rating" },
              { stat: "$2.4B+", key: "stats.bookings" },
            ].map((s) => (
              <StaggerItem key={s.key} variant="fadeInUp">
                <div className="text-center">
                  <p className="text-3xl lg:text-4xl font-bold text-gradient-gold" style={{ fontFamily: "var(--font-playfair), serif" }}>{s.stat}</p>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{t(s.key)}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ============== RECENTLY VIEWED ============== */}
      <RecentlyViewed />

      {/* ============== TRENDING DESTINATIONS (NEW) ============== */}
      <TrendingDestinationsSection />

      {/* ============== FEATURED HOTELS ============== */}
      <section className="section-pad">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <ScrollAnimation variant="fadeInUp">
            <SectionHeader
              eyebrow={t("section.featuredHotels.eyebrow")}
              title={t("section.featuredHotels")}
              description={t("section.featuredHotels.desc")}
              onAction={() => setView({ name: "hotels" })}
              actionLabel={t("section.browseAllHotels")}
            />
          </ScrollAnimation>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="aspect-[4/3] rounded-2xl bg-surface" />)}
            </div>
          ) : (
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.1}>
              {hotels.map(h => (
                <StaggerItem key={h.id} variant="fadeInUp">
                  <HotelCard hotel={h} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </div>
      </section>

      {/* ============== TRAVEL CATEGORIES (NEW) ============== */}
      <TravelCategoriesSection />

      {/* ============== FEATURED CARS ============== */}
      <section className="section-pad bg-surface border-y border-border-subtle">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <ScrollAnimation variant="fadeInUp">
            <SectionHeader
              eyebrow={t("section.featuredCars.eyebrow")}
              title={t("section.featuredCars")}
              description={t("section.featuredCars.desc")}
              onAction={() => setView({ name: "cars" })}
              actionLabel={t("section.browseAllCars")}
            />
          </ScrollAnimation>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="aspect-[16/10] rounded-2xl bg-card" />)}
            </div>
          ) : (
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.1}>
              {cars.map(c => (
                <StaggerItem key={c.id} variant="fadeInUp">
                  <CarCard car={c} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </div>
      </section>

      {/* ============== PREMIUM EXPERIENCES (NEW) ============== */}
      <PremiumExperiencesSection />

      {/* ============== DESTINATIONS ============== */}
      <section className="section-pad">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <ScrollAnimation variant="fadeInUp">
            <SectionHeader
              eyebrow={t("section.destinations.eyebrow")}
              title={t("section.destinations")}
              description={t("section.destinations.desc")}
              onAction={() => setView({ name: "destinations" })}
              actionLabel={t("section.viewAllDestinations")}
            />
          </ScrollAnimation>
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="aspect-[3/4] rounded-2xl bg-surface" />)}
            </div>
          ) : (
            <StaggerContainer className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6" staggerDelay={0.1}>
              {destinations.map((d, i) => (
                <StaggerItem key={d.id} variant="scaleIn">
                  <DestinationCard destination={d} large={i === 0} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </div>
      </section>

      {/* ============== STATS & AWARDS (NEW) ============== */}
      <StatsAwardsSection />

      {/* ============== OFFERS ============== */}
      {promotions.length > 0 && (
        <section className="section-pad bg-surface border-y border-border-subtle">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
            <ScrollAnimation variant="fadeInUp">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-10">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/10 border border-gold/20 text-xs font-medium mb-4">
                    <TrendingUp className="w-3.5 h-3.5 text-gold" />
                    <span className="text-gold">{t("section.offers.eyebrow")}</span>
                  </div>
                  <h2 className="text-3xl lg:text-5xl font-bold tracking-tight text-foreground" style={{ fontFamily: "var(--font-playfair), serif" }}>{t("section.offers.title")}</h2>
                  <p className="mt-3 text-muted-foreground max-w-xl">
                    {t("section.offers.desc")}
                  </p>
                </div>
              </div>
            </ScrollAnimation>
            <StaggerContainer className="grid md:grid-cols-3 gap-5" staggerDelay={0.1}>
              {promotions.map((p) => (
                <StaggerItem key={p.id} variant="fadeInUp">
                  <div className="relative overflow-hidden rounded-2xl bg-card border border-border-subtle hover:border-gold/40 transition-colors p-6 lg:p-8 group premium-card">
                    <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-gold/10 blur-2xl group-hover:bg-gold/20 transition-colors" />
                    <Badge className="bg-gradient-to-r from-gold-light to-gold-dark text-background border-0">{p.discountPct > 0 ? `${p.discountPct}% OFF` : `$${p.discountAmt} OFF`}</Badge>
                    <h3 className="mt-4 text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-playfair), serif" }}>{p.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                    <div className="mt-5 flex items-center justify-between">
                      <code className="px-3 py-1.5 rounded-lg bg-background border border-border-subtle text-gold font-mono text-sm font-bold">{p.code}</code>
                      <Button variant="ghost" size="sm" className="text-gold hover:text-gold hover:bg-gold/10" onClick={() => setView(p.type === "HOTEL" ? { name: "hotels" } : p.type === "CAR" ? { name: "cars" } : { name: "deals" })}>
                        {t("offers.apply")} <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
      )}

      {/* ============== WHY CHOOSE US ============== */}
      <section className="section-pad">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <ScrollAnimation variant="fadeInUp">
            <SectionHeader
              eyebrow={t("section.whyChooseUs.eyebrow")}
              title={t("section.whyChooseUs.title")}
              description={t("section.whyChooseUs.desc")}
              center
            />
          </ScrollAnimation>
          <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10" staggerDelay={0.08}>
            {[
              { icon: ShieldCheck, key: "why.secure" },
              { icon: Award, key: "why.verified" },
              { icon: CreditCard, key: "why.value" },
              { icon: CalendarCheck, key: "why.easy" },
              { icon: Headphones, key: "why.support" },
              { icon: Star, key: "why.reviews" },
            ].map((f) => (
              <StaggerItem key={f.key} variant="fadeInUp">
                <div className="group p-6 rounded-2xl border border-border-subtle bg-card hover:border-gold/30 hover:shadow-premium transition-all h-full">
                  <div className="w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <f.icon className="w-5 h-5 text-gold" />
                  </div>
                  <h3 className="font-semibold text-lg text-foreground" style={{ fontFamily: "var(--font-playfair), serif" }}>{t(`${f.key}.title`)}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{t(`${f.key}.desc`)}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ============== HOW IT WORKS ============== */}
      <section className="section-pad bg-surface border-y border-border-subtle">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <ScrollAnimation variant="fadeInUp">
            <SectionHeader
              eyebrow={t("section.howItWorks.eyebrow")}
              title={t("section.howItWorks.title")}
              description={t("section.howItWorks.desc")}
              center
            />
          </ScrollAnimation>
          <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10 relative" staggerDelay={0.15}>
            {[
              { step: "01", icon: Search, key: "how.search" },
              { step: "02", icon: GitCompare, key: "how.compare" },
              { step: "03", icon: CalendarCheck, key: "how.book" },
              { step: "04", icon: PartyPopper, key: "how.enjoy" },
            ].map((s, i) => (
              <StaggerItem key={s.step} variant="fadeInUp">
                <div className="relative">
                  {i < 3 && (
                    <div className="hidden lg:block absolute top-8 left-[60%] w-full h-px border-t-2 border-dashed border-border-subtle" />
                  )}
                  <div className="relative bg-card border border-border-subtle rounded-2xl p-6 text-center h-full">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-gold-light to-gold-dark flex items-center justify-center text-background shadow-gold-glow">
                      <s.icon className="w-6 h-6" />
                    </div>
                    <div className="mt-3 text-[10px] uppercase tracking-[0.2em] text-gold font-bold">Step {s.step}</div>
                    <h3 className="mt-1 font-semibold text-lg text-foreground" style={{ fontFamily: "var(--font-playfair), serif" }}>{t(`${s.key}.title`)}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{t(`${s.key}.desc`)}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ============== TESTIMONIALS ============== */}
      <section className="section-pad">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <ScrollAnimation variant="fadeInUp">
            <SectionHeader
              eyebrow={t("section.testimonials.eyebrow")}
              title={t("section.testimonials.title")}
              description={t("section.testimonials.desc")}
              center
            />
          </ScrollAnimation>
          <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-10" staggerDelay={0.1}>
            {[
              { name: "Marco Bianchi", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80", location: "San Francisco, USA", text: "Booked a hotel in Santorini and a Mercedes S-Class for the same trip. The whole experience was seamless. The concierge even helped with restaurant reservations!", rating: 5 },
              { name: "Sophia Lindqvist", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80", location: "Stockholm, Sweden", text: "Voyarion is my go-to for travel. The verified partner badge gives me peace of mind, and the prices are consistently better than other platforms.", rating: 5 },
              { name: "Amelia Tanaka", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80", location: "Tokyo, Japan", text: "Rented a Tesla Model S for a weekend in LA. The owner was incredibly responsive and the car was immaculate. Will definitely use Voyarion again.", rating: 5 },
            ].map((r) => (
              <StaggerItem key={r.name} variant="fadeInUp">
                <div className="p-6 rounded-2xl border border-border-subtle bg-card hover:shadow-premium transition-shadow h-full">
                  <Quote className="w-8 h-8 text-gold/40" />
                  <div className="flex items-center gap-0.5 mt-3">
                    {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="w-4 h-4 fill-gold text-gold" />)}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">"{r.text}"</p>
                  <div className="mt-5 flex items-center gap-3">
                    <SmartImage src={r.avatar} alt={r.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-gold/20" fallbackText="User" />
                    <div>
                      <p className="text-sm font-semibold text-foreground" style={{ fontFamily: "var(--font-playfair), serif" }}>{r.name}</p>
                      <p className="text-xs text-muted-foreground">{r.location}</p>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ============== MOBILE APP (NEW) ============== */}
      <MobileAppSection />

      {/* ============== CTA ============== */}
      <section className="relative section-pad overflow-hidden">
        <div className="absolute inset-0">
          <SmartImage src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&q=80" alt="" className="w-full h-full object-cover" fallbackText="Travel" />
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background/90 to-background/70" />
        </div>
        <div className="relative mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8 text-center">
          <ScrollAnimation variant="scaleIn">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card-light text-white text-xs font-medium mb-4">
              <Sparkles className="w-3.5 h-3.5 text-gold" /> Get Started Today
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold tracking-tight text-foreground" style={{ fontFamily: "var(--font-playfair), serif" }}>
              {t("section.cta.title")}
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              {t("section.cta.desc")}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button size="lg" className="btn-gold h-12 px-8" onClick={() => setView({ name: "auth", mode: "register" })}>
                {t("section.cta.button")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="btn-gold-outline h-12 px-8" onClick={() => setView({ name: "hotels" })}>
                {t("section.cta.secondary")}
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-muted-foreground text-sm">
              {["No credit card required", "Free cancellation", "Instant confirmation"].map(item => (
                <span key={item} className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-gold" />{item}</span>
              ))}
            </div>
          </ScrollAnimation>
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
        <h2 className="mt-2 text-3xl lg:text-5xl font-bold tracking-tight text-foreground" style={{ fontFamily: "var(--font-playfair), serif" }}>{title}</h2>
        {description && <p className="mt-3 text-muted-foreground lg:text-lg max-w-2xl">{description}</p>}
      </div>
      {actionLabel && onAction && (
        <Button variant="outline" onClick={onAction} className="hidden lg:flex btn-gold-outline">
          {actionLabel}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      )}
    </div>
  );
}
