"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { SignupPopup } from "@/components/site/SignupPopup";
import { ToastContainer } from "@/components/site/ToastContainer";
import { SocialProofToast } from "@/components/site/SocialProofToast";
import { HomeView } from "@/components/views/HomeView";
import { HotelsView } from "@/components/views/HotelsView";
import { HotelDetailView } from "@/components/views/HotelDetailView";
import { CarsView } from "@/components/views/CarsView";
import { CarDetailView } from "@/components/views/CarDetailView";
import { DestinationsView } from "@/components/views/DestinationsView";
import { AuthView } from "@/components/views/AuthView";
import { CustomerDashboardView } from "@/components/views/CustomerDashboardView";
import { OwnerPortalView } from "@/components/views/OwnerPortalView";
import { AdminPanelView } from "@/components/views/AdminPanelView";
import { CheckoutView } from "@/components/views/CheckoutView";
import { ConfirmationView } from "@/components/views/ConfirmationView";
import { BookingTrackingView } from "@/components/views/BookingTrackingView";
import { WishlistView } from "@/components/views/WishlistView";
import { SimplePage } from "@/components/views/SimplePage";

export default function Home() {
  const { view, user, setUser } = useAppStore();

  // Fetch session on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.user) setUser(data.user);
      } catch {}
    })();
  }, []);

  const isAuthView = view.name === "auth";
  const isCheckoutFlow = view.name === "checkout" || view.name === "confirmation";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {!isAuthView && <Navbar />}
      <main className="flex-1">
        {view.name === "home" && <HomeView />}
        {view.name === "hotels" && <HotelsView />}
        {view.name === "hotel-detail" && <HotelDetailView hotelId={view.hotelId} />}
        {view.name === "cars" && <CarsView />}
        {view.name === "car-detail" && <CarDetailView carId={view.carId} />}
        {view.name === "destinations" && <DestinationsView />}
        {view.name === "destination-detail" && <DestinationsView />}
        {view.name === "deals" && <SimplePage kind="deals" />}
        {view.name === "about" && <SimplePage kind="about" />}
        {view.name === "help" && <SimplePage kind="help" />}
        {view.name === "auth" && <AuthView mode={view.mode} />}
        {view.name === "customer-dashboard" && <CustomerDashboardView tab={view.tab} />}
        {view.name === "owner-portal" && <OwnerPortalView tab={view.tab} />}
        {view.name === "admin-panel" && <AdminPanelView tab={view.tab} />}
        {view.name === "checkout" && <CheckoutView bookingType={view.bookingType} refId={view.refId} />}
        {view.name === "confirmation" && <ConfirmationView bookingId={view.bookingId} />}
        {view.name === "booking-tracking" && <BookingTrackingView bookingId={view.bookingId} />}
        {view.name === "wishlist" && <WishlistView />}
        {view.name === "terms" && <SimplePage kind="terms" />}
        {view.name === "privacy" && <SimplePage kind="privacy" />}
        {view.name === "cancellation" && <SimplePage kind="cancellation" />}
      </main>
      {!isAuthView && !isCheckoutFlow && <Footer />}
      <SignupPopup />
      <ToastContainer />
      <SocialProofToast />
    </div>
  );
}
