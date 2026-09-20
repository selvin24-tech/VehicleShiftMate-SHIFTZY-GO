// Real, server-verified auth state — replaces trusting localStorage flags
// alone. `useCurrentUser()` is the single source of truth for "who (if
// anyone) is logged in" across the whole app: it calls the real session
// endpoint and every component branches on its result rather than a client
// flag the browser fully controls.
import { useQuery, useQueryClient } from "@tanstack/react-query";

export interface CurrentUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  isVerified: boolean;
  address: string | null;
  role: "customer" | "admin";
  averageRating: number;
  totalRatings: number;
  createdAt: string;
}

export function useCurrentUser() {
  const query = useQuery<CurrentUser | null>({
    queryKey: ["/api/user/me"],
    queryFn: async () => {
      const res = await fetch("/api/user/me", { credentials: "include" });
      if (res.status === 401) return null;
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
    staleTime: 60 * 1000,
    retry: false,
  });

  return {
    user: query.data ?? null,
    // undefined-vs-resolved distinction matters for routing guards: don't
    // redirect to /login while we still don't know the real answer.
    isLoading: query.isLoading,
    isAuthenticated: Boolean(query.data),
    isAdmin: query.data?.role === "admin",
  };
}

/** Real logout everywhere it's called from: destroys the server session
 * first, then clears the small set of legacy localStorage UI flags some
 * older pages still read, then hard-navigates so all in-memory state resets. */
export async function performLogout() {
  try {
    await fetch("/api/user/logout", { method: "POST", credentials: "include" });
  } catch {
    // Even if the network call fails, still clear local UI state below —
    // but never claim success silently if the server call fails outright;
    // callers can inspect the resolved promise if they need to know.
  }
  ["isAuthenticated", "userType", "username", "displayName", "isFirstLogin", "hasSeenTour", "loginPlace"].forEach(
    (k) => localStorage.removeItem(k)
  );
  window.location.href = "/";
}

/** Build a /login?next=<path> URL that returns the user to where they were. */
export function loginUrlWithReturn(currentPath: string): string {
  return `/login?next=${encodeURIComponent(currentPath)}`;
}

/**
 * A `next` value is only safe to redirect to when it's unambiguously a
 * same-origin, relative path: exactly one leading "/", never "//..." or
 * "/\..." (both are protocol-relative — browsers treat them as a redirect
 * to a different host) and never containing a scheme like "javascript:" or
 * "https:" before the first "/". Anything else falls back to "/".
 */
function isSafeNextPath(next: string | null): next is string {
  if (!next) return false;
  if (!next.startsWith("/")) return false;
  if (next.startsWith("//") || next.startsWith("/\\")) return false;
  // Reject an embedded scheme (e.g. "/\t/javascript:alert(1)" style tricks)
  // by requiring everything up to the first "/" or "?" to be empty.
  if (/^\/[^/?#]*:/i.test(next)) return false;
  return true;
}

/** After a successful login/signup, go back to whatever the user was
 * trying to do (if we redirected them here for that reason), else home. */
export function returnAfterLoginPath(): string {
  const next = new URLSearchParams(window.location.search).get("next");
  return isSafeNextPath(next) ? next : "/";
}

export function useInvalidateCurrentUser() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["/api/user/me"] });
}
