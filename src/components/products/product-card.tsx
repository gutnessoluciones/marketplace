"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Icon } from "@/components/icons";
import { FavoriteButton } from "@/components/social/favorite-button";
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
}: {
  product: Product;
  isFavorited?: boolean;
}) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group relative bg-white rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200"
    >
      {/* Image — tall like Vinted */}
      <div className="aspect-3/4 bg-flamencalia-cream relative overflow-hidden">
        {product.images?.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.title}
            className="object-cover w-full h-full group-hover:scale-[1.03] transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-flamencalia-albero/30">
            <Icon name="dress" className="w-10 h-10" />
          </div>
        )}

        {/* Heart button */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all">
          <FavoriteButton
            productId={product.id}
            initialFavorited={isFavorited}
            size="sm"
          />
        </div>

        {/* Condition badge */}
        {product.condition && (
          <span className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm text-[10px] font-semibold px-2 py-0.5 rounded-full text-neutral-700 uppercase tracking-wide">
            {CONDITION_LABELS[product.condition] ?? product.condition}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        {/* Price */}
        <p className="text-base font-bold text-flamencalia-black">
          {formatPrice(product.price)}
        </p>

        {/* Badges: size + brand */}
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          {product.size && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 uppercase">
              {product.size === "unica" ? "T.Única" : product.size}
            </span>
          )}
          {product.brand && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-flamencalia-albero-pale/40 text-flamencalia-black truncate max-w-20">
              {product.brand}
            </span>
          )}
        </div>

        {/* Title */}
        <p className="text-xs text-neutral-500 mt-1.5 line-clamp-1">
          {product.title}
        </p>

        {/* Seller */}
        {product.seller && (
          <div className="flex items-center gap-1.5 mt-2">
            <div className="w-5 h-5 rounded-full bg-neutral-100 overflow-hidden shrink-0">
              {product.seller.avatar_url ? (
                <img
                  src={product.seller.avatar_url}
                  alt=""
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
          </div>
        )}
      </div>
    </Link>
  );
}
