"use client";

import { useState, useEffect, useCallback } from "react";
import { Icon } from "@/components/icons";
import { AdminToast } from "@/components/admin/toast";

interface Product {
  id: string;
  title: string;
  price: number;
  stock: number;
  status: string;
  category: string | null;
  images: string[];
  created_at: string;
  seller_id: string;
  seller?: { display_name: string } | null;
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [actionModal, setActionModal] = useState<{
    product: Product;
    type: "hide" | "activate" | "remove";
  } | null>(null);
  const [reason, setReason] = useState("");
  const [acting, setActing] = useState(false);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/products");
    if (res.ok) {
      const json = await res.json();
      setProducts(json.data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleAction = async () => {
    if (!actionModal) return;
    setActing(true);

    const { product, type } = actionModal;
    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: type, reason: reason || undefined }),
    });

    if (res.ok) {
      const label =
        type === "hide"
          ? "Producto ocultado"
          : type === "activate"
            ? "Producto activado"
            : "Producto eliminado";
      setToast({ msg: label, type: "success" });
      setActionModal(null);
      setReason("");
      loadProducts();
    } else {
      const json = await res.json().catch(() => null);
      setToast({
        msg: json?.error || "Error al procesar la acción",
        type: "error",
      });
    }
    setActing(false);
  };

  const filtered =
    filter === "all" ? products : products.filter((p) => p.status === filter);

  const statusLabel = (s: string) => {
    const map: Record<string, { label: string; cls: string }> = {
      active: { label: "Activo", cls: "bg-emerald-50 text-emerald-700" },
      draft: { label: "Borrador", cls: "bg-neutral-100 text-neutral-600" },
      hidden: { label: "Oculto", cls: "bg-red-50 text-red-700" },
      sold: { label: "Vendido", cls: "bg-blue-50 text-blue-700" },
    };
    return map[s] || { label: s, cls: "bg-neutral-100 text-neutral-600" };
  };

  return (
    <div className="max-w-6xl">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-flamencalia-black">
            Productos
          </h1>
          <p className="text-sm text-neutral-400 mt-0.5">
            {products.length} productos en la plataforma
          </p>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {[
            { value: "all", label: "Todos" },
            { value: "active", label: "Activos" },
            { value: "hidden", label: "Ocultos" },
            { value: "draft", label: "Borradores" },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                filter === f.value
                  ? "bg-flamencalia-black text-white"
                  : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-neutral-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-100">
                <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 sm:px-5 py-3">
                  Producto
                </th>
                <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 sm:px-5 py-3 hidden sm:table-cell">
                  Vendedor
                </th>
                <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 sm:px-5 py-3 hidden md:table-cell">
                  Precio
                </th>
                <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 sm:px-5 py-3 hidden lg:table-cell">
                  Estado
                </th>
                <th className="text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 sm:px-5 py-3">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <div className="animate-pulse text-sm text-neutral-400">
                      Cargando...
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center text-sm text-neutral-400"
                  >
                    No hay productos
                  </td>
                </tr>
              ) : (
                filtered.map((product) => {
                  const st = statusLabel(product.status);
                  return (
                    <tr
                      key={product.id}
                      className={`hover:bg-neutral-50/50 ${product.status === "hidden" ? "bg-red-50/20" : ""}`}
                    >
                      <td className="px-4 sm:px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-neutral-100 shrink-0 overflow-hidden">
                            {product.images?.length > 0 ? (
                              <img
                                src={product.images[0]}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-neutral-300">
                                <Icon name="package" className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-neutral-700 truncate max-w-48">
                              {product.title}
                            </p>
                            <p className="text-xs text-neutral-400 capitalize">
                              {product.category ?? "Sin categoría"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-5 py-3 text-sm text-neutral-600 hidden sm:table-cell">
                        {product.seller?.display_name ?? "—"}
                      </td>
                      <td className="px-4 sm:px-5 py-3 text-sm font-medium text-neutral-700 hidden md:table-cell">
                        {formatPrice(product.price)}
                      </td>
                      <td className="px-4 sm:px-5 py-3 hidden lg:table-cell">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${st.cls}`}
                        >
                          {st.label}
                        </span>
                      </td>
                      <td className="px-4 sm:px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {product.status === "active" ? (
                            <button
                              onClick={() =>
                                setActionModal({
                                  product,
                                  type: "hide",
                                })
                              }
                              className="text-xs px-2.5 py-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
                            >
                              Ocultar
                            </button>
                          ) : product.status === "hidden" ? (
                            <button
                              onClick={() =>
                                setActionModal({
                                  product,
                                  type: "activate",
                                })
                              }
                              className="text-xs px-2.5 py-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                            >
                              Activar
                            </button>
                          ) : null}
                          <button
                            onClick={() =>
                              setActionModal({
                                product,
                                type: "remove",
                              })
                            }
                            className="text-xs px-2.5 py-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Modal */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-neutral-800 mb-1">
              {actionModal.type === "hide"
                ? "Ocultar producto"
                : actionModal.type === "activate"
                  ? "Activar producto"
                  : "Eliminar producto"}
            </h3>
            <p className="text-sm text-neutral-500 mb-4">
              {actionModal.product.title}
            </p>

            {(actionModal.type === "hide" || actionModal.type === "remove") && (
              <div className="mb-4">
                <label className="text-xs font-medium text-neutral-600 mb-1 block">
                  Motivo{actionModal.type === "remove" ? " (opcional)" : " *"}
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="w-full text-sm border border-neutral-200 rounded-xl p-3 focus:ring-2 focus:ring-flamencalia-albero/30 focus:border-flamencalia-albero outline-none resize-none"
                  placeholder="Ej: Producto no cumple estándares de calidad..."
                />
              </div>
            )}

            {actionModal.type === "remove" && (
              <p className="text-xs text-red-600 mb-4 bg-red-50 rounded-lg p-3">
                Esta acción es irreversible. El producto se eliminará
                permanentemente.
              </p>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setActionModal(null);
                  setReason("");
                }}
                className="text-sm px-4 py-2 rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleAction}
                disabled={acting || (actionModal.type === "hide" && !reason)}
                className={`text-sm px-4 py-2 rounded-xl font-medium text-white disabled:opacity-50 ${
                  actionModal.type === "remove"
                    ? "bg-red-600 hover:bg-red-700"
                    : actionModal.type === "hide"
                      ? "bg-amber-600 hover:bg-amber-700"
                      : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {acting
                  ? "Procesando..."
                  : actionModal.type === "hide"
                    ? "Ocultar"
                    : actionModal.type === "activate"
                      ? "Activar"
                      : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
      <AdminToast
        message={toast?.msg ?? null}
        type={toast?.type ?? "success"}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
