"use client";

import { useEffect, useState } from "react";

/**
 * SSR-safe media query hook.
 * Returns true when the viewport matches the given query.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);

    // Set initial value asynchronously to avoid triggering cascading render during setup
    requestAnimationFrame(() => {
      setMatches(media.matches);
    });

    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

/**
 * Convenience hook for detecting mobile viewport (< 768px).
 */
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 767px)");
}

/**
 * Convenience hook for detecting tablet viewport (768px - 1023px).
 */
export function useIsTablet(): boolean {
  return useMediaQuery("(min-width: 768px) and (max-width: 1023px)");
}

/**
 * Convenience hook for detecting desktop viewport (>= 1024px).
 */
export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 1024px)");
}
