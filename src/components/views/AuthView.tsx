"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Mail, Lock, User, Phone, Building2, Car, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";

export function AuthView({ mode: initialMode }: { mode: "login" | "register" | "forgot" | "reset" }) {
  const { setView, setUser } = useAppStore();
  const [mode, setMode] = useState(initialMode);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "", password: "", name: "", phone: "", role: "CUSTOMER", confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email, password: form.password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Login failed");
        setUser(data.user, data.token);
        toast.success(`Welcome back, ${data.user.name}!`);
        // Route based on role
        if (data.user.role === "ADMIN" || data.user.role === "SUPER_ADMIN") {
          setView({ name: "admin-panel", tab: "dashboard" });
        } else if (data.user.role === "OWNER") {
          setView({ name: "owner-portal", tab: "dashboard" });
        } else {
          setView({ name: "home" });
        }
      } else if (mode === "register") {
        if (form.password !== form.confirmPassword) {
          toast.error("Passwords don't match");
          return;
        }
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email, password: form.password, name: form.name, phone: form.phone, role: form.role }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Registration failed");
        setUser(data.user, data.token);
        toast.success(`Welcome to Voyarion, ${data.user.name}!`);
        if (data.user.role === "OWNER") {
          setView({ name: "owner-portal", tab: "dashboard" });
        } else {
          setView({ name: "home" });
        }
      } else if (mode === "forgot") {
        toast.success("Reset link sent!", { description: "Check your inbox for password reset instructions." });
        setMode("login");
      }
    } catch (e: any) {
      toast.error(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role: "customer" | "owner" | "admin") => {
    const creds = {
      customer: { email: "guest@voyarion.com", password: "guest123" },
      owner: { email: "owner@voyarion.com", password: "owner123" },
      admin: { email: "admin@voyarion.com", password: "admin123" },
    };
    setForm({ ...form, ...creds[role] });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left visual panel */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/80" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <button onClick={() => setView({ name: "home" })} className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-light to-gold-dark flex items-center justify-center shadow-gold-glow">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-background" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M12 2L4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6l-8-4z"/>
              </svg>
            </div>
            <span className="text-xl font-bold" style={{ fontFamily: "var(--font-playfair), serif" }}>Voyarion</span>
          </button>

          <div>
            <Sparkles className="w-8 h-8 text-gold mb-4" />
            <h2 className="text-4xl font-bold leading-tight" style={{ fontFamily: "var(--font-playfair), serif" }}>Your journey<br/>begins here.</h2>
            <p className="mt-4 text-white/80 max-w-md">
              Join 250,000+ travelers discovering premium hotels and rental cars from verified partners worldwide.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
              {[
                { stat: "1,800+", label: "Partners" },
                { stat: "92", label: "Countries" },
                { stat: "4.9/5", label: "Rating" },
              ].map(s => (
                <div key={s.label}>
                  <p className="text-2xl font-bold text-gradient-gold" style={{ fontFamily: "var(--font-playfair), serif" }}>{s.stat}</p>
                  <p className="text-xs text-white/70 uppercase tracking-wider">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-white/60">
            <ShieldCheck className="w-4 h-4" /> Bank-grade security · PCI compliant · SSL encrypted
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-md">
          <button onClick={() => setView({ name: "home" })} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8">
            <ChevronLeft className="w-4 h-4" /> Back to home
          </button>

          <h1 className="text-3xl font-bold tracking-tight text-foreground" style={{ fontFamily: "var(--font-playfair), serif" }}>
            {mode === "login" && "Welcome back"}
            {mode === "register" && "Create your account"}
            {mode === "forgot" && "Reset password"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "login" && "Sign in to continue your journey."}
            {mode === "register" && "Join the premium travel marketplace."}
            {mode === "forgot" && "We'll send you a reset link."}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {mode === "register" && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Full name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="name" placeholder="John Doe" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="pl-10 premium-input h-11" required />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="pl-10 premium-input h-11" required />
              </div>
            </div>

            {(mode === "register" || mode === "login") && (
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="password" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="pl-10 premium-input h-11" required />
                </div>
              </div>
            )}

            {mode === "register" && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="confirm">Confirm password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="confirm" type="password" placeholder="••••••••" value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})} className="pl-10 premium-input h-11" required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="phone" placeholder="+1 (555) 000-0000" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="pl-10 premium-input h-11" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>I want to</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setForm({...form, role: "CUSTOMER"})} className={`p-3 rounded-xl border-2 transition-all ${form.role === "CUSTOMER" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
                      <User className="w-5 h-5 mx-auto mb-1.5 text-primary" />
                      <p className="text-sm font-semibold">Book & travel</p>
                      <p className="text-[10px] text-muted-foreground">As a customer</p>
                    </button>
                    <button type="button" onClick={() => setForm({...form, role: "OWNER"})} className={`p-3 rounded-xl border-2 transition-all ${form.role === "OWNER" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
                      <Car className="w-5 h-5 mx-auto mb-1.5 text-primary" />
                      <p className="text-sm font-semibold">List my cars</p>
                      <p className="text-[10px] text-muted-foreground">As an owner</p>
                    </button>
                  </div>
                </div>
              </>
            )}

            {mode === "login" && (
              <div className="flex justify-end">
                <button type="button" onClick={() => setMode("forgot")} className="text-xs text-gold hover:underline">Forgot password?</button>
              </div>
            )}

            <Button type="submit" disabled={loading} className="btn-gold w-full h-11">
              {loading ? "Please wait..." : (
                <>
                  {mode === "login" && "Sign in"}
                  {mode === "register" && "Create account"}
                  {mode === "forgot" && "Send reset link"}
                </>
              )}
            </Button>
          </form>

          {mode === "login" && (
            <div className="mt-6 p-4 rounded-xl bg-muted/40 border border-border/60">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Demo accounts (click to fill)</p>
              <div className="grid grid-cols-3 gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => fillDemo("customer")} className="text-xs">
                  <User className="w-3 h-3 mr-1" /> Customer
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => fillDemo("owner")} className="text-xs">
                  <Car className="w-3 h-3 mr-1" /> Owner
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => fillDemo("admin")} className="text-xs">
                  <ShieldCheck className="w-3 h-3 mr-1" /> Admin
                </Button>
              </div>
            </div>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "login" && <>Don't have an account? <button onClick={() => setMode("register")} className="text-gold font-semibold hover:underline">Sign up</button></>}
            {mode === "register" && <>Already have an account? <button onClick={() => setMode("login")} className="text-gold font-semibold hover:underline">Sign in</button></>}
            {mode === "forgot" && <>Remember your password? <button onClick={() => setMode("login")} className="text-gold font-semibold hover:underline">Sign in</button></>}
          </p>
        </div>
      </div>
    </div>
  );
}
