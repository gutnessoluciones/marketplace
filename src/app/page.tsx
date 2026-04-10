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

const SUBCATEGORIES_COMPLEMENTOS = [
  { slug: "mantones", label: "Mantones", icon: "mantilla" },
  { slug: "flores", label: "Flores", icon: "flower" },
  { slug: "pendientes", label: "Pendientes", icon: "earring" },
  { slug: "accesorios-pelo", label: "Accesorios pelo", icon: "hairClip" },
  { slug: "broches", label: "Broches", icon: "sparkle" },
  { slug: "sombreros", label: "Sombreros", icon: "hat" },
  { slug: "panuelos", label: "Pañuelos", icon: "scarf" },
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

  return (
    <div className="flex flex-col min-h-screen bg-flamencalia-cream">
      {/* ═══ HEADER ═══ */}
      <header className="bg-flamencalia-white sticky top-0 z-30 shadow-sm">
        {/* Top decorative toldo */}
        <div className="h-1.5 toldo-rayas" />

        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <Image
              src="/cliente/flamencalia.jpg"
              alt="Flamencalia"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <div className="hidden sm:block">
              <span className="font-serif font-bold text-xl tracking-wide text-flamencalia-black">
                FLAMENCALIA
              </span>
              <p className="text-[10px] text-flamencalia-red italic -mt-0.5">
                &ldquo;Larga vida a tu Flamenca&rdquo;
              </p>
            </div>
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
        {/* Fondo gradiente rojo feria */}
        <div className="absolute inset-0 bg-linear-to-br from-flamencalia-red via-flamencalia-red-dark to-flamencalia-black" />

        {/* Patrón de rayas verticales sutil */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute top-0 left-0 right-0 h-full"
            style={{
              backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 48px, rgba(255,255,255,0.1) 48px, rgba(255,255,255,0.1) 50px)`,
            }}
          />
        </div>

        {/* Farolillos */}
        <div className="absolute top-4 left-[10%] farolillo">
          <div className="w-6 h-8 bg-flamencalia-albero rounded-full opacity-60" />
        </div>
        <div
          className="absolute top-6 left-[30%] farolillo"
          style={{ animationDelay: "0.5s" }}
        >
          <div className="w-5 h-7 bg-flamencalia-red-light rounded-full opacity-40" />
        </div>
        <div
          className="absolute top-3 right-[20%] farolillo"
          style={{ animationDelay: "1s" }}
        >
          <div className="w-6 h-8 bg-flamencalia-albero rounded-full opacity-50" />
        </div>
        <div
          className="absolute top-5 right-[40%] farolillo"
          style={{ animationDelay: "1.5s" }}
        >
          <div className="w-4 h-6 bg-flamencalia-albero-light rounded-full opacity-40" />
        </div>

        <div className="relative py-16 sm:py-24 lg:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              {/* Lado izquierdo: texto */}
              <div>
                <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-5 border border-white/20 animate-fade-in-up">
                  <Icon name="fan" className="w-4 h-4" /> Marketplace de Moda
                  Flamenca
                </div>
                <h1
                  className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-white drop-shadow-lg animate-fade-in-up"
                  style={{ animationDelay: "0.1s" }}
                >
                  Viste tu
                  <span className="text-flamencalia-albero-light">
                    {" "}
                    flamenca
                  </span>
                  <br />
                  con estilo
                </h1>
                <p
                  className="mt-4 text-base sm:text-lg text-white/80 max-w-lg animate-fade-in-up"
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
                    className="bg-flamencalia-albero text-flamencalia-black px-8 py-3.5 rounded-full text-sm font-bold hover:bg-flamencalia-albero-light transition-all hover:shadow-lg hover:shadow-flamencalia-albero/30 hover:-translate-y-0.5"
                  >
                    Explorar Productos
                  </Link>
                  <Link
                    href="/register"
                    className="border-2 border-white/40 text-white px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-white/15 backdrop-blur-sm transition-all hover:-translate-y-0.5"
                  >
                    Vender Ahora
                  </Link>
                </div>
              </div>

              {/* Lado derecho: marca + abanico */}
              <div
                className="hidden lg:flex flex-col items-center justify-center gap-4 animate-fade-in-up"
                style={{ animationDelay: "0.4s" }}
              >
                <Image
                  src="/cliente/marca-flamencalia.svg"
                  alt="FLAMENCALIA"
                  width={400}
                  height={120}
                  className="object-contain drop-shadow-2xl w-full max-w-sm h-auto"
                  priority
                />
                <Image
                  src="/cliente/Abanico.svg"
                  alt="Flamencalia — abanico"
                  width={300}
                  height={300}
                  className="object-contain drop-shadow-2xl w-full max-w-xs h-auto"
                />
                <Image
                  src="/cliente/slogan.svg"
                  alt="Larga vida a tu Flamenca"
                  width={400}
                  height={80}
                  className="object-contain drop-shadow-lg w-full max-w-sm h-auto"
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
        {/* ── Categorías Principales ── */}
        <section className="mb-10">
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
            {CATEGORIES.map((cat, i) => (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="bg-flamencalia-white rounded-2xl p-4 text-center hover:shadow-lg transition-all hover:-translate-y-1.5 border border-flamencalia-albero-pale/50 group category-glow animate-fade-in-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <span className="block mb-2 group-hover:scale-110 transition-transform text-flamencalia-red/60 group-hover:text-flamencalia-red">
                  <Icon
                    name={cat.icon}
                    className="w-7 h-7 sm:w-8 sm:h-8 mx-auto"
                  />
                </span>
                <span className="text-[11px] sm:text-xs font-semibold text-flamencalia-black/70 group-hover:text-flamencalia-red transition-colors leading-tight">
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Complementos Flamencos (subcategorías) ── */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-flamencalia-albero-pale" />
            <h2 className="font-serif text-lg font-bold text-flamencalia-black flex items-center gap-2">
              <Icon name="flower" className="w-5 h-5 text-flamencalia-red" />
              Complementos Flamencos
            </h2>
            <div className="h-px flex-1 bg-flamencalia-albero-pale" />
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {SUBCATEGORIES_COMPLEMENTOS.map((sub) => (
              <Link
                key={sub.slug}
                href={`/products?category=complementos-flamencos&sub=${sub.slug}`}
                className="flex items-center gap-2 bg-flamencalia-white border border-flamencalia-albero-pale/50 rounded-full px-4 py-2 text-sm font-medium text-flamencalia-black/70 hover:bg-flamencalia-red hover:text-white hover:border-flamencalia-red transition-all whitespace-nowrap group"
              >
                <Icon
                  name={sub.icon}
                  className="w-4 h-4 text-flamencalia-red group-hover:text-white transition-colors"
                />
                {sub.label}
              </Link>
            ))}
          </div>
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
