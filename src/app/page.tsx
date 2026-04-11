import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import { Icon } from "@/components/icons";
import { ProductCard } from "@/components/products/product-card";
import { FavoritesService } from "@/services/favorites.service";
import { UserNav } from "@/components/layout/user-nav";
import { PublicMobileNav } from "@/components/layout/public-mobile-nav";
import { Footer } from "@/components/layout/footer";
import { BannerCarousel } from "@/components/layout/banner-carousel";
import { RecentlyViewed } from "@/components/social/recently-viewed";
import AnimatedBrand from "@/components/animated-brand";
import { MobileSearch } from "@/components/layout/mobile-search";

const CATEGORIES = [
  {
    slug: "feria",
    label: "Feria",
    icon: "fan",
    image: "/categorias/feria.jpg",
  },
  {
    slug: "camino",
    label: "Camino",
    icon: "horseshoe",
    image: "/categorias/camino.jpg",
  },
  {
    slug: "complementos-flamencos",
    label: "Complementos",
    icon: "flower",
    image: "/categorias/complementos.jpg",
  },
  {
    slug: "invitada-flamenca",
    label: "Invitada Flamenca",
    icon: "dress",
    image: "/categorias/invitada.jpg",
  },
  {
    slug: "moda-infantil",
    label: "Moda Infantil",
    icon: "child",
    image: "/categorias/infantil.jpg",
  },
  {
    slug: "equitacion",
    label: "Equitación",
    icon: "horseshoe",
    image: "/categorias/equitacion.jpg",
  },
  {
    slug: "zapatos",
    label: "Zapatos",
    icon: "shoe",
    image: "/categorias/zapatos.jpg",
  },
  {
    slug: "todo",
    label: "Todo",
    icon: "fan",
    image: "/categorias/todo.jpg",
  },
];

export default async function HomePage() {
  const supabase = await createClient();

  const { data: featuredProducts } = await supabase
    .from("products")
    .select(
      "*, seller:profiles!seller_id(id, display_name, avatar_url, verification_status)",
    )
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(8);

  const { data: recentProducts } = await supabase
    .from("products")
    .select(
      "*, seller:profiles!seller_id(id, display_name, avatar_url, verification_status)",
    )
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(4);

  const { data: dealProducts } = await supabase
    .from("products")
    .select(
      "*, seller:profiles!seller_id(id, display_name, avatar_url, verification_status)",
    )
    .eq("status", "active")
    .order("price", { ascending: true })
    .limit(4);

  // Top sellers: profiles that have active products, ordered by product count
  const { data: topSellersRaw } = await supabase
    .from("products")
    .select(
      "seller_id, seller:profiles!seller_id(id, display_name, avatar_url)",
    )
    .eq("status", "active");

  const sellerMap = new Map<
    string,
    {
      id: string;
      display_name: string | null;
      avatar_url: string | null;
      product_count: number;
    }
  >();
  for (const p of topSellersRaw ?? []) {
    const raw = p.seller as unknown;
    const s = (Array.isArray(raw) ? raw[0] : raw) as {
      id: string;
      display_name: string | null;
      avatar_url: string | null;
    } | null;
    if (!s) continue;
    const existing = sellerMap.get(s.id);
    if (existing) {
      existing.product_count++;
    } else {
      sellerMap.set(s.id, { ...s, product_count: 1 });
    }
  }
  const topSellers = Array.from(sellerMap.values())
    .sort((a, b) => b.product_count - a.product_count)
    .slice(0, 10);

  // Personalized feed: products from sellers the user follows
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let followedProducts: typeof featuredProducts = null;
  let favoriteIds: string[] = [];

  if (user) {
    // Get followed seller IDs
    const { data: followsData } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", user.id);

    const followedIds = (followsData ?? []).map((f) => f.following_id);

    if (followedIds.length > 0) {
      const { data } = await supabase
        .from("products")
        .select("*, seller:profiles!seller_id(id, display_name, avatar_url)")
        .eq("status", "active")
        .in("seller_id", followedIds)
        .order("created_at", { ascending: false })
        .limit(8);
      followedProducts = data;
    }

    // Get favorite IDs
    const favService = new FavoritesService(supabase);
    favoriteIds = await favService.getUserFavoriteIds(user.id);
  }

  return (
    <div className="flex flex-col min-h-screen bg-flamencalia-cream">
      {/* ═══ HEADER ═══ */}
      <header className="bg-flamencalia-white sticky top-0 z-30 shadow-sm">
        {/* Top decorative toldo */}
        <div className="h-1.5 toldo-rayas" />

        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {/* Mobile hamburger — left of logo */}
            <PublicMobileNav />
            <Link href="/" className="flex items-center gap-3 shrink-0">
              <Image
                src="/cliente/marca-flamencalia.svg"
                alt="FLAMENCALIA"
                width={220}
                height={44}
                className="h-8 sm:h-10 w-auto object-contain"
                priority
              />
              <Image
                src="/cliente/Abanico.svg"
                alt="Flamencalia"
                width={48}
                height={48}
                className="w-10 h-10 sm:w-12 sm:h-12"
              />
            </Link>
          </div>

          {/* Search bar */}
          <form
            action="/products"
            method="GET"
            className="hidden sm:block flex-1 max-w-xl"
          >
            <div className="relative">
              <Icon
                name="search"
                className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-flamencalia-albero"
              />
              <input
                type="text"
                name="q"
                placeholder="Buscar vestidos, mantones, complementos..."
                className="w-full bg-flamencalia-cream border border-flamencalia-albero-pale rounded-full pl-11 pr-5 py-2.5 text-sm text-flamencalia-black placeholder-neutral-400 hover:border-flamencalia-albero focus:border-flamencalia-albero focus:outline-none focus:ring-2 focus:ring-flamencalia-albero/20 transition-all"
              />
            </div>
          </form>

          <div className="flex items-center">
            <MobileSearch />
            <UserNav variant="light" />
          </div>
        </nav>

        {/* Categories bar — hidden on mobile (hamburger menu covers it) */}
        <div className="hidden sm:block border-t border-flamencalia-albero-pale/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 py-2">
            <Link
              href="/products"
              className="text-flamencalia-white bg-flamencalia-black text-xs font-serif font-semibold uppercase tracking-wide px-3.5 py-1.5 rounded-full hover:bg-flamencalia-black/80 transition-colors whitespace-nowrap"
            >
              Todo
            </Link>
            {CATEGORIES.filter((cat) => cat.slug !== "todo").map((cat) => (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="text-flamencalia-black/70 text-xs font-serif font-medium uppercase tracking-wide px-3 py-1.5 rounded-full hover:bg-flamencalia-albero/10 hover:text-flamencalia-albero transition-colors whitespace-nowrap"
              >
                {cat.label}
              </Link>
            ))}

            {/* Separador */}
            <span className="w-px h-4 bg-flamencalia-albero-pale/50 mx-1" />

            <Link
              href="/ferias"
              className="text-xs font-serif font-medium uppercase tracking-wide px-3 py-1.5 rounded-full hover:bg-flamencalia-albero/10 text-flamencalia-black/70 hover:text-flamencalia-albero transition-colors whitespace-nowrap"
            >
              Ferias
            </Link>
            <Link
              href="/blog"
              className="text-xs font-serif font-medium uppercase tracking-wide px-3 py-1.5 rounded-full hover:bg-flamencalia-albero/10 text-flamencalia-black/70 hover:text-flamencalia-albero transition-colors whitespace-nowrap"
            >
              Blog
            </Link>
            <Link
              href="/lookbook"
              className="text-xs font-serif font-medium uppercase tracking-wide px-3 py-1.5 rounded-full hover:bg-flamencalia-albero/10 text-flamencalia-black/70 hover:text-flamencalia-albero transition-colors whitespace-nowrap"
            >
              Inspírate
            </Link>
            <Link
              href="/about"
              className="text-flamencalia-albero text-xs font-serif font-medium uppercase tracking-wide px-3 py-1.5 rounded-full hover:bg-flamencalia-albero/10 hover:text-flamencalia-albero transition-colors whitespace-nowrap ml-auto"
            >
              Quiénes Somos
            </Link>
          </div>
        </div>
      </header>

      {/* ═══ HERO BANNER — Carrusel de colección ═══ */}
      <section className="relative overflow-hidden bg-flamencalia-black min-h-[calc(100svh-8rem)]">
        {/* Carrusel de fondo a pantalla completa */}
        <div className="absolute inset-0">
          <BannerCarousel />
        </div>

        {/* Overlay oscuro para legibilidad */}
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative flex items-center justify-center min-h-[calc(100svh-8rem)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Marca animada — F gira como flamenca */}
            <div className="flex justify-center items-center mb-6 animate-fade-in-up">
              <div className="w-62 sm:w-96 lg:w-150">
                <AnimatedBrand className="w-full h-auto text-white drop-shadow-lg" />
              </div>
            </div>

            {/* Slogan SVG */}
            <div
              className="flex justify-center mb-6 animate-fade-in-up"
              style={{ animationDelay: "0.1s" }}
            >
              <Image
                src="/cliente/slogan.svg?v=2"
                alt="Larga vida a tu Flamenca"
                width={600}
                height={80}
                className="object-contain w-full max-w-xs sm:max-w-md h-auto drop-shadow-lg"
                unoptimized
                priority
              />
            </div>
            <p
              className="mt-4 text-base sm:text-lg text-white/80 max-w-2xl mx-auto animate-fade-in-up"
              style={{ animationDelay: "0.2s" }}
            >
              Vestidos, mantones, flores y complementos de diseñadores y de la
              comunidad flamenca. Compra, vende y dale larga vida a tu flamenca.
            </p>
          </div>
        </div>

        {/* Borde inferior con ondas */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 100"
            fill="none"
            preserveAspectRatio="none"
            className="w-full h-14 sm:h-20"
          >
            <path
              d="M0 100V50C180 10 360 0 540 20s360 40 540 20 180-30 360-20v80H0z"
              fill="var(--flamencalia-cream)"
            />
          </svg>
        </div>
      </section>

      {/* ═══ MAIN CONTENT ═══ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 relative z-10 pb-12">
        {/* ── Categorías con imágenes grandes ── */}
        <section className="mb-14">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px flex-1 bg-flamencalia-albero-pale" />
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-flamencalia-black text-center">
              Explora por Categoría
            </h2>
            <div className="h-px flex-1 bg-flamencalia-albero-pale" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={
                  cat.slug === "todo"
                    ? "/products"
                    : `/products?category=${cat.slug}`
                }
                className="group relative overflow-hidden rounded-2xl"
              >
                <div className="aspect-4/5 relative">
                  <Image
                    src={cat.image}
                    alt={cat.label}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                    <h3 className="font-serif text-base sm:text-lg font-bold text-white drop-shadow-md">
                      {cat.label}
                    </h3>
                    <span className="text-xs text-white/70 font-medium mt-1 block group-hover:text-flamencalia-albero-light transition-colors">
                      {cat.slug === "todo"
                        ? "Explorar todo →"
                        : "Ver colección →"}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Vendedores & Diseñadores ── */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-flamencalia-albero-pale" />
            <h2 className="font-serif text-2xl font-bold text-flamencalia-black flex items-center gap-2">
              <Icon name="fan" className="w-5 h-5 text-flamencalia-albero" />
              Vendedores &amp; Diseñadores
            </h2>
            <div className="h-px flex-1 bg-flamencalia-albero-pale" />
          </div>
          {topSellers && topSellers.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {topSellers.map((seller) => (
                <Link
                  key={seller.id}
                  href={`/sellers/${seller.id}`}
                  className="group relative bg-flamencalia-white rounded-2xl border border-flamencalia-albero-pale/50 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Avatar grande */}
                  <div className="aspect-square relative bg-flamencalia-albero-pale/30">
                    {seller.avatar_url ? (
                      <img
                        src={seller.avatar_url}
                        alt={seller.display_name ?? "Vendedor"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-flamencalia-albero/20 to-flamencalia-red/10">
                        <Icon
                          name="user"
                          className="w-12 h-12 text-flamencalia-albero/60"
                        />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  {/* Info */}
                  <div className="p-3 text-center">
                    <p className="text-sm font-semibold text-flamencalia-black truncate group-hover:text-flamencalia-albero transition-colors">
                      {seller.display_name ?? "Vendedor"}
                    </p>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {seller.product_count} producto
                      {seller.product_count !== 1 ? "s" : ""}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-400 text-center py-4">
              Pronto verás aquí a los mejores vendedores y diseñadores.
            </p>
          )}
        </section>

        {/* ── Feed personalizado: Vendedores que sigues ── */}
        {followedProducts && followedProducts.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px flex-1 bg-flamencalia-albero-pale" />
              <h2 className="font-serif text-2xl font-bold text-flamencalia-black flex items-center gap-2">
                <Icon name="heart" className="w-5 h-5 text-flamencalia-red" />
                De quienes sigues
              </h2>
              <div className="h-px flex-1 bg-flamencalia-albero-pale" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {followedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product as import("@/types").Product}
                  isFavorited={favoriteIds.includes(product.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── Productos Destacados ── */}
        {featuredProducts && featuredProducts.length > 0 && (
          <section className="mb-10">
            <div className="bg-flamencalia-white rounded-2xl border border-flamencalia-albero-pale/50 overflow-hidden shadow-sm">
              <div className="flex items-center justify-between p-5 pb-0">
                <h2 className="font-serif text-2xl font-bold text-flamencalia-black flex items-center gap-2">
                  <Icon
                    name="sparkle"
                    className="w-5 h-5 text-flamencalia-albero"
                  />
                  Productos Destacados
                </h2>
                <Link
                  href="/products"
                  className="text-sm text-flamencalia-albero font-medium hover:text-flamencalia-albero-light transition-colors"
                >
                  Ver todos →
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-flamencalia-albero-pale/30 mt-4">
                {featuredProducts.slice(0, 4).map((product) => (
                  <ProductHomeCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Two Column: Recientes + Mejores Precios ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {recentProducts && recentProducts.length > 0 && (
            <section className="bg-flamencalia-white rounded-2xl border border-flamencalia-albero-pale/50 overflow-hidden shadow-sm">
              <div className="flex items-center justify-between p-5 pb-0">
                <h2 className="font-serif text-2xl font-bold text-flamencalia-black flex items-center gap-2">
                  <Icon
                    name="fan"
                    className="w-5 h-5 text-flamencalia-albero"
                  />{" "}
                  Lo Último
                </h2>
                <Link
                  href="/products"
                  className="text-sm text-flamencalia-albero font-medium hover:text-flamencalia-albero-light transition-colors"
                >
                  Ver más →
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-px bg-flamencalia-albero-pale/30 mt-4">
                {recentProducts.slice(0, 4).map((product) => (
                  <ProductHomeCard
                    key={product.id}
                    product={product}
                    size="sm"
                  />
                ))}
              </div>
            </section>
          )}

          {dealProducts && dealProducts.length > 0 && (
            <section className="bg-flamencalia-white rounded-2xl border border-flamencalia-albero-pale/50 overflow-hidden shadow-sm">
              <div className="flex items-center justify-between p-5 pb-0">
                <h2 className="font-serif text-2xl font-bold text-flamencalia-black flex items-center gap-2">
                  <Icon
                    name="flame"
                    className="w-5 h-5 text-flamencalia-albero"
                  />{" "}
                  Mejores Precios
                </h2>
                <Link
                  href="/products"
                  className="text-sm text-flamencalia-albero font-medium hover:text-flamencalia-albero-light transition-colors"
                >
                  Ver más →
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-px bg-flamencalia-albero-pale/30 mt-4">
                {dealProducts.slice(0, 4).map((product) => (
                  <ProductHomeCard
                    key={product.id}
                    product={product}
                    size="sm"
                  />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ── Más Productos ── */}
        {featuredProducts && featuredProducts.length > 4 && (
          <section className="mb-10">
            <div className="bg-flamencalia-white rounded-2xl border border-flamencalia-albero-pale/50 overflow-hidden shadow-sm">
              <div className="flex items-center justify-between p-5 pb-0">
                <h2 className="font-serif text-2xl font-bold text-flamencalia-black">
                  Más productos para ti
                </h2>
                <Link
                  href="/products"
                  className="text-sm text-flamencalia-albero font-medium hover:text-flamencalia-albero-light transition-colors"
                >
                  Ver todos →
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-flamencalia-albero-pale/30 mt-4">
                {featuredProducts.slice(4, 8).map((product) => (
                  <ProductHomeCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Vistos recientemente (client-side) ── */}
        <RecentlyViewed />

        {/* ── CTA: Vende tu Flamenca ── */}
        <section className="relative overflow-hidden rounded-2xl">
          <div className="bg-linear-to-br from-flamencalia-red via-flamencalia-red-dark to-flamencalia-black p-8 sm:p-12 text-center text-white relative">
            {/* Decoración farolillos */}
            <div className="absolute top-3 left-[15%] farolillo opacity-30">
              <div className="w-4 h-6 bg-flamencalia-albero rounded-full" />
            </div>
            <div
              className="absolute top-5 right-[25%] farolillo opacity-20"
              style={{ animationDelay: "0.7s" }}
            >
              <div className="w-5 h-7 bg-flamencalia-albero-light rounded-full" />
            </div>

            <div className="absolute -top-20 -right-20 w-60 h-60 bg-flamencalia-albero/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-flamencalia-red-light/10 rounded-full blur-3xl" />

            <div className="relative">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold">
                ¿Tienes algo que vender?
              </h2>
              <p className="mt-3 text-white/70 max-w-md mx-auto">
                Únete a la comunidad de Flamencalia. Vende tus vestidos,
                complementos o dale una segunda vida a tu moda flamenca.
              </p>
              <Link
                href="/register"
                className="inline-flex mt-6 bg-flamencalia-albero text-flamencalia-black px-8 py-3.5 rounded-full text-sm font-bold hover:bg-flamencalia-albero-light transition-all hover:shadow-lg hover:shadow-flamencalia-albero/30 hover:-translate-y-0.5"
              >
                Crear Cuenta Gratis
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ═══ FOOTER ═══ */}
      <Footer />
    </div>
  );
}

function ProductHomeCard({
  product,
  size = "md",
}: {
  product: {
    id: string;
    title: string;
    price: number;
    images: string[];
    seller?: { display_name: string; avatar_url?: string | null } | null;
  };
  size?: "sm" | "md";
}) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="bg-flamencalia-white p-4 hover:bg-flamencalia-albero-pale/30 transition-colors group block"
    >
      <div
        className={`${size === "sm" ? "h-32" : "h-44"} bg-flamencalia-cream rounded-xl flex items-center justify-center overflow-hidden mb-3 relative`}
      >
        {product.images?.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.title}
            className="object-cover w-full h-full rounded-xl group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <span className="text-flamencalia-albero/40 text-xs">Sin imagen</span>
        )}
        {/* Hover heart icon */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Icon name="heart" className="w-4 h-4 text-flamencalia-albero" />
          </div>
        </div>
      </div>
      <p
        className={`${size === "sm" ? "text-xs" : "text-sm"} font-medium truncate group-hover:text-flamencalia-albero transition-colors`}
      >
        {product.title}
      </p>
      <p
        className={`${size === "sm" ? "text-sm" : "text-base"} font-bold text-flamencalia-black mt-0.5`}
      >
        {formatPrice(product.price)}
      </p>
      {product.seller && (
        <p className="text-xs text-neutral-400 mt-0.5 truncate">
          {product.seller.display_name}
        </p>
      )}
    </Link>
  );
}
