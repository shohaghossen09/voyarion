"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Sparkles, LifeBuoy, FileText, Shield, RotateCcw, Headphones, Mail, Phone, MessageCircle, BookOpen } from "lucide-react";

export function SimplePage({ kind }: { kind: "about" | "help" | "deals" | "terms" | "privacy" | "cancellation" }) {
  const { setView } = useAppStore();

  if (kind === "about") {
    return (
      <div className="min-h-screen">
        <div className="relative aspect-[16/6] bg-foreground">
          <img src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&q=80" alt="" className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground via-foreground/70 to-transparent" />
          <div className="absolute inset-0 flex items-center">
            <div className="mx-auto max-w-[1400px] w-full px-4 sm:px-6 lg:px-8 text-white">
              <button onClick={() => setView({ name: "home" })} className="text-sm text-white/70 hover:text-white mb-3 flex items-center gap-1"><ChevronLeft className="w-4 h-4" /> Back to home</button>
              <h1 className="text-4xl lg:text-6xl font-bold tracking-tight max-w-2xl">We're building the world's most trusted travel marketplace.</h1>
              <p className="mt-4 text-white/80 max-w-2xl">Premium stays and rides, handpicked and verified — for travelers who expect more.</p>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8 py-16 space-y-12">
          <section className="grid lg:grid-cols-3 gap-8">
            <div>
              <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-4"><Sparkles className="w-5 h-5 text-gold" /></div>
              <h3 className="font-bold text-lg">Our mission</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">To make premium travel experiences accessible to everyone — without compromising on quality, trust, or transparency. We curate every partner, verify every listing, and stand behind every booking.</p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-xl bg-gold/15 flex items-center justify-center mb-4"><Shield className="w-5 h-5 text-gold" /></div>
              <h3 className="font-bold text-lg">Our promise</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">Every property and vehicle is verified by our team. Every transaction is encrypted and protected. Every guest is supported 24/7. We hold ourselves to a higher standard — and our partners do too.</p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-4"><Headphones className="w-5 h-5 text-gold" /></div>
              <h3 className="font-bold text-lg">Our support</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">Real humans, available around the clock. Whether it's a quick question or a complex issue, our concierge team is one click away. We resolve 97% of inquiries within 2 hours.</p>
            </div>
          </section>

          <section className="bg-card border border-border/60 rounded-2xl p-8">
            <h2 className="text-2xl font-bold">By the numbers</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
              {[
                { stat: "1,800+", label: "Verified partners" },
                { stat: "92", label: "Countries" },
                { stat: "250K+", label: "Happy travelers" },
                { stat: "4.9/5", label: "Average rating" },
              ].map(s => (
                <div key={s.label}>
                  <p className="text-3xl lg:text-4xl font-bold text-gradient-teal">{s.stat}</p>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6">What we stand for</h2>
            <div className="space-y-4">
              {[
                { title: "Trust first", desc: "Every partner is verified. Every listing is reviewed. Every transaction is protected. We earn your trust with every booking." },
                { title: "Quality without compromise", desc: "We curate the best — not the most. Every property and vehicle meets our premium standards, period." },
                { title: "Transparency always", desc: "No hidden fees. No surprise charges. What you see is what you pay. Always." },
                { title: "People over profit", desc: "Our concierge team is one click away. Our partners earn fairly. Our travelers travel confidently." },
              ].map(v => (
                <div key={v.title} className="p-5 rounded-xl border border-border/60 bg-card">
                  <h3 className="font-semibold">{v.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{v.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  if (kind === "help") {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-card border-b border-border/60">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-12">
            <button onClick={() => setView({ name: "home" })} className="text-sm text-muted-foreground hover:text-foreground mb-3 flex items-center gap-1"><ChevronLeft className="w-4 h-4" /> Back to home</button>
            <div className="text-center max-w-2xl mx-auto">
              <div className="w-12 h-12 mx-auto rounded-xl bg-gold/10 flex items-center justify-center mb-4"><LifeBuoy className="w-6 h-6 text-gold" /></div>
              <h1 className="text-3xl lg:text-5xl font-bold tracking-tight">How can we help?</h1>
              <p className="mt-3 text-muted-foreground">Search our knowledge base or reach out to our 24/7 concierge team.</p>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8 py-12 space-y-8">
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: MessageCircle, title: "Live chat", desc: "Instant help from our team", action: "Start chat" },
              { icon: Mail, title: "Email support", desc: "We reply within 2 hours", action: "Send email" },
              { icon: Phone, title: "Phone support", desc: "24/7 concierge line", action: "+1 (415) 555-0100" },
            ].map(c => (
              <div key={c.title} className="bg-card border border-border/60 rounded-2xl p-6 text-center hover:shadow-premium transition-shadow">
                <div className="w-12 h-12 mx-auto rounded-xl bg-gold/10 flex items-center justify-center mb-3"><c.icon className="w-5 h-5 text-gold" /></div>
                <h3 className="font-semibold">{c.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{c.desc}</p>
                <Button variant="outline" size="sm" className="mt-3">{c.action}</Button>
              </div>
            ))}
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4">Frequently asked questions</h2>
            <div className="space-y-3">
              {[
                { q: "How do I book a hotel or car?", a: "Search for your destination, select your dates, choose a listing, and complete the secure checkout. You'll receive an instant confirmation." },
                { q: "What is the cancellation policy?", a: "Most listings offer free cancellation up to 48 hours before your start date. Specific policies are shown on each listing page." },
                { q: "How do payments work?", a: "We use Stripe for all payments. Your card is charged when the booking is confirmed, and we hold funds securely until 24 hours after check-in or pickup." },
                { q: "How do I become a car owner partner?", a: "Sign up for an owner account, complete your profile, and add your vehicles. Each vehicle is reviewed before going live." },
                { q: "What if I have an issue during my trip?", a: "Our 24/7 concierge team is one click away via live chat, email, or phone. We'll resolve any issue immediately." },
                { q: "Are the listings verified?", a: "Yes. Every partner goes through a verification process. Hotels are inspected by our team, and car owners submit documentation and vehicle history." },
              ].map(f => (
                <details key={f.q} className="bg-card border border-border/60 rounded-xl p-4 group">
                  <summary className="font-semibold text-sm cursor-pointer flex items-center justify-between">{f.q} <span className="text-muted-foreground group-open:rotate-180 transition-transform">▾</span></summary>
                  <p className="text-sm text-muted-foreground mt-3">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (kind === "deals") {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-foreground text-background">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-16">
            <button onClick={() => setView({ name: "home" })} className="text-sm text-background/60 hover:text-background mb-3 flex items-center gap-1"><ChevronLeft className="w-4 h-4" /> Back to home</button>
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">Deals & Offers</h1>
            <p className="mt-3 text-background/70 max-w-xl">Save up to 25% on premium stays and rides. Use these codes at checkout.</p>
          </div>
        </div>
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-12">
          <PromoGrid />
        </div>
      </div>
    );
  }

  // Legal pages
  const legalContent: any = {
    terms: { title: "Terms of Service", icon: FileText, sections: [
      { h: "1. Acceptance of Terms", p: "By accessing or using Voyarion (the 'Service'), you agree to be bound by these Terms of Service. If you do not agree, you may not access or use the Service. These terms constitute a legally binding agreement between you and Voyarion Inc. ('Voyarion', 'we', 'us', or 'our')." },
      { h: "2. Description of Service", p: "Voyarion operates an online marketplace that connects travelers with hotels, car rental partners, and other accommodation providers. We facilitate bookings but are not a party to the contracts between users and partners. We act solely as an intermediary platform." },
      { h: "3. User Accounts", p: "You must be at least 18 years old to create an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate. You are responsible for maintaining the security of your account and password." },
      { h: "4. Bookings and Payments", p: "When you make a booking, you authorize us to charge your payment method for the total amount shown. All payments are processed securely through Stripe. Prices are calculated server-side and include all applicable taxes and fees unless otherwise stated." },
      { h: "5. Cancellations and Refunds", p: "Cancellation policies vary by listing. Most hotels and cars offer free cancellation up to 48 hours before the start date. Refunds are processed to the original payment method within 5-10 business days." },
      { h: "6. Partner Obligations", p: "Hotel and car owner partners are independent contractors, not employees of Voyarion. Partners are responsible for maintaining accurate listings, providing the services as described, and complying with all applicable laws and regulations." },
      { h: "7. Limitation of Liability", p: "Voyarion shall not be liable for indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues. Our total liability shall not exceed the amount you paid to us in the preceding 12 months." },
      { h: "8. Changes to Terms", p: "We may modify these terms at any time. We will notify users of material changes via email or in-app notification. Continued use of the Service after changes constitutes acceptance of the modified terms." },
    ]},
    privacy: { title: "Privacy Policy", icon: Shield, sections: [
      { h: "1. Information We Collect", p: "We collect information you provide directly to us, such as name, email, phone number, and payment information. We also collect usage data including IP address, browser type, and booking history through cookies and similar technologies." },
      { h: "2. How We Use Your Information", p: "We use your information to process bookings, communicate with you, provide customer support, verify identity, prevent fraud, personalize content, and improve our services. We do not sell your personal information to third parties." },
      { h: "3. Information Sharing", p: "We share your information with booking partners (hotels, car owners) to fulfill your reservations, with payment processors (Stripe) to handle transactions, and with service providers who help us operate the platform. We may disclose information when required by law." },
      { h: "4. Data Security", p: "We implement industry-standard security measures including SSL encryption, secure password hashing, PCI-compliant payment processing, and regular security audits. However, no method of transmission over the Internet is 100% secure." },
      { h: "5. Your Rights", p: "You have the right to access, correct, or delete your personal information. You can also object to or restrict certain processing of your data. To exercise these rights, contact us at privacy@voyarion.com." },
      { h: "6. Cookies", p: "We use cookies to remember your preferences, analyze site traffic, and personalize content. You can control cookies through your browser settings, but disabling them may affect site functionality." },
      { h: "7. Data Retention", p: "We retain your personal information for as long as your account is active or as needed to provide services. After account closure, we retain certain data for legal, accounting, and reporting purposes." },
    ]},
    cancellation: { title: "Cancellation Policy", icon: RotateCcw, sections: [
      { h: "Free Cancellation Window", p: "Most hotel and car bookings on Voyarion offer free cancellation up to 48 hours before your check-in or pickup time. Within this window, you'll receive a full refund with no fees." },
      { h: "Late Cancellations", p: "Cancellations made within 48 hours of check-in or pickup are subject to a fee equal to the first night's stay (for hotels) or the first day's rental (for cars). The remaining balance will be refunded." },
      { h: "No-Show Policy", p: "If you do not arrive for your booking without prior cancellation, the full booking amount will be charged and no refund will be issued. We recommend contacting our support team if you anticipate any issues." },
      { h: "Partner Cancellations", p: "If a hotel or car owner must cancel your booking, we will notify you immediately and offer alternatives. You will receive a full refund, and we may provide additional compensation for the inconvenience." },
      { h: "How to Cancel", p: "To cancel a booking, sign in to your account, go to My Bookings, select the booking, and click 'Cancel booking'. You can also contact our 24/7 support team via chat, email, or phone." },
      { h: "Refund Processing", p: "Refunds are processed to your original payment method within 5-10 business days. The timing of the refund appearing in your account depends on your bank or card issuer." },
      { h: "Force Majeure", p: "In cases of natural disasters, government travel restrictions, or other circumstances beyond reasonable control, Voyarion may offer enhanced cancellation terms or travel credits at its discretion." },
    ]},
  };

  const content = legalContent[kind] || legalContent.terms;
  const Icon = content.icon;

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-border/60">
        <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8 py-10">
          <button onClick={() => setView({ name: "home" })} className="text-sm text-muted-foreground hover:text-foreground mb-3 flex items-center gap-1"><ChevronLeft className="w-4 h-4" /> Back to home</button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center"><Icon className="w-5 h-5 text-gold" /></div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{content.title}</h1>
              <p className="text-xs text-muted-foreground">Last updated: August 2026</p>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-[900px] px-4 sm:px-6 lg:px-8 py-10">
        <div className="space-y-6">
          {content.sections.map((s: any, i: number) => (
            <section key={i}>
              <h2 className="text-xl font-bold mb-2">{s.h}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.p}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

function PromoGrid() {
  const [promotions, setPromotions] = useState<any[]>([]);
  const { setView } = useAppStore();
  useEffect(() => {
    fetch("/api/promotions").then(r => r.json()).then(d => setPromotions(d.promotions || []));
  }, []);
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
      {promotions.map(p => (
        <div key={p.id} className="relative overflow-hidden rounded-2xl bg-card border border-border/60 hover:border-gold/40 transition-colors p-6 group">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-gold/10 blur-2xl" />
          <div className="flex items-center gap-2 mb-3">
            <span className="pill bg-gold text-gold-foreground">{p.discountPct > 0 ? `${p.discountPct}% OFF` : `$${p.discountAmt} OFF`}</span>
            <span className="pill bg-gold/10 text-gold">{p.type}</span>
          </div>
          <h3 className="text-xl font-bold">{p.title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
          <div className="mt-4 flex items-center justify-between">
            <code className="px-3 py-1.5 rounded-lg bg-surface font-mono text-sm font-bold">{p.code}</code>
            <Button size="sm" variant="outline" onClick={() => setView(p.type === "HOTEL" ? { name: "hotels" } : p.type === "CAR" ? { name: "cars" } : { name: "home" })}>Use code</Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-3">Valid until {new Date(p.validTo).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
}
