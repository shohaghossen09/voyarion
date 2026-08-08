"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ChevronLeft, CreditCard, Lock, CheckCircle2, ShieldCheck, Calendar, Users, MapPin, Clock,
  ArrowRight, ArrowLeft, Loader2, User, Mail, Phone, Sparkles, Tag, Info,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STEPS = [
  { num: 1, label: "Your details", icon: User },
  { num: 2, label: "Payment", icon: CreditCard },
  { num: 3, label: "Confirmation", icon: CheckCircle2 },
];

export function CheckoutView({ bookingType, refId }: { bookingType: "HOTEL" | "CAR"; refId: string }) {
  const { user, bookingDraft, setView } = useAppStore();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [processing, setProcessing] = useState(false);

  // Customer details
  const [details, setDetails] = useState({
    firstName: user?.name?.split(" ")[0] || "",
    lastName: user?.name?.split(" ").slice(1).join(" ") || "",
    email: user?.email || "",
    phone: user?.phone || "",
    country: "United States",
    specialRequests: "",
    arrivalTime: "15:00",
  });

  // Payment
  const [cardName, setCardName] = useState(user?.name || "");
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [expiry, setExpiry] = useState("12/28");
  const [cvc, setCvc] = useState("123");
  const [zip, setZip] = useState("94103");
  const [saveCard, setSaveCard] = useState(true);
  const [acceptCancellation, setAcceptCancellation] = useState(false);

  // Promo
  const [promoCode, setPromoCode] = useState("");
  const [discountPct, setDiscountPct] = useState(0);

  useEffect(() => {
    if (!user) { setView({ name: "auth", mode: "login" }); return; }
    if (!bookingDraft) { setView({ name: "home" }); return; }
    (async () => {
      try {
        const endpoint = bookingType === "HOTEL" ? `/api/hotels/${refId}` : `/api/cars/${refId}`;
        const res = await fetch(endpoint);
        if (res.ok) setListing(await res.json());
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [refId, bookingType]);

  const applyPromo = () => {
    if (promoCode.toUpperCase() === "SUMMER25") { setDiscountPct(25); toast.success("25% discount applied!"); }
    else if (promoCode.toUpperCase() === "WEEKEND15") { setDiscountPct(15); toast.success("15% discount applied!"); }
    else if (promoCode.toUpperCase() === "WELCOME50") { setDiscountPct(10); toast.success("$50 off applied!"); }
    else { toast.error("Invalid promo code"); setDiscountPct(0); }
  };

  const handleStep1Next = () => {
    if (!details.firstName || !details.lastName || !details.email || !details.phone) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (!details.email.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePay = async () => {
    if (!acceptCancellation) {
      toast.error("Please acknowledge the cancellation policy");
      return;
    }
    setProcessing(true);
    setStep(3);
    try {
      const draft: any = { ...bookingDraft, discountPct };
      const createRes = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(createData.error || "Failed to create booking");

      await new Promise(r => setTimeout(r, 1800));
      const confirmRes = await fetch(`/api/bookings/${createData.booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "confirm_payment" }),
      });
      const confirmData = await confirmRes.json();
      if (!confirmRes.ok) throw new Error(confirmData.error || "Payment failed");

      setTimeout(() => {
        setView({ name: "confirmation", bookingId: createData.booking.id });
      }, 1200);
    } catch (e: any) {
      toast.error(e.message || "Payment failed");
      setStep(2);
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-8 w-32 mb-4" />
        <div className="grid lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!listing || !bookingDraft) {
    return <div className="text-center py-20 text-muted-foreground">Booking draft not found.</div>;
  }

  const draft: any = bookingDraft;
  const price = draft.price;
  const finalPrice = discountPct > 0
    ? {
        ...price,
        discount: (price.basePrice * discountPct) / 100,
        totalAmount: price.totalAmount - (price.basePrice * discountPct) / 100,
      }
    : price;

  return (
    <div className="bg-background min-h-screen pb-12">
      <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8 py-6">
        <button
          onClick={() => setView(bookingType === "HOTEL" ? { name: "hotel-detail", hotelId: refId } : { name: "car-detail", carId: refId })}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ChevronLeft className="w-4 h-4" /> Back to {bookingType === "HOTEL" ? "hotel" : "car"}
        </button>

        {/* Progress steps */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.num} className="flex items-center gap-2 sm:gap-4">
              <div className="flex flex-col items-center gap-1.5">
                <div className={cn(
                  "w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                  step > s.num
                    ? "bg-gold text-background"
                    : step === s.num
                      ? "bg-gold text-background pulse-gold"
                      : "bg-card border border-border-subtle text-muted-foreground"
                )}>
                  {step > s.num ? <CheckCircle2 className="w-5 h-5" /> : s.num}
                </div>
                <span className={cn(
                  "text-[10px] sm:text-xs font-medium hidden sm:block",
                  step >= s.num ? "text-foreground" : "text-muted-foreground"
                )}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn(
                  "w-8 sm:w-16 h-0.5 transition-all",
                  step > s.num ? "bg-gold" : "bg-border-subtle"
                )} />
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Listing summary */}
            <div className="bg-card border border-border-subtle rounded-2xl overflow-hidden">
              <div className="flex flex-col sm:flex-row">
                <div className="sm:w-48 aspect-[4/3] sm:aspect-auto bg-surface shrink-0">
                  <img src={listing.heroImage} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-[10px] border-border-subtle text-muted-foreground">{bookingType}</Badge>
                    {listing.featured && <Badge className="bg-gold/15 text-gold border border-gold/30 text-[10px]">FEATURED</Badge>}
                  </div>
                  <h2 className="font-bold text-lg text-foreground" style={{ fontFamily: "var(--font-playfair), serif" }}>
                    {bookingType === "HOTEL" ? listing.name : `${listing.brand} ${listing.model}`}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gold/70" />
                    {bookingType === "HOTEL" ? listing.shortLocation : `${listing.locationCity}, ${listing.locationCountry}`}
                  </p>
                  <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5 text-gold/70" />
                      {new Date(draft.startDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5 text-gold/70" />
                      {new Date(draft.endDate).toLocaleDateString()}
                    </div>
                    {bookingType === "HOTEL" ? (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="w-3.5 h-3.5 text-gold/70" />
                        {draft.guests} guests · {draft.rooms} rooms
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-3.5 h-3.5 text-gold/70" /> {draft.pickupTime}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground col-span-2">
                          <MapPin className="w-3.5 h-3.5 text-gold/70" /> {draft.pickupLocation}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 1: Your details */}
            {step === 1 && (
              <div className="bg-card border border-border-subtle rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <User className="w-4 h-4 text-gold" />
                  <h3 className="font-bold text-foreground" style={{ fontFamily: "var(--font-playfair), serif" }}>Your details</h3>
                </div>
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="firstName" className="text-muted-foreground">First name *</Label>
                      <Input id="firstName" value={details.firstName} onChange={e => setDetails({...details, firstName: e.target.value})} className="premium-input mt-1" required />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-muted-foreground">Last name *</Label>
                      <Input id="lastName" value={details.lastName} onChange={e => setDetails({...details, lastName: e.target.value})} className="premium-input mt-1" required />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="email" className="text-muted-foreground">Email *</Label>
                      <div className="relative mt-1">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input id="email" type="email" value={details.email} onChange={e => setDetails({...details, email: e.target.value})} className="pl-10 premium-input" required />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-muted-foreground">Phone *</Label>
                      <div className="relative mt-1">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input id="phone" value={details.phone} onChange={e => setDetails({...details, phone: e.target.value})} className="pl-10 premium-input" required />
                      </div>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="country" className="text-muted-foreground">Country</Label>
                      <select
                        id="country"
                        value={details.country}
                        onChange={e => setDetails({...details, country: e.target.value})}
                        className="w-full mt-1 px-3 py-2 rounded-md border border-border-subtle bg-surface-elevated text-foreground text-sm premium-input"
                      >
                        {["United States", "United Kingdom", "Canada", "Australia", "Germany", "France", "Japan", "Brazil", "Singapore", "Other"].map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    {bookingType === "HOTEL" && (
                      <div>
                        <Label htmlFor="arrival" className="text-muted-foreground">Estimated arrival time</Label>
                        <Input id="arrival" type="time" value={details.arrivalTime} onChange={e => setDetails({...details, arrivalTime: e.target.value})} className="premium-input mt-1" />
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="requests" className="text-muted-foreground">Special requests <span className="text-muted-foreground/60">(optional)</span></Label>
                    <textarea
                      id="requests"
                      value={details.specialRequests}
                      onChange={e => setDetails({...details, specialRequests: e.target.value})}
                      placeholder="e.g. High floor, late check-in, celebrating a special occasion..."
                      rows={3}
                      className="w-full mt-1 px-3 py-2 rounded-md border border-border-subtle bg-surface-elevated text-foreground text-sm premium-input resize-none"
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-gold/5 border border-gold/20 flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      Confirmation will be sent to <span className="text-foreground font-medium">{details.email || "your email"}</span>.
                      Make sure your details match the ID you'll present at check-in.
                    </p>
                  </div>

                  <Button onClick={handleStep1Next} className="btn-gold w-full h-12">
                    Continue to payment
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: Payment */}
            {step === 2 && (
              <div className="bg-card border border-border-subtle rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-gold" />
                    <h3 className="font-bold text-foreground" style={{ fontFamily: "var(--font-playfair), serif" }}>Payment details</h3>
                  </div>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-gold" /> Secured by Stripe
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cardName" className="text-muted-foreground">Cardholder name</Label>
                    <Input id="cardName" value={cardName} onChange={e => setCardName(e.target.value)} className="premium-input mt-1" placeholder="John Doe" />
                  </div>
                  <div>
                    <Label htmlFor="cardNumber" className="text-muted-foreground">Card number</Label>
                    <div className="relative mt-1">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="cardNumber" value={cardNumber} onChange={e => setCardNumber(e.target.value)} className="pl-10 premium-input" placeholder="4242 4242 4242 4242" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor="expiry" className="text-muted-foreground">Expiry</Label>
                      <Input id="expiry" value={expiry} onChange={e => setExpiry(e.target.value)} className="premium-input mt-1" placeholder="MM/YY" />
                    </div>
                    <div>
                      <Label htmlFor="cvc" className="text-muted-foreground">CVC</Label>
                      <Input id="cvc" value={cvc} onChange={e => setCvc(e.target.value)} className="premium-input mt-1" placeholder="123" />
                    </div>
                    <div>
                      <Label htmlFor="zip" className="text-muted-foreground">ZIP</Label>
                      <Input id="zip" value={zip} onChange={e => setZip(e.target.value)} className="premium-input mt-1" placeholder="94103" />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox checked={saveCard} onCheckedChange={(v) => setSaveCard(!!v)} />
                    <span className="text-xs text-muted-foreground">Save this card for faster checkout next time</span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer p-3 rounded-xl bg-surface border border-border-subtle">
                    <Checkbox
                      checked={acceptCancellation}
                      onCheckedChange={(v) => setAcceptCancellation(!!v)}
                      className="mt-0.5"
                    />
                    <span className="text-xs text-muted-foreground">
                      I understand and accept the{" "}
                      <button type="button" onClick={() => setView({ name: "cancellation" })} className="text-gold hover:underline">cancellation policy</button>
                      {". "}Free cancellation up to 48 hours before check-in.
                    </span>
                  </label>

                  <div className="p-4 rounded-xl bg-surface border border-border-subtle text-xs text-muted-foreground">
                    <p className="font-semibold text-foreground mb-1">Demo payment</p>
                    This is a demo checkout. Use any card details — no real charge will be made. The card is pre-filled with Stripe's test card.
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setStep(1)} className="border-border-subtle text-foreground hover:bg-white/[0.04]">
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <Button onClick={handlePay} disabled={!acceptCancellation} className="btn-gold flex-1 h-12">
                      <Lock className="w-4 h-4 mr-2" /> Pay ${finalPrice.totalAmount.toFixed(2)}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Processing */}
            {step === 3 && (
              <div className="bg-card border border-border-subtle rounded-2xl p-12 text-center">
                {processing ? (
                  <>
                    <Loader2 className="w-12 h-12 mx-auto text-gold animate-spin" />
                    <h3 className="mt-4 font-bold text-lg text-foreground" style={{ fontFamily: "var(--font-playfair), serif" }}>Processing payment...</h3>
                    <p className="text-sm text-muted-foreground mt-1">Securely contacting Stripe. Please don't close this page.</p>
                    <div className="mt-6 max-w-xs mx-auto space-y-2 text-left">
                      <ProcessingStep label="Validating booking details" done />
                      <ProcessingStep label="Contacting Stripe" done />
                      <ProcessingStep label="Confirming payment" active />
                      <ProcessingStep label="Sending confirmation" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 mx-auto rounded-full bg-green-500/10 flex items-center justify-center">
                      <CheckCircle2 className="w-9 h-9 text-green-500" />
                    </div>
                    <h3 className="mt-4 font-bold text-xl text-foreground" style={{ fontFamily: "var(--font-playfair), serif" }}>Payment successful!</h3>
                    <p className="text-sm text-muted-foreground mt-1">Redirecting to your confirmation...</p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-card border border-border-subtle rounded-2xl p-5 lg:p-6">
              <h3 className="font-bold mb-4 text-foreground" style={{ fontFamily: "var(--font-playfair), serif" }}>Order summary</h3>

              <div className="space-y-2 text-sm pb-4 border-b border-border-subtle">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{bookingType === "HOTEL" ? "Room rate" : "Daily rate"}</span>
                  <span className="font-medium text-foreground">${bookingType === "HOTEL" ? draft.price.pricePerNight : draft.price.pricePerDay}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{bookingType === "HOTEL" ? "Nights × Rooms" : "Days"}</span>
                  <span className="font-medium text-foreground">{bookingType === "HOTEL" ? `${draft.price.nights} × ${draft.rooms}` : draft.price.days}</span>
                </div>
              </div>

              <div className="space-y-2 py-4 text-sm border-b border-border-subtle">
                <SummaryRow label="Base price" value={`$${finalPrice.basePrice.toFixed(2)}`} />
                {finalPrice.discount > 0 && <SummaryRow label={`Discount (${discountPct}%)`} value={`-$${finalPrice.discount.toFixed(2)}`} highlight />}
                <SummaryRow label="Service fee" value={`$${finalPrice.serviceFee.toFixed(2)}`} />
                <SummaryRow label="Taxes" value={`$${finalPrice.taxes.toFixed(2)}`} />
                {bookingType === "CAR" && finalPrice.securityDeposit > 0 && (
                  <SummaryRow label="Security deposit" value={`$${finalPrice.securityDeposit.toFixed(2)}`} muted />
                )}
              </div>

              {/* Promo code */}
              <div className="py-4 border-b border-border-subtle">
                <Label className="text-xs text-muted-foreground">Promo code</Label>
                <div className="flex gap-2 mt-1">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input value={promoCode} onChange={e => setPromoCode(e.target.value)} placeholder="SUMMER25" className="pl-10 premium-input uppercase text-sm" />
                  </div>
                  <Button variant="outline" size="sm" onClick={applyPromo} className="border-border-subtle text-foreground hover:bg-white/[0.04]">Apply</Button>
                </div>
                {discountPct > 0 && (
                  <p className="text-[10px] text-green-500 mt-1.5 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> {discountPct}% discount applied!
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-4">
                <span className="font-semibold text-foreground">Total</span>
                <span className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-playfair), serif" }}>${finalPrice.totalAmount.toFixed(2)}</span>
              </div>

              {bookingType === "HOTEL" && (
                <p className="text-[10px] text-muted-foreground mt-2 text-center">
                  Includes all taxes and fees
                </p>
              )}

              <div className="mt-4 pt-4 border-t border-border-subtle space-y-1.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-2"><Lock className="w-3.5 h-3.5 text-gold" /> 256-bit SSL encryption</div>
                <div className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-gold" /> PCI DSS compliant</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-gold" /> Free cancellation 48h</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProcessingStep({ label, done, active }: { label: string; done?: boolean; active?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 text-xs">
      {done ? (
        <CheckCircle2 className="w-4 h-4 text-green-500" />
      ) : active ? (
        <Loader2 className="w-4 h-4 text-gold animate-spin" />
      ) : (
        <div className="w-4 h-4 rounded-full border border-border-subtle" />
      )}
      <span className={done || active ? "text-foreground" : "text-muted-foreground"}>{label}</span>
    </div>
  );
}

function SummaryRow({ label, value, muted, highlight }: { label: string; value: string; muted?: boolean; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("font-medium", muted && "text-muted-foreground italic", highlight && "text-green-500")}>{value}</span>
    </div>
  );
}
