---
name: useSyncExternalStore stable snapshot
description: Why the localStorage-backed appStore getters must return cached references
---

The client store in `client/src/lib/appStore.ts` is localStorage-backed and exposed
to React via `useSyncExternalStore` (`useShiftRequests`, `useGoRequests`,
`usePayments`, `useEmergencyContacts`).

**Rule:** The getter passed as `getSnapshot` MUST return a stable reference when the
underlying data hasn't changed. A plain `JSON.parse(localStorage.getItem(...))` (or a
fresh `[]` fallback) returns a NEW reference every call.

**Why:** `useSyncExternalStore` compares snapshots with `Object.is`. A new reference
every render is read as "store changed" → forces re-render → new reference → infinite
loop → React crashes the page to a WHITE SCREEN. Symptom seen: Login (no store hooks)
renders fine, but every authenticated page white-screened because Home uses
`useShiftRequests` and BottomNav uses `useEmergencyContacts`.

**How to apply:** Keep the `readCached` layer that caches parsed value keyed by the raw
serialized string, plus a shared `EMPTY_ARR` for the empty case. Any new reactive getter
added to appStore must use `readCached`, never the raw `read`.
