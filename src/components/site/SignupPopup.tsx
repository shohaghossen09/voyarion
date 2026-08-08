"use client";

import { useEffect, useState, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Sparkles, Gift, TrendingDown, Star, Mail, CheckCircle2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const POPUP_DELAY_MS = 5000; // 5 seconds after page load
const COOLDOWN_HOURS = 24;

export function SignupPopup() {
  const { user, setView } = useAppStore();
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Don't show for logged-in users
    if (user) return;

    // Check cooldown from localStorage
    try {
      const dismissedAt = localStorage.getItem("voyarion-popup-dismissed");
      if (dismissedAt) {
        const hoursSince = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60);
        if (hoursSince < COOLDOWN_HOURS) return;
      }
      // Also check if user has seen it this session
      const sessionSeen = sessionStorage.getItem("voyarion-popup-shown");
      if (sessionSeen) return;
    } catch {}

    // Set timer to show popup
    timerRef.current = setTimeout(() => {
      setVisible(true);
      try { sessionStorage.setItem("voyarion-popup-shown", "true"); } catch {}
    }, POPUP_DELAY_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [user]);

  const handleClose = () => {
    setVisible(false);
    try {
      localStorage.setItem("voyarion-popup-dismissed", String(Date.now()));
    } catch {}
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }
    setSubmitted(true);
    setTimeout(() => {
      handleClose();
      setView({ name: "auth", mode: "register" });
    }, 1500);
  };

  if (!visible || user) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={handleClose}
      />

      {/* Popup */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="relative pointer-events-auto w-full max-w-md bg-card border border-gold/30 rounded-2xl overflow-hidden shadow-premium-lg animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-foreground/60" />
          </button>

          {/* Top image section */}
          <div className="relative h-32 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80"
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-gold/30 via-background/60 to-background" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gold/20 backdrop-blur border border-gold/30 text-gold text-[10px] font-bold uppercase tracking-wider mb-2">
                  <Sparkles className="w-3 h-3" /> Exclusive Offer
                </div>
                <p className="text-xs text-white/80">Welcome to Voyarion</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {!submitted ? (
              <>
                <h2 className="text-2xl font-bold text-foreground leading-tight" style={{ fontFamily: "var(--font-playfair), serif" }}>
                  Get <span className="text-gradient-gold">$50 OFF</span> your first booking
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Join 250,000+ travelers. Unlock member-only deals, save your favorites, and book faster.
                </p>

                {/* Benefits */}
                <div className="mt-4 space-y-2">
                  {[
                    { icon: Gift, text: "$50 off your first booking over $400" },
                    { icon: TrendingDown, text: "Up to 30% member-exclusive rates" },
                    { icon: Star, text: "Earn loyalty points on every booking" },
                  ].map((b, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-sm text-foreground/80">
                      <div className="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                        <b.icon className="w-3 h-3 text-gold" />
                      </div>
                      <span>{b.text}</span>
                    </div>
                  ))}
                </div>

                {/* Email form */}
                <form onSubmit={handleSubmit} className="mt-5 space-y-3">
                  <div>
                    <Label htmlFor="popup-email" className="text-xs text-muted-foreground">Email address</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="popup-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 premium-input h-11"
                        autoFocus
                      />
                    </div>
                  </div>
                  <Button type="submit" className="btn-gold w-full h-11">
                    Claim my $50 discount
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>

                <p className="mt-3 text-[10px] text-muted-foreground text-center">
                  No credit card required. Unsubscribe anytime. By signing up you agree to our Terms & Privacy Policy.
                </p>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="w-14 h-14 mx-auto rounded-full bg-green-500/10 flex items-center justify-center mb-3 animate-scale-in">
                  <CheckCircle2 className="w-7 h-7 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-playfair), serif" }}>You're in!</h3>
                <p className="mt-2 text-sm text-muted-foreground">Taking you to registration...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
