"use client";

import { useAppStore } from "@/store/useAppStore";
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Linkedin, Send, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

export function Footer() {
  const { setView } = useAppStore();
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success("You're subscribed!", { description: "Watch your inbox for premium travel deals." });
    setEmail("");
  };

  const cols: Array<{ title: string; links: Array<{ label: string; view?: any }> }> = [
    {
      title: "Discover",
      links: [
        { label: "Hotels", view: { name: "hotels" } },
        { label: "Cars", view: { name: "cars" } },
        { label: "Destinations", view: { name: "destinations" } },
        { label: "Deals & Offers", view: { name: "deals" } },
      ],
    },
    {
      title: "Partners",
      links: [
        { label: "List your vehicle", view: { name: "auth", mode: "register" } },
        { label: "Owner portal", view: { name: "owner-portal", tab: "dashboard" } },
        { label: "Become a hotel partner" },
        { label: "Partner help center" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About us", view: { name: "about" } },
        { label: "Help & support", view: { name: "help" } },
        { label: "Terms of service", view: { name: "terms" } },
        { label: "Privacy policy", view: { name: "privacy" } },
        { label: "Cancellation policy", view: { name: "cancellation" } },
      ],
    },
  ];

  return (
    <footer className="mt-auto bg-surface border-t border-border-subtle">
      {/* Newsletter */}
      <div className="border-b border-border-subtle">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground" style={{ fontFamily: "var(--font-playfair), serif" }}>
                Travel smarter, stay richer.
              </h3>
              <p className="mt-3 text-muted-foreground text-sm lg:text-base max-w-md">
                Join 250,000+ travelers receiving curated deals, hidden gems, and members-only offers every week.
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md lg:max-w-lg lg:ml-auto w-full">
              <Input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="premium-input h-12 flex-1"
              />
              <Button type="submit" className="btn-gold h-12 px-6 whitespace-nowrap">
                <Send className="w-4 h-4 mr-2" />
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-2">
            <button
              onClick={() => setView({ name: "home" })}
              className="flex items-center gap-2.5 group"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-light to-gold-dark flex items-center justify-center shadow-gold-glow">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-background" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M12 2L4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6l-8-4z"/>
                  <path d="M9 12l2 2 4-4" stroke="#0A0A0A" strokeWidth="2.5"/>
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-foreground" style={{ fontFamily: "var(--font-playfair), serif" }}>Voyarion</span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-gold">Stay & Ride</span>
              </div>
            </button>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs leading-relaxed">
              A premium marketplace for hotels and rental cars. Discover, compare, and book trusted stays and rides — worldwide.
            </p>
            <div className="mt-5 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-gold" /> hello@voyarion.com</div>
              <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gold" /> +1 (415) 555-0100</div>
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gold" /> San Francisco · London · Singapore</div>
            </div>
            <div className="mt-6 flex items-center gap-3">
              {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
                <button key={i} className="w-9 h-9 rounded-full border border-border-subtle flex items-center justify-center hover:border-gold hover:text-gold transition-colors text-muted-foreground" aria-label="Social">
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-4" style={{ fontFamily: "var(--font-playfair), serif" }}>{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => link.view && setView(link.view)}
                      className="text-sm text-muted-foreground hover:text-gold transition-colors text-left link-underline"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border-subtle">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Voyarion Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            {["Visa", "Mastercard", "Amex", "Stripe", "Apple Pay"].map((p) => (
              <span key={p} className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-2 py-1 rounded border border-border-subtle">
                {p}
              </span>
            ))}
            <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <ShieldCheck className="w-3.5 h-3.5 text-gold" /> SSL Secured
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
