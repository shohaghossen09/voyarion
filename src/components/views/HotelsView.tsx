"use client";

import { useEffect, useState, useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import { HotelCard, type HotelCardData } from "@/components/site/HotelCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Search, SlidersHorizontal, X, Star, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const PROPERTY_TYPES = [
  { value: "HOTEL", label: "Hotel" },
  { value: "RESORT", label: "Resort" },
  { value: "VILLA", label: "Villa" },
  { value: "APARTMENT", label: "Apartment" },
  { value: "BOUTIQUE", label: "Boutique" },
];

const AMENITIES = [
  { value: "pool", label: "Pool" },
  { value: "spa", label: "Spa" },
  { value: "fitness", label: "Fitness Center" },
  { value: "restaurant", label: "Restaurant" },
  { value: "bar", label: "Bar" },
  { value: "wifi", label: "Free WiFi" },
  { value: "parking", label: "Parking" },
  { value: "shuttle", label: "Airport Shuttle" },
  { value: "concierge", label: "Concierge" },
  { value: "beach", label: "Beach Access" },
  { value: "ocean-view", label: "Ocean View" },
  { value: "pet-friendly", label: "Pet Friendly" },
];

export function HotelsView() {
  const { search } = useAppStore();
  const [hotels, setHotels] = useState<HotelCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(search.destination);
  const [city, setCity] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [minRating, setMinRating] = useState(0);
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("recommended");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    setQ(search.destination);
  }, [search.destination]);

  useEffect(() => { loadHotels(); }, [q, city, priceRange, minRating, propertyTypes, amenities, sortBy]);

  const loadHotels = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q, city,
        minPrice: String(priceRange[0]),
        maxPrice: String(priceRange[1]),
        minRating: String(minRating),
        sortBy,
        limit: "30",
      });
      if (propertyTypes.length) params.set("propertyType", propertyTypes[0]);
      if (amenities.length) params.set("amenities", amenities.join(","));
      const res = await fetch(`/api/hotels?${params}`);
      const data = await res.json();
      setHotels(data.hotels || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleArr = (arr: string[], val: string, setter: (v: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);
  };

  const clearFilters = () => {
    setPriceRange([0, 2000]); setMinRating(0); setPropertyTypes([]); setAmenities([]); setQ(""); setCity("");
  };

  const activeFilterCount = (priceRange[0] > 0 || priceRange[1] < 2000 ? 1 : 0) + (minRating > 0 ? 1 : 0) + propertyTypes.length + amenities.length;

  const FiltersContent = (
    <div className="space-y-7">
      {/* Price */}
      <div>
        <h4 className="text-sm font-semibold mb-3">Price per night</h4>
        <div className="px-1">
          <Slider
            value={priceRange}
            onValueChange={(v) => setPriceRange([v[0], v[1]] as [number, number])}
            min={0}
            max={2000}
            step={50}
            className="mb-3"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}+</span>
          </div>
        </div>
      </div>

      {/* Rating */}
      <div>
        <h4 className="text-sm font-semibold mb-3">Guest rating</h4>
        <div className="space-y-2">
          {[4.5, 4.0, 3.5, 3.0].map(r => (
            <label key={r} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="rating"
                checked={minRating === r}
                onChange={() => setMinRating(r)}
                className="accent-primary"
              />
              <span className="text-sm flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-gold text-gold" /> {r}+ rating
              </span>
            </label>
          ))}
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="rating" checked={minRating === 0} onChange={() => setMinRating(0)} className="accent-primary" />
            <span className="text-sm">Any rating</span>
          </label>
        </div>
      </div>

      {/* Property Type */}
      <div>
        <h4 className="text-sm font-semibold mb-3">Property type</h4>
        <div className="space-y-2">
          {PROPERTY_TYPES.map(pt => (
            <label key={pt.value} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={propertyTypes.includes(pt.value)}
                onCheckedChange={() => toggleArr(propertyTypes, pt.value, setPropertyTypes)}
              />
              <span className="text-sm">{pt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div>
        <h4 className="text-sm font-semibold mb-3">Amenities</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-premium pr-1">
          {AMENITIES.map(a => (
            <label key={a.value} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={amenities.includes(a.value)}
                onCheckedChange={() => toggleArr(amenities, a.value, setAmenities)}
              />
              <span className="text-sm">{a.label}</span>
            </label>
          ))}
        </div>
      </div>

      {activeFilterCount > 0 && (
        <Button variant="outline" className="w-full" onClick={clearFilters}>
          <X className="w-4 h-4 mr-2" />
          Clear all filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Search header */}
      <div className="bg-card border-b border-border/60">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Find your perfect stay</h1>
              <p className="text-sm text-muted-foreground mt-1">Premium hotels, resorts, villas, and boutique properties worldwide.</p>
            </div>
            <div className="flex-1 lg:max-w-xl lg:ml-auto flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by destination, hotel name..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="pl-10 premium-input h-11"
                />
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-44 h-11">
                  <SelectValue />
                </SelectTrigger>
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
          {/* Sidebar */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-28 bg-card border border-border/60 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold flex items-center gap-2"><SlidersHorizontal className="w-4 h-4" /> Filters</h3>
                {activeFilterCount > 0 && <Badge className="bg-gold text-gold-foreground">{activeFilterCount}</Badge>}
              </div>
              {FiltersContent}
            </div>
          </aside>

          {/* Results */}
          <main className="flex-1 min-w-0">
            {/* Mobile filter button */}
            <div className="flex items-center justify-between mb-4 lg:hidden">
              <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline">
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Filters
                    {activeFilterCount > 0 && <Badge className="ml-2 bg-gold text-gold-foreground">{activeFilterCount}</Badge>}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full sm:w-[380px] overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="p-4">{FiltersContent}</div>
                </SheetContent>
              </Sheet>
              <span className="text-sm text-muted-foreground">{loading ? "Loading..." : `${hotels.length} hotels`}</span>
            </div>

            <div className="hidden lg:flex items-center justify-between mb-5">
              <p className="text-sm text-muted-foreground">
                {loading ? "Loading..." : <><span className="font-semibold text-foreground">{hotels.length}</span> hotels found</>}
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {[1,2,3,4,5,6,7,8,9].map(i => <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />)}
              </div>
            ) : hotels.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {hotels.map(h => <HotelCard key={h.id} hotel={h} />)}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20">
      <div className="w-16 h-16 mx-auto rounded-full bg-surface flex items-center justify-center">
        <MapPin className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">No hotels found</h3>
      <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters or search query.</p>
    </div>
  );
}
