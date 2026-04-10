import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/products/product-card";
import { Icon } from "@/components/icons";
import { SiteHeader } from "@/components/layout/site-header";
import { Footer } from "@/components/layout/footer";

interface PageProps {
  params: Promise<{ id: string }>;
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

export default async function SellerProfilePage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, bio, location, website, created_at")
    .eq("id", id)
    .single();

  if (!profile) notFound();

  const { data: products } = await supabase
    .from("products")
    .select("*, seller:profiles!seller_id(id, display_name, avatar_url)")
    .eq("seller_id", id)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  const { count: totalProducts } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("seller_id", id)
    .eq("status", "active");

  const memberSince = new Date(profile.created_at).toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-flamencalia-cream">
      <SiteHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile header */}
        <div className="bg-flamencalia-white rounded-2xl border border-flamencalia-albero-pale/50 p-6 sm:p-8 mb-8 shadow-sm">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-flamencalia-albero-pale/50 border-3 border-flamencalia-albero-pale overflow-hidden flex items-center justify-center shrink-0">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name ?? "Vendedor"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Icon
                  name="user"
                  className="w-12 h-12 text-flamencalia-albero"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold font-serif text-flamencalia-black">
                {profile.display_name ?? "Vendedor"}
              </h1>
              {profile.bio && (
                <p className="text-sm text-neutral-600 mt-2 max-w-xl">
                  {profile.bio}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-neutral-500">
                <span className="flex items-center gap-1.5">
                  <Icon name="package" className="w-4 h-4" />
                  {totalProducts ?? 0} producto
                  {(totalProducts ?? 0) !== 1 ? "s" : ""}
                </span>
                <span className="flex items-center gap-1.5">
                  <Icon name="fan" className="w-4 h-4" />
                  Miembro desde {memberSince}
                </span>
                {profile.location && (
                  <span className="flex items-center gap-1.5">
                    <Icon name="mapPin" className="w-4 h-4" />
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
                    className="flex items-center gap-1.5 text-flamencalia-red hover:text-flamencalia-red-dark transition-colors"
                  >
                    <Icon name="globe" className="w-4 h-4" />
                    Web
                  </a>
                )}
              </div>
              <Link
                href={`/products?seller=${profile.id}`}
                className="inline-flex items-center gap-2 mt-4 bg-flamencalia-red text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-flamencalia-red-dark transition-all"
              >
                Ver todos sus productos →
              </Link>
            </div>
          </div>
        </div>

        {/* Products */}
        <h2 className="font-serif text-xl font-bold text-flamencalia-black mb-5 flex items-center gap-2">
          <Icon name="sparkle" className="w-5 h-5 text-flamencalia-albero" />
          Productos de {profile.display_name ?? "este vendedor"}
        </h2>

        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
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
