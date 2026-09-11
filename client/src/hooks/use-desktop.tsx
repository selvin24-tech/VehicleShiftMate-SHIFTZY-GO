import * as React from "react";

// Matches Tailwind's `lg` breakpoint — below this, every page renders its
// existing hand-tuned mobile UI untouched. At or above it, pages render a
// dedicated desktop layout instead of stretching the mobile one.
const DESKTOP_BREAKPOINT = 1024;

/**
 * undefined until the first client-side measurement lands, then a stable
 * boolean. Pages should treat `undefined` as "not yet known" (e.g. render
 * nothing or a lightweight loading state) rather than guessing — this app
 * is client-rendered, so there is no server-guessed value to fall back to.
 */
export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`);
    const onChange = () => setIsDesktop(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isDesktop;
}
