"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Product } from "@/types";

export function EditProductForm({ product }: { product: Product }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
        category: formData.get("category") || undefined,
        stock: Number(formData.get("stock")) || 0,
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
    if (!confirm("¿Eliminar este producto?")) return;

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
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1.5">
            Título
          </label>
          <input
            id="title"
            name="title"
            defaultValue={product.title}
            required
            minLength={3}
            className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium mb-1.5"
          >
            Descripción
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={product.description ?? ""}
            className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium mb-1.5">
              Precio (USD)
            </label>
            <input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0.50"
              defaultValue={(product.price / 100).toFixed(2)}
              required
              className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition-colors"
            />
          </div>
          <div>
            <label htmlFor="stock" className="block text-sm font-medium mb-1.5">
              Stock
            </label>
            <input
              id="stock"
              name="stock"
              type="number"
              min="0"
              defaultValue={product.stock}
              className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition-colors"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium mb-1.5"
          >
            Categoría
          </label>
          <input
            id="category"
            name="category"
            defaultValue={product.category ?? ""}
            className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition-colors"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-black text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {loading ? "Guardando..." : "Guardar Cambios"}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2.5 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
          >
            Eliminar
          </button>
        </div>
      </form>
    </>
  );
}
