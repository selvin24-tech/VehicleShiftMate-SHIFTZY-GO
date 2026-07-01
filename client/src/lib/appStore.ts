// Lightweight client-side app store (demo only, localStorage-backed).
// Backs stateful v1.1 features: active shift requests, Go requests,
// payment history and SOS emergency contacts. Components subscribe via the
// exported hooks and re-render whenever the underlying data changes.

import { useSyncExternalStore } from "react";

/* ── pub/sub ─────────────────────────────────────────────────────────── */
const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage failures in demo
  }
  emit();
}

const newId = (prefix: string) =>
  `${prefix}-${Date.now()}${Math.floor(Math.random() * 1000)}`;

/* ── Shift requests (created from the "Shift" flow) ───────────────────── */
export type ShiftStatus =
  | "pending_traveler"
  | "waiting_driver"
  | "accepted"
  | "in_transit"
  | "completed"
  | "cancelled";

export const SHIFT_STATUS_LABEL: Record<ShiftStatus, string> = {
  pending_traveler: "Pending for Traveler Acceptance",
  waiting_driver: "Waiting for Professional Driver",
  accepted: "Driver Assigned",
  in_transit: "In Transit",
  completed: "Completed",
  cancelled: "Cancelled",
};

export interface ShiftRequestRecord {
  id: string;
  pickup: string;
  drop: string;
  vehicleType: string;
  vehicleModel?: string;
  driverType: "professional" | "traveler";
  date: string;
  timeRange?: string;
  status: ShiftStatus;
  createdAt: number;
}

const SHIFT_KEY = "shiftzy_shift_requests";

export function getShiftRequests(): ShiftRequestRecord[] {
  return read<ShiftRequestRecord[]>(SHIFT_KEY, []);
}
export function addShiftRequest(
  r: Omit<ShiftRequestRecord, "id" | "createdAt" | "status"> & { status?: ShiftStatus }
): ShiftRequestRecord {
  const item: ShiftRequestRecord = {
    id: newId("shift"),
    createdAt: Date.now(),
    status: r.status ?? (r.driverType === "traveler" ? "pending_traveler" : "waiting_driver"),
    ...r,
  };
  write(SHIFT_KEY, [item, ...getShiftRequests()].slice(0, 40));
  return item;
}
export function updateShiftStatus(id: string, status: ShiftStatus) {
  write(
    SHIFT_KEY,
    getShiftRequests().map((r) => (r.id === id ? { ...r, status } : r))
  );
}

/* ── Go requests (created from the "Go / Travel" flow) ────────────────── */
export type GoStatus =
  | "requested"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled";

export const GO_STATUS_LABEL: Record<GoStatus, string> = {
  requested: "Request Sent — Awaiting Owner",
  confirmed: "Confirmed",
  in_progress: "On the Way",
  completed: "Completed",
  cancelled: "Cancelled",
};

export interface GoRequestRecord {
  id: string;
  pickup: string;
  drop: string;
  vehicleType: string;
  mode: "outstation" | "local";
  date: string;
  time: string;
  distanceKm: number;
  estFare: number;
  status: GoStatus;
  createdAt: number;
}

const GO_KEY = "shiftzy_go_requests";

export function getGoRequests(): GoRequestRecord[] {
  return read<GoRequestRecord[]>(GO_KEY, []);
}
export function addGoRequest(
  r: Omit<GoRequestRecord, "id" | "createdAt" | "status"> & { status?: GoStatus }
): GoRequestRecord {
  const item: GoRequestRecord = {
    id: newId("go"),
    createdAt: Date.now(),
    status: r.status ?? "requested",
    ...r,
  };
  write(GO_KEY, [item, ...getGoRequests()].slice(0, 40));
  return item;
}
export function updateGoStatus(id: string, status: GoStatus) {
  write(
    GO_KEY,
    getGoRequests().map((r) => (r.id === id ? { ...r, status } : r))
  );
}

/* ── Payment history ─────────────────────────────────────────────────── */
export type PaymentStatus = "paid" | "pending" | "refunded" | "failed";

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  paid: "Paid",
  pending: "Pending",
  refunded: "Refunded",
  failed: "Failed",
};

export interface PaymentRecord {
  id: string;
  description: string;
  route?: string;
  amount: number;
  method: string;
  status: PaymentStatus;
  date: string;
  createdAt: number;
}

const PAY_KEY = "shiftzy_payments";

export function getPayments(): PaymentRecord[] {
  return read<PaymentRecord[]>(PAY_KEY, []);
}
export function addPayment(
  p: Omit<PaymentRecord, "id" | "createdAt" | "date"> & { date?: string }
): PaymentRecord {
  const item: PaymentRecord = {
    id: newId("pay"),
    createdAt: Date.now(),
    date: p.date ?? "Just now",
    ...p,
  };
  write(PAY_KEY, [item, ...getPayments()].slice(0, 60));
  return item;
}

/* ── SOS emergency contacts ──────────────────────────────────────────── */
export interface EmergencyContact {
  name: string;
  phone: string;
}

const SOS_KEY = "shiftzy_emergency_contacts";

export function getEmergencyContacts(): EmergencyContact[] {
  return read<EmergencyContact[]>(SOS_KEY, []);
}
export function setEmergencyContacts(contacts: EmergencyContact[]) {
  write(SOS_KEY, contacts.slice(0, 2));
}

/* ── one-time demo seed ──────────────────────────────────────────────── */
const SEED_KEY = "shiftzy_seeded_v1";

export function ensureSeed() {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(SEED_KEY)) return;

  if (getPayments().length === 0) {
    const demo: Omit<PaymentRecord, "id" | "createdAt">[] = [
      { description: "Vehicle shift — Honda City", route: "Chennai → Bangalore", amount: 2352, method: "UPI · GPay", status: "paid", date: "Today" },
      { description: "Vehicle shift — Maruti Swift", route: "Chennai → Madurai", amount: 1620, method: "Card · ••42", status: "paid", date: "10 Jun 2026" },
      { description: "Booking — Hyundai i20", route: "Coimbatore → Chennai", amount: 1180, method: "UPI · PhonePe", status: "refunded", date: "5 Jun 2026" },
    ];
    demo.forEach((d) => addPayment(d));
  }

  window.localStorage.setItem(SEED_KEY, "1");
}

/* ── React hooks ─────────────────────────────────────────────────────── */
export function useShiftRequests() {
  return useSyncExternalStore(subscribe, getShiftRequests, getShiftRequests);
}
export function useGoRequests() {
  return useSyncExternalStore(subscribe, getGoRequests, getGoRequests);
}
export function usePayments() {
  return useSyncExternalStore(subscribe, getPayments, getPayments);
}
export function useEmergencyContacts() {
  return useSyncExternalStore(subscribe, getEmergencyContacts, getEmergencyContacts);
}
