---
name: TanStack Query default fetcher only uses queryKey[0]
description: How the shared queryClient resolves URLs from query keys in this repo
---

The default `getQueryFn` in `client/src/lib/queryClient.ts` builds its fetch URL from `queryKey[0]` ONLY — it ignores all later array segments.

**Why:** Several dev guidelines say to use hierarchical array keys like `['/api/x', id, 'messages']` for cache invalidation. That works for *invalidation*, but the default fetcher will hit `/api/x`, NOT `/api/x/<id>/messages`, silently returning the wrong data.

**How to apply:** For any nested/parameterized GET, either (a) provide an explicit `queryFn` that builds the real URL (use `apiRequest('GET', url)`), or (b) make `queryKey[0]` the complete URL string. Keep extra key segments for invalidation only.
