"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/icons";
import { VerificationBadge } from "@/components/social/verification-badge";

interface RecommendedProduct {
  id: string;
  title: string;
  price: number;
  images: string[];
  category: string;
  seller?: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
    verification_status: string | null;
  };
}

export function Recommendations({
  excludeId,
  limit = 4,
  title = "También te puede gustar",
}: {
  excludeId?: string;
  limit?: number;
  title?: string;
}) {
  const [products, setProducts] = useState<RecommendedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (excludeId) params.set("exclude", excludeId);
    params.set("limit", String(limit));

    fetch(`/api/recommendations?${params}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.data) setProducts(json.data);
      })
      .finally(() => setLoading(false));
  }, [excludeId, limit]);

  if (loading) {
    return (
      <div className="mt-10">
        <h3 className="font-serif text-xl font-bold text-flamencalia-black mb-4">
          {title}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: limit }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl overflow-hidden animate-pulse"
            >
              <div className="aspect-3/4 bg-gray-100" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!products.length) return null;

  return (
    <div className="mt-10">
      <h3 className="font-serif text-xl font-bold text-flamencalia-black mb-4 flex items-center gap-2">
        <Icon name="sparkle" className="w-5 h-5 text-flamencalia-albero" />
        {title}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="group bg-white rounded-xl overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="aspect-3/4 relative bg-gray-50">
              {product.images?.[0] ? (
                <Image
                  src={product.images[0]}
                  alt={product.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <Icon name="dress" className="w-8 h-8" />
                </div>
              )}
            </div>
            <div className="p-3">
              <p className="text-xs text-flamencalia-black font-medium line-clamp-1">
                {product.title}
              </p>
              <p className="text-sm font-bold text-flamencalia-red mt-0.5">
                {product.price.toFixed(2)} €
              </p>
              {product.seller && (
                <div className="flex items-center gap-1 mt-1.5">
                  <span className="text-[10px] text-gray-400 truncate">
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
        ))}
      </div>
    </div>
  );
}
