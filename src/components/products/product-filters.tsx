"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/* ── Constants ── */

const CATEGORIES = [
  { slug: "", label: "Todas" },
  { slug: "feria", label: "Feria" },
  { slug: "camino", label: "Camino" },
  { slug: "complementos-flamencos", label: "Complementos" },
  { slug: "invitada-flamenca", label: "Invitada Flamenca" },
  { slug: "moda-infantil", label: "Moda Infantil" },
  { slug: "equitacion", label: "Equitación" },
  { slug: "zapatos", label: "Zapatos" },
];

const COLORS = [
  { value: "blanco", label: "Blanco" },
  { value: "negro", label: "Negro" },
  { value: "rojo", label: "Rojo" },
  { value: "rosa", label: "Rosa" },
  { value: "fucsia", label: "Fucsia" },
  { value: "naranja", label: "Naranja" },
  { value: "amarillo", label: "Amarillo" },
  { value: "verde", label: "Verde" },
  { value: "azul", label: "Azul" },
  { value: "morado", label: "Morado" },
  { value: "burdeos", label: "Burdeos" },
  { value: "dorado", label: "Dorado" },
  { value: "plateado", label: "Plateado" },
  { value: "beige", label: "Beige" },
  { value: "marron", label: "Marrón" },
  { value: "multicolor", label: "Multicolor" },
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

const SELECT_CLASSES =
  "w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm bg-white text-neutral-700 focus:outline-none focus:ring-2 focus:ring-flamencalia-red/20 focus:border-flamencalia-red/40 cursor-pointer appearance-none transition-colors";

const SELECT_ARROW = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat" as const,
  backgroundPosition: "right 12px center",
};

/* ── Price range slider ── */

function PriceRangeSlider({
  min,
  max,
  currentMin,
  currentMax,
  onChange,
}: {
  min: number;
  max: number;
  currentMin: number;
  currentMax: number;
  onChange: (min: number, max: number) => void;
}) {
  const [localMin, setLocalMin] = useState(currentMin);
  const [localMax, setLocalMax] = useState(currentMax);

  const handleMinChange = (val: number) => {
    const clamped = Math.min(val, localMax - 5);
    setLocalMin(clamped);
    onChange(clamped, localMax);
  };

  const handleMaxChange = (val: number) => {
    const clamped = Math.max(val, localMin + 5);
    setLocalMax(clamped);
    onChange(localMin, clamped);
  };

  const leftPct = ((localMin - min) / (max - min)) * 100;
  const rightPct = ((localMax - min) / (max - min)) * 100;

  return (
    <div>
      <div className="relative h-6 flex items-center">
        <div className="absolute inset-x-0 h-1.5 bg-neutral-200 rounded-full" />
        <div
          className="absolute h-1.5 bg-flamencalia-red rounded-full"
          style={{ left: `${leftPct}%`, right: `${100 - rightPct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={5}
          value={localMin}
          onChange={(e) => handleMinChange(Number(e.target.value))}
          className="absolute inset-x-0 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-flamencalia-red [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-sm [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-flamencalia-red [&::-moz-range-thumb]:cursor-pointer"
          style={{ zIndex: localMin > max - 20 ? 5 : 3 }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={5}
          value={localMax}
          onChange={(e) => handleMaxChange(Number(e.target.value))}
          className="absolute inset-x-0 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-flamencalia-red [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-sm [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-flamencalia-red [&::-moz-range-thumb]:cursor-pointer"
          style={{ zIndex: 4 }}
        />
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-neutral-500">{localMin}€</span>
        <span className="text-xs text-neutral-500">{localMax}€</span>
      </div>
    </div>
  );
}

/* ── Types ── */

export interface SellerInfo {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  count: number;
}

interface ProductFiltersProps {
  allSellers: SellerInfo[];
}

/* ── Main component ── */

export function ProductFilters({ allSellers }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  const category = searchParams.get("category") ?? "";
  const color = searchParams.get("color") ?? "";
  const size = searchParams.get("size") ?? "";
  const condition = searchParams.get("condition") ?? "";
  const brand = searchParams.get("brand") ?? "";
  const priceMin = searchParams.get("priceMin") ?? "";
  const priceMax = searchParams.get("priceMax") ?? "";
  const seller = searchParams.get("seller") ?? "";

  const [brandInput, setBrandInput] = useState(brand);

  const navigate = useCallback(
    (overrides: Record<string, string | undefined>) => {
      const sp = new URLSearchParams(searchParams.toString());
      sp.delete("page");
      for (const [k, v] of Object.entries(overrides)) {
        if (v) sp.set(k, v);
        else sp.delete(k);
      }
      const qs = sp.toString();
      router.push(`/products${qs ? `?${qs}` : ""}`);
    },
    [router, searchParams],
  );

  const clearAll = () => {
    const sp = new URLSearchParams(searchParams.toString());
    [
      "category",
      "color",
      "size",
      "condition",
      "brand",
      "priceMin",
      "priceMax",
      "seller",
      "page",
    ].forEach((k) => sp.delete(k));
    const qs = sp.toString();
    router.push(`/products${qs ? `?${qs}` : ""}`);
    setBrandInput("");
    setMobileOpen(false);
  };

  const hasActiveFilters = !!(
    category ||
    color ||
    size ||
    condition ||
    brand ||
    priceMin ||
    priceMax ||
    seller
  );

  /* ── Shared filter content (no accordions, flat layout like volearteflamenca) ── */

  const filtersContent = (
    <div className="space-y-5">
      {/* Categoría */}
      <div>
        <label className="block text-sm font-semibold text-neutral-800 mb-1.5">
          Categoría
        </label>
        <select
          value={category}
          onChange={(e) => navigate({ category: e.target.value || undefined })}
          className={SELECT_CLASSES}
          style={SELECT_ARROW}
        >
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Precio */}
      <div>
        <label className="block text-sm font-semibold text-neutral-800 mb-2">
          Precio: {priceMin || "0"}€ - {priceMax || "1000"}€
        </label>
        <PriceRangeSlider
          min={0}
          max={1000}
          currentMin={priceMin ? Number(priceMin) : 0}
          currentMax={priceMax ? Number(priceMax) : 1000}
          onChange={(min, max) => {
            navigate({
              priceMin: min > 0 ? String(min) : undefined,
              priceMax: max < 1000 ? String(max) : undefined,
            });
          }}
        />
      </div>

      {/* Talla */}
      <div>
        <label className="block text-sm font-semibold text-neutral-800 mb-1.5">
          Talla
        </label>
        <select
          value={size}
          onChange={(e) => navigate({ size: e.target.value || undefined })}
          className={SELECT_CLASSES}
          style={SELECT_ARROW}
        >
          <option value="">Todas las tallas</option>
          {SIZES.map((s) => (
            <option key={s} value={s}>
              {s === "unica" ? "Única" : s}
            </option>
          ))}
        </select>
      </div>

      {/* Estado */}
      <div>
        <label className="block text-sm font-semibold text-neutral-800 mb-1.5">
          Estado
        </label>
        <select
          value={condition}
          onChange={(e) => navigate({ condition: e.target.value || undefined })}
          className={SELECT_CLASSES}
          style={SELECT_ARROW}
        >
          <option value="">Todos los estados</option>
          {CONDITIONS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Color */}
      <div>
        <label className="block text-sm font-semibold text-neutral-800 mb-1.5">
          Color
        </label>
        <select
          value={color}
          onChange={(e) => navigate({ color: e.target.value || undefined })}
          className={SELECT_CLASSES}
          style={SELECT_ARROW}
        >
          <option value="">Todos los colores</option>
          {COLORS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Marca */}
      <div>
        <label className="block text-sm font-semibold text-neutral-800 mb-1.5">
          Marca / Diseñador
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar marca..."
            value={brandInput}
            onChange={(e) => setBrandInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                navigate({ brand: brandInput.trim() || undefined });
              }
            }}
            onBlur={() => {
              if (brandInput.trim() !== brand) {
                navigate({ brand: brandInput.trim() || undefined });
              }
            }}
            className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 pr-9 text-sm bg-white text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-flamencalia-red/20 focus:border-flamencalia-red/40 transition-colors"
          />
          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Vendedor — burbujas de perfil */}
      {allSellers.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-neutral-800 mb-2.5">
            Top Vendedores
          </label>
          <div className="flex flex-wrap gap-3">
            {allSellers.slice(0, 8).map((s) => {
              const isActive = seller === s.id;
              const initials = (s.display_name ?? "V")
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() =>
                    navigate({ seller: isActive ? undefined : s.id })
                  }
                  className="flex flex-col items-center gap-1 group"
                  title={`${s.display_name ?? "Vendedor"} · ${s.count} productos`}
                >
                  <div
                    className={`w-11 h-11 rounded-full overflow-hidden border-2 transition-all ${
                      isActive
                        ? "border-flamencalia-red ring-2 ring-flamencalia-red/20 scale-110"
                        : "border-neutral-200 group-hover:border-flamencalia-red/40"
                    }`}
                  >
                    {s.avatar_url ? (
                      <img
                        src={s.avatar_url}
                        alt={s.display_name ?? "Vendedor"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-flamencalia-red/80 to-flamencalia-red flex items-center justify-center text-white text-xs font-bold">
                        {initials}
                      </div>
                    )}
                  </div>
                  <span
                    className={`text-[10px] leading-tight text-center max-w-[52px] truncate ${
                      isActive
                        ? "text-flamencalia-red font-semibold"
                        : "text-neutral-500 group-hover:text-neutral-700"
                    }`}
                  >
                    {(s.display_name ?? "Vendedor").split(" ")[0]}
                  </span>
                </button>
              );
            })}
          </div>
          {seller && (
            <button
              type="button"
              onClick={() => navigate({ seller: undefined })}
              className="mt-2 text-xs text-neutral-400 hover:text-flamencalia-red transition-colors"
            >
              × Ver todos
            </button>
          )}
        </div>
      )}

      {/* Botón limpiar */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearAll}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-neutral-500 hover:text-flamencalia-red border border-neutral-200 rounded-lg hover:border-flamencalia-red/30 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          Limpiar filtros
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* ── Mobile: Filtros button ── */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="lg:hidden inline-flex items-center gap-2 border border-neutral-200 rounded-full px-4 py-2 text-sm text-neutral-600 bg-white hover:border-flamencalia-red/40 hover:text-flamencalia-red transition-colors"
      >
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="M4 6h16M4 12h10M4 18h4" strokeLinecap="round" />
        </svg>
        Filtros
        {hasActiveFilters && (
          <span className="w-2 h-2 rounded-full bg-flamencalia-red" />
        )}
      </button>

      {/* ── Mobile: Sheet overlay ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute bottom-0 inset-x-0 max-h-[85vh] bg-white rounded-t-3xl shadow-2xl overflow-hidden animate-slide-up flex flex-col">
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-neutral-300 rounded-full" />
            </div>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-100">
              <h2 className="text-lg font-serif font-bold text-neutral-900">
                Filtros de búsqueda
              </h2>
              <div className="flex items-center gap-3">
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="text-sm text-neutral-500 hover:text-flamencalia-red font-medium transition-colors"
                  >
                    Limpiar
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="p-1 rounded-full hover:bg-neutral-100 transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-neutral-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>
            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {filtersContent}
            </div>
            {/* Apply button */}
            <div className="px-5 py-3 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="w-full bg-neutral-900 text-white rounded-full py-3 text-sm font-semibold hover:bg-neutral-800 transition-colors"
              >
                Ver resultados
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Desktop: Sidebar ── */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="bg-white rounded-2xl border border-neutral-200 p-5 sticky top-24">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-serif font-bold text-neutral-900 flex items-center gap-2">
              <svg
                className="w-4 h-4 text-neutral-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Filtros
            </h3>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAll}
                className="text-xs text-neutral-500 hover:text-flamencalia-red font-medium transition-colors"
              >
                Limpiar
              </button>
            )}
          </div>
          {filtersContent}
        </div>
      </aside>
    </>
  );
}
