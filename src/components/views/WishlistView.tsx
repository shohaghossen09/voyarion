"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, X, Plus, Folder, ArrowRight, Star, MapPin } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function WishlistView() {
  const { favorites, setView, toggleFavorite, wishlistCollections, createWishlistCollection, moveFavoriteToCollection } = useAppStore();
  const [activeCollection, setActiveCollection] = useState<string>("All");
  const [newCollectionName, setNewCollectionName] = useState("");
  const [showNewCollection, setShowNewCollection] = useState(false);

  const allCollections = ["All", ...wishlistCollections];

  const filteredFavorites = activeCollection === "All"
    ? favorites
    : favorites.filter(f => f.collection === activeCollection || (activeCollection === "Saved" && !f.collection));

  const handleCreateCollection = () => {
    if (!newCollectionName.trim()) return;
    createWishlistCollection(newCollectionName.trim());
    toast.success(`Collection "${newCollectionName.trim()}" created`);
    setNewCollectionName("");
    setShowNewCollection(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-border-subtle">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-8">
          <button onClick={() => setView({ name: "home" })} className="text-sm text-muted-foreground hover:text-foreground mb-3 flex items-center gap-1">
            <ArrowRight className="w-4 h-4 rotate-180" /> Back to home
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center">
              <Heart className="w-6 h-6 text-gold" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground" style={{ fontFamily: "var(--font-playfair), serif" }}>My Wishlist</h1>
              <p className="text-sm text-muted-foreground">{favorites.length} saved {favorites.length === 1 ? "listing" : "listings"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-8">
        {/* Collections */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto scrollbar-premium pb-2">
          {allCollections.map(col => (
            <button
              key={col}
              onClick={() => setActiveCollection(col)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                activeCollection === col
                  ? "bg-gold text-background"
                  : "bg-card border border-border-subtle text-muted-foreground hover:text-foreground hover:border-gold/30"
              )}
            >
              <Folder className="w-3.5 h-3.5" />
              {col}
              <span className={cn(
                "text-[10px] px-1.5 py-0.5 rounded-full",
                activeCollection === col ? "bg-background/20" : "bg-white/5"
              )}>
                {col === "All" ? favorites.length : favorites.filter(f => (f.collection === col) || (col === "Saved" && !f.collection)).length}
              </span>
            </button>
          ))}
          <button
            onClick={() => setShowNewCollection(!showNewCollection)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-card border border-dashed border-border-subtle text-muted-foreground hover:border-gold/40 hover:text-gold whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" /> New collection
          </button>
        </div>

        {showNewCollection && (
          <div className="flex gap-2 mb-6 p-4 rounded-xl bg-card border border-border-subtle">
            <Input
              placeholder="Collection name (e.g. Honeymoon, Summer 2026)"
              value={newCollectionName}
              onChange={e => setNewCollectionName(e.target.value)}
              className="premium-input"
              onKeyDown={e => e.key === "Enter" && handleCreateCollection()}
              autoFocus
            />
            <Button className="btn-gold" onClick={handleCreateCollection}>Create</Button>
            <Button variant="outline" className="border-border-subtle" onClick={() => setShowNewCollection(false)}>Cancel</Button>
          </div>
        )}

        {/* Favorites grid */}
        {filteredFavorites.length === 0 ? (
          <div className="text-center py-20 bg-card border border-border-subtle rounded-2xl">
            <div className="w-16 h-16 mx-auto rounded-full bg-surface flex items-center justify-center">
              <Heart className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground" style={{ fontFamily: "var(--font-playfair), serif" }}>
              {activeCollection === "All" ? "No saved listings yet" : `Nothing in "${activeCollection}" yet`}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">Tap the heart icon on hotels and cars to save them here.</p>
            <Button className="btn-gold mt-4" onClick={() => setView({ name: "hotels" })}>Browse listings</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredFavorites.map(fav => (
              <div key={fav.id} className="bg-card border border-border-subtle rounded-2xl overflow-hidden premium-card group">
                <div className="relative aspect-[4/3] bg-surface">
                  <img src={fav.image} alt={fav.name} className="w-full h-full object-cover" />
                  <button
                    onClick={() => { toggleFavorite(fav); toast.success("Removed from wishlist"); }}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-red-500/30 transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                  <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-gold/90 backdrop-blur text-background text-[10px] font-bold uppercase tracking-wider">
                    {fav.type}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-foreground truncate group-hover:text-gold transition-colors" style={{ fontFamily: "var(--font-playfair), serif" }}>{fav.name}</h3>
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3 text-gold/70" /> {fav.location}
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-xs">
                    <Star className="w-3 h-3 fill-gold text-gold" />
                    <span className="font-semibold text-foreground">{fav.rating.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-subtle">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">From</span>
                      <p className="font-bold text-foreground">${fav.price}<span className="text-xs font-normal text-muted-foreground">/{fav.type === "HOTEL" ? "night" : "day"}</span></p>
                    </div>
                    <Button size="sm" className="btn-gold" onClick={() => setView(fav.type === "HOTEL" ? { name: "hotel-detail", hotelId: fav.id } : { name: "car-detail", carId: fav.id })}>
                      View
                    </Button>
                  </div>
                  {/* Move to collection */}
                  <select
                    value={fav.collection || "Saved"}
                    onChange={e => { moveFavoriteToCollection(fav.id, e.target.value); toast.success(`Moved to ${e.target.value}`); }}
                    className="w-full mt-3 px-2 py-1.5 rounded-md bg-surface border border-border-subtle text-xs text-muted-foreground cursor-pointer"
                  >
                    {wishlistCollections.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
