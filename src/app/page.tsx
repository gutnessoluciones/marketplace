import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import { Icon } from "@/components/icons";
import { UserNav } from "@/components/layout/user-nav";
import { Footer } from "@/components/layout/footer";

const CATEGORIES = [
  { slug: "feria", label: "Feria", icon: "fan" },
  { slug: "camino", label: "Camino", icon: "horseshoe" },
  { slug: "complementos-flamencos", label: "Complementos", icon: "flower" },
  { slug: "invitada-flamenca", label: "Invitada Flamenca", icon: "dress" },
  { slug: "moda-infantil", label: "Moda Infantil", icon: "child" },
  { slug: "equitacion", label: "Equitación", icon: "horseshoe" },
  { slug: "zapatos", label: "Zapatos", icon: "shoe" },
];

export default async function HomePage() {
  const supabase = await createClient();

  const { data: featuredProducts } = await supabase
    .from("products")
    .select("*, seller:profiles!seller_id(display_name, avatar_url)")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(8);

  const { data: recentProducts } = await supabase
    .from("products")
    .select("*, seller:profiles!seller_id(display_name, avatar_url)")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(4);

  const { data: dealProducts } = await supabase
    .from("products")
    .select("*, seller:profiles!seller_id(display_name, avatar_url)")
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

  return (
    <div className="flex flex-col min-h-screen bg-flamencalia-cream">
      {/* ═══ HEADER ═══ */}
      <header className="bg-flamencalia-white sticky top-0 z-30 shadow-sm">
        {/* Top decorative toldo */}
        <div className="h-1.5 toldo-rayas" />

        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
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

          {/* Search bar */}
          <form action="/products" method="GET" className="flex-1 max-w-xl">
            <div className="relative">
              <Icon
                name="search"
                className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-flamencalia-red"
              />
              <input
                type="text"
                name="q"
                placeholder="Buscar vestidos, mantones, complementos..."
                className="w-full bg-flamencalia-cream border border-flamencalia-albero-pale rounded-full pl-11 pr-5 py-2.5 text-sm text-flamencalia-black placeholder-neutral-400 hover:border-flamencalia-albero focus:border-flamencalia-red focus:outline-none focus:ring-2 focus:ring-flamencalia-red/20 transition-all"
              />
            </div>
          </form>

          <UserNav variant="light" />
        </nav>

        {/* Categories bar */}
        <div className="border-t border-flamencalia-albero-pale/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto scrollbar-hide py-2">
            <Link
              href="/products"
              className="text-flamencalia-white bg-flamencalia-red text-xs font-semibold px-4 py-1.5 rounded-full hover:bg-flamencalia-red-dark transition-colors whitespace-nowrap"
            >
              Todo
            </Link>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="text-flamencalia-black/70 text-xs font-medium px-3.5 py-1.5 rounded-full hover:bg-flamencalia-red/10 hover:text-flamencalia-red transition-colors whitespace-nowrap flex items-center gap-1.5"
              >
                <Icon name={cat.icon} className="w-3.5 h-3.5" /> {cat.label}
              </Link>
            ))}
            <Link
              href="/about"
              className="text-flamencalia-albero text-xs font-medium px-3.5 py-1.5 rounded-full hover:bg-flamencalia-albero/10 hover:text-flamencalia-albero transition-colors whitespace-nowrap ml-auto"
            >
              Quiénes Somos
            </Link>
          </div>
        </div>
      </header>

      {/* ═══ HERO BANNER — Estilo Caseta de Feria ═══ */}
      <section className="relative overflow-hidden">
        {/* Fondo gradiente cream → albero cálido */}
        <div className="absolute inset-0 bg-linear-to-br from-flamencalia-cream via-flamencalia-albero-pale to-flamencalia-cream" />

        {/* Lunares de feria — sutil */}
        <div className="absolute inset-0 opacity-[0.06] lunares-pattern-dark" />

        {/* Farolillos */}
        <div className="absolute top-4 left-[10%] farolillo">
          <div className="w-6 h-8 bg-flamencalia-red rounded-full opacity-30" />
        </div>
        <div
          className="absolute top-6 left-[30%] farolillo"
          style={{ animationDelay: "0.5s" }}
        >
          <div className="w-5 h-7 bg-flamencalia-albero rounded-full opacity-25" />
        </div>
        <div
          className="absolute top-3 right-[20%] farolillo"
          style={{ animationDelay: "1s" }}
        >
          <div className="w-6 h-8 bg-flamencalia-red rounded-full opacity-20" />
        </div>
        <div
          className="absolute top-5 right-[40%] farolillo"
          style={{ animationDelay: "1.5s" }}
        >
          <div className="w-4 h-6 bg-flamencalia-albero rounded-full opacity-25" />
        </div>

        <div className="relative py-14 sm:py-20 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Slogan SVG centrado arriba */}
            <div className="flex justify-center mb-8 animate-fade-in-up">
              <Image
                src="/cliente/slogan.svg"
                alt="Larga vida a tu Flamenca"
                width={600}
                height={80}
                className="object-contain w-full max-w-md sm:max-w-lg h-auto"
                priority
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              {/* Lado izquierdo: texto */}
              <div>
                <div className="inline-flex items-center gap-2 bg-flamencalia-red/10 text-flamencalia-red text-xs font-semibold px-4 py-1.5 rounded-full mb-5 border border-flamencalia-red/20 animate-fade-in-up">
                  <Icon name="fan" className="w-4 h-4" /> Marketplace de Moda
                  Flamenca
                </div>
                <h1
                  className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-flamencalia-black animate-fade-in-up"
                  style={{ animationDelay: "0.1s" }}
                >
                  Viste tu
                  <span className="text-flamencalia-red"> flamenca</span>
                  <br />
                  con estilo
                </h1>
                <p
                  className="mt-4 text-base sm:text-lg text-flamencalia-black/60 max-w-lg animate-fade-in-up"
                  style={{ animationDelay: "0.2s" }}
                >
                  Vestidos, mantones, flores y complementos de diseñadores y de
                  la comunidad flamenca. Compra, vende y dale larga vida a tu
                  flamenca.
                </p>
                <div
                  className="mt-8 flex flex-wrap gap-3 animate-fade-in-up"
                  style={{ animationDelay: "0.3s" }}
                >
                  <Link
                    href="/products"
                    className="bg-flamencalia-red text-white px-8 py-3.5 rounded-full text-sm font-bold hover:bg-flamencalia-red-dark transition-all hover:shadow-lg hover:shadow-flamencalia-red/30 hover:-translate-y-0.5"
                  >
                    Explorar Productos
                  </Link>
                  <Link
                    href="/register"
                    className="border-2 border-flamencalia-black/20 text-flamencalia-black px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-flamencalia-black/5 transition-all hover:-translate-y-0.5"
                  >
                    Vender Ahora
                  </Link>
                </div>
              </div>

              {/* Lado derecho: abanico grande */}
              <div
                className="hidden lg:flex items-center justify-center animate-fade-in-up"
                style={{ animationDelay: "0.4s" }}
              >
                <Image
                  src="/cliente/Abanico.svg"
                  alt="Flamencalia — abanico"
                  width={400}
                  height={400}
                  className="object-contain w-full max-w-sm h-auto drop-shadow-xl animate-float"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Borde inferior con ondas */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full">
            <path
              d="M0 60V30C240 0 480 0 720 30s480 30 720 0v30H0z"
              fill="var(--flamencalia-cream)"
            />
          </svg>
        </div>
      </section>

      {/* ═══ MAIN CONTENT ═══ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2 relative z-10 pb-12">
        {/* ── Vendedores Destacados ── */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-flamencalia-albero-pale" />
            <h2 className="font-serif text-lg font-bold text-flamencalia-black flex items-center gap-2">
              <Icon name="fan" className="w-5 h-5 text-flamencalia-red" />
              Vendedores &amp; Diseñadores
            </h2>
            <div className="h-px flex-1 bg-flamencalia-albero-pale" />
          </div>
          {topSellers && topSellers.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
              {topSellers.map((seller) => (
                <Link
                  key={seller.id}
                  href={`/products?seller=${seller.id}`}
                  className="flex flex-col items-center gap-2 shrink-0 group"
                >
                  <div className="w-20 h-20 rounded-full bg-flamencalia-albero-pale/50 border-2 border-flamencalia-albero-pale group-hover:border-flamencalia-red overflow-hidden transition-colors flex items-center justify-center">
                    {seller.avatar_url ? (
                      <img
                        src={seller.avatar_url}
                        alt={seller.display_name ?? "Vendedor"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Icon
                        name="user"
                        className="w-8 h-8 text-flamencalia-albero"
                      />
                    )}
                  </div>
                  <span className="text-xs font-medium text-flamencalia-black/70 group-hover:text-flamencalia-red transition-colors text-center max-w-20 truncate">
                    {seller.display_name ?? "Vendedor"}
                  </span>
                  <span className="text-[10px] text-neutral-400">
                    {seller.product_count} producto
                    {seller.product_count !== 1 ? "s" : ""}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-400 text-center py-4">
              Pronto verás aquí a los mejores vendedores y diseñadores.
            </p>
          )}
        </section>

        {/* ── Productos Destacados ── */}
        {featuredProducts && featuredProducts.length > 0 && (
          <section className="mb-10">
            <div className="bg-flamencalia-white rounded-2xl border border-flamencalia-albero-pale/50 overflow-hidden shadow-sm">
              <div className="flex items-center justify-between p-5 pb-0">
                <h2 className="font-serif text-xl font-bold text-flamencalia-black flex items-center gap-2">
                  <Icon
                    name="sparkle"
                    className="w-5 h-5 text-flamencalia-albero"
                  />
                  Productos Destacados
                </h2>
                <Link
                  href="/products"
                  className="text-sm text-flamencalia-red font-medium hover:text-flamencalia-red-dark transition-colors"
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
                <h2 className="font-serif text-lg font-bold text-flamencalia-black flex items-center gap-2">
                  <Icon name="fan" className="w-5 h-5 text-flamencalia-red" />{" "}
                  Lo Último
                </h2>
                <Link
                  href="/products"
                  className="text-sm text-flamencalia-red font-medium hover:text-flamencalia-red-dark transition-colors"
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
                <h2 className="font-serif text-lg font-bold text-flamencalia-black flex items-center gap-2">
                  <Icon
                    name="flame"
                    className="w-5 h-5 text-flamencalia-albero"
                  />{" "}
                  Mejores Precios
                </h2>
                <Link
                  href="/products"
                  className="text-sm text-flamencalia-red font-medium hover:text-flamencalia-red-dark transition-colors"
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
                <h2 className="font-serif text-lg font-bold text-flamencalia-black">
                  Más productos para ti
                </h2>
                <Link
                  href="/products"
                  className="text-sm text-flamencalia-red font-medium hover:text-flamencalia-red-dark transition-colors"
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
            <Icon name="heart" className="w-4 h-4 text-flamencalia-red" />
          </div>
        </div>
      </div>
      <p
        className={`${size === "sm" ? "text-xs" : "text-sm"} font-medium truncate group-hover:text-flamencalia-red transition-colors`}
      >
        {product.title}
      </p>
      <p
        className={`${size === "sm" ? "text-sm" : "text-base"} font-bold text-flamencalia-red mt-0.5`}
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
