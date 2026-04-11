"use client";

import { useState, useEffect } from "react";

interface FollowButtonProps {
  sellerId: string;
  initialFollowing?: boolean;
  initialCount?: number;
  compact?: boolean;
}

export function FollowButton({
  sellerId,
  initialFollowing = false,
  initialCount = 0,
  compact = false,
}: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/follows?following_id=${sellerId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.following !== undefined) setFollowing(d.following);
      })
      .catch(() => {});
  }, [sellerId]);

  async function handleToggle() {
    setLoading(true);
    try {
      if (following) {
        await fetch(`/api/follows?following_id=${sellerId}`, {
          method: "DELETE",
        });
        setFollowing(false);
        setCount((c) => Math.max(0, c - 1));
      } else {
        await fetch("/api/follows", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ following_id: sellerId }),
        });
        setFollowing(true);
        setCount((c) => c + 1);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  if (compact) {
    return (
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-all ${
          following
            ? "bg-flamencalia-albero-pale text-flamencalia-black border border-flamencalia-albero"
            : "bg-flamencalia-black text-white hover:bg-flamencalia-black/80"
        } disabled:opacity-50`}
      >
        {following ? "Siguiendo" : "Seguir"}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`flex items-center gap-2 text-sm font-semibold px-5 py-2 rounded-full transition-all ${
          following
            ? "bg-flamencalia-albero-pale text-flamencalia-black border border-flamencalia-albero hover:bg-flamencalia-albero-pale/50"
            : "bg-flamencalia-black text-white hover:bg-flamencalia-black/80"
        } disabled:opacity-50`}
      >
        {following ? (
          <>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
            Siguiendo
          </>
        ) : (
          <>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path d="M12 4v16m8-8H4" />
            </svg>
            Seguir
          </>
        )}
      </button>
      {count > 0 && (
        <span className="text-xs text-flamencalia-black/50">
          {count} {count === 1 ? "seguidor" : "seguidores"}
        </span>
      )}
    </div>
  );
}
