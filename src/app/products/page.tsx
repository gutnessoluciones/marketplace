import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ProductsService } from "@/services/products.service";
import { ProductCard } from "@/components/products/product-card";
import { Icon } from "@/components/icons";
import { UserNav } from "@/components/layout/user-nav";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Explorar Productos - GutnesPlace",
  description:
    "Descubre y compra productos únicos de vendedores independientes en GutnesPlace.",
  openGraph: {
    title: "Explorar Productos - GutnesPlace",
    description:
      "Descubre y compra productos únicos de vendedores independientes en GutnesPlace.",
    siteName: "GutnesPlace",
  },
};

interface PageProps {
  searchParams: Promise<{ page?: string; category?: string; q?: string }>;
}

const CATEGORIES = [
  { slug: "", label: "Todos", icon: "tag" },
  { slug: "electronica", label: "Electrónica", icon: "monitor" },
  { slug: "ropa", label: "Ropa", icon: "shirt" },
  { slug: "hogar", label: "Hogar", icon: "home" },
  { slug: "deportes", label: "Deportes", icon: "medal" },
  { slug: "libros", label: "Libros", icon: "book" },
  { slug: "arte", label: "Arte", icon: "brush" },
  { slug: "otros", label: "Otros", icon: "package" },
];

export default async function ProductsPage({ searchParams }: PageProps) {
  const { page: pageStr, category, q } = await searchParams;
  const page = Number(pageStr) || 1;

  const supabase = await createClient();
  const service = new ProductsService(supabase);
  const result = await service.list(page, 20, category, q);

  const totalPages = Math.ceil((result.total ?? 0) / result.limit);

  function buildUrl(params: Record<string, string | undefined>) {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v) sp.set(k, v);
    }
    const qs = sp.toString();
    return `/products${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-indigo-950 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-14 flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-white font-bold tracking-tight shrink-0"
            >
              <Image
                src="/gutnes-logo.png"
                alt="GutnesPlace"
                width={28}
                height={28}
                className="rounded-lg"
              />
              <span className="hidden sm:inline">GutnesPlace</span>
            </Link>

            {/* Search */}
            <form action="/products" method="GET" className="flex-1 max-w-2xl">
              {category && (
                <input type="hidden" name="category" value={category} />
              )}
              <div className="relative">
                <Icon
                  name="search"
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                />
                <input
                  type="text"
                  name="q"
                  defaultValue={q}
                  placeholder="Buscar productos, marcas y más..."
                  className="w-full bg-white rounded-full pl-10 pr-4 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400/50 border border-transparent focus:border-teal-400 transition-all"
                />
              </div>
            </form>

            <UserNav variant="dark" />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800">
            {q ? `Resultados para "${q}"` : "Explorar Productos"}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {result.total ?? 0} productos disponibles
          </p>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
          {CATEGORIES.map((cat) => {
            const isActive = (category ?? "") === cat.slug;
            return (
              <Link
                key={cat.slug}
                href={buildUrl({
                  category: cat.slug || undefined,
                  q: q || undefined,
                })}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:shadow-sm"
                }`}
              >
                <Icon name={cat.icon} className="w-4 h-4" />
                {cat.label}
              </Link>
            );
          })}
        </div>

        {/* Products Grid */}
        {result.data.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {result.data.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-12">
                {page > 1 && (
                  <Link
                    href={buildUrl({
                      page: String(page - 1),
                      category: category || undefined,
                      q: q || undefined,
                    })}
                    className="px-5 py-2.5 bg-white border border-slate-200 rounded-full text-sm font-medium hover:bg-slate-50 hover:shadow-sm transition-all text-slate-700"
                  >
                    ← Anterior
                  </Link>
                )}
                <span className="text-sm text-slate-400 px-4">
                  Página {page} de {totalPages}
                </span>
                {page < totalPages && (
                  <Link
                    href={buildUrl({
                      page: String(page + 1),
                      category: category || undefined,
                      q: q || undefined,
                    })}
                    className="px-5 py-2.5 bg-white border border-slate-200 rounded-full text-sm font-medium hover:bg-slate-50 hover:shadow-sm transition-all text-slate-700"
                  >
                    Siguiente →
                  </Link>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <Icon name="search" className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              No se encontraron productos
            </h3>
            <p className="text-slate-400 text-sm mb-6">
              {q
                ? `No hay resultados para "${q}".`
                : category
                  ? "No hay productos en esta categoría todavía."
                  : "Aún no hay productos publicados."}
            </p>
            {(category || q) && (
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-linear-to-r from-indigo-600 to-violet-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:from-indigo-700 hover:to-violet-700 transition-all"
              >
                Ver todos los productos
              </Link>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
