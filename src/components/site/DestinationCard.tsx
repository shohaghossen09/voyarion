"use client";

import { useAppStore } from "@/store/useAppStore";
import { ArrowRight, MapPin } from "lucide-react";

export interface DestinationCardData {
  id: string;
  slug: string;
  name: string;
  country: string;
  description: string;
  heroImage: string;
  propertyCount: number;
  carCount: number;
}

export function DestinationCard({ destination, large = false, onSelect }: { destination: DestinationCardData; large?: boolean; onSelect?: (d: DestinationCardData) => void }) {
  const { setView } = useAppStore();

  const handleClick = () => {
    if (onSelect) {
      onSelect(destination);
    } else {
      setView({ name: "destination-detail", destinationId: destination.id });
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative overflow-hidden rounded-2xl ${large ? "aspect-[4/5] lg:aspect-[3/4]" : "aspect-[3/4]"} premium-card cursor-pointer text-left bg-card border border-border-subtle`}
    >
      <img
        src={destination.heroImage}
        alt={destination.name}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      <div className="absolute inset-0 p-4 lg:p-6 flex flex-col justify-end text-white">
        <div className="flex items-center gap-1.5 text-xs mb-1.5 opacity-90">
          <MapPin className="w-3 h-3 text-gold" />
          <span>{destination.country}</span>
        </div>
        <h3 className={`font-bold leading-tight ${large ? "text-2xl lg:text-3xl" : "text-lg lg:text-xl"}`} style={{ fontFamily: "var(--font-playfair), serif" }}>
          {destination.name}
        </h3>
        <p className="text-xs opacity-80 mt-1">
          {destination.propertyCount} stays · {destination.carCount} cars
        </p>
        <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-gold opacity-0 group-hover:opacity-100 transition-opacity">
          Explore destination
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}
