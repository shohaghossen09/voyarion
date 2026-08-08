"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
} from "recharts";
import {
  LayoutDashboard, Users, Building2, Car as CarIcon, CalendarDays, DollarSign,
  ShieldCheck, ChevronLeft, TrendingUp, TrendingDown, Wallet, AlertCircle,
  Star, ScrollText, Ban, CheckCircle2, Eye, Activity, CreditCard, Clock,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const COLORS = ["var(--primary)", "var(--gold)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

export function AdminPanelView({ tab: initialTab }: { tab?: string }) {
  const { user, setView } = useAppStore();
  const [tab, setTab] = useState(initialTab || "dashboard");
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userFilter, setUserFilter] = useState("");
  const [userRole, setUserRole] = useState("");
  const [bookingFilter, setBookingFilter] = useState({ bookingType: "", status: "", paymentStatus: "" });

  useEffect(() => {
    if (!user) { setView({ name: "auth", mode: "login" }); return; }
    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") { setView({ name: "home" }); return; }
    loadStats();
  }, [user]);

  useEffect(() => {
    if (tab === "users") loadUsers();
    if (tab === "bookings") loadBookings();
    if (tab === "audit") loadAudit();
  }, [tab, userFilter, userRole, bookingFilter]);

  const loadStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      setStats(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const loadUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (userFilter) params.set("q", userFilter);
      if (userRole) params.set("role", userRole);
      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      setUsers(data.users || []);
    } catch (e) { console.error(e); }
  };

  const loadBookings = async () => {
    try {
      const params = new URLSearchParams();
      if (bookingFilter.bookingType) params.set("bookingType", bookingFilter.bookingType);
      if (bookingFilter.status) params.set("status", bookingFilter.status);
      if (bookingFilter.paymentStatus) params.set("paymentStatus", bookingFilter.paymentStatus);
      const res = await fetch(`/api/admin/bookings?${params}`);
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch (e) { console.error(e); }
  };

  const loadAudit = async () => {
    try {
      const res = await fetch("/api/admin/audit");
      const data = await res.json();
      setAuditLogs(data.logs || []);
    } catch (e) { console.error(e); }
  };

  const handleUserAction = async (userId: string, action: "suspend" | "reactivate") => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      });
      if (res.ok) {
        toast.success(`User ${action === "suspend" ? "suspended" : "reactivated"}`);
        loadUsers();
      } else { toast.error("Failed"); }
    } catch (e: any) { toast.error(e.message); }
  };

  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-foreground text-background">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6">
          <button onClick={() => setView({ name: "home" })} className="flex items-center gap-1 text-sm text-background/60 hover:text-background mb-3">
            <ChevronLeft className="w-4 h-4" /> Back to home
          </button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-background/10 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-gold" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold">Admin Control Panel</h1>
              <p className="text-sm text-background/60">{user.email} · {user.role.replace("_", " ")}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 mb-6 h-auto overflow-x-auto">
            <TabsTrigger value="dashboard" className="flex items-center gap-1.5 py-2.5 text-xs"><LayoutDashboard className="w-4 h-4" /> Dashboard</TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-1.5 py-2.5 text-xs"><Users className="w-4 h-4" /> Users</TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-1.5 py-2.5 text-xs"><CalendarDays className="w-4 h-4" /> Bookings</TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-1.5 py-2.5 text-xs"><Building2 className="w-4 h-4" /> Inventory</TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-1.5 py-2.5 text-xs"><CreditCard className="w-4 h-4" /> Payments</TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-1.5 py-2.5 text-xs"><ScrollText className="w-4 h-4" /> Audit Logs</TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1.5 py-2.5 text-xs"><Activity className="w-4 h-4" /> Settings</TabsTrigger>
          </TabsList>

          {/* DASHBOARD */}
          <TabsContent value="dashboard">
            {loading ? <DashboardSkeleton /> : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard icon={Users} label="Total customers" value={String(stats?.stats.totalCustomers || 0)} trend="+24" trendUp color="primary" />
                  <StatCard icon={CarIcon} label="Total cars" value={String(stats?.stats.totalCars || 0)} trend="+6" trendUp color="gold" />
                  <StatCard icon={Building2} label="Total hotels" value={String(stats?.stats.totalHotels || 0)} trend="+3" trendUp color="primary" />
                  <StatCard icon={Wallet} label="Total revenue" value={`$${(stats?.stats.totalRevenue || 0).toLocaleString()}`} trend="+18.2%" trendUp color="gold" />
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard icon={CalendarDays} label="Total bookings" value={String(stats?.stats.totalBookings || 0)} />
                  <StatCard icon={Users} label="Total owners" value={String(stats?.stats.totalOwners || 0)} />
                  <StatCard icon={TrendingDown} label="Platform fees" value={`$${(stats?.stats.platformFees || 0).toLocaleString()}`} />
                  <StatCard icon={AlertCircle} label="Pending payouts" value={`$${(stats?.stats.pendingPayouts || 0).toLocaleString()}`} />
                </div>

                {/* Charts */}
                <div className="grid lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2 bg-card border border-border/60 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold">Revenue & bookings (30d)</h3>
                        <p className="text-xs text-muted-foreground">Daily platform activity</p>
                      </div>
                      <Badge className="bg-green-100 text-green-700"><TrendingUp className="w-3 h-3 mr-1" /> +18%</Badge>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                      <AreaChart data={stats?.revenueChart || []}>
                        <defs>
                          <linearGradient id="rev2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="bk" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--gold)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="var(--gold)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" tickFormatter={(v) => v.slice(5)} />
                        <YAxis yAxisId="left" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" tickFormatter={(v) => `$${v}`} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                        <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
                        <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={2} fill="url(#rev2)" />
                        <Area yAxisId="right" type="monotone" dataKey="bookings" stroke="var(--gold)" strokeWidth={2} fill="url(#bk)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-card border border-border/60 rounded-2xl p-5">
                    <h3 className="font-semibold mb-4">Hotel vs Car bookings</h3>
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Hotels", value: stats?.stats.hotelBookingsCount || 0 },
                            { name: "Cars", value: stats?.stats.carBookingsCount || 0 },
                          ]}
                          cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4}
                          dataKey="value" label={(entry: any) => `${entry.name}: ${entry.value}`}
                        >
                          {[0,1].map(i => <Cell key={i} fill={COLORS[i]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Recent activity */}
                <div className="grid lg:grid-cols-2 gap-4">
                  <div className="bg-card border border-border/60 rounded-2xl p-5">
                    <h3 className="font-semibold mb-4">Recent bookings</h3>
                    <div className="space-y-2">
                      {(stats?.recentBookings || []).slice(0, 5).map((b: any) => (
                        <div key={b.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface/40">
                          <Avatar className="w-8 h-8"><AvatarFallback className="text-[10px]">{b.customer?.name?.slice(0,2).toUpperCase()}</AvatarFallback></Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{b.customer?.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{b.hotel?.name || `${b.car?.brand} ${b.car?.model}`}</p>
                          </div>
                          <span className="text-sm font-bold">${b.totalAmount.toFixed(0)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-card border border-border/60 rounded-2xl p-5">
                    <h3 className="font-semibold mb-4">Recent signups</h3>
                    <div className="space-y-2">
                      {(stats?.recentUsers || []).slice(0, 5).map((u: any) => (
                        <div key={u.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface/40">
                          <Avatar className="w-8 h-8"><AvatarImage src={u.avatarUrl} /><AvatarFallback className="text-[10px]">{u.name?.slice(0,2).toUpperCase()}</AvatarFallback></Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{u.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                          </div>
                          <Badge variant="outline" className="text-[10px]">{u.role}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* USERS */}
          <TabsContent value="users">
            <div className="bg-card border border-border/60 rounded-2xl p-5">
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="flex-1">
                  <Input placeholder="Search users by name or email..." value={userFilter} onChange={e => setUserFilter(e.target.value)} className="premium-input" />
                </div>
                <Select value={userRole || "all"} onValueChange={v => setUserRole(v === "all" ? "" : v)}>
                  <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="All roles" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All roles</SelectItem>
                    <SelectItem value="CUSTOMER">Customer</SelectItem>
                    <SelectItem value="OWNER">Owner</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="overflow-x-auto scrollbar-premium">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60 text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="text-left py-3 px-2">User</th>
                      <th className="text-left py-3 px-2">Role</th>
                      <th className="text-left py-3 px-2">Status</th>
                      <th className="text-left py-3 px-2">Bookings</th>
                      <th className="text-left py-3 px-2">Joined</th>
                      <th className="text-right py-3 px-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="border-b border-border/40 hover:bg-surface/30">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8"><AvatarImage src={u.avatarUrl} /><AvatarFallback className="text-[10px]">{u.name?.slice(0,2).toUpperCase()}</AvatarFallback></Avatar>
                            <div><p className="font-medium">{u.name}</p><p className="text-xs text-muted-foreground">{u.email}</p></div>
                          </div>
                        </td>
                        <td className="py-3 px-2"><Badge variant="outline" className="text-[10px]">{u.role}</Badge></td>
                        <td className="py-3 px-2"><Badge className={u.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>{u.status}</Badge></td>
                        <td className="py-3 px-2">{u._count?.bookings || 0}</td>
                        <td className="py-3 px-2 text-xs text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 px-2 text-right">
                          {u.status === "ACTIVE" ? (
                            <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleUserAction(u.id, "suspend")}><Ban className="w-3.5 h-3.5 mr-1" /> Suspend</Button>
                          ) : (
                            <Button size="sm" variant="ghost" className="text-green-600" onClick={() => handleUserAction(u.id, "reactivate")}><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Reactivate</Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* BOOKINGS */}
          <TabsContent value="bookings">
            <div className="bg-card border border-border/60 rounded-2xl p-5">
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <Select value={bookingFilter.bookingType || "all"} onValueChange={v => setBookingFilter({...bookingFilter, bookingType: v === "all" ? "" : v})}>
                  <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="All types" /></SelectTrigger>
                  <SelectContent><SelectItem value="all">All types</SelectItem><SelectItem value="HOTEL">Hotel</SelectItem><SelectItem value="CAR">Car</SelectItem></SelectContent>
                </Select>
                <Select value={bookingFilter.status || "all"} onValueChange={v => setBookingFilter({...bookingFilter, status: v === "all" ? "" : v})}>
                  <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="All statuses" /></SelectTrigger>
                  <SelectContent><SelectItem value="all">All statuses</SelectItem><SelectItem value="PENDING">Pending</SelectItem><SelectItem value="CONFIRMED">Confirmed</SelectItem><SelectItem value="COMPLETED">Completed</SelectItem><SelectItem value="CANCELLED">Cancelled</SelectItem></SelectContent>
                </Select>
                <Select value={bookingFilter.paymentStatus || "all"} onValueChange={v => setBookingFilter({...bookingFilter, paymentStatus: v === "all" ? "" : v})}>
                  <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="All payments" /></SelectTrigger>
                  <SelectContent><SelectItem value="all">All payments</SelectItem><SelectItem value="PENDING">Pending</SelectItem><SelectItem value="PAID">Paid</SelectItem><SelectItem value="FAILED">Failed</SelectItem><SelectItem value="REFUNDED">Refunded</SelectItem></SelectContent>
                </Select>
              </div>

              <div className="overflow-x-auto scrollbar-premium">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60 text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="text-left py-3 px-2">Ref</th>
                      <th className="text-left py-3 px-2">Customer</th>
                      <th className="text-left py-3 px-2">Listing</th>
                      <th className="text-left py-3 px-2">Type</th>
                      <th className="text-left py-3 px-2">Dates</th>
                      <th className="text-left py-3 px-2">Status</th>
                      <th className="text-left py-3 px-2">Payment</th>
                      <th className="text-right py-3 px-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(b => (
                      <tr key={b.id} className="border-b border-border/40 hover:bg-surface/30">
                        <td className="py-3 px-2 font-mono text-xs">{b.reference}</td>
                        <td className="py-3 px-2"><p className="font-medium">{b.customer?.name}</p></td>
                        <td className="py-3 px-2 text-xs">{b.hotel?.name || `${b.car?.brand} ${b.car?.model}`}</td>
                        <td className="py-3 px-2"><Badge variant="outline" className="text-[10px]">{b.bookingType}</Badge></td>
                        <td className="py-3 px-2 text-xs text-muted-foreground">{new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()}</td>
                        <td className="py-3 px-2"><Badge className={cn("text-[10px]", b.bookingStatus === "CONFIRMED" ? "bg-green-100 text-green-700" : b.bookingStatus === "PENDING" ? "bg-amber-100 text-amber-700" : b.bookingStatus === "CANCELLED" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700")}>{b.bookingStatus}</Badge></td>
                        <td className="py-3 px-2"><Badge variant="outline" className="text-[10px]">{b.paymentStatus}</Badge></td>
                        <td className="py-3 px-2 text-right font-bold">${b.totalAmount.toFixed(0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* INVENTORY */}
          <TabsContent value="inventory">
            <div className="grid lg:grid-cols-2 gap-4">
              <div className="bg-card border border-border/60 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Hotels ({stats?.stats.totalHotels || 0})</h3>
                  <Button size="sm" variant="outline" onClick={() => toast.info("Add hotel form coming soon")}><Building2 className="w-3.5 h-3.5 mr-1" /> Add hotel</Button>
                </div>
                <p className="text-sm text-muted-foreground">Manage hotel inventory, rooms, and pricing.</p>
                <div className="mt-4 p-4 rounded-xl bg-surface/30">
                  <p className="text-2xl font-bold">{stats?.stats.totalHotels || 0}</p>
                  <p className="text-xs text-muted-foreground">Published properties</p>
                </div>
              </div>
              <div className="bg-card border border-border/60 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Cars ({stats?.stats.totalCars || 0})</h3>
                  <Button size="sm" variant="outline" onClick={() => toast.info("Add car form coming soon")}><CarIcon className="w-3.5 h-3.5 mr-1" /> Add car</Button>
                </div>
                <p className="text-sm text-muted-foreground">Manage vehicle inventory, owners, and approvals.</p>
                <div className="mt-4 p-4 rounded-xl bg-surface/30">
                  <p className="text-2xl font-bold">{stats?.stats.totalCars || 0}</p>
                  <p className="text-xs text-muted-foreground">Active listings</p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* PAYMENTS */}
          <TabsContent value="payments">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard icon={DollarSign} label="Total processed" value={`$${(stats?.stats.totalRevenue || 0).toLocaleString()}`} />
              <StatCard icon={TrendingDown} label="Refunds" value={`$${(stats?.stats.refunds || 0).toLocaleString()}`} />
              <StatCard icon={Wallet} label="Platform fees" value={`$${(stats?.stats.platformFees || 0).toLocaleString()}`} />
              <StatCard icon={Clock} label="Pending payouts" value={`$${(stats?.stats.pendingPayouts || 0).toLocaleString()}`} />
            </div>
            <div className="bg-card border border-border/60 rounded-2xl p-5">
              <h3 className="font-semibold mb-4">Recent payments</h3>
              <div className="space-y-2">
                {bookings.filter(b => b.payment).slice(0, 10).map(b => (
                  <div key={b.id} className="flex items-center justify-between p-3 rounded-xl bg-surface/30">
                    <div>
                      <p className="font-medium text-sm">{b.reference}</p>
                      <p className="text-xs text-muted-foreground">{b.customer?.name} · {b.payment?.method}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${b.payment.amount.toFixed(2)}</p>
                      <Badge className={cn("text-[10px]", b.payment.status === "SUCCEEDED" ? "bg-green-100 text-green-700" : b.payment.status === "REFUNDED" ? "bg-purple-100 text-purple-700" : "bg-amber-100 text-amber-700")}>{b.payment.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* AUDIT LOGS */}
          <TabsContent value="audit">
            <div className="bg-card border border-border/60 rounded-2xl p-5">
              <h3 className="font-semibold mb-4">Audit log ({auditLogs.length})</h3>
              <div className="space-y-2">
                {auditLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 p-3 rounded-xl bg-surface/30">
                    <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center shrink-0"><ScrollText className="w-4 h-4 text-gold" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{log.action.replace(/_/g, " ")}</p>
                        <Badge variant="outline" className="text-[10px]">{log.entity}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">By {log.actor?.name || "System"} · {new Date(log.createdAt).toLocaleString()}</p>
                      {log.metadata && <pre className="text-[10px] text-muted-foreground/70 mt-1 bg-surface/40 p-2 rounded overflow-x-auto">{JSON.stringify(log.metadata, null, 2)}</pre>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* SETTINGS */}
          <TabsContent value="settings">
            <div className="max-w-2xl space-y-4">
              <div className="bg-card border border-border/60 rounded-2xl p-6">
                <h3 className="font-bold mb-4">Platform settings</h3>
                <div className="space-y-3 text-sm">
                  <SettingRow label="Platform commission" value="12%" />
                  <SettingRow label="Tax rate (default)" value="10-12% by region" />
                  <SettingRow label="Default currency" value="USD" />
                  <SettingRow label="Stripe mode" value="Test (sk_test_...)" />
                  <SettingRow label="Maintenance mode" value="Off" />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, trend, trendUp, color }: any) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-2">
        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", color === "gold" ? "bg-gold/15" : "bg-gold/10")}>
          <Icon className={cn("w-4 h-4", color === "gold" ? "text-gold" : "text-gold")} />
        </div>
        {trend && <span className={`text-[10px] font-medium flex items-center gap-0.5 ${trendUp ? "text-green-600" : "text-muted-foreground"}`}>{trendUp && <TrendingUp className="w-3 h-3" />}{trend}</span>}
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
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

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-surface/30">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
