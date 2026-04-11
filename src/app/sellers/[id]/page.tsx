import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SellerProductCard } from "@/components/products/seller-product-card";
import { FavoritesService } from "@/services/favorites.service";
import { FollowButton } from "@/components/social/follow-button";
import { Icon } from "@/components/icons";
import { SiteHeader } from "@/components/layout/site-header";
import { Footer } from "@/components/layout/footer";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sort?: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", id)
    .single();

  const name = profile?.display_name ?? "Vendedor";
  return {
    title: `${name} - Flamencalia`,
    description: `Descubre los productos de ${name} en Flamencalia.`,
  };
}

export default async function SellerProfilePage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { sort } = await searchParams;
  const activeSort = sort === "recent" ? "recent" : "popular";
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id, display_name, avatar_url, banner_url, bio, location, website, created_at, followers_count, following_count",
    )
    .eq("id", id)
    .single();

  if (!profile) notFound();

  let productsQuery = supabase
    .from("products")
    .select(
      "id, title, price, images, likes_count, views_count, condition, brand, size, created_at",
    )
    .eq("seller_id", id)
    .eq("status", "active");

  if (activeSort === "popular") {
    productsQuery = productsQuery.order("likes_count", { ascending: false });
  } else {
    productsQuery = productsQuery.order("created_at", { ascending: false });
  }

  const { data: products } = await productsQuery;

  const { count: totalProducts } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("seller_id", id)
    .eq("status", "active");

  // Fetch reviews for all seller products (last 3 per product)
  const productIds = (products ?? []).map((p) => p.id);
  let reviewsByProduct: Record<
    string,
    {
      reviews: Array<{
        id: string;
        rating: number;
        comment: string | null;
        created_at: string;
        buyer: {
          display_name: string | null;
          avatar_url: string | null;
        } | null;
      }>;
      count: number;
    }
  > = {};
  if (productIds.length > 0) {
    const { data: allReviews } = await supabase
      .from("reviews")
      .select(
        "id, product_id, rating, comment, created_at, buyer:profiles!buyer_id(display_name, avatar_url)",
      )
      .in("product_id", productIds)
      .order("created_at", { ascending: false });

    // Group by product
    for (const review of allReviews ?? []) {
      const pid = review.product_id;
      if (!reviewsByProduct[pid]) {
        reviewsByProduct[pid] = { reviews: [], count: 0 };
      }
      reviewsByProduct[pid].count++;
      if (reviewsByProduct[pid].reviews.length < 3) {
        const buyer = Array.isArray(review.buyer)
          ? review.buyer[0]
          : review.buyer;
        reviewsByProduct[pid].reviews.push({
          id: review.id,
          rating: review.rating,
          comment: review.comment,
          created_at: review.created_at,
          buyer,
        });
      }
    }
  }

  // Calculate total likes across all products
  const totalLikes = (products ?? []).reduce(
    (sum, p) => sum + (p.likes_count ?? 0),
    0,
  );

  // Average rating
  const allRatings = Object.values(reviewsByProduct).flatMap((r) =>
    r.reviews.map((rev) => rev.rating),
  );
  const avgRating =
    allRatings.length > 0
      ? allRatings.reduce((s, r) => s + r, 0) / allRatings.length
      : 0;
  const totalReviews = Object.values(reviewsByProduct).reduce(
    (sum, r) => sum + r.count,
    0,
  );

  const memberSince = new Date(profile.created_at).toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });

  // Get current user + favorites
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let favoriteIds: string[] = [];
  if (user) {
    const favService = new FavoritesService(supabase);
    favoriteIds = await favService.getUserFavoriteIds(user.id);
  }
  const isOwnProfile = user?.id === id;

  return (
    <div className="min-h-screen bg-flamencalia-cream">
      <SiteHeader />

      {/* Cover / Hero area */}
      <div className="relative overflow-hidden">
        {/* Banner image or gradient fallback */}
        {profile.banner_url ? (
          <div className="absolute inset-0">
            <img
              src={profile.banner_url}
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-b from-black/40 via-black/50 to-black/80" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-flamencalia-black via-flamencalia-black/95 to-flamencalia-red-dark/70">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-flamencalia-albero/8 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-flamencalia-red/8 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-flamencalia-albero/5 rounded-full blur-2xl" />
          </div>
        )}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-24 relative">
          <div className="flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="relative mb-4">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-3 border-flamencalia-albero/40 bg-flamencalia-albero-pale/20 overflow-hidden shadow-2xl ring-4 ring-white/5">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.display_name ?? "Vendedor"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon name="user" className="w-12 h-12 text-white/40" />
                  </div>
                )}
              </div>
              {/* Online indicator */}
              <div className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-400 border-2 border-flamencalia-black rounded-full" />
            </div>

            {/* Name */}
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-white">
              {profile.display_name ?? "Vendedor"}
            </h1>

            {/* Bio */}
            {profile.bio && (
              <p className="text-sm text-white/50 mt-2 max-w-md leading-relaxed">
                {profile.bio}
              </p>
            )}

            {/* Meta */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-3 text-xs text-white/35">
              {profile.location && (
                <span className="flex items-center gap-1">
                  <Icon name="mapPin" className="w-3 h-3" />
                  {profile.location}
                </span>
              )}
              {profile.website && (
                <a
                  href={
                    profile.website.startsWith("http")
                      ? profile.website
                      : `https://${profile.website}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-flamencalia-albero transition-colors"
                >
                  <Icon name="globe" className="w-3 h-3" />
                  Web
                </a>
              )}
              <span className="flex items-center gap-1">
                <Icon name="fan" className="w-3 h-3" />
                Desde {memberSince}
              </span>
            </div>

            {/* Stats row — Instagram centered */}
            <div className="flex items-center gap-8 sm:gap-12 mt-6">
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold text-white">
                  {totalProducts ?? 0}
                </p>
                <p className="text-[11px] text-white/40 mt-0.5">
                  publicaciones
                </p>
              </div>
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold text-white">
                  {profile.followers_count ?? 0}
                </p>
                <p className="text-[11px] text-white/40 mt-0.5">seguidores</p>
              </div>
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold text-white">
                  {profile.following_count ?? 0}
                </p>
                <p className="text-[11px] text-white/40 mt-0.5">siguiendo</p>
              </div>
            </div>

            {/* Action buttons */}
            {!isOwnProfile && (
              <div className="flex items-center gap-3 mt-5">
                <FollowButton
                  sellerId={profile.id}
                  initialCount={profile.followers_count ?? 0}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Highlight stats bar — overlapping */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 mb-6">
        <div className="bg-white rounded-2xl border border-flamencalia-albero-pale/30 shadow-lg">
          <div className="grid grid-cols-3 divide-x divide-neutral-100">
            <div className="flex flex-col items-center py-4 sm:py-5">
              <div className="flex items-center gap-1.5 text-flamencalia-red">
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                <span className="text-lg sm:text-xl font-bold text-flamencalia-black">
                  {totalLikes}
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-neutral-400 mt-0.5">
                me gusta totales
              </p>
            </div>
            <div className="flex flex-col items-center py-4 sm:py-5">
              <div className="flex items-center gap-1.5 text-flamencalia-albero">
                <Icon name="star" className="w-4 h-4" />
                <span className="text-lg sm:text-xl font-bold text-flamencalia-black">
                  {avgRating > 0 ? avgRating.toFixed(1) : "—"}
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-neutral-400 mt-0.5">
                valoración media
              </p>
            </div>
            <div className="flex flex-col items-center py-4 sm:py-5">
              <div className="flex items-center gap-1.5 text-neutral-600">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span className="text-lg sm:text-xl font-bold text-flamencalia-black">
                  {totalReviews}
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-neutral-400 mt-0.5">
                reseñas
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Sort Tabs — Instagram style with icons */}
        <div className="flex items-center justify-between mb-5 border-b border-neutral-200 pb-3">
          <div className="flex items-center gap-1">
            <Link
              href={`/sellers/${id}?sort=popular`}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeSort === "popular"
                  ? "bg-flamencalia-black text-white"
                  : "text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              Populares
            </Link>
            <Link
              href={`/sellers/${id}?sort=recent`}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeSort === "recent"
                  ? "bg-flamencalia-black text-white"
                  : "text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              <Icon name="sparkle" className="w-4 h-4" />
              Recientes
            </Link>
          </div>
          <span className="text-xs text-neutral-400">
            {totalProducts ?? 0} producto{(totalProducts ?? 0) !== 1 ? "s" : ""}
          </span>
        </div>

        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((product) => {
              const prodReviews = reviewsByProduct[product.id] ?? {
                reviews: [],
                count: 0,
              };
              return (
                <SellerProductCard
                  key={product.id}
                  product={product}
                  reviews={prodReviews.reviews}
                  reviewCount={prodReviews.count}
                  isFavorited={favoriteIds.includes(product.id)}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-flamencalia-albero-pale/20 rounded-full flex items-center justify-center mx-auto mb-5">
              <Icon
                name="dress"
                className="w-10 h-10 text-flamencalia-albero/30"
              />
            </div>
            <h3 className="text-lg font-semibold text-neutral-600 mb-2">
              Sin productos todavía
            </h3>
            <p className="text-neutral-400 text-sm">
              Este vendedor aún no ha publicado productos.
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
