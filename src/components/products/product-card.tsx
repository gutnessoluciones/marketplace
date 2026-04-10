import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Icon } from "@/components/icons";
import type { Product } from "@/types";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group bg-flamencalia-white border border-flamencalia-albero-pale/50 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 product-card-hover"
    >
      <div className="bg-flamencalia-cream aspect-4/3 flex items-center justify-center relative overflow-hidden">
        {product.images?.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.title}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-flamencalia-albero/30">
            <Icon name="dress" className="w-10 h-10" />
            <span className="text-xs">Sin imagen</span>
          </div>
        )}
        {product.category && (
          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-medium px-2.5 py-1 rounded-full capitalize text-flamencalia-black">
            {product.category}
          </span>
        )}
        {/* Heart icon on hover */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-flamencalia-red hover:text-white transition-colors cursor-pointer">
            <Icon name="heart" className="w-4 h-4 text-flamencalia-red" />
          </div>
        </div>
      </div>
      <div className="p-4">
        <p className="font-medium group-hover:text-flamencalia-red transition-colors truncate">
          {product.title}
        </p>
        <p className="text-lg font-bold text-flamencalia-red mt-1">
          {formatPrice(product.price)}
        </p>
        {product.seller && (
          <p className="text-xs text-neutral-400 mt-2">
            {product.seller.display_name}
          </p>
        )}
      </div>
    </Link>
  );
}
