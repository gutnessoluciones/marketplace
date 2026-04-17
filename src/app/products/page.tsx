import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Suspense } from "react";

export const revalidate = 300;
import { createClient } from "@/lib/supabase/server";
import { ProductsService } from "@/services/products.service";
import { FavoritesService } from "@/services/favorites.service";
import { BoostsService } from "@/services/boosts.service";
import { ProductCard } from "@/components/products/product-card";
import { ProductFilters } from "@/components/products/product-filters";
import { Icon } from "@/components/icons";
import { SiteHeader } from "@/components/layout/site-header";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Explorar Productos - Flamencalia",
  description:
    "Descubre vestidos de flamenca, mantones, complementos y más en Flamencalia.",
};

interface PageProps {
  searchParams: Promise<{
    page?: string;
    category?: string;
    subcategory?: string;
    q?: string;
    seller?: string;
    color?: string;
    size?: string;
    condition?: string;
    brand?: string;
    priceMin?: string;
    priceMax?: string;
    sort?: string;
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

const COLORS = [
  { value: "blanco", label: "Blanco", hex: "#FFFFFF" },
  { value: "negro", label: "Negro", hex: "#1A1A1A" },
  { value: "rojo", label: "Rojo", hex: "#C8102E" },
  { value: "rosa", label: "Rosa", hex: "#F4A6C0" },
  { value: "fucsia", label: "Fucsia", hex: "#D6006E" },
  { value: "naranja", label: "Naranja", hex: "#F28C28" },
  { value: "amarillo", label: "Amarillo", hex: "#F5D100" },
  { value: "verde", label: "Verde", hex: "#2E8B57" },
  { value: "azul", label: "Azul", hex: "#2563EB" },
  { value: "morado", label: "Morado", hex: "#7C3AED" },
  { value: "burdeos", label: "Burdeos", hex: "#722F37" },
  { value: "dorado", label: "Dorado", hex: "#D4A843" },
  { value: "plateado", label: "Plateado", hex: "#C0C0C0" },
  { value: "beige", label: "Beige", hex: "#E8D5B7" },
  { value: "marron", label: "Marrón", hex: "#8B5E34" },
  {
    value: "multicolor",
    label: "Multi",
    hex: "conic-gradient(red,yellow,green,blue,red)",
  },
];

const SIZES = [
  "XXS",
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "3XL",
  "34",
  "36",
  "38",
  "40",
  "42",
  "44",
  "46",
  "48",
  "unica",
];

const CONDITIONS = [
  { value: "nuevo", label: "Nuevo" },
  { value: "como-nuevo", label: "Como nuevo" },
  { value: "bueno", label: "Buen estado" },
  { value: "aceptable", label: "Aceptable" },
];

const SORT_OPTIONS = [
  { value: "", label: "Más populares" },
  { value: "newest", label: "Más recientes" },
  { value: "price-asc", label: "Precio: menor a mayor" },
  { value: "price-desc", label: "Precio: mayor a menor" },
];

export default async function ProductsPage({ searchParams }: PageProps) {
  const {
    page: pageStr,
    category,
    subcategory,
    q,
    seller,
    color,
    size,
    condition,
    brand,
    priceMin,
    priceMax,
    sort,
  } = await searchParams;
  const page = Number(pageStr) || 1;

  const supabase = await createClient();
  const service = new ProductsService(supabase);
  const boostService = new BoostsService(supabase);

  // Parallelizar queries independientes para reducir TTFB
  const [
    result,
    boostedIds,
    { data: sellersRaw },
    {
      data: { user },
    },
  ] = await Promise.all([
    service.list(page, 24, category, q, seller, {
      color,
      size,
      condition,
      brand,
      subcategory,
      priceMin: priceMin ? Math.round(Number(priceMin) * 100) : undefined,
      priceMax: priceMax ? Math.round(Number(priceMax) * 100) : undefined,
      sort,
    }),
    !sort && page === 1
      ? boostService.getBoostedProductIds()
      : Promise.resolve([]),
    supabase
      .from("products")
      .select(
        "seller_id, seller:profiles!seller_id(id, display_name, avatar_url)",
      )
      .eq("status", "active"),
    supabase.auth.getUser(),
  ]);
  const boostedSet = new Set(boostedIds);
  const products =
    boostedIds.length > 0
      ? [
          ...result.data.filter((p) => boostedSet.has(p.id)),
          ...result.data.filter((p) => !boostedSet.has(p.id)),
        ]
      : result.data;

  // Secondary parallel queries (depend on user/seller)
  const [sellerProfileResult, favoriteIds] = await Promise.all([
    seller
      ? supabase
          .from("profiles")
          .select("display_name")
          .eq("id", seller)
          .single()
          .then(({ data }) => data)
      : Promise.resolve(null),
    user
      ? new FavoritesService(supabase).getUserFavoriteIds(user.id)
      : Promise.resolve([] as string[]),
  ]);
  const sellerProfile = sellerProfileResult as {
    display_name: string | null;
  } | null;

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
    if (existing) existing.count++;
    else sellerMap.set(s.id, { ...s, count: 1 });
  }
  const allSellers = Array.from(sellerMap.values()).sort(
    (a, b) => b.count - a.count,
  );
  const totalPages = Math.ceil((result.total ?? 0) / result.limit);

  function buildUrl(overrides: Record<string, string | undefined>) {
    const current: Record<string, string | undefined> = {
      category: category || undefined,
      q: q || undefined,
      seller: seller || undefined,
      color: color || undefined,
      size: size || undefined,
      condition: condition || undefined,
      brand: brand || undefined,
      priceMin: priceMin || undefined,
      priceMax: priceMax || undefined,
      sort: sort || undefined,
    };
    const merged = { ...current, ...overrides };
    if (merged.page === "1") delete merged.page;
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) {
      if (v) sp.set(k, v);
    }
    const qs = sp.toString();
    return `/products${qs ? `?${qs}` : ""}`;
  }

  const hasActiveFilters = !!(
    color ||
    size ||
    condition ||
    brand ||
    priceMin ||
    priceMax ||
    seller
  );

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <SiteHeader activeCategory={category} defaultSearch={q} />

      {/* ── Hero mini-banner ── */}
      <div className="bg-flamencalia-white border-b border-flamencalia-albero-pale/20">
        <div className="max-w-350 mx-auto px-4 sm:px-6 py-5 sm:py-7">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-flamencalia-black tracking-tight">
                {seller && sellerProfile ? (
                  `Productos de ${sellerProfile.display_name}`
                ) : q ? (
                  <>
                    Resultados para{" "}
                    <span className="text-flamencalia-albero italic">
                      &ldquo;{q}&rdquo;
                    </span>
                  </>
                ) : category ? (
                  (CATEGORIES.find((c) => c.slug === category)?.label ??
                  "Productos")
                ) : (
                  "Explora la colección"
                )}
              </h1>
              <p className="text-sm text-neutral-400 mt-1">
                {result.total ?? 0} producto{(result.total ?? 0) !== 1 && "s"}{" "}
                disponible{(result.total ?? 0) !== 1 && "s"}
              </p>
            </div>
            <form action="/products" method="GET" className="shrink-0">
              {category && (
                <input type="hidden" name="category" value={category} />
              )}
              {q && <input type="hidden" name="q" value={q} />}
              {seller && <input type="hidden" name="seller" value={seller} />}
              {color && <input type="hidden" name="color" value={color} />}
              {size && <input type="hidden" name="size" value={size} />}
              {condition && (
                <input type="hidden" name="condition" value={condition} />
              )}
              {brand && <input type="hidden" name="brand" value={brand} />}
              {priceMin && (
                <input type="hidden" name="priceMin" value={priceMin} />
              )}
              {priceMax && (
                <input type="hidden" name="priceMax" value={priceMax} />
              )}
              <select
                name="sort"
                defaultValue={sort ?? ""}
                className="border border-flamencalia-albero-pale/30 rounded-full px-4 py-2 text-xs text-neutral-600 bg-white focus:outline-none focus:ring-2 focus:ring-flamencalia-albero/20 cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <noscript>
                <button
                  type="submit"
                  className="ml-1 text-xs text-flamencalia-albero"
                >
                  Aplicar
                </button>
              </noscript>
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-350 mx-auto px-4 sm:px-6 py-6">
        {/* Mobile filter button */}
        <div className="lg:hidden mb-4 flex items-center gap-3">
          <Suspense>
            <ProductFilters allSellers={allSellers} />
          </Suspense>
        </div>

        {/* Active filter chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs text-neutral-400">Filtros:</span>
            {color && (
              <Link
                href={buildUrl({ color: undefined, page: undefined })}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-flamencalia-white border border-flamencalia-albero-pale/30 rounded-full text-xs text-neutral-700 hover:border-flamencalia-albero hover:text-flamencalia-albero transition-colors"
              >
                <span
                  className="w-3 h-3 rounded-full border border-neutral-200 shrink-0"
                  style={{
                    background:
                      COLORS.find((c) => c.value === color)?.hex ?? "#ccc",
                  }}
                />
                {COLORS.find((c) => c.value === color)?.label ?? color}
                <span className="ml-0.5">✕</span>
              </Link>
            )}
            {size && (
              <Link
                href={buildUrl({ size: undefined, page: undefined })}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-flamencalia-white border border-flamencalia-albero-pale/30 rounded-full text-xs text-neutral-700 hover:border-flamencalia-albero hover:text-flamencalia-albero transition-colors"
              >
                Talla: {size === "unica" ? "Única" : size}{" "}
                <span className="ml-0.5">✕</span>
              </Link>
            )}
            {condition && (
              <Link
                href={buildUrl({ condition: undefined, page: undefined })}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-flamencalia-white border border-flamencalia-albero-pale/30 rounded-full text-xs text-neutral-700 hover:border-flamencalia-albero hover:text-flamencalia-albero transition-colors"
              >
                {CONDITIONS.find((c) => c.value === condition)?.label ??
                  condition}
                <span className="ml-0.5">✕</span>
              </Link>
            )}
            {brand && (
              <Link
                href={buildUrl({ brand: undefined, page: undefined })}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-flamencalia-white border border-flamencalia-albero-pale/30 rounded-full text-xs text-neutral-700 hover:border-flamencalia-albero hover:text-flamencalia-albero transition-colors"
              >
                {brand} <span className="ml-0.5">✕</span>
              </Link>
            )}
            {(priceMin || priceMax) && (
              <Link
                href={buildUrl({
                  priceMin: undefined,
                  priceMax: undefined,
                  page: undefined,
                })}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-flamencalia-white border border-flamencalia-albero-pale/30 rounded-full text-xs text-neutral-700 hover:border-flamencalia-albero hover:text-flamencalia-albero transition-colors"
              >
                {priceMin ? `${priceMin}€` : "0€"} –{" "}
                {priceMax ? `${priceMax}€` : "∞"}
                <span className="ml-0.5">✕</span>
              </Link>
            )}
            {seller && (
              <Link
                href={buildUrl({ seller: undefined, page: undefined })}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-flamencalia-white border border-flamencalia-albero-pale/30 rounded-full text-xs text-neutral-700 hover:border-flamencalia-albero hover:text-flamencalia-albero transition-colors"
              >
                {sellerProfile?.display_name ?? "Vendedor"}{" "}
                <span className="ml-0.5">✕</span>
              </Link>
            )}
            <Link
              href={buildUrl({
                color: undefined,
                size: undefined,
                condition: undefined,
                brand: undefined,
                priceMin: undefined,
                priceMax: undefined,
                seller: undefined,
                page: undefined,
              })}
              className="text-xs text-flamencalia-albero font-medium hover:underline ml-1"
            >
              Borrar todo
            </Link>
          </div>
        )}

        <div className="flex gap-6">
          {/* ── Desktop Sidebar ── */}
          <Suspense>
            <ProductFilters allSellers={allSellers} />
          </Suspense>
          {/* ── Main grid ── */}
          <div className="flex-1 min-w-0">
            {products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isFavorited={favoriteIds.includes(product.id)}
                      boosted={boostedSet.has(product.id)}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12">
                    {page > 1 && (
                      <Link
                        href={buildUrl({ page: String(page - 1) })}
                        className="px-5 py-2.5 bg-white border border-flamencalia-albero-pale/30 rounded-full text-sm font-medium hover:border-flamencalia-albero hover:text-flamencalia-albero transition-all text-flamencalia-black/70 shadow-sm"
                      >
                        ← Anterior
                      </Link>
                    )}
                    <span className="text-sm text-neutral-400 px-4 font-medium">
                      {page} de {totalPages}
                    </span>
                    {page < totalPages && (
                      <Link
                        href={buildUrl({ page: String(page + 1) })}
                        className="px-5 py-2.5 bg-flamencalia-black text-white rounded-full text-sm font-medium hover:bg-flamencalia-black/80 transition-all shadow-sm"
                      >
                        Siguiente →
                      </Link>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-24">
                <div className="w-20 h-20 bg-flamencalia-albero-pale/20 rounded-full flex items-center justify-center mx-auto mb-5">
                  <Icon
                    name="search"
                    className="w-8 h-8 text-flamencalia-albero/40"
                  />
                </div>
                <h3 className="text-xl font-serif font-bold text-neutral-700 mb-2">
                  No se encontraron productos
                </h3>
                <p className="text-neutral-400 text-sm mb-6 max-w-sm mx-auto">
                  {q
                    ? `No hay resultados para "${q}". Intenta con otros términos.`
                    : hasActiveFilters
                      ? "Prueba a cambiar los filtros para ver más resultados."
                      : "Aún no hay productos publicados."}
                </p>
                {(hasActiveFilters || category || q) && (
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 bg-flamencalia-black text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-flamencalia-black/80 transition-all shadow-sm"
                  >
                    <Icon name="tag" className="w-4 h-4" />
                    Ver todos los productos
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
