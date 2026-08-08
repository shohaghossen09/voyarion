"use client";

import { useState, useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, Mail, Lock, User, Phone, Building2, Car, ShieldCheck, Sparkles, Eye, EyeOff, Check, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

const STRENGTH_LABELS = ["Very weak", "Weak", "Fair", "Good", "Strong", "Very strong"];
const STRENGTH_COLORS = ["bg-red-500", "bg-red-500", "bg-amber-500", "bg-yellow-500", "bg-green-500", "bg-green-500"];

export function AuthView({ mode: initialMode }: { mode: "login" | "register" | "forgot" | "reset" }) {
  const { setView, setUser } = useAppStore();
  const [mode, setMode] = useState(initialMode);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    email: "", password: "", name: "", phone: "", role: "CUSTOMER", confirmPassword: "",
    rememberMe: true, acceptTerms: false, acceptMarketing: true,
  });

  const passwordScore = useMemo(() => getPasswordStrength(form.password), [form.password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "register") {
      if (!form.acceptTerms) {
        toast.error("Please accept the Terms of Service to continue");
        return;
      }
      if (passwordScore < 2) {
        toast.error("Please use a stronger password");
        return;
      }
    }

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
          setLoading(false);
          return;
        }
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form.email, password: form.password, name: form.name,
            phone: form.phone, role: form.role,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Registration failed");
        setUser(data.user, data.token);
        toast.success(`Welcome to Voyarion, ${data.user.name}!`, {
          description: form.acceptMarketing ? "Check your inbox for member-only deals." : undefined,
        });
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

  const handleSocialLogin = (provider: "google" | "apple") => {
    toast.info(`${provider === "google" ? "Google" : "Apple"} sign-in coming soon`, {
      description: "For demo, use the email/password login below.",
    });
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

            <div className="mt-10 space-y-3">
              {[
                "Free cancellation on most bookings",
                "Member-only deals up to 30% off",
                "Earn loyalty points on every stay",
                "24/7 concierge support worldwide",
              ].map(benefit => (
                <div key={benefit} className="flex items-center gap-2 text-sm text-white/70">
                  <Check className="w-4 h-4 text-gold" /> {benefit}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-white/60">
            <ShieldCheck className="w-4 h-4 text-gold" /> Bank-grade security · PCI compliant · SSL encrypted
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

          {/* Social login (only for login/register) */}
          {(mode === "login" || mode === "register") && (
            <div className="mt-6 space-y-2">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 border-border-subtle bg-card hover:bg-white/[0.04] text-foreground"
                  onClick={() => handleSocialLogin("google")}
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 border-border-subtle bg-card hover:bg-white/[0.04] text-foreground"
                  onClick={() => handleSocialLogin("apple")}
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  Apple
                </Button>
              </div>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border-subtle" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-background px-3 text-muted-foreground uppercase tracking-wider">or continue with email</span>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-muted-foreground">Full name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="name" placeholder="John Doe" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="pl-10 premium-input h-11" required />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-muted-foreground">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="pl-10 premium-input h-11" required />
              </div>
            </div>

            {(mode === "register" || mode === "login") && (
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-muted-foreground">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm({...form, password: e.target.value})}
                    className="pl-10 pr-10 premium-input h-11"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Password strength meter */}
                {mode === "register" && form.password && (
                  <div className="mt-2">
                    <div className="flex gap-1">
                      {[0,1,2,3,4].map(i => (
                        <div
                          key={i}
                          className={cn(
                            "h-1 flex-1 rounded-full transition-all",
                            i < passwordScore ? STRENGTH_COLORS[passwordScore] : "bg-border-subtle"
                          )}
                        />
                      ))}
                    </div>
                    <p className={cn("text-[10px] mt-1", passwordScore >= 4 ? "text-green-500" : passwordScore >= 2 ? "text-amber-500" : "text-red-500")}>
                      {STRENGTH_LABELS[passwordScore]}
                    </p>
                  </div>
                )}
              </div>
            )}

            {mode === "register" && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="confirm" className="text-muted-foreground">Confirm password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirm"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={form.confirmPassword}
                      onChange={e => setForm({...form, confirmPassword: e.target.value})}
                      className="pl-10 premium-input h-11"
                      required
                    />
                    {form.confirmPassword && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {form.password === form.confirmPassword
                          ? <Check className="w-4 h-4 text-green-500" />
                          : <X className="w-4 h-4 text-red-500" />
                        }
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-muted-foreground">Phone <span className="text-muted-foreground/60">(optional)</span></Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="phone" placeholder="+1 (555) 000-0000" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="pl-10 premium-input h-11" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">I want to</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setForm({...form, role: "CUSTOMER"})}
                      className={cn(
                        "p-3 rounded-xl border-2 transition-all",
                        form.role === "CUSTOMER" ? "border-gold bg-gold/5" : "border-border-subtle hover:border-gold/40"
                      )}
                    >
                      <User className={cn("w-5 h-5 mx-auto mb-1.5", form.role === "CUSTOMER" ? "text-gold" : "text-muted-foreground")} />
                      <p className="text-sm font-semibold text-foreground">Book & travel</p>
                      <p className="text-[10px] text-muted-foreground">As a customer</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({...form, role: "OWNER"})}
                      className={cn(
                        "p-3 rounded-xl border-2 transition-all",
                        form.role === "OWNER" ? "border-gold bg-gold/5" : "border-border-subtle hover:border-gold/40"
                      )}
                    >
                      <Car className={cn("w-5 h-5 mx-auto mb-1.5", form.role === "OWNER" ? "text-gold" : "text-muted-foreground")} />
                      <p className="text-sm font-semibold text-foreground">List my cars</p>
                      <p className="text-[10px] text-muted-foreground">As an owner</p>
                    </button>
                  </div>
                </div>

                {/* Terms & marketing */}
                <div className="space-y-3 pt-2">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <Checkbox
                      checked={form.acceptTerms}
                      onCheckedChange={(v) => setForm({...form, acceptTerms: !!v})}
                      className="mt-0.5"
                    />
                    <span className="text-xs text-muted-foreground">
                      I agree to the{" "}
                      <button type="button" onClick={() => setView({ name: "terms" })} className="text-gold hover:underline">Terms of Service</button>
                      {" "}and{" "}
                      <button type="button" onClick={() => setView({ name: "privacy" })} className="text-gold hover:underline">Privacy Policy</button>
                    </span>
                  </label>
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <Checkbox
                      checked={form.acceptMarketing}
                      onCheckedChange={(v) => setForm({...form, acceptMarketing: !!v})}
                      className="mt-0.5"
                    />
                    <span className="text-xs text-muted-foreground">
                      Send me exclusive deals, member offers, and travel inspiration
                    </span>
                  </label>
                </div>
              </>
            )}

            {mode === "login" && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={form.rememberMe}
                    onCheckedChange={(v) => setForm({...form, rememberMe: !!v})}
                  />
                  <span className="text-xs text-muted-foreground">Remember me</span>
                </label>
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
            <div className="mt-6 p-4 rounded-xl bg-surface border border-border-subtle">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Demo accounts (click to fill)</p>
              <div className="grid grid-cols-3 gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => fillDemo("customer")} className="text-xs border-border-subtle text-foreground hover:bg-white/[0.04]">
                  <User className="w-3 h-3 mr-1 text-gold" /> Customer
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => fillDemo("owner")} className="text-xs border-border-subtle text-foreground hover:bg-white/[0.04]">
                  <Car className="w-3 h-3 mr-1 text-gold" /> Owner
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => fillDemo("admin")} className="text-xs border-border-subtle text-foreground hover:bg-white/[0.04]">
                  <ShieldCheck className="w-3 h-3 mr-1 text-gold" /> Admin
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
