"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, CreditCard, Lock, CheckCircle2, ShieldCheck, Calendar, Users, MapPin, Clock, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function CheckoutView({ bookingType, refId }: { bookingType: "HOTEL" | "CAR"; refId: string }) {
  const { user, bookingDraft, setView } = useAppStore();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<"details" | "payment" | "processing">("details");
  const [bookingId, setBookingId] = useState<string | null>(null);

  // Payment form state
  const [cardName, setCardName] = useState(user?.name || "");
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [expiry, setExpiry] = useState("12/28");
  const [cvc, setCvc] = useState("123");
  const [country, setCountry] = useState("United States");
  const [zip, setZip] = useState("94103");

  // Promo code
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

  const handlePay = async () => {
    setStep("processing");
    try {
      // 1. Create the booking
      const draft: any = { ...bookingDraft, discountPct };
      const createRes = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(createData.error || "Failed to create booking");

      // 2. Simulate Stripe webhook confirmation
      await new Promise(r => setTimeout(r, 1800));
      const confirmRes = await fetch(`/api/bookings/${createData.booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "confirm_payment" }),
      });
      const confirmData = await confirmRes.json();
      if (!confirmRes.ok) throw new Error(confirmData.error || "Payment failed");

      setBookingId(createData.booking.id);
      setView({ name: "confirmation", bookingId: createData.booking.id });
    } catch (e: any) {
      toast.error(e.message || "Payment failed");
      setStep("details");
    } finally {
      setSubmitting(false);
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
    return <div className="text-center py-20">Booking draft not found.</div>;
  }

  const draft: any = bookingDraft;
  const price = draft.price;

  // Apply promo discount if set
  const finalPrice = discountPct > 0
    ? { ...price, discount: (price.basePrice * discountPct) / 100, totalAmount: price.totalAmount - (price.basePrice * discountPct) / 100 }
    : price;

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => setView(bookingType === "HOTEL" ? { name: "hotel-detail", hotelId: refId } : { name: "car-detail", carId: refId })} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ChevronLeft className="w-4 h-4" /> Back to {bookingType === "HOTEL" ? "hotel" : "car"}
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold", step === "details" ? "bg-primary text-primary-foreground" : "bg-green-100 text-green-700")}>
            {step === "details" ? "1" : <CheckCircle2 className="w-4 h-4" />}
          </div>
          <span className={cn("text-sm font-semibold", step === "details" ? "text-foreground" : "text-muted-foreground")}>Booking details</span>
          <div className="flex-1 h-px bg-border" />
          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold", step === "payment" || step === "processing" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>2</div>
          <span className={cn("text-sm font-semibold", step === "payment" || step === "processing" ? "text-foreground" : "text-muted-foreground")}>Payment</span>
          <div className="flex-1 h-px bg-border" />
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-muted text-muted-foreground">3</div>
          <span className="text-sm font-semibold text-muted-foreground">Confirmation</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Listing summary */}
            <div className="bg-card border border-border/60 rounded-2xl overflow-hidden">
              <div className="flex flex-col sm:flex-row">
                <div className="sm:w-56 aspect-[4/3] sm:aspect-auto bg-muted shrink-0">
                  <img src={listing.heroImage} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 p-5">
                  <Badge variant="outline" className="mb-2">{bookingType}</Badge>
                  <h2 className="font-bold text-lg">{bookingType === "HOTEL" ? listing.name : `${listing.brand} ${listing.model}`}</h2>
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {bookingType === "HOTEL" ? listing.shortLocation : `${listing.locationCity}, ${listing.locationCountry}`}
                  </p>
                  <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
                    <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> {new Date(draft.startDate).toLocaleDateString()}</div>
                    <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> {new Date(draft.endDate).toLocaleDateString()}</div>
                    {bookingType === "HOTEL" ? (
                      <div className="flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> {draft.guests} guests · {draft.rooms} rooms</div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> {draft.pickupTime}</div>
                        <div className="flex items-center gap-2 text-xs"><MapPin className="w-3.5 h-3.5 text-primary" /> {draft.pickupLocation}</div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment form */}
            {step === "details" && (
              <div className="bg-card border border-border/60 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Lock className="w-4 h-4 text-primary" />
                  <h3 className="font-bold">Payment details</h3>
                  <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Secured by Stripe</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cardName">Cardholder name</Label>
                    <Input id="cardName" value={cardName} onChange={e => setCardName(e.target.value)} className="premium-input mt-1" placeholder="John Doe" />
                  </div>
                  <div>
                    <Label htmlFor="cardNumber">Card number</Label>
                    <div className="relative mt-1">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="cardNumber" value={cardNumber} onChange={e => setCardNumber(e.target.value)} className="pl-10 premium-input" placeholder="4242 4242 4242 4242" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor="expiry">Expiry</Label>
                      <Input id="expiry" value={expiry} onChange={e => setExpiry(e.target.value)} className="premium-input mt-1" placeholder="MM/YY" />
                    </div>
                    <div>
                      <Label htmlFor="cvc">CVC</Label>
                      <Input id="cvc" value={cvc} onChange={e => setCvc(e.target.value)} className="premium-input mt-1" placeholder="123" />
                    </div>
                    <div>
                      <Label htmlFor="zip">ZIP</Label>
                      <Input id="zip" value={zip} onChange={e => setZip(e.target.value)} className="premium-input mt-1" placeholder="94103" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <select id="country" value={country} onChange={e => setCountry(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm premium-input bg-card">
                      {["United States", "United Kingdom", "Canada", "Australia", "Germany", "France", "Japan", "Brazil", "Other"].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>

                  <div className="p-4 rounded-xl bg-muted/40 border border-border/60 text-xs text-muted-foreground">
                    <p className="font-semibold text-foreground mb-1">Demo payment</p>
                    This is a demo checkout. Use any card details — no real charge will be made. The card is pre-filled with Stripe's test card.
                  </div>
                </div>
              </div>
            )}

            {step === "processing" && (
              <div className="bg-card border border-border/60 rounded-2xl p-12 text-center">
                <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin" />
                <h3 className="mt-4 font-bold text-lg">Processing payment...</h3>
                <p className="text-sm text-muted-foreground mt-1">Securely contacting Stripe. Please don't close this page.</p>
              </div>
            )}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-card border border-border/60 rounded-2xl p-5 lg:p-6">
              <h3 className="font-bold mb-4">Order summary</h3>

              <div className="space-y-2 text-sm pb-4 border-b border-border/60">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{bookingType === "HOTEL" ? "Room rate" : "Daily rate"}</span>
                  <span className="font-medium">${bookingType === "HOTEL" ? draft.price.pricePerNight : draft.price.pricePerDay}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{bookingType === "HOTEL" ? "Nights × Rooms" : "Days"}</span>
                  <span className="font-medium">{bookingType === "HOTEL" ? `${draft.price.nights} × ${draft.rooms}` : draft.price.days}</span>
                </div>
              </div>

              <div className="space-y-2 py-4 text-sm border-b border-border/60">
                <Row label="Base price" value={`$${finalPrice.basePrice.toFixed(2)}`} />
                {finalPrice.discount > 0 && <Row label={`Discount (${discountPct}%)`} value={`-$${finalPrice.discount.toFixed(2)}`} highlight />}
                <Row label="Service fee" value={`$${finalPrice.serviceFee.toFixed(2)}`} />
                <Row label="Taxes" value={`$${finalPrice.taxes.toFixed(2)}`} />
                {bookingType === "CAR" && finalPrice.securityDeposit > 0 && (
                  <Row label="Security deposit" value={`$${finalPrice.securityDeposit.toFixed(2)}`} muted />
                )}
              </div>

              {/* Promo code */}
              <div className="py-4 border-b border-border/60">
                <Label className="text-xs">Promo code</Label>
                <div className="flex gap-2 mt-1">
                  <Input value={promoCode} onChange={e => setPromoCode(e.target.value)} placeholder="SUMMER25" className="premium-input uppercase text-sm" />
                  <Button variant="outline" size="sm" onClick={applyPromo}>Apply</Button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <span className="font-semibold">Total</span>
                <span className="text-2xl font-bold">${finalPrice.totalAmount.toFixed(2)}</span>
              </div>

              <Button
                onClick={handlePay}
                disabled={step === "processing"}
                className="btn-premium w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground mt-4"
              >
                {step === "processing" ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                ) : (
                  <>Pay ${finalPrice.totalAmount.toFixed(2)} <ArrowRight className="w-4 h-4 ml-2" /></>
                )}
              </Button>

              <div className="mt-4 pt-4 border-t border-border/60 space-y-1.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-2"><Lock className="w-3.5 h-3.5 text-primary" /> 256-bit SSL encryption</div>
                <div className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-primary" /> PCI DSS compliant</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Free cancellation 48h</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, muted, highlight }: { label: string; value: string; muted?: boolean; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("font-medium", muted && "text-muted-foreground italic", highlight && "text-green-600")}>{value}</span>
    </div>
  );
}
