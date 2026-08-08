"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Search, MapPin, Calendar, Users, Clock, Building2, Car as CarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchWidgetProps {
  variant?: "hero" | "compact";
}

export function SearchWidget({ variant = "hero" }: SearchWidgetProps) {
  const { search, setSearch, setView } = useAppStore();
  const [tab, setTab] = useState<"HOTEL" | "CAR">(search.type);

  const handleSearch = () => {
    setSearch({ type: tab });
    if (tab === "HOTEL") setView({ name: "hotels" });
    else setView({ name: "cars" });
  };

  return (
    <div className={cn(
      "glass-card rounded-2xl p-2",
      variant === "hero" && "max-w-5xl"
    )}>
      {/* Tabs */}
      <div className="flex gap-1 p-1.5">
        {[
          { key: "HOTEL", label: "Hotels", icon: Building2 },
          { key: "CAR", label: "Cars", icon: CarIcon },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key as any); setSearch({ type: t.key as any }); }}
            className={cn(
              "flex items-center gap-2 px-4 lg:px-6 py-2.5 rounded-lg text-sm font-semibold transition-all",
              tab === t.key
                ? "bg-gradient-to-r from-gold-light to-gold-dark text-background shadow-gold-glow"
                : "text-white/70 hover:bg-white/[0.06]"
            )}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Form */}
      <div className="p-1.5">
        {tab === "HOTEL" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-2">
            <FieldGroup className="lg:col-span-3" icon={MapPin} label="Destination">
              <input
                type="text"
                placeholder="Where to?"
                value={search.destination}
                onChange={(e) => setSearch({ destination: e.target.value })}
                className="w-full bg-transparent outline-none text-sm font-medium placeholder:text-muted-deep text-foreground"
              />
            </FieldGroup>
            <FieldGroup className="lg:col-span-2" icon={Calendar} label="Check-in">
              <input
                type="date"
                value={search.checkIn}
                onChange={(e) => setSearch({ checkIn: e.target.value })}
                className="w-full bg-transparent outline-none text-sm font-medium text-foreground"
              />
            </FieldGroup>
            <FieldGroup className="lg:col-span-2" icon={Calendar} label="Check-out">
              <input
                type="date"
                value={search.checkOut}
                onChange={(e) => setSearch({ checkOut: e.target.value })}
                className="w-full bg-transparent outline-none text-sm font-medium text-foreground"
              />
            </FieldGroup>
            <FieldGroup className="lg:col-span-2" icon={Users} label="Guests">
              <select
                value={search.guests}
                onChange={(e) => setSearch({ guests: parseInt(e.target.value) })}
                className="w-full bg-transparent outline-none text-sm font-medium text-foreground"
              >
                {[1,2,3,4,5,6].map(n => <option key={n} value={n} className="bg-surface-elevated">{n} {n===1 ? "Guest" : "Guests"}</option>)}
              </select>
            </FieldGroup>
            <FieldGroup className="lg:col-span-2" icon={Users} label="Rooms">
              <select
                value={search.rooms}
                onChange={(e) => setSearch({ rooms: parseInt(e.target.value) })}
                className="w-full bg-transparent outline-none text-sm font-medium text-foreground"
              >
                {[1,2,3,4].map(n => <option key={n} value={n} className="bg-surface-elevated">{n} {n===1 ? "Room" : "Rooms"}</option>)}
              </select>
            </FieldGroup>
            <div className="lg:col-span-1 flex">
              <Button
                onClick={handleSearch}
                className="btn-gold w-full h-full rounded-lg min-h-[56px]"
              >
                <Search className="w-4 h-4 lg:mr-1" />
                <span className="hidden lg:inline">Search</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-2">
            <FieldGroup className="lg:col-span-2" icon={MapPin} label="Pickup">
              <input
                type="text"
                placeholder="Pickup location"
                value={search.pickupLocation}
                onChange={(e) => setSearch({ pickupLocation: e.target.value })}
                className="w-full bg-transparent outline-none text-sm font-medium placeholder:text-muted-deep text-foreground"
              />
            </FieldGroup>
            <FieldGroup className="lg:col-span-2" icon={Calendar} label="Pickup date">
              <input
                type="date"
                value={search.pickupDate}
                onChange={(e) => setSearch({ pickupDate: e.target.value })}
                className="w-full bg-transparent outline-none text-sm font-medium text-foreground"
              />
            </FieldGroup>
            <FieldGroup className="lg:col-span-1" icon={Clock} label="Time">
              <input
                type="time"
                value={search.pickupTime}
                onChange={(e) => setSearch({ pickupTime: e.target.value })}
                className="w-full bg-transparent outline-none text-sm font-medium text-foreground"
              />
            </FieldGroup>
            <FieldGroup className="lg:col-span-2" icon={MapPin} label="Return">
              <input
                type="text"
                placeholder="Return location"
                value={search.returnLocation}
                onChange={(e) => setSearch({ returnLocation: e.target.value })}
                className="w-full bg-transparent outline-none text-sm font-medium placeholder:text-muted-deep text-foreground"
              />
            </FieldGroup>
            <FieldGroup className="lg:col-span-2" icon={Calendar} label="Return date">
              <input
                type="date"
                value={search.returnDate}
                onChange={(e) => setSearch({ returnDate: e.target.value })}
                className="w-full bg-transparent outline-none text-sm font-medium text-foreground"
              />
            </FieldGroup>
            <FieldGroup className="lg:col-span-1" icon={Clock} label="Time">
              <input
                type="time"
                value={search.returnTime}
                onChange={(e) => setSearch({ returnTime: e.target.value })}
                className="w-full bg-transparent outline-none text-sm font-medium text-foreground"
              />
            </FieldGroup>
            <div className="lg:col-span-2 flex">
              <Button
                onClick={handleSearch}
                className="btn-gold w-full h-full rounded-lg min-h-[56px]"
              >
                <Search className="w-4 h-4 lg:mr-2" />
                <span>Search</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FieldGroup({
  icon: Icon, label, children, className,
}: { icon: any; label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn(
      "flex items-center gap-3 px-4 py-2.5 rounded-lg border border-white/[0.06] hover:border-gold/30 transition-colors cursor-text bg-white/[0.03] min-h-[60px]",
      className
    )}>
      <Icon className="w-4 h-4 text-gold/70 shrink-0" />
      <div className="flex-1 min-w-0">
        <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">{label}</span>
        {children}
      </div>
    </label>
  );
}
