"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";

export interface CartItem {
  product_id: string;
  title: string;
  price: number; // cents
  image: string | null;
  seller_id: string;
  seller_name: string;
  added_at: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  clearSeller: (sellerId: string) => void;
  clearAll: () => void;
  isInCart: (productId: string) => boolean;
  count: number;
  sellerGroups: Map<string, { sellerName: string; items: CartItem[] }>;
}

const CartContext = createContext<CartContextType | null>(null);
const STORAGE_KEY = "flamencalia_cart";

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage full or unavailable
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setItems(loadCart());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveCart(items);
  }, [items, loaded]);

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      if (prev.some((i) => i.product_id === item.product_id)) return prev;
      return [...prev, { ...item, added_at: new Date().toISOString() }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.product_id !== productId));
  }, []);

  const clearSeller = useCallback((sellerId: string) => {
    setItems((prev) => prev.filter((i) => i.seller_id !== sellerId));
  }, []);

  const clearAll = useCallback(() => setItems([]), []);

  const isInCart = useCallback(
    (productId: string) => items.some((i) => i.product_id === productId),
    [items],
  );

  const sellerGroups = new Map<
    string,
    { sellerName: string; items: CartItem[] }
  >();
  for (const item of items) {
    const existing = sellerGroups.get(item.seller_id);
    if (existing) {
      existing.items.push(item);
    } else {
      sellerGroups.set(item.seller_id, {
        sellerName: item.seller_name,
        items: [item],
      });
    }
  }

  return (
    <CartContext
      value={{
        items,
        addItem,
        removeItem,
        clearSeller,
        clearAll,
        isInCart,
        count: items.length,
        sellerGroups,
      }}
    >
      {children}
    </CartContext>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
