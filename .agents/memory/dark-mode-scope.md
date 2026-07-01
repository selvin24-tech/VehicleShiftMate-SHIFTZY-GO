---
name: Dark mode scope (Shiftzy Go)
description: How far dark theming was intentionally rolled out and why it is partial
---

Dark mode uses class-based Tailwind (`darkMode: ["class"]`) toggled via the theme-provider from a switch in the Header nav drawer.

**Decision:** dark: variants were applied to the shared shell (Header, nav drawer, BottomNav) and the Home page's primary surfaces (root, location bar, section headings, vehicle cards, trust card). Deep inner panels (e.g. Home expanded trip-detail breakdown) and most secondary pages are NOT yet dark-themed.

**Why:** the app was built with hardcoded `bg-white`/`text-neutral-*` everywhere; full coverage is a large sweep. Scope was limited to the most-viewed surfaces to ship a coherent, working toggle without a half-broken look.

**How to apply:** if extending dark mode, continue outward from the shell — theme each page's root + cards + primary text first, then nested neutral-50/white panels. Keep colored gradient CTAs (SHIFT/GO/support) as-is; they read fine on any background.
