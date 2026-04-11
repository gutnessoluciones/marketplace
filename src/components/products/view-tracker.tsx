"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { addToRecentlyViewed } from "@/components/social/recently-viewed";

interface ViewTrackerProps {
  productId: string;
  title?: string;
  price?: number;
  image?: string;
}

export function ViewTracker({
  productId,
  title,
  price,
  image,
}: ViewTrackerProps) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;

    const supabase = createClient();
    supabase.rpc("increment_product_views", { product_id: productId }).then();

    if (title && price !== undefined) {
      addToRecentlyViewed({ id: productId, title, price, image: image ?? "" });
    }
  }, [productId, title, price, image]);

  return null;
}
