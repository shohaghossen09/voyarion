import { create } from "zustand";
import { persist } from "zustand/middleware";

// ============================================================
// APP STORE — Global client-side state
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
}

interface FavoriteItem {
  id: string;
  type: "HOTEL" | "CAR";
  name: string;
  image: string;
  location: string;
  price: number;
  rating: number;
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

interface AppState {
  view: ViewKey;
  viewHistory: ViewKey[];
  setView: (view: ViewKey) => void;
  goBack: () => void;

  user: SessionUser | null;
  token: string | null;
  setUser: (user: SessionUser | null, token?: string | null) => void;
  logout: () => void;

  favorites: FavoriteItem[];
  toggleFavorite: (item: FavoriteItem) => void;
  isFavorited: (id: string) => boolean;

  search: SearchState;
  setSearch: (s: Partial<SearchState>) => void;
  resetSearch: () => void;

  bookingDraft: any | null;
  setBookingDraft: (d: any | null) => void;

  mobileNavOpen: boolean;
  setMobileNavOpen: (b: boolean) => void;
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
          set({ favorites: [...get().favorites, item] });
        }
      },
      isFavorited: (id) => !!get().favorites.find((f) => f.id === id),

      search: defaultSearch,
      setSearch: (s) => set({ search: { ...get().search, ...s } }),
      resetSearch: () => set({ search: defaultSearch }),

      bookingDraft: null,
      setBookingDraft: (d) => set({ bookingDraft: d }),

      mobileNavOpen: false,
      setMobileNavOpen: (b) => set({ mobileNavOpen: b }),
    }),
    {
      name: "voyarion-store",
      partialize: (s) => ({
        user: s.user,
        token: s.token,
        favorites: s.favorites,
        search: s.search,
      }),
    }
  )
);

// Expose store to window for debugging/testing
if (typeof window !== "undefined") {
  (window as any).__voyarionStore = useAppStore;
}
