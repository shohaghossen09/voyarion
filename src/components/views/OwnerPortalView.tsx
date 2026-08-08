"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SmartImage } from "@/components/site/SmartImage";
import {
  AreaChart, Area, BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
} from "recharts";
import {
  LayoutDashboard, Car as CarIcon, CalendarDays, DollarSign, Settings, ChevronLeft, Plus,
  TrendingUp, TrendingDown, Wallet, Clock, Users, Star, Edit, Eye, Trash, ArrowUpRight, Check, X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const VEHICLE_TYPES = ["LUXURY", "SPORTS", "SUV", "SEDAN", "ELECTRIC", "ECONOMY", "VAN", "CONVERTIBLE"];
const TRANSMISSION = ["AUTOMATIC", "MANUAL"];
const FUEL_TYPES = ["PETROL", "DIESEL", "HYBRID", "ELECTRIC"];
const ALL_FEATURES = ["leather-seats","sunroof","gps-navigation","bluetooth","backup-camera","apple-carplay","android-auto","heated-seats","premium-sound-system","keyless-entry","push-button-start","4wd","parking-sensors","cruise-control","lane-assist","auto-emergency-brake","roof-rack","tow-hitch"];

export function OwnerPortalView({ tab: initialTab }: { tab?: string }) {
  const { user, setView } = useAppStore();
  const [tab, setTab] = useState(initialTab || "dashboard");
  const [stats, setStats] = useState<any>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    if (!user) { setView({ name: "auth", mode: "login" }); return; }
    if (user.role !== "OWNER") { setView({ name: "home" }); return; }
    loadAll();
  }, [user]);

  const loadAll = async () => {
    try {
      const [sRes, vRes, bRes] = await Promise.all([
        fetch("/api/owner/stats"),
        fetch("/api/owner/vehicles"),
        fetch("/api/bookings?role=owner"),
      ]);
      const [s, v, b] = await Promise.all([sRes.json(), vRes.json(), bRes.json()]);
      setStats(s); setVehicles(v.cars || []); setBookings(b.bookings || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  if (!user || user.role !== "OWNER") return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border/60">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6">
          <button onClick={() => setView({ name: "home" })} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3">
            <ChevronLeft className="w-4 h-4" /> Back to home
          </button>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-14 h-14 ring-2 ring-border">
                <AvatarImage src={user.avatarUrl} />
                <AvatarFallback className="bg-gold/10 text-gold">{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl lg:text-2xl font-bold">{user.name}</h1>
                  <Badge variant="secondary" className="text-[10px]">Owner</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <Button className="btn-gold hidden sm:flex" onClick={() => setAddOpen(true)}>
              <Plus className="w-4 h-4 mr-1" /> Add vehicle
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 mb-6 h-auto">
            <TabsTrigger value="dashboard" className="flex items-center gap-1.5 py-2.5"><LayoutDashboard className="w-4 h-4" /> Dashboard</TabsTrigger>
            <TabsTrigger value="vehicles" className="flex items-center gap-1.5 py-2.5"><CarIcon className="w-4 h-4" /> Vehicles</TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-1.5 py-2.5"><CalendarDays className="w-4 h-4" /> Bookings</TabsTrigger>
            <TabsTrigger value="earnings" className="flex items-center gap-1.5 py-2.5"><DollarSign className="w-4 h-4" /> Earnings</TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1.5 py-2.5"><Settings className="w-4 h-4" /> Settings</TabsTrigger>
          </TabsList>

          {/* Dashboard */}
          <TabsContent value="dashboard">
            {loading ? <DashboardSkeleton /> : (
              <div className="space-y-6">
                {/* Stat cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard icon={CarIcon} label="Total vehicles" value={String(stats?.stats.totalVehicles || 0)} sub={`${stats?.stats.activeListings || 0} active`} trend="+2 this month" trendUp />
                  <StatCard icon={CalendarDays} label="Bookings" value={String(stats?.stats.confirmedBookings || 0)} sub={`${stats?.stats.pendingBookings || 0} pending`} trend="+12% MoM" trendUp />
                  <StatCard icon={Wallet} label="Total earnings" value={`$${(stats?.stats.totalEarnings || 0).toLocaleString()}`} sub={`$${(stats?.stats.pendingPayouts || 0).toLocaleString()} pending`} trend="+8.2%" trendUp />
                  <StatCard icon={Star} label="Rating" value={(stats?.stats.rating || 0).toFixed(2)} sub={`${stats?.stats.responseRate || 0}% response`} trend="Stable" />
                </div>

                {/* Charts */}
                <div className="grid lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2 bg-card border border-border/60 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold">Revenue (last 30 days)</h3>
                        <p className="text-xs text-muted-foreground">Daily earnings from confirmed bookings</p>
                      </div>
                      <Badge className="bg-green-100 text-green-700"><TrendingUp className="w-3 h-3 mr-1" /> +18%</Badge>
                    </div>
                    <ResponsiveContainer width="100%" height={240}>
                      <AreaChart data={stats?.revenueChart || []}>
                        <defs>
                          <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" tickFormatter={(v) => v.slice(5)} />
                        <YAxis tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" tickFormatter={(v) => `$${v}`} />
                        <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
                        <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={2} fill="url(#rev)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-card border border-border/60 rounded-2xl p-5">
                    <h3 className="font-semibold mb-4">Bookings (30d)</h3>
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={stats?.revenueChart?.filter((_: any, i: number) => i % 3 === 0) || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" tickFormatter={(v) => v.slice(5)} />
                        <YAxis tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                        <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
                        <Bar dataKey="bookings" fill="var(--gold)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Vehicle performance */}
                <div className="bg-card border border-border/60 rounded-2xl p-5">
                  <h3 className="font-semibold mb-4">Vehicle performance</h3>
                  <div className="space-y-3">
                    {(stats?.vehiclePerformance || []).slice(0, 5).map((v: any, i: number) => (
                      <div key={v.id} className="flex items-center gap-4 p-3 rounded-xl bg-surface/30">
                        <div className="w-7 h-7 rounded-full bg-gold/10 flex items-center justify-center text-xs font-bold text-gold">#{i+1}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{v.name} ({v.year})</p>
                          <p className="text-xs text-muted-foreground">{v.bookings} bookings</p>
                        </div>
                        <p className="font-bold text-sm">${v.revenue.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent bookings */}
                <div className="bg-card border border-border/60 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Recent booking requests</h3>
                    <Button variant="ghost" size="sm" onClick={() => setTab("bookings")}>View all <ArrowUpRight className="w-3.5 h-3.5 ml-1" /></Button>
                  </div>
                  {(stats?.recentBookings || []).length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">No bookings yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {(stats?.recentBookings || []).map((b: any) => (
                        <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface/40 transition-colors">
                          <Avatar className="w-9 h-9"><AvatarFallback>{b.customer?.name?.slice(0,2).toUpperCase()}</AvatarFallback></Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{b.customer?.name}</p>
                            <p className="text-xs text-muted-foreground">{b.car ? `${b.car.brand} ${b.car.model}` : "N/A"} · {new Date(b.startDate).toLocaleDateString()}</p>
                          </div>
                          <Badge variant="outline" className="text-[10px]">{b.bookingStatus}</Badge>
                          <p className="font-bold text-sm">${b.totalAmount.toFixed(0)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Vehicles */}
          <TabsContent value="vehicles">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">My vehicles ({vehicles.length})</h2>
              <Button className="btn-gold" onClick={() => setAddOpen(true)}>
                <Plus className="w-4 h-4 mr-1" /> Add vehicle
              </Button>
            </div>
            {loading ? <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}</div> : (
              <div className="space-y-3">
                {vehicles.map(v => (
                  <div key={v.id} className="bg-card border border-border/60 rounded-2xl overflow-hidden flex flex-col sm:flex-row hover:shadow-premium transition-shadow">
                    <div className="sm:w-44 aspect-[4/3] sm:aspect-auto bg-surface shrink-0">
                      <SmartImage src={v.heroImage} alt="" className="w-full h-full object-cover" fallbackText="Image" />
                    </div>
                    <div className="flex-1 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-[10px]">{v.vehicleType}</Badge>
                          <Badge className={v.status === "PUBLISHED" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>{v.status}</Badge>
                        </div>
                        <h3 className="font-semibold">{v.brand} {v.model}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{v.year} · {v.locationCity} · ${v.dailyRate}/day</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-gold text-gold" /> {v.rating?.toFixed(1)}</span>
                          <span>·</span>
                          <span>{v.reviewCount} reviews</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setView({ name: "car-detail", carId: v.id })}><Eye className="w-3.5 h-3.5 mr-1" /> View</Button>
                        <Button size="sm" variant="outline" onClick={() => toast.info("Edit form coming soon")}><Edit className="w-3.5 h-3.5 mr-1" /> Edit</Button>
                      </div>
                    </div>
                  </div>
                ))}
                {vehicles.length === 0 && (
                  <div className="text-center py-20 bg-card border border-border/60 rounded-2xl">
                    <CarIcon className="w-12 h-12 mx-auto text-muted-foreground" />
                    <h3 className="mt-3 font-semibold">No vehicles yet</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Add your first vehicle to start earning.</p>
                    <Button className="mt-4" onClick={() => setAddOpen(true)}><Plus className="w-4 h-4 mr-1" /> Add vehicle</Button>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Bookings */}
          <TabsContent value="bookings">
            <h2 className="text-lg font-bold mb-4 text-foreground" style={{ fontFamily: "var(--font-playfair), serif" }}>Booking requests ({bookings.length})</h2>
            {loading ? <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}</div> : (
              <div className="space-y-3">
                {bookings.map(b => (
                  <div key={b.id} className="bg-card border border-border-subtle rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                    <Avatar className="w-10 h-10 ring-2 ring-gold/20"><AvatarFallback className="bg-gold/10 text-gold">{b.customer?.name?.slice(0,2).toUpperCase()}</AvatarFallback></Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm text-foreground">{b.customer?.name}</p>
                        <Badge className={cn("text-[10px]", b.bookingStatus === "CONFIRMED" ? "bg-green-500/15 text-green-400 border border-green-500/30" : b.bookingStatus === "PENDING" ? "bg-amber-500/15 text-amber-400 border border-amber-500/30" : b.bookingStatus === "COMPLETED" ? "bg-blue-500/15 text-blue-400 border border-blue-500/30" : "bg-red-500/15 text-red-400 border border-red-500/30")}>{b.bookingStatus}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {b.car ? `${b.car.brand} ${b.car.model}` : "N/A"} · {new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()}
                      </p>
                      {b.pickupLocation && <p className="text-xs text-muted-foreground">Pickup: {b.pickupLocation}</p>}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">${b.totalAmount.toFixed(0)}</p>
                      <p className="text-[10px] text-muted-foreground">Your payout: ${((b.totalAmount * 0.88) - (b.car?.securityDeposit || 0)).toFixed(0)}</p>
                    </div>
                    {b.bookingStatus === "PENDING" && (
                      <div className="flex gap-2">
                        <Button size="sm" className="btn-gold" onClick={() => toast.success("Booking accepted! Customer notified.")}>
                          <Check className="w-3.5 h-3.5 mr-1" /> Accept
                        </Button>
                        <Button size="sm" variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10" onClick={() => toast.info("Booking declined")}>
                          <X className="w-3.5 h-3.5 mr-1" /> Decline
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                {bookings.length === 0 && (
                  <div className="text-center py-20 bg-card border border-border-subtle rounded-2xl">
                    <CalendarDays className="w-12 h-12 mx-auto text-muted-foreground" />
                    <h3 className="mt-3 font-semibold text-foreground" style={{ fontFamily: "var(--font-playfair), serif" }}>No bookings yet</h3>
                    <p className="mt-1 text-sm text-muted-foreground">When customers book your vehicles, they'll appear here.</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Earnings */}
          <TabsContent value="earnings">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard icon={DollarSign} label="Gross revenue" value={`$${(stats?.stats.totalEarnings || 0).toLocaleString()}`} />
              <StatCard icon={TrendingDown} label="Platform fees" value={`$${(stats?.stats.platformFees || 0).toLocaleString()}`} sub="12% commission" />
              <StatCard icon={Wallet} label="Net earnings" value={`$${(stats?.stats.netEarnings || 0).toLocaleString()}`} sub="After fees" />
              <StatCard icon={Clock} label="Pending payouts" value={`$${(stats?.stats.pendingPayouts || 0).toLocaleString()}`} sub="Available in 3-5 days" />
            </div>

            <div className="bg-card border border-border/60 rounded-2xl p-5 mb-6">
              <h3 className="font-semibold mb-4">Payout history</h3>
              <div className="space-y-2">
                {[
                  { date: "Aug 1, 2026", amount: 4190.50, status: "Paid", method: "Stripe Connect" },
                  { date: "Jul 1, 2026", amount: 3820.00, status: "Paid", method: "Stripe Connect" },
                  { date: "Jun 1, 2026", amount: 3450.25, status: "Paid", method: "Stripe Connect" },
                  { date: "Sep 1, 2026 (pending)", amount: 6240.00, status: "Pending", method: "Stripe Connect" },
                ].map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-surface/30">
                    <div>
                      <p className="font-medium text-sm">{p.date}</p>
                      <p className="text-xs text-muted-foreground">{p.method}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold">${p.amount.toLocaleString()}</span>
                      <Badge className={p.status === "Paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>{p.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-gold-light to-gold-dark text-background rounded-2xl p-6">
              <h3 className="font-bold text-lg">Ready to withdraw?</h3>
              <p className="text-sm text-background/80 mt-1">Transfer your pending payouts to your bank account.</p>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gold-foreground/15">
                <div>
                  <p className="text-xs text-background/70">Available balance</p>
                  <p className="text-3xl font-bold">${(stats?.stats.pendingPayouts || 0).toLocaleString()}</p>
                </div>
                <Button className="btn-gold" onClick={() => toast.success("Payout initiated! Funds arrive in 3-5 business days.")}>
                  <Wallet className="w-4 h-4 mr-2" /> Withdraw funds
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings">
            <div className="max-w-2xl space-y-4">
              <div className="bg-card border border-border/60 rounded-2xl p-6">
                <h3 className="font-bold mb-4">Payout method</h3>
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-surface/30 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center"><Wallet className="w-5 h-5 text-gold" /></div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Stripe Connect</p>
                      <p className="text-xs text-muted-foreground">Connected · acct_1Voyarion</p>
                    </div>
                    <Badge className="bg-green-100 text-green-700">Active</Badge>
                  </div>
                  <Button variant="outline" onClick={() => toast.info("Stripe onboarding coming soon")}>Update payout details</Button>
                </div>
              </div>

              <div className="bg-card border border-border/60 rounded-2xl p-6">
                <h3 className="font-bold mb-4">Account information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between p-2"><span className="text-muted-foreground">Display name</span><span className="font-medium">{user.name}</span></div>
                  <div className="flex items-center justify-between p-2"><span className="text-muted-foreground">Email</span><span className="font-medium">{user.email}</span></div>
                  <div className="flex items-center justify-between p-2"><span className="text-muted-foreground">Phone</span><span className="font-medium">{user.phone || "Not set"}</span></div>
                  <div className="flex items-center justify-between p-2"><span className="text-muted-foreground">Verification</span><Badge className="bg-green-100 text-green-700"><Check className="w-3 h-3 mr-1" /> Verified</Badge></div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add vehicle dialog */}
      <AddVehicleDialog open={addOpen} setOpen={setAddOpen} onSuccess={() => { setAddOpen(false); loadAll(); toast.success("Vehicle added!"); }} />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, trend, trendUp }: any) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-2">
        <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center"><Icon className="w-4 h-4 text-gold" /></div>
        {trend && <span className={`text-[10px] font-medium flex items-center gap-0.5 ${trendUp ? "text-green-600" : "text-muted-foreground"}`}>{trendUp && <TrendingUp className="w-3 h-3" />}{trend}</span>}
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-muted-foreground/70 mt-1">{sub}</p>}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}</div>
      <div className="grid lg:grid-cols-3 gap-4">
        <Skeleton className="lg:col-span-2 h-80 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    </div>
  );
}

function AddVehicleDialog({ open, setOpen, onSuccess }: { open: boolean; setOpen: (b: boolean) => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    brand: "", model: "", year: new Date().getFullYear().toString(), vehicleType: "SUV",
    transmission: "AUTOMATIC", fuelType: "PETROL", seats: "5", doors: "4", mileage: "0",
    description: "", locationCity: "", locationCountry: "",
    dailyRate: "", weeklyRate: "", monthlyRate: "", weekendRate: "", securityDeposit: "500",
    minimumRental: "1", maximumRental: "30", mileagePerDay: "250", extraMileageFee: "0.45",
    images: ["https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=80"],
  });
  const [features, setFeatures] = useState<string[]>(["leather-seats","gps-navigation","bluetooth"]);
  const [loading, setLoading] = useState(false);

  const toggleFeature = (f: string) => {
    setFeatures(features.includes(f) ? features.filter(x => x !== f) : [...features, f]);
  };

  const handleSubmit = async () => {
    if (!form.brand || !form.model || !form.dailyRate || !form.locationCity) {
      toast.error("Please fill in all required fields");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/owner/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, features, year: parseInt(form.year), seats: parseInt(form.seats), doors: parseInt(form.doors), mileage: parseInt(form.mileage), dailyRate: parseFloat(form.dailyRate), weeklyRate: form.weeklyRate, monthlyRate: form.monthlyRate, weekendRate: form.weekendRate, securityDeposit: parseFloat(form.securityDeposit), minimumRental: parseInt(form.minimumRental), maximumRental: parseInt(form.maximumRental), mileagePerDay: parseInt(form.mileagePerDay), extraMileageFee: parseFloat(form.extraMileageFee) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onSuccess();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-premium">
        <DialogHeader>
          <DialogTitle>Add a new vehicle</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid sm:grid-cols-3 gap-3">
            <div><Label>Brand *</Label><Input value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} placeholder="Mercedes-Benz" className="premium-input mt-1" /></div>
            <div><Label>Model *</Label><Input value={form.model} onChange={e => setForm({...form, model: e.target.value})} placeholder="S-Class" className="premium-input mt-1" /></div>
            <div><Label>Year</Label><Input type="number" value={form.year} onChange={e => setForm({...form, year: e.target.value})} className="premium-input mt-1" /></div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <div><Label>Vehicle type</Label><Select value={form.vehicleType} onValueChange={v => setForm({...form, vehicleType: v})}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{VEHICLE_TYPES.map(t => <SelectItem key={t} value={t}>{t.charAt(0)+t.slice(1).toLowerCase()}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Transmission</Label><Select value={form.transmission} onValueChange={v => setForm({...form, transmission: v})}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{TRANSMISSION.map(t => <SelectItem key={t} value={t}>{t.charAt(0)+t.slice(1).toLowerCase()}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Fuel type</Label><Select value={form.fuelType} onValueChange={v => setForm({...form, fuelType: v})}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{FUEL_TYPES.map(t => <SelectItem key={t} value={t}>{t.charAt(0)+t.slice(1).toLowerCase()}</SelectItem>)}</SelectContent></Select></div>
          </div>

          <div className="grid sm:grid-cols-4 gap-3">
            <div><Label>Seats</Label><Input type="number" value={form.seats} onChange={e => setForm({...form, seats: e.target.value})} className="premium-input mt-1" /></div>
            <div><Label>Doors</Label><Input type="number" value={form.doors} onChange={e => setForm({...form, doors: e.target.value})} className="premium-input mt-1" /></div>
            <div><Label>Mileage (mi)</Label><Input type="number" value={form.mileage} onChange={e => setForm({...form, mileage: e.target.value})} className="premium-input mt-1" /></div>
            <div><Label>Daily mileage</Label><Input type="number" value={form.mileagePerDay} onChange={e => setForm({...form, mileagePerDay: e.target.value})} className="premium-input mt-1" /></div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div><Label>City *</Label><Input value={form.locationCity} onChange={e => setForm({...form, locationCity: e.target.value})} placeholder="Los Angeles" className="premium-input mt-1" /></div>
            <div><Label>Country *</Label><Input value={form.locationCountry} onChange={e => setForm({...form, locationCountry: e.target.value})} placeholder="USA" className="premium-input mt-1" /></div>
          </div>

          <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Describe your vehicle..." className="premium-input mt-1" rows={3} /></div>

          <div className="grid sm:grid-cols-4 gap-3">
            <div><Label>Daily rate *</Label><Input type="number" value={form.dailyRate} onChange={e => setForm({...form, dailyRate: e.target.value})} placeholder="280" className="premium-input mt-1" /></div>
            <div><Label>Weekly rate</Label><Input type="number" value={form.weeklyRate} onChange={e => setForm({...form, weeklyRate: e.target.value})} placeholder="1680" className="premium-input mt-1" /></div>
            <div><Label>Monthly rate</Label><Input type="number" value={form.monthlyRate} onChange={e => setForm({...form, monthlyRate: e.target.value})} placeholder="7200" className="premium-input mt-1" /></div>
            <div><Label>Security deposit</Label><Input type="number" value={form.securityDeposit} onChange={e => setForm({...form, securityDeposit: e.target.value})} className="premium-input mt-1" /></div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div><Label>Min rental (days)</Label><Input type="number" value={form.minimumRental} onChange={e => setForm({...form, minimumRental: e.target.value})} className="premium-input mt-1" /></div>
            <div><Label>Max rental (days)</Label><Input type="number" value={form.maximumRental} onChange={e => setForm({...form, maximumRental: e.target.value})} className="premium-input mt-1" /></div>
          </div>

          <div>
            <Label>Features</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {ALL_FEATURES.map(f => (
                <button key={f} type="button" onClick={() => toggleFeature(f)} className={cn("px-3 py-1.5 rounded-full text-xs font-medium border transition-all capitalize", features.includes(f) ? "bg-gold text-gold-foreground border-gold" : "bg-card border-border hover:border-gold/40")}>
                  {f.replace(/-/g, " ")}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="btn-gold flex-1" onClick={handleSubmit} disabled={loading}>
              {loading ? "Adding..." : "Add vehicle"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
