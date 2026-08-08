import { create } from "zustand";
import { persist } from "zustand/middleware";

// ============================================================
// APP STORE — Global client-side state (booking.com-grade)
// ============================================================

export type ViewKey =
  | { name: "home" }
  | { name: "hotels" }
  | { name: "hotel-detail"; hotelId: string }
  | { name: "cars" }
  | { name: "car-detail"; carId: string }
  | { name: "destinations" }
  | { name: "destination-detail"; destinationId: string }
  | { name: "deals" }
  | { name: "about" }
  | { name: "help" }
  | { name: "auth"; mode: "login" | "register" | "forgot" | "reset" }
  | { name: "customer-dashboard"; tab?: string }
  | { name: "owner-portal"; tab?: string }
  | { name: "admin-panel"; tab?: string }
  | { name: "checkout"; bookingType: "HOTEL" | "CAR"; refId: string }
  | { name: "confirmation"; bookingId: string }
  | { name: "booking-tracking"; bookingId: string }
  | { name: "wishlist" }
  | { name: "terms" }
  | { name: "privacy" }
  | { name: "cancellation" };

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: "CUSTOMER" | "OWNER" | "ADMIN" | "SUPER_ADMIN";
  avatarUrl?: string;
  phone?: string;
  ownerId?: string;
  emailVerified?: boolean;
  loyaltyPoints?: number;
  memberTier?: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
}

interface FavoriteItem {
  id: string;
  type: "HOTEL" | "CAR";
  name: string;
  image: string;
  location: string;
  price: number;
  rating: number;
  collection?: string; // wishlist collection name
  addedAt: string;
}

interface RecentlyViewedItem {
  id: string;
  type: "HOTEL" | "CAR";
  name: string;
  image: string;
  location: string;
  price: number;
  rating: number;
  viewedAt: string;
}

interface PriceAlert {
  id: string;
  listingId: string;
  type: "HOTEL" | "CAR";
  name: string;
  image: string;
  targetPrice: number;
  currentPrice: number;
  createdAt: string;
}

interface SearchState {
  type: "HOTEL" | "CAR";
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  pickupLocation: string;
  returnLocation: string;
  pickupDate: string;
  returnDate: string;
  pickupTime: string;
  returnTime: string;
}

interface SearchHistoryItem {
  id: string;
  type: "HOTEL" | "CAR";
  query: string;
  destination: string;
  timestamp: string;
}

interface AppState {
  // View routing
  view: ViewKey;
  viewHistory: ViewKey[];
  setView: (view: ViewKey) => void;
  goBack: () => void;

  // Auth
  user: SessionUser | null;
  token: string | null;
  setUser: (user: SessionUser | null, token?: string | null) => void;
  logout: () => void;

  // Favorites / Wishlist
  favorites: FavoriteItem[];
  toggleFavorite: (item: FavoriteItem) => void;
  isFavorited: (id: string) => boolean;
  moveFavoriteToCollection: (id: string, collection: string) => void;
  wishlistCollections: string[];
  createWishlistCollection: (name: string) => void;

  // Recently viewed
  recentlyViewed: RecentlyViewedItem[];
  addRecentlyViewed: (item: RecentlyViewedItem) => void;
  clearRecentlyViewed: () => void;

  // Price alerts
  priceAlerts: PriceAlert[];
  addPriceAlert: (alert: PriceAlert) => void;
  removePriceAlert: (id: string) => void;

  // Search
  search: SearchState;
  setSearch: (s: Partial<SearchState>) => void;
  resetSearch: () => void;

  // Search history
  searchHistory: SearchHistoryItem[];
  addSearchHistory: (item: SearchHistoryItem) => void;
  clearSearchHistory: () => void;

  // Cart / pending booking draft
  bookingDraft: any | null;
  setBookingDraft: (d: any | null) => void;

  // Toast notifications
  toasts: Array<{ id: string; type: "success" | "error" | "info" | "warning"; title: string; message?: string }>;
  addToast: (t: Omit<AppState["toasts"][0], "id">) => void;
  removeToast: (id: string) => void;

  // Mobile nav
  mobileNavOpen: boolean;
  setMobileNavOpen: (b: boolean) => void;

  // Signup popup
  signupPopupShown: boolean;
  signupPopupDismissedAt: string | null;
  setSignupPopupShown: (b: boolean) => void;
  dismissSignupPopup: () => void;
  shouldShowSignupPopup: () => boolean;
}

const defaultSearch: SearchState = {
  type: "HOTEL",
  destination: "",
  checkIn: "",
  checkOut: "",
  guests: 2,
  rooms: 1,
  pickupLocation: "",
  returnLocation: "",
  pickupDate: "",
  returnDate: "",
  pickupTime: "10:00",
  returnTime: "10:00",
};

const SIGNUP_POPUP_COOLDOWN_HOURS = 24; // don't show again for 24h after dismissal

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      view: { name: "home" },
      viewHistory: [],
      setView: (view) => {
        const prev = get().view;
        set({
          view,
          viewHistory: [...get().viewHistory.slice(-20), prev],
        });
        if (typeof window !== "undefined") {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      },
      goBack: () => {
        const hist = [...get().viewHistory];
        const prev = hist.pop();
        if (prev) set({ view: prev, viewHistory: hist });
      },

      user: null,
      token: null,
      setUser: (user, token) => {
        set({ user, token: token ?? get().token });
      },
      logout: () => {
        set({ user: null, token: null, view: { name: "home" } });
      },

      favorites: [],
      toggleFavorite: (item) => {
        const exists = get().favorites.find((f) => f.id === item.id);
        if (exists) {
          set({ favorites: get().favorites.filter((f) => f.id !== item.id) });
        } else {
          set({ favorites: [...get().favorites, { ...item, addedAt: new Date().toISOString() }] });
        }
      },
      isFavorited: (id) => !!get().favorites.find((f) => f.id === id),
      moveFavoriteToCollection: (id, collection) => {
        set({
          favorites: get().favorites.map((f) => (f.id === id ? { ...f, collection } : f)),
        });
      },
      wishlistCollections: ["Saved", "Dream Stays", "Quick Getaways"],
      createWishlistCollection: (name) => {
        if (!get().wishlistCollections.includes(name)) {
          set({ wishlistCollections: [...get().wishlistCollections, name] });
        }
      },

      recentlyViewed: [],
      addRecentlyViewed: (item) => {
        const existing = get().recentlyViewed.filter((r) => r.id !== item.id);
        set({
          recentlyViewed: [{ ...item, viewedAt: new Date().toISOString() }, ...existing].slice(0, 12),
        });
      },
      clearRecentlyViewed: () => set({ recentlyViewed: [] }),

      priceAlerts: [],
      addPriceAlert: (alert) => {
        const exists = get().priceAlerts.find((a) => a.listingId === alert.listingId);
        if (!exists) {
          set({ priceAlerts: [...get().priceAlerts, alert] });
        }
      },
      removePriceAlert: (id) => set({ priceAlerts: get().priceAlerts.filter((a) => a.id !== id) }),

      search: defaultSearch,
      setSearch: (s) => set({ search: { ...get().search, ...s } }),
      resetSearch: () => set({ search: defaultSearch }),

      searchHistory: [],
      addSearchHistory: (item) => {
        const existing = get().searchHistory.filter((s) => s.query !== item.query || s.destination !== item.destination);
        set({ searchHistory: [item, ...existing].slice(0, 8) });
      },
      clearSearchHistory: () => set({ searchHistory: [] }),

      bookingDraft: null,
      setBookingDraft: (d) => set({ bookingDraft: d }),

      toasts: [],
      addToast: (t) => {
        const id = Math.random().toString(36).slice(2);
        set({ toasts: [...get().toasts, { ...t, id }] });
        // Auto-remove after 5 seconds
        if (typeof window !== "undefined") {
          setTimeout(() => {
            set({ toasts: get().toasts.filter((x) => x.id !== id) });
          }, 5000);
        }
      },
      removeToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),

      mobileNavOpen: false,
      setMobileNavOpen: (b) => set({ mobileNavOpen: b }),

      signupPopupShown: false,
      signupPopupDismissedAt: null,
      setSignupPopupShown: (b) => set({ signupPopupShown: b }),
      dismissSignupPopup: () => set({
        signupPopupShown: false,
        signupPopupDismissedAt: new Date().toISOString(),
      }),
      shouldShowSignupPopup: () => {
        const state = get();
        if (state.user) return false; // don't show to logged-in users
        if (state.signupPopupShown) return false;
        if (state.signupPopupDismissedAt) {
          const dismissed = new Date(state.signupPopupDismissedAt);
          const hoursSince = (Date.now() - dismissed.getTime()) / (1000 * 60 * 60);
          if (hoursSince < SIGNUP_POPUP_COOLDOWN_HOURS) return false;
        }
        return true;
      },
    }),
    {
      name: "voyarion-store",
      partialize: (s) => ({
        user: s.user,
        token: s.token,
        favorites: s.favorites,
        search: s.search,
        recentlyViewed: s.recentlyViewed,
        priceAlerts: s.priceAlerts,
        searchHistory: s.searchHistory,
        wishlistCollections: s.wishlistCollections,
        signupPopupDismissedAt: s.signupPopupDismissedAt,
      }),
    }
  )
);

// Expose store to window for debugging/testing
if (typeof window !== "undefined") {
  (window as any).__voyarionStore = useAppStore;
}
