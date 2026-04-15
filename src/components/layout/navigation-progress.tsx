"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function NavigationProgress() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Reset when navigation completes
  useEffect(() => {
    setLoading(false);
    setProgress(100);
    const t = setTimeout(() => setProgress(0), 300);
    return () => clearTimeout(t);
  }, [pathname, searchParams]);

  // Intercept link clicks to detect navigation start
  const handleClick = useCallback((e: MouseEvent) => {
    const anchor = (e.target as HTMLElement).closest("a");
    if (!anchor) return;

    const href = anchor.getAttribute("href");
    if (
      !href ||
      href.startsWith("#") ||
      href.startsWith("http") ||
      href.startsWith("mailto:") ||
      anchor.target === "_blank" ||
      e.metaKey ||
      e.ctrlKey
    )
      return;

    // Only trigger for internal navigation that changes the page
    const url = new URL(href, window.location.origin);
    if (
      url.pathname !== window.location.pathname ||
      url.search !== window.location.search
    ) {
      setLoading(true);
      setProgress(20);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("click", handleClick, true);
    // Empty touchstart listener enables :active CSS on iOS Safari
    const noop = () => {};
    document.addEventListener("touchstart", noop, { passive: true });
    return () => {
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("touchstart", noop);
    };
  }, [handleClick]);

  // Animate progress while loading
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) return p;
        return p + (90 - p) * 0.1;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [loading]);

  if (progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] h-[3px] pointer-events-none"
      role="progressbar"
      aria-valuenow={Math.round(progress)}
    >
      <div
        className="h-full bg-flamencalia-red transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress >= 100 ? 0 : 1,
        }}
      />
    </div>
  );
}
