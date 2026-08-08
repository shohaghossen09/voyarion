"use client";

import { useAppStore, type FavoriteItem } from "@/store/useAppStore";
import { Heart, Star, MapPin, ArrowRight, Bed, Maximize, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface HotelCardData {
  id: string;
  name: string;
  shortLocation: string;
  city: string;
  country: string;
  reviewScore: number;
  reviewCount: number;
  priceFrom: number;
  heroImage: string;
  images?: string[];
  amenities: string[];
  propertyType: string;
  starRating: number;
  featured?: boolean;
  destination?: { name: string } | null;
}

const AMENITY_LABELS: Record<string, string> = {
  pool: "Pool", spa: "Spa", fitness: "Gym", restaurant: "Restaurant", bar: "Bar",
  wifi: "Free WiFi", parking: "Parking", shuttle: "Airport Shuttle",
  concierge: "Concierge", "room-service": "Room Service", business: "Business Center",
  "pet-friendly": "Pet Friendly", beach: "Beach Access", "hot-tub": "Hot Tub",
  sauna: "Sauna", ac: "A/C", "ocean-view": "Ocean View", "mountain-view": "Mountain View",
  balcony: "Balcony", kitchenette: "Kitchenette",
};

export function HotelCard({ hotel, compact = false }: { hotel: HotelCardData; compact?: boolean }) {
  const { setView, toggleFavorite, isFavorited } = useAppStore();
  const fav = isFavorited(hotel.id);

  const onToggleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite({
      id: hotel.id, type: "HOTEL", name: hotel.name, image: hotel.heroImage,
      location: hotel.shortLocation, price: hotel.priceFrom, rating: hotel.reviewScore,
    } as FavoriteItem);
  };

  return (
    <article
      onClick={() => setView({ name: "hotel-detail", hotelId: hotel.id })}
      className="group premium-card bg-card border border-border/60 rounded-2xl overflow-hidden cursor-pointer"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={hotel.heroImage}
          alt={hotel.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        {hotel.featured && (
          <Badge className="absolute top-3 left-3 bg-gold text-gold-foreground border-0 hover:bg-gold">
            Featured
          </Badge>
        )}
        <button
          onClick={onToggleFav}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center hover:bg-white transition-colors"
          aria-label="Save"
        >
          <Heart className={cn("w-4 h-4 transition-all", fav ? "fill-destructive text-destructive" : "text-foreground/70")} />
        </button>
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur">
          <Star className="w-3 h-3 fill-gold text-gold" />
          <span className="text-xs font-bold text-foreground">{hotel.reviewScore.toFixed(1)}</span>
          <span className="text-[10px] text-foreground/60">({hotel.reviewCount})</span>
        </div>
      </div>

      <div className="p-4 lg:p-5">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-base lg:text-lg leading-tight truncate group-hover:text-primary transition-colors">
              {hotel.name}
            </h3>
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{hotel.shortLocation}</span>
            </div>
          </div>
          <Badge variant="outline" className="shrink-0 text-[10px] uppercase tracking-wider">
            {hotel.propertyType}
          </Badge>
        </div>

        {!compact && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {hotel.amenities.slice(0, 4).map((a) => (
              <span key={a} className="text-[11px] px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground font-medium">
                {AMENITY_LABELS[a] || a}
              </span>
            ))}
            {hotel.amenities.length > 4 && (
              <span className="text-[11px] px-2 py-0.5 text-muted-foreground font-medium">+{hotel.amenities.length - 4}</span>
            )}
          </div>
        )}

        <div className="flex items-end justify-between mt-4 pt-3 border-t border-border/60">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">From</p>
            <p className="font-bold text-lg lg:text-xl text-foreground">
              ${hotel.priceFrom}
              <span className="text-xs font-normal text-muted-foreground ml-1">/ night</span>
            </p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="text-primary hover:text-primary hover:bg-primary/10 -mr-2 group/btn"
          >
            View details
            <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover/btn:translate-x-0.5 transition-transform" />
          </Button>
        </div>
      </div>
    </article>
  );
}
