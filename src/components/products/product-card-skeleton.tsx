export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
      {/* Image skeleton */}
      <div className="aspect-3/4 bg-flamencalia-albero-pale/20 relative overflow-hidden">
        <div className="absolute inset-0 animate-shimmer" />
      </div>

      {/* Info skeleton */}
      <div className="p-3.5 space-y-2.5">
        {/* Price */}
        <div className="h-5 w-16 bg-flamencalia-albero-pale/20 rounded-full" />

        {/* Badges */}
        <div className="flex gap-1.5">
          <div className="h-4 w-10 bg-flamencalia-albero-pale/15 rounded-full" />
          <div className="h-4 w-16 bg-flamencalia-albero-pale/15 rounded-full" />
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <div className="h-3 w-full bg-flamencalia-albero-pale/15 rounded" />
          <div className="h-3 w-2/3 bg-flamencalia-albero-pale/15 rounded" />
        </div>

        {/* Seller */}
        <div className="flex items-center gap-1.5 pt-2.5 border-t border-flamencalia-cream">
          <div className="w-5 h-5 rounded-full bg-flamencalia-albero-pale/20" />
          <div className="h-3 w-20 bg-flamencalia-albero-pale/15 rounded" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
