// ============================================================
// PRICING ENGINE — Centralized server-side pricing
// ============================================================

export interface HotelPriceInput {
  roomRate: number; // per night
  nights: number;
  rooms: number;
  taxesPct?: number; // default 12%
  serviceFeePct?: number; // default 8%
  discountPct?: number;
}

export interface CarPriceInput {
  dailyRate: number;
  days: number;
  weeklyRate?: number;
  monthlyRate?: number;
  weekendRate?: number;
  securityDeposit?: number;
  taxesPct?: number; // default 10%
  serviceFeePct?: number; // default 8%
  discountPct?: number;
  extraMileageFee?: number;
}

export interface PriceBreakdown {
  basePrice: number;
  serviceFee: number;
  taxes: number;
  discount: number;
  securityDeposit: number;
  totalAmount: number;
  currency: string;
  nights?: number;
  days?: number;
  pricePerNight?: number;
  pricePerDay?: number;
}

export function calculateHotelPrice(input: HotelPriceInput): PriceBreakdown {
  const nights = Math.max(1, input.nights);
  const rooms = Math.max(1, input.rooms);
  const taxesPct = input.taxesPct ?? 12;
  const serviceFeePct = input.serviceFeePct ?? 8;
  const discountPct = input.discountPct ?? 0;

  const basePrice = input.roomRate * nights * rooms;
  const discount = (basePrice * discountPct) / 100;
  const discountedBase = basePrice - discount;
  const serviceFee = (discountedBase * serviceFeePct) / 100;
  const taxes = (discountedBase * taxesPct) / 100;
  const totalAmount = discountedBase + serviceFee + taxes;

  return {
    basePrice: round2(basePrice),
    serviceFee: round2(serviceFee),
    taxes: round2(taxes),
    discount: round2(discount),
    securityDeposit: 0,
    totalAmount: round2(totalAmount),
    currency: "USD",
    nights,
    pricePerNight: input.roomRate,
  };
}

export function calculateCarPrice(input: CarPriceInput): PriceBreakdown {
  const days = Math.max(1, input.days);
  const taxesPct = input.taxesPct ?? 10;
  const serviceFeePct = input.serviceFeePct ?? 8;
  const discountPct = input.discountPct ?? 0;
  const securityDeposit = input.securityDeposit ?? 0;
  const extraMileageFee = input.extraMileageFee ?? 0;

  // Choose best rate (weekly if >= 7 days, monthly if >= 30 days)
  let basePrice: number;
  if (days >= 30 && input.monthlyRate) {
    const fullMonths = Math.floor(days / 30);
    const remainingDays = days % 30;
    basePrice = input.monthlyRate * fullMonths + input.dailyRate * remainingDays;
  } else if (days >= 7 && input.weeklyRate) {
    const fullWeeks = Math.floor(days / 7);
    const remainingDays = days % 7;
    basePrice = input.weeklyRate * fullWeeks + input.dailyRate * remainingDays;
  } else {
    basePrice = input.dailyRate * days;
  }

  const discount = (basePrice * discountPct) / 100;
  const discountedBase = basePrice - discount;
  const serviceFee = (discountedBase * serviceFeePct) / 100;
  const taxes = (discountedBase * taxesPct) / 100;
  const totalAmount = discountedBase + serviceFee + taxes + securityDeposit + extraMileageFee;

  return {
    basePrice: round2(basePrice),
    serviceFee: round2(serviceFee),
    taxes: round2(taxes),
    discount: round2(discount),
    securityDeposit: round2(securityDeposit),
    totalAmount: round2(totalAmount),
    currency: "USD",
    days,
    pricePerDay: input.dailyRate,
  };
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function nightsBetween(start: string | Date, end: string | Date): number {
  const s = new Date(start);
  const e = new Date(end);
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return 0;
  const diff = e.getTime() - s.getTime();
  if (diff <= 0) return 0;
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

export function daysBetween(start: string | Date, end: string | Date): number {
  return nightsBetween(start, end);
}

export function generateBookingReference(): string {
  const prefix = "VY";
  const ts = Date.now().toString(36).toUpperCase().slice(-6);
  const rnd = Math.random().toString(36).toUpperCase().slice(2, 6);
  return `${prefix}-${ts}-${rnd}`;
}

// Platform commission (taken from owner payout)
export const PLATFORM_COMMISSION_PCT = 12;
