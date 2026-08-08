"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { CarCard, type CarCardData } from "@/components/site/CarCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Search, SlidersHorizontal, X, Star, MapPin } from "lucide-react";

const VEHICLE_TYPES = [
  { value: "LUXURY", label: "Luxury" },
  { value: "SPORTS", label: "Sports" },
  { value: "SUV", label: "SUV" },
  { value: "SEDAN", label: "Sedan" },
  { value: "ELECTRIC", label: "Electric" },
  { value: "ECONOMY", label: "Economy" },
  { value: "VAN", label: "Van" },
  { value: "CONVERTIBLE", label: "Convertible" },
];

const CAR_FEATURES = [
  { value: "leather-seats", label: "Leather Seats" },
  { value: "sunroof", label: "Sunroof" },
  { value: "gps-navigation", label: "GPS Navigation" },
  { value: "bluetooth", label: "Bluetooth" },
  { value: "backup-camera", label: "Backup Camera" },
  { value: "apple-carplay", label: "Apple CarPlay" },
  { value: "heated-seats", label: "Heated Seats" },
  { value: "premium-sound-system", label: "Premium Sound" },
  { value: "4wd", label: "4WD" },
  { value: "auto-emergency-brake", label: "Auto Emergency Brake" },
];

export function CarsView() {
  const { search } = useAppStore();
  const [cars, setCars] = useState<CarCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [city, setCity] = useState(search.pickupLocation);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [minRating, setMinRating] = useState(0);
  const [vehicleTypes, setVehicleTypes] = useState<string[]>([]);
  const [transmission, setTransmission] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [features, setFeatures] = useState<string[]>([]);
  const [minSeats, setMinSeats] = useState(0);
  const [sortBy, setSortBy] = useState("recommended");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => { loadCars(); }, [q, city, priceRange, minRating, vehicleTypes, transmission, fuelType, features, minSeats, sortBy]);

  const loadCars = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q, city,
        minPrice: String(priceRange[0]),
        maxPrice: String(priceRange[1]),
        minRating: String(minRating),
        minSeats: String(minSeats),
        sortBy,
        limit: "30",
      });
      if (vehicleTypes.length) params.set("vehicleType", vehicleTypes[0]);
      if (transmission) params.set("transmission", transmission);
      if (fuelType) params.set("fuelType", fuelType);
      if (features.length) params.set("features", features.join(","));
      const res = await fetch(`/api/cars?${params}`);
      const data = await res.json();
      setCars(data.cars || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const toggleArr = (arr: string[], val: string, setter: (v: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);
  };

  const clearFilters = () => {
    setPriceRange([0, 1000]); setMinRating(0); setVehicleTypes([]); setTransmission(""); setFuelType(""); setFeatures([]); setMinSeats(0); setQ(""); setCity("");
  };

  const activeFilterCount = (priceRange[0] > 0 || priceRange[1] < 1000 ? 1 : 0) + (minRating > 0 ? 1 : 0) + vehicleTypes.length + (transmission ? 1 : 0) + (fuelType ? 1 : 0) + features.length + (minSeats > 0 ? 1 : 0);

  const FiltersContent = (
    <div className="space-y-7">
      <div>
        <h4 className="text-sm font-semibold mb-3">Daily rate</h4>
        <Slider value={priceRange} onValueChange={(v) => setPriceRange([v[0], v[1]] as [number, number])} min={0} max={1000} step={25} className="mb-3" />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>${priceRange[0]}</span><span>${priceRange[1]}+</span>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-3">Minimum rating</h4>
        <div className="space-y-2">
          {[4.5, 4.0, 3.5].map(r => (
            <label key={r} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="rating" checked={minRating === r} onChange={() => setMinRating(r)} className="accent-primary" />
              <span className="text-sm flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-gold text-gold" /> {r}+</span>
            </label>
          ))}
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="rating" checked={minRating === 0} onChange={() => setMinRating(0)} className="accent-primary" />
            <span className="text-sm">Any rating</span>
          </label>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-3">Vehicle type</h4>
        <div className="space-y-2">
          {VEHICLE_TYPES.map(t => (
            <label key={t.value} className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={vehicleTypes.includes(t.value)} onCheckedChange={() => toggleArr(vehicleTypes, t.value, setVehicleTypes)} />
              <span className="text-sm">{t.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-3">Transmission</h4>
        <div className="space-y-2">
          {["AUTOMATIC", "MANUAL"].map(t => (
            <label key={t} className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={transmission === t} onCheckedChange={() => setTransmission(transmission === t ? "" : t)} />
              <span className="text-sm">{t.charAt(0) + t.slice(1).toLowerCase()}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-3">Fuel type</h4>
        <div className="space-y-2">
          {["PETROL", "DIESEL", "HYBRID", "ELECTRIC"].map(t => (
            <label key={t} className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={fuelType === t} onCheckedChange={() => setFuelType(fuelType === t ? "" : t)} />
              <span className="text-sm capitalize">{t.toLowerCase()}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-3">Minimum seats</h4>
        <div className="space-y-2">
          {[2, 4, 5, 7].map(s => (
            <label key={s} className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={minSeats === s} onCheckedChange={() => setMinSeats(minSeats === s ? 0 : s)} />
              <span className="text-sm">{s}+ seats</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-3">Features</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-premium pr-1">
          {CAR_FEATURES.map(f => (
            <label key={f.value} className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={features.includes(f.value)} onCheckedChange={() => toggleArr(features, f.value, setFeatures)} />
              <span className="text-sm">{f.label}</span>
            </label>
          ))}
        </div>
      </div>

      {activeFilterCount > 0 && (
        <Button variant="outline" className="w-full" onClick={clearFilters}>
          <X className="w-4 h-4 mr-2" /> Clear all filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-border/60">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Find your perfect ride</h1>
              <p className="text-sm text-muted-foreground mt-1">Luxury, sports, electric, and economy vehicles from verified owners.</p>
            </div>
            <div className="flex-1 lg:max-w-xl lg:ml-auto flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Brand, model, or location..." value={q} onChange={e => setQ(e.target.value)} className="pl-10 premium-input h-11" />
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-44 h-11"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="recommended">Recommended</SelectItem>
                  <SelectItem value="price_low">Price: Low to High</SelectItem>
                  <SelectItem value="price_high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest rated</SelectItem>
                  <SelectItem value="reviews">Most reviewed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-28 bg-card border border-border/60 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold flex items-center gap-2"><SlidersHorizontal className="w-4 h-4" /> Filters</h3>
                {activeFilterCount > 0 && <Badge className="bg-primary text-primary-foreground">{activeFilterCount}</Badge>}
              </div>
              {FiltersContent}
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4 lg:hidden">
              <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline">
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Filters
                    {activeFilterCount > 0 && <Badge className="ml-2 bg-primary text-primary-foreground">{activeFilterCount}</Badge>}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full sm:w-[380px] overflow-y-auto">
                  <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
                  <div className="p-4">{FiltersContent}</div>
                </SheetContent>
              </Sheet>
              <span className="text-sm text-muted-foreground">{loading ? "Loading..." : `${cars.length} cars`}</span>
            </div>

            <div className="hidden lg:flex items-center justify-between mb-5">
              <p className="text-sm text-muted-foreground">
                {loading ? "Loading..." : <><span className="font-semibold text-foreground">{cars.length}</span> cars found</>}
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {[1,2,3,4,5,6,7,8,9].map(i => <Skeleton key={i} className="aspect-[16/10] rounded-2xl" />)}
              </div>
            ) : cars.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">No cars found</h3>
                <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters or search query.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {cars.map(c => <CarCard key={c.id} car={c} />)}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
