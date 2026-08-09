"use client";

import { useAppStore } from "@/store/useAppStore";
import { useI18n } from "@/lib/i18n";
import { ScrollAnimation, StaggerContainer, StaggerItem } from "@/components/site/ScrollAnimation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plane, Building2, Car as CarIcon, Star, TrendingUp, ArrowRight, MapPin,
  Waves, Mountain, Crown, Compass, Heart, Users, Leaf, Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================
// TRENDING DESTINATIONS SECTION (after hero)
// ============================================================
export function TrendingDestinationsSection() {
  const { setView } = useAppStore();
  const { t } = useI18n();

  const trending = [
    { name: "Santorini", country: "Greece", bookings: "2,847 this week", image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&q=80", trend: "+18%" },
    { name: "Bali", country: "Indonesia", bookings: "2,103 this week", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80", trend: "+24%" },
    { name: "Maldives", country: "Maldives", bookings: "1,892 this week", image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600&q=80", trend: "+31%" },
    { name: "Paris", country: "France", bookings: "1,654 this week", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80", trend: "+12%" },
    { name: "Kyoto", country: "Japan", bookings: "1,421 this week", image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&q=80", trend: "+27%" },
    { name: "Tuscany", country: "Italy", bookings: "1,205 this week", image: "https://images.unsplash.com/photo-1518101657792-5eaaa8f4e46b?w=600&q=80", trend: "+15%" },
  ];

  return (
    <section className="section-pad bg-surface border-y border-border-subtle">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <ScrollAnimation variant="fadeInUp">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/10 border border-gold/20 text-xs font-medium mb-4">
                <Flame className="w-3.5 h-3.5 text-gold" />
                <span className="text-gold">{t("section.trending.eyebrow")}</span>
              </div>
              <h2 className="text-3xl lg:text-5xl font-bold tracking-tight text-foreground" style={{ fontFamily: "var(--font-playfair), serif" }}>
                {t("section.trending.title")}
              </h2>
              <p className="mt-3 text-muted-foreground lg:text-lg max-w-2xl">
                {t("section.trending.desc")}
              </p>
            </div>
            <Button variant="outline" onClick={() => setView({ name: "destinations" })} className="btn-gold-outline hidden lg:flex">
              {t("section.viewAllDestinations")}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </ScrollAnimation>

        <StaggerContainer className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6" staggerDelay={0.08}>
          {trending.map((dest, i) => (
            <StaggerItem key={dest.name} variant="scaleIn">
              <div
                onClick={() => setView({ name: "destinations" })}
                className="group relative overflow-hidden rounded-2xl aspect-[4/5] cursor-pointer premium-card bg-card border border-border-subtle"
              >
                <img
                  src={dest.image}
                  alt={dest.name}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-md bg-green-500/20 backdrop-blur border border-green-500/30 text-green-400 text-[10px] font-bold">
                  <TrendingUp className="w-3 h-3" />
                  {dest.trend}
                </div>
                <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur border border-white/10 flex items-center justify-center text-white text-xs font-bold">
                  #{i + 1}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-5 text-white">
                  <div className="flex items-center gap-1.5 text-xs mb-1 opacity-90">
                    <MapPin className="w-3 h-3 text-gold" />
                    {dest.country}
                  </div>
                  <h3 className="text-xl lg:text-2xl font-bold" style={{ fontFamily: "var(--font-playfair), serif" }}>
                    {dest.name}
                  </h3>
                  <p className="text-[11px] text-white/70 mt-1">{dest.bookings}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

// ============================================================
// TRAVEL CATEGORIES SECTION
// ============================================================
export function TravelCategoriesSection() {
  const { setView } = useAppStore();
  const { t } = useI18n();

  const categories = [
    { key: "beach", icon: Waves, color: "from-blue-500/20 to-cyan-500/20", iconColor: "text-cyan-400", count: "248 properties" },
    { key: "city", icon: Building2, color: "from-purple-500/20 to-pink-500/20", iconColor: "text-purple-400", count: "312 properties" },
    { key: "mountain", icon: Mountain, color: "from-green-500/20 to-emerald-500/20", iconColor: "text-green-400", count: "156 properties" },
    { key: "luxury", icon: Crown, color: "from-gold/20 to-amber-500/20", iconColor: "text-gold", count: "89 properties" },
    { key: "adventure", icon: Compass, color: "from-orange-500/20 to-red-500/20", iconColor: "text-orange-400", count: "174 properties" },
    { key: "romantic", icon: Heart, color: "from-pink-500/20 to-rose-500/20", iconColor: "text-pink-400", count: "203 properties" },
    { key: "family", icon: Users, color: "from-teal-500/20 to-cyan-500/20", iconColor: "text-teal-400", count: "267 properties" },
    { key: "eco", icon: Leaf, color: "from-lime-500/20 to-green-500/20", iconColor: "text-lime-400", count: "94 properties" },
  ];

  return (
    <section className="section-pad">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <ScrollAnimation variant="fadeInUp">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/10 border border-gold/20 text-xs font-medium mb-4">
              <Compass className="w-3.5 h-3.5 text-gold" />
              <span className="text-gold">{t("section.categories.eyebrow")}</span>
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold tracking-tight text-foreground" style={{ fontFamily: "var(--font-playfair), serif" }}>
              {t("section.categories.title")}
            </h2>
            <p className="mt-3 text-muted-foreground lg:text-lg">
              {t("section.categories.desc")}
            </p>
          </div>
        </ScrollAnimation>

        <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4" staggerDelay={0.06}>
          {categories.map((cat) => (
            <StaggerItem key={cat.key} variant="fadeInUp">
              <button
                onClick={() => setView({ name: "hotels" })}
                className={cn(
                  "group w-full p-6 rounded-2xl border border-border-subtle bg-card hover:border-gold/40 transition-all text-left premium-card",
                  "bg-gradient-to-br", cat.color
                )}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-background/50 backdrop-blur flex items-center justify-center group-hover:scale-110 transition-transform">
                    <cat.icon className={cn("w-6 h-6", cat.iconColor)} />
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-gold group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="font-bold text-base text-foreground" style={{ fontFamily: "var(--font-playfair), serif" }}>
                  {t(`categories.${cat.key}`)}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {t(`categories.${cat.key}.desc`)}
                </p>
                <p className="text-[10px] text-gold mt-3 font-semibold uppercase tracking-wider">{cat.count}</p>
              </button>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

// ============================================================
// PREMIUM EXPERIENCES SECTION
// ============================================================
export function PremiumExperiencesSection() {
  const { setView } = useAppStore();
  const { t } = useI18n();

  const experiences = [
    {
      key: "honeymoon",
      image: "https://images.unsplash.com/photo-1519974719765-e6559eac257b?w=800&q=80",
      tag: "Romantic",
    },
    {
      key: "business",
      image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80",
      tag: "Professional",
    },
    {
      key: "roadtrip",
      image: "https://images.unsplash.com/photo-1503350366024-9ab57f05b275?w=800&q=80",
      tag: "Adventure",
    },
    {
      key: "wellness",
      image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80",
      tag: "Wellness",
    },
  ];

  return (
    <section className="section-pad bg-surface border-y border-border-subtle">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <ScrollAnimation variant="fadeInUp">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/10 border border-gold/20 text-xs font-medium mb-4">
                <Star className="w-3.5 h-3.5 text-gold" />
                <span className="text-gold">{t("section.experiences.eyebrow")}</span>
              </div>
              <h2 className="text-3xl lg:text-5xl font-bold tracking-tight text-foreground" style={{ fontFamily: "var(--font-playfair), serif" }}>
                {t("section.experiences.title")}
              </h2>
              <p className="mt-3 text-muted-foreground lg:text-lg max-w-2xl">
                {t("section.experiences.desc")}
              </p>
            </div>
          </div>
        </ScrollAnimation>

        <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5" staggerDelay={0.1}>
          {experiences.map((exp) => (
            <StaggerItem key={exp.key} variant="fadeInUp">
              <div
                onClick={() => setView({ name: "hotels" })}
                className="group relative overflow-hidden rounded-2xl aspect-[3/4] cursor-pointer premium-card bg-card border border-border-subtle"
              >
                <img
                  src={exp.image}
                  alt={t(`experiences.${exp.key}`)}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute top-3 left-3">
                  <Badge className="bg-gold/90 text-background border-0 text-[10px]">{exp.tag}</Badge>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  <h3 className="text-xl font-bold" style={{ fontFamily: "var(--font-playfair), serif" }}>
                    {t(`experiences.${exp.key}`)}
                  </h3>
                  <p className="text-xs text-white/80 mt-2 line-clamp-3">
                    {t(`experiences.${exp.key}.desc`)}
                  </p>
                  <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-gold opacity-0 group-hover:opacity-100 transition-opacity">
                    Explore <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

// ============================================================
// STATS & AWARDS SECTION
// ============================================================
export function StatsAwardsSection() {
  const { t } = useI18n();

  const awards = [
    { stat: "4.9", suffix: "/5", label: "User rating", icon: Star },
    { stat: "250K", suffix: "+", label: "Happy travelers", icon: Users },
    { stat: "1,800", suffix: "+", label: "Verified partners", icon: Building2 },
    { stat: "92", suffix: "", label: "Countries", icon: MapPin },
  ];

  const achievements = [
    { year: "2025", title: "Best Travel Platform", org: "Travel Tech Awards" },
    { year: "2025", title: "Premium Service Excellence", org: "Hospitality Times" },
    { year: "2024", title: "Innovation in Booking", org: "Digital Travel Forum" },
    { year: "2024", title: "Customer Choice Award", org: "Global Travel Association" },
  ];

  return (
    <section className="section-pad">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <ScrollAnimation variant="fadeInUp">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/10 border border-gold/20 text-xs font-medium mb-4">
              <Crown className="w-3.5 h-3.5 text-gold" />
              <span className="text-gold">{t("section.stats.eyebrow")}</span>
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold tracking-tight text-foreground" style={{ fontFamily: "var(--font-playfair), serif" }}>
              {t("section.stats.title")}
            </h2>
            <p className="mt-3 text-muted-foreground lg:text-lg">
              {t("section.stats.desc")}
            </p>
          </div>
        </ScrollAnimation>

        {/* Big stats */}
        <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12" staggerDelay={0.1}>
          {awards.map((award) => (
            <StaggerItem key={award.label} variant="scaleIn">
              <div className="stat-card text-center">
                <div className="w-12 h-12 mx-auto rounded-xl bg-gold/10 flex items-center justify-center mb-3">
                  <award.icon className="w-6 h-6 text-gold" />
                </div>
                <p className="text-3xl lg:text-4xl font-bold text-gradient-gold" style={{ fontFamily: "var(--font-playfair), serif" }}>
                  {award.stat}<span className="text-lg">{award.suffix}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">{award.label}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Awards list */}
        <ScrollAnimation variant="fadeInUp" delay={0.2}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {achievements.map((ach) => (
              <div key={ach.title} className="p-4 rounded-xl bg-surface border border-border-subtle flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                  <Crown className="w-5 h-5 text-gold" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gold font-bold uppercase tracking-wider">{ach.year}</p>
                  <p className="text-sm font-semibold text-foreground truncate">{ach.title}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{ach.org}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}

// ============================================================
// MOBILE APP CTA SECTION
// ============================================================
export function MobileAppSection() {
  const { t } = useI18n();

  return (
    <section className="section-pad bg-surface border-y border-border-subtle">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <ScrollAnimation variant="slideInLeft">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/10 border border-gold/20 text-xs font-medium mb-4">
                <Plane className="w-3.5 h-3.5 text-gold" />
                <span className="text-gold">{t("section.app.eyebrow")}</span>
              </div>
              <h2 className="text-3xl lg:text-5xl font-bold tracking-tight text-foreground" style={{ fontFamily: "var(--font-playfair), serif" }}>
                {t("section.app.title")}
              </h2>
              <p className="mt-4 text-muted-foreground lg:text-lg max-w-md">
                {t("section.app.desc")}
              </p>

              {/* Features */}
              <div className="mt-6 space-y-3">
                {[
                  "Exclusive app-only deals up to 30% off",
                  "Offline access to all your bookings",
                  "Instant 24/7 chat support",
                  "Real-time booking notifications",
                ].map((feat, i) => (
                  <ScrollAnimation key={feat} variant="fadeInUp" delay={0.1 * i}>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-gold/15 flex items-center justify-center shrink-0">
                        <Star className="w-3 h-3 text-gold fill-gold" />
                      </div>
                      <span className="text-sm text-foreground/80">{feat}</span>
                    </div>
                  </ScrollAnimation>
                ))}
              </div>

              {/* App store buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button className="flex items-center gap-3 px-5 py-3 rounded-xl bg-card border border-border-subtle hover:border-gold/40 transition-colors">
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="white">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  <div className="text-left">
                    <p className="text-[10px] text-muted-foreground">Download on the</p>
                    <p className="text-sm font-semibold text-foreground">App Store</p>
                  </div>
                </button>
                <button className="flex items-center gap-3 px-5 py-3 rounded-xl bg-card border border-border-subtle hover:border-gold/40 transition-colors">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#34A853" d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92z"/>
                    <path fill="#FBBC04" d="M16.81 15.02l-3.018-3.018 3.018-3.018 3.286 1.879c.926.529.926 1.748 0 2.277l-3.286 1.88z"/>
                    <path fill="#EA4335" d="M3.609 22.186L13.792 12 16.81 15.02l-9.487 5.42c-.713.407-1.494.373-2.024-.094.276.05.564.01.81-.16z"/>
                    <path fill="#4285F4" d="M3.609 1.814c.53-.467 1.31-.5 2.024-.094L15.12 7.14 13.792 8.47 3.609 1.814z"/>
                  </svg>
                  <div className="text-left">
                    <p className="text-[10px] text-muted-foreground">GET IT ON</p>
                    <p className="text-sm font-semibold text-foreground">Google Play</p>
                  </div>
                </button>
              </div>
            </div>
          </ScrollAnimation>

          {/* Right: phone mockup */}
          <ScrollAnimation variant="slideInRight" delay={0.2}>
            <div className="relative flex justify-center">
              <div className="relative w-64 h-[500px] rounded-[3rem] border-4 border-border-subtle bg-card overflow-hidden shadow-premium-lg">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-border-subtle rounded-b-2xl z-10" />
                {/* Screen content */}
                <div className="h-full bg-gradient-to-br from-background to-surface p-4 pt-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-light to-gold-dark" />
                    <div className="w-8 h-8 rounded-full bg-border-subtle" />
                  </div>
                  <div className="text-[10px] text-gold uppercase tracking-wider font-bold mb-1">Welcome back</div>
                  <div className="text-base font-bold text-foreground mb-4" style={{ fontFamily: "var(--font-playfair), serif" }}>Marco B.</div>
                  <div className="rounded-xl bg-card border border-border-subtle p-3 mb-3">
                    <div className="w-full h-20 rounded-lg bg-gradient-to-br from-surface-elevated to-surface mb-2" />
                    <div className="h-2 w-3/4 rounded-full bg-border-subtle mb-1" />
                    <div className="h-2 w-1/2 rounded-full bg-border-subtle" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl bg-card border border-border-subtle p-2">
                      <div className="w-8 h-8 rounded-lg bg-gold/10 mb-1" />
                      <div className="h-1.5 w-full rounded-full bg-border-subtle mb-1" />
                      <div className="h-1.5 w-2/3 rounded-full bg-border-subtle" />
                    </div>
                    <div className="rounded-xl bg-card border border-border-subtle p-2">
                      <div className="w-8 h-8 rounded-lg bg-gold/10 mb-1" />
                      <div className="h-1.5 w-full rounded-full bg-border-subtle mb-1" />
                      <div className="h-1.5 w-2/3 rounded-full bg-border-subtle" />
                    </div>
                  </div>
                </div>
              </div>
              {/* Gold glow */}
              <div className="absolute -inset-4 bg-gold/10 blur-3xl -z-10" />
            </div>
          </ScrollAnimation>
        </div>
      </div>
    </section>
  );
}
