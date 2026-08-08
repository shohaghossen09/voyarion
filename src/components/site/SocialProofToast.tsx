"use client";

import { useEffect, useState, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";
import { X, TrendingUp } from "lucide-react";

const SOCIAL_PROOF_MESSAGES = [
  { name: "Sarah from London", action: "just booked", listing: "Aegean Pearl Resort", location: "Santorini", time: "2 minutes ago" },
  { name: "James from Tokyo", action: "booked", listing: "Tesla Model S Plaid", location: "Los Angeles", time: "5 minutes ago" },
  { name: "Maria from Paris", action: "reserved", listing: "Velaa Private Island", location: "Maldives", time: "7 minutes ago" },
  { name: "Liam from Sydney", action: "just booked", listing: "Ferrari Roma", location: "Los Angeles", time: "12 minutes ago" },
  { name: "Sophie from Berlin", action: "booked", listing: "Caldera Cliff Villas", location: "Santorini", time: "15 minutes ago" },
  { name: "Noah from Toronto", action: "reserved", listing: "Porsche 911 Carrera", location: "Paris", time: "18 minutes ago" },
  { name: "Emma from Milan", action: "just booked", listing: "Ubud Jungle Sanctuary", location: "Bali", time: "22 minutes ago" },
  { name: "Lucas from Madrid", action: "booked", listing: "Mercedes-Benz S-Class", location: "Paris", time: "25 minutes ago" },
];

const FIRST_DELAY = 12000; // 12 seconds
const REPEAT_DELAY = 25000; // every 25 seconds
const VISIBLE_DURATION = 6000; // visible for 6 seconds

export function SocialProofToast() {
  const { view, user } = useAppStore();
  const [visible, setVisible] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(SOCIAL_PROOF_MESSAGES[0]);
  const [dismissed, setDismissed] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (dismissed) return;
    // Don't show for logged-in admins/owners or on auth/checkout/admin pages
    if (user && (user.role === "ADMIN" || user.role === "SUPER_ADMIN" || user.role === "OWNER")) {
      return;
    }
    if (view.name === "auth" || view.name === "checkout" || view.name === "confirmation" || view.name === "admin-panel" || view.name === "owner-portal") {
      return;
    }

    const showMessage = () => {
      setCurrentMessage(SOCIAL_PROOF_MESSAGES[Math.floor(Math.random() * SOCIAL_PROOF_MESSAGES.length)]);
      setVisible(true);
      // Auto-hide after VISIBLE_DURATION
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(() => setVisible(false), VISIBLE_DURATION);
    };

    // First show after FIRST_DELAY
    firstTimerRef.current = setTimeout(() => {
      showMessage();
      // Repeat every REPEAT_DELAY
      intervalRef.current = setInterval(showMessage, REPEAT_DELAY);
    }, FIRST_DELAY);

    // Cleanup all timers on unmount or dependency change
    return () => {
      if (firstTimerRef.current) clearTimeout(firstTimerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [view.name, dismissed, user]);

  if (!visible || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[90] max-w-xs animate-fade-in-up">
      <div className="relative bg-card border border-border-subtle rounded-xl shadow-premium-lg p-4 flex items-start gap-3">
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-2 w-6 h-6 rounded-full hover:bg-white/[0.06] flex items-center justify-center text-muted-foreground hover:text-foreground"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
          <TrendingUp className="w-5 h-5 text-gold" />
        </div>

        <div className="flex-1 min-w-0 pr-4">
          <p className="text-sm text-foreground">
            <span className="font-semibold">{currentMessage.name}</span>{" "}
            <span className="text-muted-foreground">{currentMessage.action}</span>
          </p>
          <p className="text-sm font-medium text-foreground truncate mt-0.5">{currentMessage.listing}</p>
          <div className="flex items-center gap-1.5 mt-1 text-[10px] text-muted-foreground">
            <span className="truncate">{currentMessage.location}</span>
            <span>·</span>
            <span>{currentMessage.time}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
