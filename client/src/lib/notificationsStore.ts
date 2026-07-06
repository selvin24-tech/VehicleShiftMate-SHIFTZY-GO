// Reactive client-side notifications store (demo only, localStorage-backed).
// Powers the bell badge, the Notifications page, and deep-links from an
// "accepted request" notification to its deal chat.

import { useSyncExternalStore } from "react";

export type StoredIconKey =
  | "request"
  | "accepted"
  | "rejected"
  | "payment"
  | "trip-started"
  | "trip-completed";

export interface StoredNotif {
  id: number;
  category: "bookings" | "payments";
  iconKey: StoredIconKey;
  color: "blue" | "orange";
  title: string;
  body: string;
  time: string;
  unread: boolean;
  requestId?: string; // when set, tapping opens /request/:requestId
}

const KEY = "shiftzy_notifications";
const SEED_KEY = "shiftzy_notifications_seeded";

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

const EMPTY_ARR = Object.freeze([]) as never[];
let cache: { raw: string | null; value: StoredNotif[] } | null = null;

export function getStoredNotifs(): StoredNotif[] {
  if (typeof window === "undefined") return EMPTY_ARR;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    return EMPTY_ARR;
  }
  if (cache && cache.raw === raw) return cache.value;
  let value: StoredNotif[];
  try {
    value = raw ? (JSON.parse(raw) as StoredNotif[]) : EMPTY_ARR;
  } catch {
    value = EMPTY_ARR;
  }
  cache = { raw, value };
  return value;
}

function persist(next: StoredNotif[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // ignore storage failures in demo
  }
  emit();
}

export function addStoredNotif(
  n: Pick<StoredNotif, "category" | "iconKey" | "color" | "title" | "body"> &
    Partial<Pick<StoredNotif, "requestId">>
): StoredNotif {
  const item: StoredNotif = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    time: "Just now",
    unread: true,
    ...n,
  };
  persist([item, ...getStoredNotifs()].slice(0, 30));
  return item;
}

export function markNotifRead(id: number) {
  persist(getStoredNotifs().map((n) => (n.id === id ? { ...n, unread: false } : n)));
}

export function markAllNotifsRead() {
  persist(getStoredNotifs().map((n) => ({ ...n, unread: false })));
}

export function getUnreadCount(): number {
  return getStoredNotifs().filter((n) => n.unread).length;
}

/* ── one-time demo seed ──────────────────────────────────────────────── */
const SEED: Omit<StoredNotif, "id">[] = [
  { category: "bookings", iconKey: "request", color: "blue", title: "Booking Request", body: "Ananya S. requested to book your Honda City · Chennai → Bangalore", time: "2 min ago", unread: true },
  { category: "bookings", iconKey: "accepted", color: "blue", title: "Booking Accepted", body: "Karthik R. accepted your booking for Toyota Innova · Chennai → Coimbatore", time: "20 min ago", unread: true },
  { category: "payments", iconKey: "payment", color: "blue", title: "Payment Successful", body: "₹3,780 paid successfully for booking SZG-2048. Chat is now unlocked.", time: "18 min ago", unread: true },
  { category: "bookings", iconKey: "trip-started", color: "blue", title: "Trip Started", body: "Your trip has started. Track your vehicle live on the map.", time: "1 hr ago", unread: false },
  { category: "bookings", iconKey: "trip-completed", color: "blue", title: "Trip Completed", body: "Your vehicle (TN 09 AB 1234) was safely delivered to Bangalore.", time: "2 hr ago", unread: false },
  { category: "bookings", iconKey: "rejected", color: "orange", title: "Booking Rejected", body: "Your booking request for MG Hector was declined. Try another vehicle.", time: "Yesterday", unread: false },
];

export function ensureNotifSeed() {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(SEED_KEY)) return;
  const base = Date.now();
  const seeded: StoredNotif[] = SEED.map((n, i) => ({ ...n, id: base - i }));
  persist([...getStoredNotifs(), ...seeded]);
  try {
    window.localStorage.setItem(SEED_KEY, "1");
  } catch {
    // ignore
  }
}

/* ── React hooks ─────────────────────────────────────────────────────── */
export function useStoredNotifs() {
  return useSyncExternalStore(subscribe, getStoredNotifs, getStoredNotifs);
}

export function useUnreadNotifCount() {
  return useSyncExternalStore(subscribe, getUnreadCount, getUnreadCount);
}
