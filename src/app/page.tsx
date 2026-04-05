import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import { Icon } from "@/components/icons";
import { UserNav } from "@/components/layout/user-nav";
import { Footer } from "@/components/layout/footer";

const CATEGORIES = [
  { slug: "electronica", label: "Electrónica", icon: "monitor" },
  { slug: "ropa", label: "Moda", icon: "shirt" },
  { slug: "hogar", label: "Hogar", icon: "home" },
  { slug: "deportes", label: "Deportes", icon: "medal" },
  { slug: "libros", label: "Libros", icon: "book" },
  { slug: "arte", label: "Arte", icon: "brush" },
];

export default async function HomePage() {
  const supabase = await createClient();

  // Productos destacados
  const { data: featuredProducts } = await supabase
    .from("products")
    .select("*, seller:profiles!seller_id(display_name)")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(8);

  // Productos de electrónica
  const { data: techProducts } = await supabase
    .from("products")
    .select("*, seller:profiles!seller_id(display_name)")
    .eq("status", "active")
    .eq("category", "electronica")
    .order("created_at", { ascending: false })
    .limit(4);

  // Productos baratos (ofertas)
  const { data: dealProducts } = await supabase
    .from("products")
    .select("*, seller:profiles!seller_id(display_name)")
    .eq("status", "active")
    .order("price", { ascending: true })
    .limit(4);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Nav */}
      <header className="bg-linear-to-r from-indigo-950 to-slate-900 sticky top-0 z-20">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-white shrink-0 flex items-center gap-2"
          >
            <Image
              src="/gutnes-logo.png"
              alt="GutnesPlace"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="hidden sm:inline">GutnesPlace</span>
          </Link>

          {/* Search bar */}
          <form action="/products" method="GET" className="flex-1 max-w-2xl">
            <div className="relative">
              <Icon
                name="search"
                className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-400"
              />
              <input
                type="text"
                name="q"
                placeholder="Buscar productos, marcas y más..."
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-full pl-11 pr-5 py-2 text-sm text-white placeholder-white/50 hover:bg-white/15 hover:border-teal-400/50 focus:bg-white/15 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/30 transition-all"
              />
            </div>
          </form>

          <UserNav variant="dark" />
        </nav>
        {/* Categories bar */}
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto scrollbar-hide py-2">
            <Link
              href="/products"
              className="text-white text-xs font-medium px-3.5 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors whitespace-nowrap"
            >
              Todos
            </Link>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="text-indigo-200 text-xs font-medium px-3.5 py-1 rounded-full hover:bg-white/10 hover:text-white transition-colors whitespace-nowrap flex items-center gap-1.5"
              >
                <Icon name={cat.icon} className="w-3.5 h-3.5" /> {cat.label}
              </Link>
            ))}
            <Link
              href="/dashboard"
              className="text-indigo-200 text-xs font-medium px-3.5 py-1 rounded-full hover:bg-white/10 hover:text-white transition-colors whitespace-nowrap ml-auto"
            >
              Mi Panel
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="relative h-75 sm:h-100 overflow-hidden">
        <Image
          src="/fondobanner.jpg"
          alt="Marketplace banner"
          fill
          className="object-cover"
          priority
          quality={85}
        />
        <div className="absolute inset-0 bg-linear-to-t from-slate-50 via-indigo-950/20 to-indigo-950/60" />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-lg">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-4 border border-white/20">
                <Icon name="sparkle" className="w-3.5 h-3.5 inline" /> Compra y
                vende con confianza
              </div>
              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight text-white drop-shadow-lg">
                Descubre productos
                <span className="text-teal-300"> únicos</span>
              </h1>
              <p className="mt-3 text-sm sm:text-base text-white/80">
                Miles de productos de vendedores independientes te esperan.
              </p>
              <div className="mt-6 flex gap-3">
                <Link
                  href="/products"
                  className="bg-teal-400 text-indigo-950 px-7 py-3 rounded-full text-sm font-bold hover:bg-teal-300 transition-all hover:shadow-lg hover:shadow-teal-400/25"
                >
                  Explorar ahora
                </Link>
                <Link
                  href="/register"
                  className="border-2 border-white/30 text-white px-7 py-3 rounded-full text-sm font-semibold hover:bg-white/10 backdrop-blur-sm transition-all"
                >
                  Empieza a vender
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 pb-12">
        {/* Category Cards */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-8">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/products?category=${cat.slug}`}
              className="bg-white rounded-2xl p-4 text-center hover:shadow-lg hover:shadow-indigo-100 transition-all hover:-translate-y-1 border border-slate-100 group"
            >
              <span className="block mb-2 group-hover:scale-110 transition-transform text-slate-400 group-hover:text-indigo-600">
                <Icon
                  name={cat.icon}
                  className="w-7 h-7 sm:w-8 sm:h-8 mx-auto"
                />
              </span>
              <span className="text-xs font-semibold text-slate-600 group-hover:text-indigo-700 transition-colors">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>

        {/* Featured Products */}
        {featuredProducts && featuredProducts.length > 0 && (
          <section className="mb-8">
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
              <div className="flex items-center justify-between p-5 pb-0">
                <h2 className="text-lg font-bold text-slate-800">
                  Productos Destacados
                </h2>
                <Link
                  href="/products"
                  className="text-sm text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
                >
                  Ver todos →
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-slate-100 mt-4">
                {featuredProducts.slice(0, 4).map((product) => (
                  <ProductHomeCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Tech Products */}
          {techProducts && techProducts.length > 0 && (
            <section className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
              <div className="flex items-center justify-between p-5 pb-0">
                <h2 className="text-lg font-bold text-slate-800">
                  <Icon name="monitor" className="w-5 h-5 inline" /> Electrónica
                </h2>
                <Link
                  href="/products?category=electronica"
                  className="text-sm text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
                >
                  Ver más →
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-px bg-slate-100 mt-4">
                {techProducts.slice(0, 4).map((product) => (
                  <ProductHomeCard
                    key={product.id}
                    product={product}
                    size="sm"
                  />
                ))}
              </div>
            </section>
          )}

          {/* Deals */}
          {dealProducts && dealProducts.length > 0 && (
            <section className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
              <div className="flex items-center justify-between p-5 pb-0">
                <h2 className="text-lg font-bold text-slate-800">
                  <Icon name="flame" className="w-5 h-5 inline" /> Mejores
                  precios
                </h2>
                <Link
                  href="/products"
                  className="text-sm text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
                >
                  Ver más →
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-px bg-slate-100 mt-4">
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

        {/* All Products Row */}
        {featuredProducts && featuredProducts.length > 4 && (
          <section className="mb-8">
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
              <div className="flex items-center justify-between p-5 pb-0">
                <h2 className="text-lg font-bold text-slate-800">
                  Más productos para ti
                </h2>
                <Link
                  href="/products"
                  className="text-sm text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
                >
                  Ver todos →
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-slate-100 mt-4">
                {featuredProducts.slice(4, 8).map((product) => (
                  <ProductHomeCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Banner */}
        <section className="bg-linear-to-br from-indigo-950 to-violet-900 rounded-2xl p-8 sm:p-12 text-center text-white relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-teal-400/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-violet-400/10 rounded-full blur-3xl" />
          <div className="relative">
            <h2 className="text-2xl sm:text-3xl font-bold">
              ¿Tienes algo que vender?
            </h2>
            <p className="mt-2 text-indigo-200/60 max-w-md mx-auto">
              Únete a nuestra comunidad de vendedores y empieza a ganar dinero
              con tus productos.
            </p>
            <Link
              href="/register"
              className="inline-flex mt-6 bg-teal-400 text-indigo-950 px-8 py-3 rounded-full text-sm font-bold hover:bg-teal-300 transition-all hover:shadow-lg hover:shadow-teal-400/25"
            >
              Crear Cuenta Gratis
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
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
    seller?: { display_name: string } | null;
  };
  size?: "sm" | "md";
}) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="bg-white p-4 hover:bg-indigo-50/50 transition-colors group block"
    >
      <div
        className={`${size === "sm" ? "h-32" : "h-44"} bg-slate-50 rounded-xl flex items-center justify-center overflow-hidden mb-3`}
      >
        {product.images?.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.title}
            className="object-cover w-full h-full rounded-xl group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <span className="text-slate-300 text-xs">Sin imagen</span>
        )}
      </div>
      <p
        className={`${size === "sm" ? "text-xs" : "text-sm"} font-medium truncate group-hover:text-indigo-700 transition-colors`}
      >
        {product.title}
      </p>
      <p
        className={`${size === "sm" ? "text-sm" : "text-base"} font-bold text-indigo-700 mt-0.5`}
      >
        {formatPrice(product.price)}
      </p>
      {product.seller && (
        <p className="text-xs text-slate-400 mt-0.5 truncate">
          {product.seller.display_name}
        </p>
      )}
    </Link>
  );
}
