"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HotelCard } from "@/components/site/HotelCard";
import { CarCard } from "@/components/site/CarCard";
import { Calendar, Heart, User, Settings, Bell, ChevronLeft, Download, X, Star, Clock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { SmartImage } from "@/components/site/SmartImage";

export function CustomerDashboardView({ tab: initialTab }: { tab?: string }) {
  const { user, setView, favorites } = useAppStore();
  const [tab, setTab] = useState(initialTab || "bookings");
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  useEffect(() => {
    if (!user) {
      setView({ name: "auth", mode: "login" });
      return;
    }
    loadBookings();
  }, [user]);

  const loadBookings = async () => {
    try {
      const res = await fetch("/api/bookings");
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleCancel = async (bookingId: string) => {
    if (!confirm("Cancel this booking? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reason: "Customer cancelled" }) });
      if (res.ok) {
        toast.success("Booking cancelled. Refund will be processed.");
        loadBookings();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to cancel");
      }
    } catch (e: any) { toast.error(e.message); }
  };

  if (!user) return null;

  const upcoming = bookings.filter(b => ["PENDING", "CONFIRMED"].includes(b.bookingStatus) && new Date(b.startDate) > new Date());
  const active = bookings.filter(b => b.bookingStatus === "CONFIRMED" && new Date(b.startDate) <= new Date() && new Date(b.endDate) >= new Date());
  const completed = bookings.filter(b => b.bookingStatus === "COMPLETED");
  const cancelled = bookings.filter(b => b.bookingStatus === "CANCELLED");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border-subtle">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-8">
          <button onClick={() => setView({ name: "home" })} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ChevronLeft className="w-4 h-4" /> Back to home
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 ring-4 ring-gold/20">
                <AvatarImage src={user.avatarUrl} />
                <AvatarFallback className="bg-gold/10 text-gold text-xl font-bold">{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground" style={{ fontFamily: "var(--font-playfair), serif" }}>{user.name}</h1>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge className="text-[10px] uppercase tracking-wider bg-gold/15 text-gold border border-gold/30">{user.role.replace("_", " ")}</Badge>
                  <Badge variant="outline" className="text-[10px] uppercase tracking-wider border-border-subtle text-muted-foreground">Gold Member</Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-center px-4 py-2 rounded-xl bg-surface border border-border-subtle">
                <p className="text-xs text-muted-foreground">Loyalty points</p>
                <p className="text-lg font-bold text-gradient-gold" style={{ fontFamily: "var(--font-playfair), serif" }}>2,450</p>
              </div>
              <div className="text-center px-4 py-2 rounded-xl bg-surface border border-border-subtle">
                <p className="text-xs text-muted-foreground">Member since</p>
                <p className="text-sm font-bold text-foreground">2026</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <QuickStat label="Upcoming" value={upcoming.length} icon={Calendar} />
          <QuickStat label="Active" value={active.length} icon={Clock} />
          <QuickStat label="Completed" value={completed.length} icon={CheckCircle2} />
          <QuickStat label="Saved" value={favorites.length} icon={Heart} />
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-6 h-auto">
            <TabsTrigger value="bookings" className="flex items-center gap-1.5 py-2.5 data-[state=active]:bg-gold data-[state=active]:text-background"><Calendar className="w-4 h-4" /> Bookings</TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-1.5 py-2.5 data-[state=active]:bg-gold data-[state=active]:text-background"><Heart className="w-4 h-4" /> Favorites</TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-1.5 py-2.5 data-[state=active]:bg-gold data-[state=active]:text-background"><User className="w-4 h-4" /> Profile</TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-1.5 py-2.5 data-[state=active]:bg-gold data-[state=active]:text-background"><Bell className="w-4 h-4" /> Alerts</TabsTrigger>
          </TabsList>

          {/* Bookings */}
          <TabsContent value="bookings">
            <div className="space-y-6">
              {loading ? (
                <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}</div>
              ) : bookings.length === 0 ? (
                <EmptyState title="No bookings yet" desc="Discover premium hotels and cars to start your journey." action={() => setView({ name: "home" })} actionLabel="Browse listings" />
              ) : (
                <div className="space-y-4">
                  {bookings.map(b => (
                    <BookingCard key={b.id} booking={b} onView={() => setSelectedBooking(b)} onCancel={() => handleCancel(b.id)} onTrack={() => setView({ name: "booking-tracking", bookingId: b.id })} />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Favorites */}
          <TabsContent value="favorites">
            <div>
              <h2 className="text-lg font-bold mb-4">Saved listings</h2>
              {favorites.length === 0 ? (
                <EmptyState title="No saved listings" desc="Tap the heart icon on hotels and cars to save them here." action={() => setView({ name: "hotels" })} actionLabel="Browse hotels" />
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {favorites.map(f => (
                    <div key={f.id} className="bg-card border border-border/60 rounded-2xl overflow-hidden">
                      <div className="aspect-[4/3] bg-surface">
                        <SmartImage src={f.image} alt={f.name} className="w-full h-full object-cover" fallbackText="Image" />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold">{f.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{f.location}</p>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/60">
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">From</p>
                            <p className="font-bold">${f.price} <span className="text-xs font-normal text-muted-foreground">/{f.type === "HOTEL" ? "night" : "day"}</span></p>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => setView(f.type === "HOTEL" ? { name: "hotel-detail", hotelId: f.id } : { name: "car-detail", carId: f.id })}>
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Profile */}
          <TabsContent value="profile">
            <div className="max-w-2xl bg-card border border-border/60 rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-5">Profile information</h2>
              <div className="space-y-4">
                <ProfileField label="Full name" value={user.name} />
                <ProfileField label="Email" value={user.email} />
                <ProfileField label="Phone" value={user.phone || "Not set"} />
                <ProfileField label="Role" value={user.role} />
                <div className="pt-4 border-t border-border/60">
                  <Button variant="outline" onClick={() => toast.info("Profile editing coming soon")}>
                    <Settings className="w-4 h-4 mr-2" /> Edit profile
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications">
            <div className="max-w-2xl space-y-3">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Recent notifications</h2>
                <Button variant="outline" size="sm" onClick={() => toast.success("All marked as read")}>Mark all read</Button>
              </div>
              {[
                { title: "Booking confirmed", desc: "Your hotel reservation at Aegean Pearl is confirmed.", time: "2 hours ago", unread: true },
                { title: "Payment received", desc: "We processed your payment of $1,840.00.", time: "1 day ago", unread: true },
                { title: "Welcome to Voyarion", desc: "Complete your profile to get personalized recommendations.", time: "1 week ago", unread: false },
              ].map((n, i) => (
                <div key={i} className={`p-4 rounded-xl border ${n.unread ? "bg-gold/5 border-primary/30" : "bg-card border-border/60"}`}>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-gold/10 flex items-center justify-center"><Bell className="w-4 h-4 text-gold" /></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm">{n.title}</p>
                        <span className="text-[10px] text-muted-foreground">{n.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{n.desc}</p>
                    </div>
                    {n.unread && <span className="w-2 h-2 rounded-full bg-gold mt-1.5" />}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Booking detail modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedBooking(null)}>
          <div className="bg-card rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto scrollbar-premium" onClick={e => e.stopPropagation()}>
            <div className="relative">
              <SmartImage src={selectedBooking.hotel?.heroImage || selectedBooking.car?.heroImage} alt="" className="w-full aspect-[16/9] object-cover rounded-t-2xl" fallbackText="Image" />
              <button onClick={() => setSelectedBooking(null)} className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Badge>{selectedBooking.bookingStatus}</Badge>
                <Badge variant="outline">Ref: {selectedBooking.reference}</Badge>
              </div>
              <h3 className="text-xl font-bold">{selectedBooking.hotel?.name || `${selectedBooking.car?.brand} ${selectedBooking.car?.model}`}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedBooking.hotel?.shortLocation || `${selectedBooking.car?.locationCity}, ${selectedBooking.car?.locationCountry}`}
              </p>
              <div className="grid grid-cols-2 gap-3 mt-5 text-sm">
                <Detail label="Start date" value={new Date(selectedBooking.startDate).toLocaleDateString()} />
                <Detail label="End date" value={new Date(selectedBooking.endDate).toLocaleDateString()} />
                <Detail label={selectedBooking.bookingType === "HOTEL" ? "Nights" : "Days"} value={String(selectedBooking.nights)} />
                <Detail label="Guests" value={String(selectedBooking.guests)} />
              </div>
              <div className="mt-5 pt-5 border-t border-border/60 space-y-2 text-sm">
                <Row label="Base price" value={`$${selectedBooking.basePrice.toFixed(2)}`} />
                <Row label="Service fee" value={`$${selectedBooking.fees.toFixed(2)}`} />
                <Row label="Taxes" value={`$${selectedBooking.taxes.toFixed(2)}`} />
                <div className="flex items-center justify-between pt-2 border-t border-border/60">
                  <span className="font-semibold">Total paid</span>
                  <span className="text-xl font-bold">${selectedBooking.totalAmount.toFixed(2)}</span>
                </div>
              </div>
              <div className="mt-5 flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => toast.success("Confirmation downloaded")}>
                  <Download className="w-4 h-4 mr-2" /> Download
                </Button>
                {["PENDING", "CONFIRMED"].includes(selectedBooking.bookingStatus) && (
                  <Button variant="destructive" className="flex-1" onClick={() => { handleCancel(selectedBooking.id); setSelectedBooking(null); }}>
                    Cancel booking
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function QuickStat({ label, value, icon: Icon }: { label: string; value: number; icon: any }) {
  return (
    <div className="stat-card flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-gold" />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function BookingCard({ booking, onView, onCancel, onTrack }: { booking: any; onView: () => void; onCancel: () => void; onTrack: () => void }) {
  const statusColors: any = {
    PENDING: "bg-amber-100 text-amber-700",
    CONFIRMED: "bg-green-100 text-green-700",
    COMPLETED: "bg-blue-100 text-blue-700",
    CANCELLED: "bg-red-100 text-red-700",
    REFUNDED: "bg-purple-100 text-purple-700",
  };
  const listing = booking.hotel || booking.car;
  const img = booking.hotel?.heroImage || booking.car?.heroImage;
  const name = booking.hotel?.name || `${booking.car?.brand} ${booking.car?.model}`;
  const location = booking.hotel?.shortLocation || `${booking.car?.locationCity}, ${booking.car?.locationCountry}`;

  return (
    <div className="bg-card border border-border/60 rounded-2xl overflow-hidden flex flex-col sm:flex-row hover:shadow-premium transition-shadow">
      <div className="sm:w-48 aspect-[4/3] sm:aspect-auto bg-surface shrink-0">
        <SmartImage src={img} alt={name} className="w-full h-full object-cover" fallbackText="Image" />
      </div>
      <div className="flex-1 p-4 lg:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge className={statusColors[booking.bookingStatus]}>{booking.bookingStatus}</Badge>
            <Badge variant="outline" className="text-[10px]">{booking.bookingType}</Badge>
            {booking.paymentStatus === "PAID" && <span className="text-[10px] text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Paid</span>}
          </div>
          <h3 className="font-semibold">{name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{location}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(booking.startDate).toLocaleDateString()} → {new Date(booking.endDate).toLocaleDateString()}</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {booking.nights} {booking.bookingType === "HOTEL" ? "nights" : "days"}</span>
          </div>
        </div>
        <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-1">
          <p className="text-lg font-bold">${booking.totalAmount.toFixed(2)}</p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onTrack} className="border-gold/30 text-gold hover:bg-gold/10 hover:text-gold">Track</Button>
            <Button size="sm" variant="outline" onClick={onView}>View</Button>
            {["PENDING", "CONFIRMED"].includes(booking.bookingStatus) && (
              <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={onCancel}>Cancel</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-surface/30">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-2 rounded-lg bg-surface/30">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold mt-0.5">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function EmptyState({ title, desc, action, actionLabel }: { title: string; desc: string; action: () => void; actionLabel: string }) {
  return (
    <div className="text-center py-20 bg-card border border-border/60 rounded-2xl">
      <div className="w-16 h-16 mx-auto rounded-full bg-surface flex items-center justify-center">
        <Heart className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">{desc}</p>
      <Button className="mt-4" onClick={action}>{actionLabel}</Button>
    </div>
  );
}
