"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Product } from "@/types";
import { Icon } from "@/components/icons";
import { ImageUpload } from "@/components/products/image-upload";
import Link from "next/link";

const CATEGORIES = [
  { value: "feria", label: "Feria" },
  { value: "camino", label: "Camino" },
  { value: "complementos-flamencos", label: "Complementos Flamencos" },
  { value: "invitada-flamenca", label: "Invitada Flamenca" },
  { value: "moda-infantil", label: "Moda Infantil" },
  { value: "equitacion", label: "Equitación" },
  { value: "zapatos", label: "Zapatos" },
];

const SUBCATEGORIES = [
  { value: "mantones", label: "Mantones" },
  { value: "flores", label: "Flores" },
  { value: "pendientes", label: "Pendientes" },
  { value: "broches-mantones", label: "Broches para mantones" },
  { value: "sombreros", label: "Sombreros" },
  { value: "panuelos", label: "Pañuelos" },
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
  { value: "nuevo", label: "Nuevo con etiqueta" },
  { value: "como-nuevo", label: "Como nuevo" },
  { value: "bueno", label: "Buen estado" },
  { value: "aceptable", label: "Aceptable" },
];

export function EditProductForm({ product }: { product: Product }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState<string[]>(product.images ?? []);
  const [selectedCategory, setSelectedCategory] = useState(
    product.category ?? "",
  );
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    const res = await fetch(`/api/products/${product.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: formData.get("title"),
        description: formData.get("description"),
        price: Math.round(Number(formData.get("price")) * 100),
        category: formData.get("category") as string,
        subcategory: formData.get("subcategory") || null,
        color: formData.get("color") || null,
        size: formData.get("size") || null,
        condition: formData.get("condition") || null,
        brand: (formData.get("brand") as string)?.trim() || null,
        material: (formData.get("material") as string)?.trim() || null,
        stock: Number(formData.get("stock")) || 0,
        images,
        status: formData.get("status") || "active",
        negotiable: formData.get("negotiable") === "on",
        weight_kg: formData.get("weight_kg")
          ? Number(formData.get("weight_kg"))
          : null,
        shipping_from:
          (formData.get("shipping_from") as string)?.trim() || null,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error?.toString() ?? "Algo salió mal");
      setLoading(false);
      return;
    }

    router.push("/dashboard/products");
    router.refresh();
  }

  async function handleDelete() {
    if (
      !confirm(
        "¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.",
      )
    )
      return;

    const res = await fetch(`/api/products/${product.id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      router.push("/dashboard/products");
      router.refresh();
    }
  }

  return (
    <>
      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-4 border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white border border-neutral-100 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">
            Información básica
          </h2>

          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-neutral-700 mb-1.5"
            >
              Título *
            </label>
            <input
              id="title"
              name="title"
              defaultValue={product.title}
              required
              minLength={3}
              className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-flamencalia-red/20 focus:border-flamencalia-red transition-all bg-neutral-50/50"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-neutral-700 mb-1.5"
            >
              Descripción
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={product.description ?? ""}
              className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-flamencalia-red/20 focus:border-flamencalia-red transition-all bg-neutral-50/50 resize-none"
            />
          </div>

          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-neutral-700 mb-1.5"
            >
              Categoría *
            </label>
            <select
              id="category"
              name="category"
              defaultValue={product.category ?? ""}
              required
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-flamencalia-red/20 focus:border-flamencalia-red transition-all bg-neutral-50/50"
            >
              <option value="">Selecciona categoría *</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {selectedCategory === "complementos-flamencos" && (
            <div>
              <label
                htmlFor="subcategory"
                className="block text-sm font-medium text-neutral-700 mb-1.5"
              >
                Subcategoría
              </label>
              <select
                id="subcategory"
                name="subcategory"
                defaultValue={
                  ((product as unknown as Record<string, unknown>)
                    .subcategory as string) ?? ""
                }
                className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-flamencalia-red/20 focus:border-flamencalia-red transition-all bg-neutral-50/50"
              >
                <option value="">Selecciona subcategoría</option>
                {SUBCATEGORIES.map((sub) => (
                  <option key={sub.value} value={sub.value}>
                    {sub.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Attributes */}
        <div className="bg-white border border-neutral-100 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">
            Atributos del producto
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="color"
                className="block text-sm font-medium text-neutral-700 mb-1.5"
              >
                Color
              </label>
              <select
                id="color"
                name="color"
                defaultValue={product.color ?? ""}
                className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-flamencalia-red/20 focus:border-flamencalia-red transition-all bg-neutral-50/50"
              >
                <option value="">Selecciona color</option>
                {COLORS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="size"
                className="block text-sm font-medium text-neutral-700 mb-1.5"
              >
                Talla
              </label>
              <select
                id="size"
                name="size"
                defaultValue={product.size ?? ""}
                className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-flamencalia-red/20 focus:border-flamencalia-red transition-all bg-neutral-50/50"
              >
                <option value="">Selecciona talla</option>
                {SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s === "unica" ? "Talla única" : s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="condition"
                className="block text-sm font-medium text-neutral-700 mb-1.5"
              >
                Estado del artículo
              </label>
              <select
                id="condition"
                name="condition"
                defaultValue={product.condition ?? ""}
                className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-flamencalia-red/20 focus:border-flamencalia-red transition-all bg-neutral-50/50"
              >
                <option value="">Selecciona estado</option>
                {CONDITIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="brand"
                className="block text-sm font-medium text-neutral-700 mb-1.5"
              >
                Marca / Diseñador
              </label>
              <input
                id="brand"
                name="brand"
                defaultValue={product.brand ?? ""}
                placeholder="Ej: Lina, Pol Núñez..."
                className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-flamencalia-red/20 focus:border-flamencalia-red transition-all bg-neutral-50/50"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="material"
              className="block text-sm font-medium text-neutral-700 mb-1.5"
            >
              Material
            </label>
            <input
              id="material"
              name="material"
              defaultValue={product.material ?? ""}
              placeholder="Ej: Algodón, Seda, Encaje..."
              className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-flamencalia-red/20 focus:border-flamencalia-red transition-all bg-neutral-50/50"
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white border border-neutral-100 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">
            Precio y stock
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-neutral-700 mb-1.5"
              >
                Precio (€) *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-neutral-400">
                  €
                </span>
                <input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0.50"
                  defaultValue={(product.price / 100).toFixed(2)}
                  required
                  className="w-full border border-neutral-200 rounded-xl pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-flamencalia-red/20 focus:border-flamencalia-red transition-all bg-neutral-50/50"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="stock"
                className="block text-sm font-medium text-neutral-700 mb-1.5"
              >
                Stock
              </label>
              <input
                id="stock"
                name="stock"
                type="number"
                min="0"
                defaultValue={product.stock}
                className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-flamencalia-red/20 focus:border-flamencalia-red transition-all bg-neutral-50/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Estado
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="relative">
                <input
                  type="radio"
                  name="status"
                  value="active"
                  defaultChecked={product.status === "active"}
                  className="peer sr-only"
                />
                <div className="border-2 border-neutral-200 rounded-xl p-3 text-center cursor-pointer peer-checked:border-emerald-500 peer-checked:bg-emerald-50 transition-all hover:border-neutral-300">
                  <span className="text-xs font-semibold text-neutral-600">
                    <Icon
                      name="checkCircle"
                      className="w-3.5 h-3.5 inline mr-1"
                    />
                    Activo
                  </span>
                </div>
              </label>
              <label className="relative">
                <input
                  type="radio"
                  name="status"
                  value="draft"
                  defaultChecked={product.status === "draft"}
                  className="peer sr-only"
                />
                <div className="border-2 border-neutral-200 rounded-xl p-3 text-center cursor-pointer peer-checked:border-neutral-500 peer-checked:bg-neutral-50 transition-all hover:border-neutral-300">
                  <span className="text-xs font-semibold text-neutral-600">
                    <Icon name="pencil" className="w-3.5 h-3.5 inline mr-1" />
                    Borrador
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                name="negotiable"
                defaultChecked={product.negotiable ?? false}
                className="w-4.5 h-4.5 rounded border-neutral-300 text-flamencalia-albero accent-flamencalia-albero"
              />
              <div>
                <span className="text-sm font-medium text-neutral-700">
                  Precio negociable
                </span>
                <p className="text-xs text-neutral-400">
                  Permite a los compradores enviar ofertas
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Shipping */}
        <div className="bg-white border border-neutral-100 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">
            Envío
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="weight_kg"
                className="block text-sm font-medium text-neutral-700 mb-1.5"
              >
                Peso (kg)
              </label>
              <input
                id="weight_kg"
                name="weight_kg"
                type="number"
                step="0.1"
                min="0"
                defaultValue={product.weight_kg ?? ""}
                placeholder="Ej: 0.5"
                className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-flamencalia-red/20 focus:border-flamencalia-red transition-all bg-neutral-50/50"
              />
            </div>
            <div>
              <label
                htmlFor="shipping_from"
                className="block text-sm font-medium text-neutral-700 mb-1.5"
              >
                Envío desde
              </label>
              <input
                id="shipping_from"
                name="shipping_from"
                defaultValue={product.shipping_from ?? ""}
                placeholder="Ej: Sevilla, Málaga..."
                className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-flamencalia-red/20 focus:border-flamencalia-red transition-all bg-neutral-50/50"
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white border border-neutral-100 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">
            Imágenes
          </h2>
          <ImageUpload images={images} onChange={setImages} />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-flamencalia-red text-white py-3 rounded-xl text-sm font-semibold hover:bg-flamencalia-red-dark disabled:opacity-50 transition-all shadow-sm"
          >
            {loading ? "Guardando..." : "Guardar Cambios"}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="px-5 py-3 border border-red-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors"
          >
            Eliminar
          </button>
        </div>
      </form>
    </>
  );
}
