"use client";

import { useAppStore, type FavoriteItem } from "@/store/useAppStore";
import { Heart, Star, MapPin, ArrowRight, Users, Cog, Fuel } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CarCardData {
  id: string;
  brand: string;
  model: string;
  year: number;
  vehicleType: string;
  transmission: string;
  fuelType: string;
  seats: number;
  doors: number;
  dailyRate: number;
  rating: number;
  reviewCount: number;
  heroImage: string;
  locationCity: string;
  locationCountry: string;
  features: string[];
  featured?: boolean;
  owner?: { displayName: string; verified: boolean };
}

const VEHICLE_TYPE_LABEL: Record<string, string> = {
  SEDAN: "Sedan", SUV: "SUV", LUXURY: "Luxury", SPORTS: "Sports",
  CONVERTIBLE: "Convertible", VAN: "Van", ELECTRIC: "Electric", ECONOMY: "Economy",
};

export function CarCard({ car, compact = false }: { car: CarCardData; compact?: boolean }) {
  const { setView, toggleFavorite, isFavorited } = useAppStore();
  const fav = isFavorited(car.id);

  const onToggleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite({
      id: car.id, type: "CAR", name: `${car.brand} ${car.model}`, image: car.heroImage,
      location: `${car.locationCity}, ${car.locationCountry}`, price: car.dailyRate, rating: car.rating,
    } as FavoriteItem);
  };

  return (
    <article
      onClick={() => setView({ name: "car-detail", carId: car.id })}
      className="group premium-card bg-card border border-border-subtle rounded-2xl overflow-hidden cursor-pointer"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-surface">
        <img
          src={car.heroImage}
          alt={`${car.brand} ${car.model}`}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        {car.featured && (
          <span className="absolute top-3 left-3 featured-badge">Featured</span>
        )}
        <button
          onClick={onToggleFav}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-black/70 transition-colors"
          aria-label="Save"
        >
          <Heart className={cn("w-4 h-4 transition-all", fav ? "fill-gold text-gold" : "text-white/80")} />
        </button>
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10">
          <Star className="w-3 h-3 fill-gold text-gold" />
          <span className="text-xs font-bold text-white">{car.rating.toFixed(1)}</span>
        </div>
        <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-gold/90 backdrop-blur text-background text-[10px] font-bold uppercase tracking-wider">
          {VEHICLE_TYPE_LABEL[car.vehicleType] || car.vehicleType}
        </div>
      </div>

      <div className="p-4 lg:p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-base lg:text-lg leading-tight truncate text-foreground group-hover:text-gold transition-colors" style={{ fontFamily: "var(--font-playfair), serif" }}>
              {car.brand} {car.model}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <span className="font-medium">{car.year}</span>
              <span className="gold-dot" />
              <span className="truncate">{car.locationCity}, {car.locationCountry}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
          <Spec icon={Users} label={`${car.seats} seats`} />
          <Spec icon={Cog} label={car.transmission === "AUTOMATIC" ? "Auto" : "Manual"} />
          <Spec icon={Fuel} label={car.fuelType} />
        </div>

        {!compact && car.features.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {car.features.slice(0, 3).map((f) => (
              <span key={f} className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] text-muted-foreground font-medium capitalize border border-border-subtle">
                {f.replace(/-/g, " ")}
              </span>
            ))}
            {car.features.length > 3 && (
              <span className="text-[10px] px-1.5 py-0.5 text-muted-foreground font-medium">+{car.features.length - 3}</span>
            )}
          </div>
        )}

        <div className="flex items-end justify-between mt-4 pt-3 border-t border-border-subtle">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">From</p>
            <p className="font-bold text-lg lg:text-xl text-foreground">
              ${car.dailyRate}
              <span className="text-xs font-normal text-muted-foreground ml-1">/ day</span>
            </p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="text-gold hover:text-gold hover:bg-gold/10 -mr-2 group/btn"
          >
            View details
            <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover/btn:translate-x-0.5 transition-transform" />
          </Button>
        </div>
      </div>
    </article>
  );
}

function Spec({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-muted-foreground">
      <Icon className="w-3.5 h-3.5 text-gold/70" />
      <span className="truncate font-medium">{label}</span>
    </div>
  );
}
