"use client";

import { useState } from "react";

interface FavoriteButtonProps {
  productId: string;
  initialFavorited?: boolean;
  size?: "sm" | "md";
}

export function FavoriteButton({
  productId,
  initialFavorited = false,
  size = "md",
}: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);
  const [animating, setAnimating] = useState(false);

  async function handleToggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);

    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId }),
      });
      const data = await res.json();

      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (data.favorited !== undefined) {
        setFavorited(data.favorited);
        if (data.favorited) {
          setAnimating(true);
          setTimeout(() => setAnimating(false), 600);
        }
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  const sizeClasses = size === "sm" ? "w-8 h-8" : "w-9 h-9";
  const iconSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`${sizeClasses} rounded-full flex items-center justify-center transition-all ${
        favorited
          ? "bg-flamencalia-red/10 text-flamencalia-red"
          : "bg-white/90 backdrop-blur-sm text-neutral-400 hover:text-flamencalia-red hover:bg-white"
      } shadow-sm disabled:opacity-50`}
      aria-label={favorited ? "Quitar de favoritos" : "Añadir a favoritos"}
    >
      <svg
        className={`${iconSize} transition-transform ${animating ? "animate-heart" : ""}`}
        viewBox="0 0 24 24"
        fill={favorited ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={favorited ? 0 : 2}
        style={
          animating
            ? { filter: "drop-shadow(0 0 6px rgba(200,16,46,0.5))" }
            : undefined
        }
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
