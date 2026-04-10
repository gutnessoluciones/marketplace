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
};

interface PageProps {
  searchParams: Promise<{
    page?: string;
    category?: string;
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
  const result = await service.list(page, 24, category, q, seller, {
    color,
    size,
    condition,
    brand,
    priceMin: priceMin ? Math.round(Number(priceMin) * 100) : undefined,
    priceMax: priceMax ? Math.round(Number(priceMax) * 100) : undefined,
    sort,
  });

  let sellerProfile: { display_name: string | null } | null = null;
  if (seller) {
    const { data } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", seller)
      .single();
    sellerProfile = data;
  }

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
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-flamencalia-black sticky top-0 z-30">
        <div className="max-w-350 mx-auto px-4 sm:px-6">
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
                alt=""
                width={28}
                height={28}
                className="w-7 h-7"
              />
            </Link>

            <form action="/products" method="GET" className="flex-1 max-w-2xl">
              {category && (
                <input type="hidden" name="category" value={category} />
              )}
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
                  className="w-full bg-white rounded-full pl-10 pr-24 py-2.5 text-sm text-neutral-700 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-flamencalia-albero/50 transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1/2 -translate-y-1/2 bg-flamencalia-black text-white px-4 py-1.5 rounded-full text-xs font-bold hover:bg-flamencalia-black/80 transition-all"
                >
                  Buscar
                </button>
              </div>
            </form>

            <UserNav variant="dark" />
          </div>
        </div>
      </header>

      {/* Categories bar */}
      <div className="bg-white border-b border-neutral-200 sticky top-14 z-20">
        <div className="max-w-350 mx-auto px-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto py-2.5 scrollbar-hide">
            {CATEGORIES.map((cat) => {
              const isActive = (category ?? "") === cat.slug;
              return (
                <Link
                  key={cat.slug}
                  href={buildUrl({
                    category: cat.slug || undefined,
                    page: undefined,
                  })}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-flamencalia-black text-white"
                      : "text-neutral-600 hover:bg-neutral-100"
                  }`}
                >
                  <Icon name={cat.icon} className="w-3.5 h-3.5" />
                  {cat.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-350 mx-auto px-4 sm:px-6 py-6">
        {/* Title + sort */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-bold text-neutral-900">
              {seller && sellerProfile
                ? `Productos de ${sellerProfile.display_name}`
                : q
                  ? `"${q}"`
                  : category
                    ? (CATEGORIES.find((c) => c.slug === category)?.label ??
                      "Productos")
                    : "Todos los productos"}
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              {result.total ?? 0} resultados
            </p>
          </div>
          <form action="/products" method="GET" className="hidden sm:block">
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
              className="border border-neutral-200 rounded-lg px-3 py-1.5 text-xs text-neutral-600 bg-white focus:outline-none focus:ring-1 focus:ring-flamencalia-albero/20"
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

        {/* Active filter chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs text-neutral-400">Filtros:</span>
            {color && (
              <Link
                href={buildUrl({ color: undefined, page: undefined })}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-neutral-200 rounded-full text-xs text-neutral-700 hover:border-red-300 hover:text-red-600 transition-colors"
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
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-neutral-200 rounded-full text-xs text-neutral-700 hover:border-red-300 hover:text-red-600 transition-colors"
              >
                Talla: {size === "unica" ? "Única" : size}{" "}
                <span className="ml-0.5">✕</span>
              </Link>
            )}
            {condition && (
              <Link
                href={buildUrl({ condition: undefined, page: undefined })}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-neutral-200 rounded-full text-xs text-neutral-700 hover:border-red-300 hover:text-red-600 transition-colors"
              >
                {CONDITIONS.find((c) => c.value === condition)?.label ??
                  condition}
                <span className="ml-0.5">✕</span>
              </Link>
            )}
            {brand && (
              <Link
                href={buildUrl({ brand: undefined, page: undefined })}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-neutral-200 rounded-full text-xs text-neutral-700 hover:border-red-300 hover:text-red-600 transition-colors"
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
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-neutral-200 rounded-full text-xs text-neutral-700 hover:border-red-300 hover:text-red-600 transition-colors"
              >
                {priceMin ? `${priceMin}€` : "0€"} –{" "}
                {priceMax ? `${priceMax}€` : "∞"}
                <span className="ml-0.5">✕</span>
              </Link>
            )}
            {seller && (
              <Link
                href={buildUrl({ seller: undefined, page: undefined })}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-neutral-200 rounded-full text-xs text-neutral-700 hover:border-red-300 hover:text-red-600 transition-colors"
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
          {/* ── Sidebar ── */}
          <aside className="hidden lg:block w-60 shrink-0 space-y-5">
            {/* Price Range */}
            <div className="bg-white rounded-xl border border-neutral-200 p-4">
              <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider mb-3">
                Precio
              </h3>
              <form
                action="/products"
                method="GET"
                className="flex items-center gap-2"
              >
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
                {sort && <input type="hidden" name="sort" value={sort} />}
                <input
                  type="number"
                  name="priceMin"
                  placeholder="Min"
                  defaultValue={priceMin ?? ""}
                  min="0"
                  step="1"
                  className="w-full border border-neutral-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-flamencalia-albero/20"
                />
                <span className="text-neutral-300 text-xs">—</span>
                <input
                  type="number"
                  name="priceMax"
                  placeholder="Max"
                  defaultValue={priceMax ?? ""}
                  min="0"
                  step="1"
                  className="w-full border border-neutral-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-flamencalia-albero/20"
                />
                <button
                  type="submit"
                  className="p-1.5 bg-flamencalia-black text-white rounded-lg hover:bg-flamencalia-black/80 transition-colors shrink-0"
                >
                  <Icon name="check" className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Color */}
            <div className="bg-white rounded-xl border border-neutral-200 p-4">
              <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider mb-3">
                Color
              </h3>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => {
                  const isActive = color === c.value;
                  return (
                    <Link
                      key={c.value}
                      href={buildUrl({
                        color: isActive ? undefined : c.value,
                        page: undefined,
                      })}
                      title={c.label}
                      className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 ${
                        isActive
                          ? "border-flamencalia-albero ring-2 ring-flamencalia-albero/30 scale-110"
                          : "border-neutral-200 hover:border-neutral-400"
                      }`}
                      style={{ background: c.hex }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Size */}
            <div className="bg-white rounded-xl border border-neutral-200 p-4">
              <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider mb-3">
                Talla
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {SIZES.map((s) => {
                  const isActive = size === s;
                  return (
                    <Link
                      key={s}
                      href={buildUrl({
                        size: isActive ? undefined : s,
                        page: undefined,
                      })}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                        isActive
                          ? "bg-flamencalia-black text-white"
                          : "bg-neutral-50 text-neutral-600 hover:bg-neutral-100"
                      }`}
                    >
                      {s === "unica" ? "Única" : s}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Condition */}
            <div className="bg-white rounded-xl border border-neutral-200 p-4">
              <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider mb-3">
                Estado
              </h3>
              <div className="space-y-1">
                {CONDITIONS.map((c) => {
                  const isActive = condition === c.value;
                  return (
                    <Link
                      key={c.value}
                      href={buildUrl({
                        condition: isActive ? undefined : c.value,
                        page: undefined,
                      })}
                      className={`block px-3 py-1.5 rounded-lg text-xs transition-all ${
                        isActive
                          ? "bg-flamencalia-red/10 text-flamencalia-albero font-semibold"
                          : "text-neutral-600 hover:bg-neutral-50"
                      }`}
                    >
                      {c.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Brand */}
            <div className="bg-white rounded-xl border border-neutral-200 p-4">
              <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider mb-3">
                Marca / Diseñador
              </h3>
              <form action="/products" method="GET" className="flex gap-1.5">
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
                {priceMin && (
                  <input type="hidden" name="priceMin" value={priceMin} />
                )}
                {priceMax && (
                  <input type="hidden" name="priceMax" value={priceMax} />
                )}
                {sort && <input type="hidden" name="sort" value={sort} />}
                <input
                  type="text"
                  name="brand"
                  placeholder="Buscar marca..."
                  defaultValue={brand ?? ""}
                  className="w-full border border-neutral-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-flamencalia-albero/20"
                />
                <button
                  type="submit"
                  className="p-1.5 bg-flamencalia-black text-white rounded-lg hover:bg-flamencalia-black/80 transition-colors shrink-0"
                >
                  <Icon name="search" className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Sellers */}
            <div className="bg-white rounded-xl border border-neutral-200 p-4">
              <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider mb-3">
                Vendedores
              </h3>
              <div className="space-y-0.5 max-h-64 overflow-y-auto">
                {allSellers.map((s) => {
                  const isActive = seller === s.id;
                  return (
                    <div key={s.id} className="flex items-center gap-1">
                      <Link
                        href={buildUrl({
                          seller: isActive ? undefined : s.id,
                          page: undefined,
                        })}
                        className={`flex-1 flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                          isActive
                            ? "bg-flamencalia-red/10 text-flamencalia-albero font-semibold"
                            : "text-neutral-600 hover:bg-neutral-50"
                        }`}
                      >
                        <div className="w-5 h-5 rounded-full bg-neutral-100 overflow-hidden shrink-0">
                          {s.avatar_url ? (
                            <img
                              src={s.avatar_url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Icon
                                name="user"
                                className="w-3 h-3 text-neutral-400"
                              />
                            </div>
                          )}
                        </div>
                        <span className="truncate">
                          {s.display_name ?? "Vendedor"}
                        </span>
                        <span className="ml-auto text-[10px] text-neutral-400">
                          {s.count}
                        </span>
                      </Link>
                      <Link
                        href={`/sellers/${s.id}`}
                        className="p-1 rounded text-neutral-400 hover:text-flamencalia-albero transition-colors shrink-0"
                        title="Ver perfil"
                      >
                        <Icon name="eye" className="w-3 h-3" />
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* ── Main grid ── */}
          <div className="flex-1 min-w-0">
            {result.data.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {result.data.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 mt-10">
                    {page > 1 && (
                      <Link
                        href={buildUrl({ page: String(page - 1) })}
                        className="px-4 py-2 bg-white border border-neutral-200 rounded-lg text-xs font-medium hover:bg-neutral-50 transition-all text-neutral-700"
                      >
                        ← Anterior
                      </Link>
                    )}
                    <span className="text-xs text-neutral-400 px-3">
                      {page} / {totalPages}
                    </span>
                    {page < totalPages && (
                      <Link
                        href={buildUrl({ page: String(page + 1) })}
                        className="px-4 py-2 bg-white border border-neutral-200 rounded-lg text-xs font-medium hover:bg-neutral-50 transition-all text-neutral-700"
                      >
                        Siguiente →
                      </Link>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="search" className="w-7 h-7 text-neutral-300" />
                </div>
                <h3 className="text-base font-semibold text-neutral-700 mb-1">
                  No se encontraron productos
                </h3>
                <p className="text-neutral-400 text-xs mb-5">
                  {q
                    ? `No hay resultados para "${q}".`
                    : hasActiveFilters
                      ? "Prueba a cambiar los filtros."
                      : "Aún no hay productos publicados."}
                </p>
                {(hasActiveFilters || category || q) && (
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-1.5 bg-flamencalia-black text-white px-5 py-2 rounded-full text-xs font-semibold hover:bg-flamencalia-black/80 transition-all"
                  >
                    Ver todos
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
