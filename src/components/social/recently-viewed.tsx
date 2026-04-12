"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { Icon } from "@/components/icons";

const STORAGE_KEY = "flamencalia_recent";
const MAX_ITEMS = 8;

interface RecentProduct {
  id: string;
  title: string;
  price: number;
  image: string;
}

export function addToRecentlyViewed(product: RecentProduct) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const existing: RecentProduct[] = raw ? JSON.parse(raw) : [];
    const filtered = existing.filter((p) => p.id !== product.id);
    filtered.unshift(product);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(filtered.slice(0, MAX_ITEMS)),
    );
  } catch {
    // silent
  }
}

export function RecentlyViewed() {
  const [products, setProducts] = useState<RecentProduct[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: RecentProduct[] = JSON.parse(raw);
        setProducts(parsed.slice(0, MAX_ITEMS));
      }
    } catch {
      // silent
    }
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-5">
        <div className="h-px flex-1 bg-flamencalia-albero-pale" />
        <h2 className="font-serif text-2xl font-bold text-flamencalia-black flex items-center gap-2">
          <Icon name="eye" className="w-5 h-5 text-flamencalia-albero" />
          Vistos recientemente
        </h2>
        <div className="h-px flex-1 bg-flamencalia-albero-pale" />
      </div>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="shrink-0 w-36 group"
          >
            <div className="aspect-3/4 bg-flamencalia-cream rounded-lg overflow-hidden">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  sizes="144px"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-flamencalia-albero/30">
                  <Icon name="dress" className="w-8 h-8" />
                </div>
              )}
            </div>
            <p className="text-xs text-neutral-500 mt-1.5 line-clamp-1 group-hover:text-flamencalia-albero transition-colors">
              {product.title}
            </p>
            <p className="text-sm font-bold text-flamencalia-black">
              {formatPrice(product.price)}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
