"use client";

import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { Icon } from "@/components/icons";
import { FavoriteButton } from "@/components/social/favorite-button";
import { VerificationBadge } from "@/components/social/verification-badge";
import type { Product } from "@/types";

const CONDITION_LABELS: Record<string, string> = {
  nuevo: "Nuevo",
  "como-nuevo": "Como nuevo",
  bueno: "Buen estado",
  aceptable: "Aceptable",
};

export function ProductCard({
  product,
  isFavorited,
  boosted,
}: {
  product: Product;
  isFavorited?: boolean;
  boosted?: boolean;
}) {
  return (
    <Link
      href={`/products/${product.id}`}
      className={`group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1${boosted ? " ring-2 ring-flamencalia-albero/40 glass-shine" : ""}`}
    >
      {/* Image — tall like Vinted */}
      <div className="aspect-3/4 bg-flamencalia-cream relative overflow-hidden">
        {product.images?.length > 0 ? (
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-flamencalia-albero/30">
            <Icon name="dress" className="w-10 h-10" />
          </div>
        )}

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Heart button */}
        <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
          <FavoriteButton
            productId={product.id}
            initialFavorited={isFavorited}
            size="sm"
          />
        </div>

        {/* Boosted badge */}
        {boosted && (
          <span className="absolute top-2.5 left-2.5 bg-flamencalia-albero text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md">
            ★ Destacado
          </span>
        )}

        {/* Condition badge */}
        {product.condition && (
          <span className="absolute bottom-2.5 left-2.5 bg-white/95 backdrop-blur-sm text-[10px] font-semibold px-2.5 py-1 rounded-full text-neutral-700 uppercase tracking-wide shadow-sm">
            {CONDITION_LABELS[product.condition] ?? product.condition}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3.5">
        {/* Price */}
        <p className="text-lg font-bold text-flamencalia-black">
          {formatPrice(product.price)}
        </p>

        {/* Badges: size + brand */}
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          {product.size && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-flamencalia-cream text-neutral-600 uppercase">
              {product.size === "unica" ? "T.Única" : product.size}
            </span>
          )}
          {product.brand && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-flamencalia-albero-pale/30 text-flamencalia-black truncate max-w-24">
              {product.brand}
            </span>
          )}
        </div>

        {/* Title */}
        <p className="text-xs text-neutral-500 mt-2 line-clamp-2 leading-relaxed">
          {product.title}
        </p>

        {/* Seller */}
        {product.seller && (
          <div className="flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-flamencalia-cream">
            <div className="w-5 h-5 rounded-full bg-flamencalia-cream overflow-hidden shrink-0 ring-1 ring-flamencalia-albero-pale/30">
              {product.seller.avatar_url ? (
                <Image
                  src={product.seller.avatar_url}
                  alt=""
                  width={20}
                  height={20}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Icon name="user" className="w-3 h-3 text-neutral-400" />
                </div>
              )}
            </div>
            <span className="text-[11px] text-neutral-400 truncate">
              {product.seller.display_name}
            </span>
            <VerificationBadge
              status={product.seller.verification_status}
              size="sm"
            />
          </div>
        )}
      </div>
    </Link>
  );
}
