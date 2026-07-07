// Reactive client-side store (demo only, localStorage-backed) for the
// "Send Request" flow on nearby trips: a customer sends a request to an
// owner, the owner accepts, and a per-owner deal chat unlocks.

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

const snapshotCache = new Map<string, { raw: string | null; value: unknown }>();
const EMPTY_ARR = Object.freeze([]) as never[];
const EMPTY_OBJ = Object.freeze({}) as Record<string, never>;

function readCached<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(key);
  } catch {
    return fallback;
  }
  const cached = snapshotCache.get(key);
  if (cached && cached.raw === raw) return cached.value as T;
  let value: T;
  try {
    value = raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    value = fallback;
  }
  snapshotCache.set(key, { raw, value });
  return value;
}

function write<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage failures in demo
  }
  emit();
}

/* ── Sent requests ───────────────────────────────────────────────────── */
export type SentRequestStatus = "sent" | "accepted" | "booking_confirmed" | "paid";

export interface SentRequestRecord {
  id: string; // matches the nearby ShiftRequest id
  vehicleName: string;
  vehicleImage?: string;
  registrationNumber?: string;
  ownerName: string;
  ownerAvatar?: string;
  route: string;
  status: SentRequestStatus;
  createdAt: number;
  bookingRef?: string;
  trackId?: string;
}

const REQ_KEY = "shiftzy_sent_requests";

export function getSentRequests(): SentRequestRecord[] {
  return readCached<SentRequestRecord[]>(REQ_KEY, EMPTY_ARR);
}

export function getSentRequest(id: string): SentRequestRecord | undefined {
  return getSentRequests().find((r) => r.id === id);
}

export function sendRequest(
  r: Omit<SentRequestRecord, "createdAt" | "status">
): SentRequestRecord {
  const existing = getSentRequest(r.id);
  if (existing) return existing; // already requested — keep current status
  const item: SentRequestRecord = { ...r, status: "sent", createdAt: Date.now() };
  write(REQ_KEY, [item, ...getSentRequests()].slice(0, 40));
  return item;
}

export function acceptRequest(id: string) {
  const list = getSentRequests();
  if (!list.some((r) => r.id === id)) return;
  write(
    REQ_KEY,
    list.map((r) => (r.id === id ? { ...r, status: "accepted" as const } : r))
  );
  // Seed a warm opening message from the owner so the chat feels alive.
  const req = getSentRequest(id);
  if (req && getDealChat(id).length === 0) {
    sendDealMessage(
      id,
      "owner",
      `Hi! I've accepted your request for the ${req.vehicleName}. When would you like to arrange the pickup?`
    );
  }
}

/* ── Deal chat (per request/owner) ───────────────────────────────────── */
export interface DealMessage {
  from: "me" | "owner";
  text: string;
  ts: number;
}

const CHAT_KEY = "shiftzy_deal_chats";

function getAllChats(): Record<string, DealMessage[]> {
  return readCached<Record<string, DealMessage[]>>(CHAT_KEY, EMPTY_OBJ);
}

export function getDealChat(id: string): DealMessage[] {
  return getAllChats()[id] ?? EMPTY_ARR;
}

export function sendDealMessage(id: string, from: DealMessage["from"], text: string) {
  const all = getAllChats();
  const thread = all[id] ?? [];
  write(CHAT_KEY, { ...all, [id]: [...thread, { from, text, ts: Date.now() }] });
}

export function markBookingConfirmed(id: string) {
  const list = getSentRequests();
  if (!list.some((r) => r.id === id)) return;
  write(
    REQ_KEY,
    list.map((r) => (r.id === id ? { ...r, status: "booking_confirmed" as const } : r))
  );
}

export function markRequestPaid(id: string, bookingRef: string, trackId: string) {
  const list = getSentRequests();
  if (!list.some((r) => r.id === id)) return;
  write(
    REQ_KEY,
    list.map((r) =>
      r.id === id ? { ...r, status: "paid" as const, bookingRef, trackId } : r
    )
  );
}

/* ── React hooks ─────────────────────────────────────────────────────── */
export function useSentRequests() {
  return useSyncExternalStore(subscribe, getSentRequests, getSentRequests);
}

export function useSentRequest(id: string) {
  const get = () => getSentRequest(id);
  return useSyncExternalStore(subscribe, get, get);
}

export function useDealChat(id: string) {
  const get = () => getDealChat(id);
  return useSyncExternalStore(subscribe, get, get);
}
