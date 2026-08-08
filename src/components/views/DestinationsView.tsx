"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { DestinationCard, type DestinationCardData } from "@/components/site/DestinationCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Globe, ChevronLeft } from "lucide-react";

export function DestinationsView({ destinationId }: { destinationId?: string }) {
  const { setView } = useAppStore();
  const [destinations, setDestinations] = useState<DestinationCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDestination, setSelectedDestination] = useState<DestinationCardData | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/destinations");
        const data = await res.json();
        const dests = data.destinations || [];
        setDestinations(dests);
        // If destinationId is provided, find and select that destination
        if (destinationId) {
          const found = dests.find((d: DestinationCardData) => d.id === destinationId);
          if (found) setSelectedDestination(found);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [destinationId]);

  // If we have a selected destination (from route or click), show detail
  if (selectedDestination) {
    return (
      <DestinationDetail
        destination={selectedDestination}
        onBack={() => {
          setSelectedDestination(null);
          setView({ name: "destinations" });
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-border-subtle">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/10 text-gold text-xs font-medium mb-4">
              <Globe className="w-3.5 h-3.5" /> 92 countries · 1,800+ partners
            </div>
            <h1 className="text-3xl lg:text-5xl font-bold tracking-tight text-foreground" style={{ fontFamily: "var(--font-playfair), serif" }}>Explore destinations</h1>
            <p className="mt-3 text-muted-foreground">From the cliffs of Santorini to the beaches of Bali, discover handpicked stays and rides in the world's most beautiful places.</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
            {destinations.map(d => (
              <DestinationCard key={d.id} destination={d} large />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DestinationDetail({ destination, onBack }: { destination: DestinationCardData; onBack: () => void }) {
  const { setView } = useAppStore();
  const [hotels, setHotels] = useState<any[]>([]);
  const [cars, setCars] = useState<any[]>([]);
  const [tab, setTab] = useState<"hotels" | "cars">("hotels");

  useEffect(() => {
    (async () => {
      const [hRes, cRes] = await Promise.all([
        fetch(`/api/hotels?city=${encodeURIComponent(destination.name)}&limit=6`),
        fetch(`/api/cars?city=${encodeURIComponent(destination.name)}&limit=6`),
      ]);
      const [h, c] = await Promise.all([hRes.json(), cRes.json()]);
      setHotels(h.hotels || []);
      setCars(c.cars || []);
    })();
  }, [destination.id]);

  return (
    <div>
      <div className="relative aspect-[16/7] bg-surface">
        <img src={destination.heroImage} alt={destination.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="absolute bottom-6 left-0 right-0 mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 text-white">
          <button onClick={onBack} className="text-sm text-white/70 hover:text-white mb-3 flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" /> Back to destinations
          </button>
          <h1 className="text-4xl lg:text-6xl font-bold tracking-tight" style={{ fontFamily: "var(--font-playfair), serif" }}>{destination.name}</h1>
          <p className="mt-2 text-white/80 max-w-2xl">{destination.description}</p>
          <div className="mt-3 flex items-center gap-4 text-sm">
            <span>{destination.propertyCount} stays</span>
            <span>·</span>
            <span>{destination.carCount} cars</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab("hotels")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === "hotels" ? "bg-gold text-background" : "bg-surface text-foreground hover:bg-white/[0.04]"}`}
          >
            Hotels ({hotels.length})
          </button>
          <button
            onClick={() => setTab("cars")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === "cars" ? "bg-gold text-background" : "bg-surface text-foreground hover:bg-white/[0.04]"}`}
          >
            Cars ({cars.length})
          </button>
        </div>

        {tab === "hotels" && hotels.length === 0 && (
          <p className="text-center text-muted-foreground py-10">No hotels found in this destination.</p>
        )}
        {tab === "cars" && cars.length === 0 && (
          <p className="text-center text-muted-foreground py-10">No cars found in this destination.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tab === "hotels" && hotels.map(h => (
            <div key={h.id} onClick={() => setView({ name: "hotel-detail", hotelId: h.id })} className="cursor-pointer">
              <HotelMini hotel={h} />
            </div>
          ))}
          {tab === "cars" && cars.map(c => (
            <div key={c.id} onClick={() => setView({ name: "car-detail", carId: c.id })} className="cursor-pointer">
              <CarMini car={c} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HotelMini({ hotel }: any) {
  return (
    <div className="bg-card border border-border-subtle rounded-2xl overflow-hidden premium-card">
      <div className="aspect-[4/3] bg-surface">
        <img src={hotel.heroImage} alt={hotel.name} className="w-full h-full object-cover" />
      </div>
      <div className="p-4">
        <h3 className="font-semibold truncate text-foreground" style={{ fontFamily: "var(--font-playfair), serif" }}>{hotel.name}</h3>
        <p className="text-xs text-muted-foreground">{hotel.shortLocation}</p>
        <p className="mt-2 font-bold text-foreground">${hotel.priceFrom}<span className="text-xs font-normal text-muted-foreground">/night</span></p>
      </div>
    </div>
  );
}

function CarMini({ car }: any) {
  return (
    <div className="bg-card border border-border-subtle rounded-2xl overflow-hidden premium-card">
      <div className="aspect-[16/10] bg-surface">
        <img src={car.heroImage} alt={`${car.brand} ${car.model}`} className="w-full h-full object-cover" />
      </div>
      <div className="p-4">
        <h3 className="font-semibold truncate text-foreground" style={{ fontFamily: "var(--font-playfair), serif" }}>{car.brand} {car.model}</h3>
        <p className="text-xs text-muted-foreground">{car.locationCity}, {car.locationCountry}</p>
        <p className="mt-2 font-bold text-foreground">${car.dailyRate}<span className="text-xs font-normal text-muted-foreground">/day</span></p>
      </div>
    </div>
  );
}
