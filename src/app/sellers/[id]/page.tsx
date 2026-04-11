import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/products/product-card";
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
      "id, display_name, avatar_url, bio, location, website, created_at, followers_count, following_count",
    )
    .eq("id", id)
    .single();

  if (!profile) notFound();

  let productsQuery = supabase
    .from("products")
    .select("*, seller:profiles!seller_id(id, display_name, avatar_url)")
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
      <div className="bg-linear-to-br from-flamencalia-black via-flamencalia-black/90 to-flamencalia-red-dark/80 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-flamencalia-albero rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-flamencalia-red rounded-full blur-3xl" />
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
            {/* Avatar */}
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white/20 bg-flamencalia-albero-pale/30 overflow-hidden shadow-2xl shrink-0">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name ?? "Vendedor"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Icon name="user" className="w-14 h-14 text-white/60" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left min-w-0">
              <h1 className="text-3xl sm:text-4xl font-bold font-serif text-white">
                {profile.display_name ?? "Vendedor"}
              </h1>
              {profile.bio && (
                <p className="text-sm text-white/60 mt-2 max-w-lg">
                  {profile.bio}
                </p>
              )}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-sm text-white/50">
                {profile.location && (
                  <span className="flex items-center gap-1.5">
                    <Icon name="mapPin" className="w-3.5 h-3.5" />
                    {profile.location}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Icon name="fan" className="w-3.5 h-3.5" />
                  Miembro desde {memberSince}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar + Actions — pulled up to overlap cover */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <div className="bg-white rounded-2xl border border-flamencalia-albero-pale/40 shadow-lg p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            {/* Stats */}
            <div className="flex items-center gap-6 sm:gap-8 flex-1">
              <div className="text-center">
                <p className="text-2xl font-bold text-flamencalia-black">
                  {totalProducts ?? 0}
                </p>
                <p className="text-xs text-neutral-500">Productos</p>
              </div>
              <div className="w-px h-8 bg-neutral-200" />
              <div className="text-center">
                <p className="text-2xl font-bold text-flamencalia-black">
                  {profile.followers_count ?? 0}
                </p>
                <p className="text-xs text-neutral-500">Seguidores</p>
              </div>
              <div className="w-px h-8 bg-neutral-200" />
              <div className="text-center">
                <p className="text-2xl font-bold text-flamencalia-black">
                  {profile.following_count ?? 0}
                </p>
                <p className="text-xs text-neutral-500">Siguiendo</p>
              </div>
            </div>

            {/* Actions */}
            {!isOwnProfile && (
              <div className="flex items-center gap-3">
                <FollowButton
                  sellerId={profile.id}
                  initialCount={profile.followers_count ?? 0}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Sort Tabs */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-xl font-bold text-flamencalia-black flex items-center gap-2">
            <Icon name="sparkle" className="w-5 h-5 text-flamencalia-albero" />
            Productos
          </h2>
          <div className="flex bg-flamencalia-albero-pale/15 rounded-full p-0.5">
            <Link
              href={`/sellers/${id}?sort=popular`}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeSort === "popular"
                  ? "bg-flamencalia-black text-white shadow-sm"
                  : "text-neutral-500 hover:text-flamencalia-black"
              }`}
            >
              Populares
            </Link>
            <Link
              href={`/sellers/${id}?sort=recent`}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeSort === "recent"
                  ? "bg-flamencalia-black text-white shadow-sm"
                  : "text-neutral-500 hover:text-flamencalia-black"
              }`}
            >
              Recientes
            </Link>
          </div>
        </div>

        {products && products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isFavorited={favoriteIds.includes(product.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-flamencalia-albero-pale/30 rounded-full flex items-center justify-center mx-auto mb-5">
              <Icon name="package" className="w-8 h-8 text-neutral-300" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-700 mb-2">
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
