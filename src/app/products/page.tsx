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
  title: "Explorar Productos - Flamencalia",
  description:
    "Descubre vestidos de flamenca, mantones, complementos y más en Flamencalia.",
  openGraph: {
    title: "Explorar Productos - Flamencalia",
    description:
      "Descubre vestidos de flamenca, mantones, complementos y más en Flamencalia.",
    siteName: "Flamencalia",
  },
};

interface PageProps {
  searchParams: Promise<{
    page?: string;
    category?: string;
    q?: string;
    seller?: string;
  }>;
}

const CATEGORIES = [
  { slug: "", label: "Todos", icon: "tag" },
  { slug: "feria", label: "Feria", icon: "fan" },
  { slug: "camino", label: "Camino", icon: "flower" },
  { slug: "complementos-flamencos", label: "Complementos", icon: "earring" },
  { slug: "invitada-flamenca", label: "Invitada Flamenca", icon: "dress" },
  { slug: "moda-infantil", label: "Moda Infantil", icon: "child" },
  { slug: "equitacion", label: "Equitación", icon: "horseshoe" },
  { slug: "zapatos", label: "Zapatos", icon: "shoe" },
];

export default async function ProductsPage({ searchParams }: PageProps) {
  const { page: pageStr, category, q, seller } = await searchParams;
  const page = Number(pageStr) || 1;

  const supabase = await createClient();
  const service = new ProductsService(supabase);
  const result = await service.list(page, 20, category, q, seller);

  // Fetch seller info if filtering by seller
  let sellerProfile: { display_name: string | null } | null = null;
  if (seller) {
    const { data } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", seller)
      .single();
    sellerProfile = data;
  }

  // Fetch all sellers for the filter sidebar
  const { data: sellersRaw } = await supabase
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
      count: number;
    }
  >();
  for (const p of sellersRaw ?? []) {
    const raw = p.seller as unknown;
    const s = (Array.isArray(raw) ? raw[0] : raw) as {
      id: string;
      display_name: string | null;
      avatar_url: string | null;
    } | null;
    if (!s) continue;
    const existing = sellerMap.get(s.id);
    if (existing) {
      existing.count++;
    } else {
      sellerMap.set(s.id, { ...s, count: 1 });
    }
  }
  const allSellers = Array.from(sellerMap.values()).sort(
    (a, b) => b.count - a.count,
  );

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
    <div className="min-h-screen bg-flamencalia-cream">
      {/* Header */}
      <header className="bg-flamencalia-black sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-14 flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <Image
                src="/cliente/marca-flamencalia.svg"
                alt="FLAMENCALIA"
                width={140}
                height={28}
                className="h-5 w-auto object-contain invert"
              />
              <Image
                src="/cliente/Abanico.svg"
                alt="Flamencalia"
                width={32}
                height={32}
                className="w-8 h-8"
              />
            </Link>

            {/* Search */}
            <form action="/products" method="GET" className="flex-1 max-w-2xl">
              {category && (
                <input type="hidden" name="category" value={category} />
              )}
              {seller && <input type="hidden" name="seller" value={seller} />}
              <div className="relative">
                <Icon
                  name="search"
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400"
                />
                <input
                  type="text"
                  name="q"
                  defaultValue={q}
                  placeholder="Buscar vestidos, mantones, complementos..."
                  className="w-full bg-white rounded-full pl-10 pr-4 py-2 text-sm text-neutral-700 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-flamencalia-albero/50 border border-transparent focus:border-flamencalia-albero transition-all"
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
          <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-flamencalia-black">
            {seller && sellerProfile
              ? `Productos de ${sellerProfile.display_name}`
              : q
                ? `Resultados para "${q}"`
                : "Explorar Productos"}
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            {result.total ?? 0} productos disponibles
          </p>
          {seller && (
            <Link
              href={buildUrl({
                category: category || undefined,
                q: q || undefined,
              })}
              className="inline-flex items-center gap-1 text-sm text-flamencalia-red font-medium mt-2 hover:underline"
            >
              ← Ver todos los vendedores
            </Link>
          )}
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {CATEGORIES.map((cat) => {
            const isActive = (category ?? "") === cat.slug;
            return (
              <Link
                key={cat.slug}
                href={buildUrl({
                  category: cat.slug || undefined,
                  q: q || undefined,
                  seller: seller || undefined,
                })}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-flamencalia-red text-white shadow-lg shadow-flamencalia-red/20"
                    : "bg-white text-neutral-600 border border-neutral-200 hover:border-flamencalia-albero hover:shadow-sm"
                }`}
              >
                <Icon name={cat.icon} className="w-4 h-4" />
                {cat.label}
              </Link>
            );
          })}
        </div>

        <div className="flex gap-8">
          {/* Sidebar: filter by seller */}
          <aside className="hidden lg:block w-56 shrink-0">
            <h3 className="text-sm font-bold text-flamencalia-black mb-3 flex items-center gap-2">
              <Icon name="user" className="w-4 h-4 text-flamencalia-red" />
              Vendedores
            </h3>
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {seller && (
                <Link
                  href={buildUrl({
                    category: category || undefined,
                    q: q || undefined,
                  })}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-flamencalia-red hover:bg-flamencalia-red/5 transition-colors"
                >
                  ✕ Quitar filtro
                </Link>
              )}
              {allSellers.map((s) => {
                const isActive = seller === s.id;
                return (
                  <Link
                    key={s.id}
                    href={buildUrl({
                      seller: isActive ? undefined : s.id,
                      category: category || undefined,
                      q: q || undefined,
                    })}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                      isActive
                        ? "bg-flamencalia-red/10 text-flamencalia-red font-semibold"
                        : "text-neutral-600 hover:bg-flamencalia-albero-pale/30 hover:text-flamencalia-black"
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-flamencalia-albero-pale/50 overflow-hidden flex items-center justify-center shrink-0">
                      {s.avatar_url ? (
                        <img
                          src={s.avatar_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Icon
                          name="user"
                          className="w-3.5 h-3.5 text-flamencalia-albero"
                        />
                      )}
                    </div>
                    <span className="truncate">
                      {s.display_name ?? "Vendedor"}
                    </span>
                    <span className="ml-auto text-xs text-neutral-400">
                      {s.count}
                    </span>
                  </Link>
                );
              })}
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Products Grid */}
            {result.data.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
                          seller: seller || undefined,
                        })}
                        className="px-5 py-2.5 bg-white border border-neutral-200 rounded-full text-sm font-medium hover:bg-neutral-50 hover:shadow-sm transition-all text-neutral-700"
                      >
                        ← Anterior
                      </Link>
                    )}
                    <span className="text-sm text-neutral-400 px-4">
                      Página {page} de {totalPages}
                    </span>
                    {page < totalPages && (
                      <Link
                        href={buildUrl({
                          page: String(page + 1),
                          category: category || undefined,
                          q: q || undefined,
                          seller: seller || undefined,
                        })}
                        className="px-5 py-2.5 bg-white border border-neutral-200 rounded-full text-sm font-medium hover:bg-neutral-50 hover:shadow-sm transition-all text-neutral-700"
                      >
                        Siguiente →
                      </Link>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-flamencalia-albero-pale/30 rounded-full flex items-center justify-center mx-auto mb-5">
                  <Icon name="search" className="w-8 h-8 text-neutral-300" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-700 mb-2">
                  No se encontraron productos
                </h3>
                <p className="text-neutral-400 text-sm mb-6">
                  {q
                    ? `No hay resultados para "${q}".`
                    : seller
                      ? "Este vendedor aún no tiene productos."
                      : category
                        ? "No hay productos en esta categoría todavía."
                        : "Aún no hay productos publicados."}
                </p>
                {(category || q || seller) && (
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 bg-flamencalia-red text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-flamencalia-red-dark transition-all"
                  >
                    Ver todos los productos
                  </Link>
                )}
              </div>
            )}
          </div>
          {/* end main content */}
        </div>
        {/* end flex gap-8 */}
      </div>

      <Footer />
    </div>
  );
}
