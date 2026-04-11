"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Icon } from "@/components/icons";

interface ReviewPreview {
  id: string;
  rating: number;
  comment: string | null;
  buyer: { display_name: string | null; avatar_url: string | null } | null;
  created_at: string;
}

interface SellerProductCardProps {
  product: {
    id: string;
    title: string;
    price: number;
    images: string[];
    likes_count: number;
    views_count: number;
    condition?: string | null;
    brand?: string | null;
    size?: string | null;
    created_at: string;
  };
  reviews: ReviewPreview[];
  reviewCount: number;
  isFavorited?: boolean;
}

const CONDITION_LABELS: Record<string, string> = {
  nuevo: "Nuevo",
  "como-nuevo": "Como nuevo",
  bueno: "Buen estado",
  aceptable: "Aceptable",
};

export function SellerProductCard({
  product,
  reviews,
  reviewCount,
  isFavorited = false,
}: SellerProductCardProps) {
  const [favorited, setFavorited] = useState(isFavorited);
  const [likesCount, setLikesCount] = useState(product.likes_count);
  const [animating, setAnimating] = useState(false);
  const [doubleTapAnim, setDoubleTapAnim] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const lastTapRef = useState<number>(0);

  const handleLike = useCallback(
    async (e?: React.MouseEvent) => {
      e?.preventDefault();
      e?.stopPropagation();
      if (loading) return;
      setLoading(true);

      try {
        const res = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product_id: product.id }),
        });
        const data = await res.json();

        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }

        if (data.favorited !== undefined) {
          setFavorited(data.favorited);
          setLikesCount((prev) => prev + (data.favorited ? 1 : -1));
          if (data.favorited) {
            setAnimating(true);
            setTimeout(() => setAnimating(false), 400);
          }
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    },
    [loading, product.id],
  );

  const handleDoubleTap = useCallback(
    (e: React.MouseEvent) => {
      const now = Date.now();
      if (now - lastTapRef[0] < 300) {
        e.preventDefault();
        e.stopPropagation();
        if (!favorited) {
          handleLike();
        }
        setDoubleTapAnim(true);
        setTimeout(() => setDoubleTapAnim(false), 800);
        lastTapRef[1](0);
      } else {
        lastTapRef[1](now);
      }
    },
    [favorited, handleLike, lastTapRef],
  );

  const timeAgo = getTimeAgo(product.created_at);

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-neutral-100 hover:border-flamencalia-albero-pale/60 transition-all hover:shadow-md group">
      {/* Image — Instagram square */}
      <Link
        href={`/products/${product.id}`}
        className="block relative aspect-square overflow-hidden bg-flamencalia-cream"
        onClick={handleDoubleTap}
      >
        {product.images?.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
            draggable={false}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-flamencalia-albero/20">
            <Icon name="dress" className="w-16 h-16" />
          </div>
        )}

        {/* Price badge */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 shadow-sm">
          <span className="text-sm font-bold text-flamencalia-black">
            {formatPrice(product.price)}
          </span>
        </div>

        {/* Condition badge */}
        {product.condition && (
          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[10px] font-semibold px-2 py-0.5 rounded-full text-neutral-600 uppercase tracking-wide">
            {CONDITION_LABELS[product.condition] ?? product.condition}
          </span>
        )}

        {/* Image count */}
        {product.images?.length > 1 && (
          <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
            +{product.images.length - 1}
          </div>
        )}

        {/* Double-tap heart animation */}
        {doubleTapAnim && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <svg
              className="w-20 h-20 text-white drop-shadow-lg animate-[heartPop_0.8s_ease-out_forwards]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
        )}
      </Link>

      {/* Action bar — Instagram style */}
      <div className="px-3 pt-2.5 pb-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Like button */}
            <button
              onClick={handleLike}
              disabled={loading}
              className={`flex items-center gap-1 transition-all disabled:opacity-50 ${
                favorited
                  ? "text-flamencalia-red"
                  : "text-neutral-500 hover:text-flamencalia-red"
              }`}
            >
              <svg
                className={`w-5.5 h-5.5 transition-transform ${animating ? "scale-125" : "scale-100"}`}
                viewBox="0 0 24 24"
                fill={favorited ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth={favorited ? 0 : 1.8}
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>

            {/* Comment button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                setShowComments(!showComments);
              }}
              className="flex items-center gap-1 text-neutral-500 hover:text-flamencalia-black transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </button>

            {/* Views */}
            <span className="flex items-center gap-1 text-neutral-400 text-xs">
              <Icon name="eye" className="w-4 h-4" />
              {product.views_count}
            </span>
          </div>

          {/* Bookmark / link to detail */}
          <Link
            href={`/products/${product.id}`}
            className="text-neutral-400 hover:text-flamencalia-black transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </Link>
        </div>

        {/* Likes count */}
        <p className="text-xs font-semibold text-flamencalia-black mt-1.5">
          {likesCount} {likesCount === 1 ? "me gusta" : "me gusta"}
        </p>

        {/* Title + time ago */}
        <div className="mt-1">
          <Link
            href={`/products/${product.id}`}
            className="text-sm text-flamencalia-black hover:text-flamencalia-red transition-colors line-clamp-1"
          >
            <span className="font-semibold">{product.title}</span>
          </Link>
          {product.brand && (
            <span className="text-[11px] text-neutral-400 ml-1">
              · {product.brand}
            </span>
          )}
        </div>

        {/* Reviews count link */}
        {reviewCount > 0 && (
          <button
            onClick={() => setShowComments(!showComments)}
            className="text-xs text-neutral-400 mt-0.5 hover:text-neutral-600 transition-colors"
          >
            Ver{" "}
            {reviewCount === 1
              ? "1 comentario"
              : `los ${reviewCount} comentarios`}
          </button>
        )}

        {/* Time ago */}
        <p className="text-[10px] text-neutral-300 uppercase tracking-wider mt-1 mb-2">
          {timeAgo}
        </p>
      </div>

      {/* Comments section — expandable */}
      {showComments && (
        <div className="border-t border-neutral-100 px-3 py-2.5 space-y-2.5 max-h-48 overflow-y-auto">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-flamencalia-albero-pale/30 overflow-hidden shrink-0 mt-0.5">
                  {review.buyer?.avatar_url ? (
                    <img
                      src={review.buyer.avatar_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[9px] font-bold text-flamencalia-albero">
                      {(review.buyer?.display_name || "?")
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-flamencalia-black">
                      {review.buyer?.display_name ?? "Usuario"}
                    </span>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg
                          key={i}
                          className={`w-2.5 h-2.5 ${
                            i < review.rating
                              ? "text-flamencalia-albero"
                              : "text-neutral-200"
                          }`}
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-xs text-neutral-600 mt-0.5 line-clamp-2 leading-relaxed">
                      {review.comment}
                    </p>
                  )}
                  <p className="text-[10px] text-neutral-300 mt-0.5">
                    {getTimeAgo(review.created_at)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-neutral-400 text-center py-2">
              Aún no hay comentarios
            </p>
          )}
          <Link
            href={`/products/${product.id}`}
            className="block text-center text-xs text-flamencalia-red font-medium hover:text-flamencalia-red-dark transition-colors py-1"
          >
            Ver producto completo →
          </Link>
        </div>
      )}
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);
  const diffW = Math.floor(diffD / 7);

  if (diffMin < 1) return "ahora";
  if (diffMin < 60) return `hace ${diffMin} min`;
  if (diffH < 24) return `hace ${diffH}h`;
  if (diffD < 7) return `hace ${diffD}d`;
  if (diffW < 52) return `hace ${diffW} sem`;
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}
