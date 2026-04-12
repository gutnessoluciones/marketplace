"use client";

import { useCart, type CartItem } from "./cart-provider";

interface AddToCartButtonProps {
  product: {
    id: string;
    title: string;
    price: number;
    images: string[];
    seller_id: string;
    seller?: { display_name: string | null } | null;
  };
  className?: string;
}

export function AddToCartButton({ product, className }: AddToCartButtonProps) {
  const { addItem, removeItem, isInCart } = useCart();
  const inCart = isInCart(product.id);

  const handleClick = () => {
    if (inCart) {
      removeItem(product.id);
    } else {
      const item: CartItem = {
        product_id: product.id,
        title: product.title,
        price: product.price,
        image: product.images?.[0] ?? null,
        seller_id: product.seller_id,
        seller_name: product.seller?.display_name ?? "Vendedor",
        added_at: new Date().toISOString(),
      };
      addItem(item);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={
        className ??
        `flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
          inCart
            ? "border-flamencalia-albero bg-flamencalia-albero/10 text-flamencalia-albero"
            : "border-gray-200 text-flamencalia-black hover:border-flamencalia-albero hover:bg-flamencalia-albero/5"
        }`
      }
    >
      <svg
        className="h-4 w-4"
        fill={inCart ? "currentColor" : "none"}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
        />
      </svg>
      {inCart ? "En el carrito" : "Añadir al carrito"}
    </button>
  );
}
