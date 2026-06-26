// Lightweight client-side notifications store (demo only).
// Lets the Quick Book request flow push notifications that the Notifications page can read.

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
}

const KEY = "shiftzy_notifications";

export function getStoredNotifs(): StoredNotif[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StoredNotif[]) : [];
  } catch {
    return [];
  }
}

export function addStoredNotif(
  n: Pick<StoredNotif, "category" | "iconKey" | "color" | "title" | "body">
): StoredNotif {
  const item: StoredNotif = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    time: "Just now",
    unread: true,
    ...n,
  };
  const next = [item, ...getStoredNotifs()].slice(0, 30);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // ignore storage failures in demo
  }
  return item;
}
