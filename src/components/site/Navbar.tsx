"use client";

import { useState, useEffect } from "react";
import {
  Menu, X, Heart, User, Bell, LogOut, LayoutDashboard,
  Car as CarIcon, Building2, ShieldCheck, Globe, ChevronDown, Sparkles,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const NAV_LINKS = [
  { label: "Hotels", view: { name: "hotels" } as const, icon: Building2 },
  { label: "Cars", view: { name: "cars" } as const, icon: CarIcon },
  { label: "Destinations", view: { name: "destinations" } as const, icon: Globe },
  { label: "Deals", view: { name: "deals" } as const, icon: Sparkles },
  { label: "About", view: { name: "about" } as const, icon: null },
  { label: "Help", view: { name: "help" } as const, icon: null },
];

export function Navbar() {
  const { user, setView, view, logout, favorites } = useAppStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(2);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Check if we're on a page with a dark hero (so navbar should be transparent with white text)
  const isHeroPage = view.name === "home";

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    logout();
    toast.success("You've been signed out");
    setView({ name: "home" });
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-background/85 backdrop-blur-xl border-b border-white/[0.06] shadow-premium"
          : isHeroPage
            ? "bg-transparent"
            : "bg-background border-b border-white/[0.04]"
      )}
    >
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 lg:h-20 items-center justify-between gap-4">
          {/* Logo */}
          <button
            onClick={() => setView({ name: "home" })}
            className="flex items-center gap-2.5 group shrink-0"
            aria-label="Voyarion home"
          >
            <div className="relative w-9 h-9 lg:w-10 lg:h-10 rounded-lg bg-gradient-to-br from-gold-light to-gold-dark flex items-center justify-center shadow-gold-glow group-hover:scale-105 transition-transform">
              <svg viewBox="0 0 24 24" className="w-5 h-5 lg:w-6 lg:h-6 text-background" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6l-8-4z"/>
                <path d="M9 12l2 2 4-4" stroke="#0A0A0A" strokeWidth="2.5"/>
              </svg>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-lg lg:text-xl font-bold tracking-tight text-foreground" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                Voyarion
              </span>
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-gold hidden sm:block">
                Stay & Ride
              </span>
            </div>
          </button>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = view.name === link.view.name;
              return (
                <button
                  key={link.label}
                  onClick={() => setView(link.view)}
                  className={cn(
                    "relative px-3.5 py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "text-gold"
                      : "text-foreground/70 hover:text-foreground hover:bg-white/[0.04]"
                  )}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute left-1/2 -translate-x-1/2 bottom-0.5 w-1 h-1 rounded-full bg-gold" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Favorites */}
            <button
              onClick={() => user ? setView({ name: "wishlist" }) : setView({ name: "auth", mode: "login" })}
              className="hidden sm:flex relative w-10 h-10 items-center justify-center rounded-full hover:bg-white/[0.06] transition-colors"
              aria-label="Saved listings"
            >
              <Heart className="w-[18px] h-[18px] text-foreground/70" />
              {favorites.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-gold text-[10px] font-bold text-gold-foreground flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </button>

            {/* Notifications */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hidden sm:flex relative w-10 h-10 items-center justify-center rounded-full hover:bg-white/[0.06] transition-colors">
                    <Bell className="w-[18px] h-[18px] text-foreground/70" />
                    {notifCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-destructive text-[10px] font-bold text-white flex items-center justify-center">
                        {notifCount}
                      </span>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 bg-surface-elevated border-border-subtle">
                  <DropdownMenuLabel className="text-sm font-semibold text-foreground">Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border-subtle" />
                  <DropdownMenuItem className="flex flex-col items-start gap-1 py-3 cursor-pointer text-foreground/80 hover:bg-white/[0.04]">
                    <span className="text-sm font-medium text-foreground">Booking confirmed</span>
                    <span className="text-xs text-muted-foreground">Your reservation at Aegean Pearl is confirmed.</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex flex-col items-start gap-1 py-3 cursor-pointer text-foreground/80 hover:bg-white/[0.04]">
                    <span className="text-sm font-medium text-foreground">Payment received</span>
                    <span className="text-xs text-muted-foreground">We processed your payment of $1,840.00.</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Auth / user menu */}
            {!user ? (
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setView({ name: "auth", mode: "login" })}
                  className="text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-white/[0.04]"
                >
                  Sign in
                </Button>
                <Button
                  size="sm"
                  onClick={() => setView({ name: "auth", mode: "register" })}
                  className="btn-gold"
                >
                  Sign up
                </Button>
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-white/[0.06] transition-colors">
                    <Avatar className="w-8 h-8 ring-2 ring-gold/30">
                      <AvatarImage src={user.avatarUrl} alt={user.name} />
                      <AvatarFallback className="bg-gold/10 text-gold text-xs font-semibold">
                        {user.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-surface-elevated border-border-subtle">
                  <div className="px-2 py-2">
                    <p className="text-sm font-semibold text-foreground" style={{ fontFamily: "var(--font-playfair), serif" }}>{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    <Badge className="mt-2 text-[10px] uppercase tracking-wider bg-gold/10 text-gold border border-gold/20">
                      {user.role.replace("_", " ")}
                    </Badge>
                  </div>
                  <DropdownMenuSeparator className="bg-border-subtle" />
                  <DropdownMenuItem onClick={() => setView({ name: "customer-dashboard", tab: "bookings" })} className="cursor-pointer text-foreground/80 hover:bg-white/[0.04] hover:text-foreground">
                    <User className="w-4 h-4 mr-2" /> My dashboard
                  </DropdownMenuItem>
                  {user.role === "OWNER" && (
                    <DropdownMenuItem onClick={() => setView({ name: "owner-portal", tab: "dashboard" })} className="cursor-pointer text-foreground/80 hover:bg-white/[0.04] hover:text-foreground">
                      <CarIcon className="w-4 h-4 mr-2" /> Owner portal
                    </DropdownMenuItem>
                  )}
                  {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
                    <DropdownMenuItem onClick={() => setView({ name: "admin-panel", tab: "dashboard" })} className="cursor-pointer text-foreground/80 hover:bg-white/[0.04] hover:text-foreground">
                      <ShieldCheck className="w-4 h-4 mr-2" /> Admin panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => setView({ name: "wishlist" })} className="cursor-pointer text-foreground/80 hover:bg-white/[0.04] hover:text-foreground">
                    <Heart className="w-4 h-4 mr-2" /> Wishlist
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border-subtle" />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive hover:bg-destructive/10">
                    <LogOut className="w-4 h-4 mr-2" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/[0.06] transition-colors">
                  <Menu className="w-5 h-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-[380px] p-0 bg-background border-border-subtle">
                <SheetHeader className="px-6 pt-6 pb-4 border-b border-border-subtle">
                  <SheetTitle className="text-left flex items-center gap-2 text-foreground" style={{ fontFamily: "var(--font-playfair), serif" }}>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-light to-gold-dark flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-4 h-4 text-background" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <path d="M12 2L4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6l-8-4z"/>
                      </svg>
                    </div>
                    Voyarion
                  </SheetTitle>
                </SheetHeader>
                <div className="px-6 py-4 space-y-1">
                  {NAV_LINKS.map((link) => (
                    <button
                      key={link.label}
                      onClick={() => { setView(link.view); setMobileOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/[0.04] text-left text-sm font-medium text-foreground/80"
                    >
                      {link.icon && <link.icon className="w-4 h-4 text-gold" />}
                      {link.label}
                    </button>
                  ))}
                </div>
                <div className="border-t border-border-subtle px-6 py-4 space-y-2">
                  {!user ? (
                    <>
                      <Button className="w-full btn-gold" onClick={() => { setView({ name: "auth", mode: "login" }); setMobileOpen(false); }}>
                        Sign in
                      </Button>
                      <Button variant="outline" className="w-full btn-gold-outline border-gold text-gold" onClick={() => { setView({ name: "auth", mode: "register" }); setMobileOpen(false); }}>
                        Create account
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-border-subtle">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={user.avatarUrl} />
                          <AvatarFallback className="bg-gold/10 text-gold">{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate text-foreground" style={{ fontFamily: "var(--font-playfair), serif" }}>{user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full justify-start border-border-subtle text-foreground/80 hover:text-foreground hover:bg-white/[0.04]" onClick={() => { setView({ name: "customer-dashboard", tab: "bookings" }); setMobileOpen(false); }}>
                        <LayoutDashboard className="w-4 h-4 mr-2 text-gold" /> My dashboard
                      </Button>
                      {user.role === "OWNER" && (
                        <Button variant="outline" className="w-full justify-start border-border-subtle text-foreground/80 hover:text-foreground hover:bg-white/[0.04]" onClick={() => { setView({ name: "owner-portal", tab: "dashboard" }); setMobileOpen(false); }}>
                          <CarIcon className="w-4 h-4 mr-2 text-gold" /> Owner portal
                        </Button>
                      )}
                      {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
                        <Button variant="outline" className="w-full justify-start border-border-subtle text-foreground/80 hover:text-foreground hover:bg-white/[0.04]" onClick={() => { setView({ name: "admin-panel", tab: "dashboard" }); setMobileOpen(false); }}>
                          <ShieldCheck className="w-4 h-4 mr-2 text-gold" /> Admin panel
                        </Button>
                      )}
                      <Button variant="ghost" className="w-full justify-start text-destructive hover:bg-destructive/10" onClick={handleLogout}>
                        <LogOut className="w-4 h-4 mr-2" /> Sign out
                      </Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
