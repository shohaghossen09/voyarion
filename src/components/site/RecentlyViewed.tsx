"use client";

import { useAppStore } from "@/store/useAppStore";
import { Clock, X, ArrowRight, Star, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SmartImage } from "@/components/site/SmartImage";

export function RecentlyViewed() {
  const { recentlyViewed, setView, clearRecentlyViewed } = useAppStore();

  if (recentlyViewed.length === 0) return null;

  return (
    <section className="py-6">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gold" />
            <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: "var(--font-playfair), serif" }}>
              Recently viewed
            </h2>
            <span className="text-xs text-muted-foreground">({recentlyViewed.length})</span>
          </div>
          <button
            onClick={clearRecentlyViewed}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Clear
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto scrollbar-premium pb-2 -mx-1 px-1">
          {recentlyViewed.map((item) => (
            <div
              key={item.id}
              onClick={() => setView(item.type === "HOTEL" ? { name: "hotel-detail", hotelId: item.id } : { name: "car-detail", carId: item.id })}
              className="group shrink-0 w-56 cursor-pointer bg-card border border-border-subtle rounded-xl overflow-hidden premium-card"
            >
              <div className="relative aspect-[4/3] bg-surface overflow-hidden">
                <SmartImage
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  fallbackText={item.type}
                />
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur border border-white/10 text-[10px] font-semibold text-white uppercase tracking-wider">
                  {item.type}
                </div>
              </div>
              <div className="p-3">
                <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-gold transition-colors" style={{ fontFamily: "var(--font-playfair), serif" }}>
                  {item.name}
                </h3>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                  <MapPin className="w-2.5 h-2.5 text-gold/60" />
                  <span className="truncate">{item.location}</span>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-border-subtle">
                  <div>
                    <span className="text-[10px] text-muted-foreground">From</span>
                    <p className="text-sm font-bold text-foreground">
                      ${item.price}
                      <span className="text-[10px] font-normal text-muted-foreground">/{item.type === "HOTEL" ? "night" : "day"}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-0.5 text-xs">
                    <Star className="w-3 h-3 fill-gold text-gold" />
                    <span className="font-semibold text-foreground">{item.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
