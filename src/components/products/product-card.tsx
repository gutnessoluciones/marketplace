import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200"
    >
      <div className="bg-gray-100 aspect-square flex items-center justify-center">
        {product.images?.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.title}
            className="object-cover w-full h-full"
          />
        ) : (
          <span className="text-gray-400 text-xs">Sin imagen</span>
        )}
      </div>
      <div className="p-4">
        <p className="text-sm font-medium group-hover:underline truncate">
          {product.title}
        </p>
        <p className="text-sm font-bold mt-1">{formatPrice(product.price)}</p>
        {product.seller && (
          <p className="text-xs text-gray-500 mt-1">
            {product.seller.display_name}
          </p>
        )}
      </div>
    </Link>
  );
}
