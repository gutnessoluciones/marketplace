"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/icons";

interface CollectionItem {
  id: string;
  product: {
    id: string;
    title: string;
    price: number;
    images: string[];
    status: string;
    seller: { display_name: string };
  };
}

interface Collection {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  item_count: number;
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [creating, setCreating] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [items, setItems] = useState<Record<string, CollectionItem[]>>({});
  const [loadingItems, setLoadingItems] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPublic, setEditPublic] = useState(false);

  const fetchCollections = useCallback(async () => {
    const res = await fetch("/api/collections");
    const json = await res.json();
    if (json.data) setCollections(json.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    await fetch("/api/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        description: description.trim() || null,
        is_public: isPublic,
      }),
    });
    setName("");
    setDescription("");
    setIsPublic(false);
    setShowCreate(false);
    setCreating(false);
    fetchCollections();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este armario y todos sus artículos?")) return;
    await fetch(`/api/collections/${id}`, { method: "DELETE" });
    setCollections((prev) => prev.filter((c) => c.id !== id));
    if (expanded === id) setExpanded(null);
  };

  const handleUpdate = async (id: string) => {
    await fetch(`/api/collections/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editName.trim(),
        description: editDesc.trim() || null,
        is_public: editPublic,
      }),
    });
    setEditingId(null);
    fetchCollections();
  };

  const toggleExpand = async (id: string) => {
    if (expanded === id) {
      setExpanded(null);
      return;
    }
    setExpanded(id);
    if (!items[id]) {
      setLoadingItems(id);
      const res = await fetch(`/api/collections/${id}/items`);
      const json = await res.json();
      if (json.data) setItems((prev) => ({ ...prev, [id]: json.data }));
      setLoadingItems(null);
    }
  };

  const removeItem = async (collectionId: string, productId: string) => {
    await fetch(
      `/api/collections/${collectionId}/items?product_id=${productId}`,
      { method: "DELETE" },
    );
    setItems((prev) => ({
      ...prev,
      [collectionId]: prev[collectionId]?.filter(
        (i) => i.product.id !== productId,
      ),
    }));
    setCollections((prev) =>
      prev.map((c) =>
        c.id === collectionId ? { ...c, item_count: c.item_count - 1 } : c,
      ),
    );
  };

  const startEdit = (c: Collection) => {
    setEditingId(c.id);
    setEditName(c.name);
    setEditDesc(c.description ?? "");
    setEditPublic(c.is_public);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-flamencalia-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif text-flamencalia-black">
            Mis Armarios
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Organiza tus artículos favoritos en colecciones
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2 bg-flamencalia-red text-white rounded-xl text-sm font-medium hover:bg-flamencalia-red-dark transition-colors"
        >
          <Icon name="plus" className="w-4 h-4" />
          Nuevo Armario
        </button>
      </div>

      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Looks de feria, Wishlist navidad..."
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-flamencalia-red/20 focus:border-flamencalia-red outline-none"
              required
              maxLength={100}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-flamencalia-red/20 focus:border-flamencalia-red outline-none resize-none"
              maxLength={500}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="rounded accent-flamencalia-red"
            />
            Hacer público (otros usuarios pueden verlo)
          </label>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={creating}
              className="px-4 py-2 bg-flamencalia-red text-white rounded-xl text-sm font-medium hover:bg-flamencalia-red-dark transition-colors disabled:opacity-50"
            >
              {creating ? "Creando..." : "Crear Armario"}
            </button>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 text-gray-600 text-sm hover:text-gray-800"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {collections.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Icon
            name="closet"
            className="w-12 h-12 text-gray-300 mx-auto mb-3"
          />
          <p className="text-gray-500 font-medium">
            No tienes armarios todavía
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Crea tu primer armario para organizar tus artículos favoritos
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {collections.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
            >
              <div className="p-4 sm:p-5">
                {editingId === c.id ? (
                  <div className="space-y-3">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-flamencalia-red/20 focus:border-flamencalia-red outline-none"
                      maxLength={100}
                    />
                    <textarea
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-flamencalia-red/20 focus:border-flamencalia-red outline-none resize-none"
                      maxLength={500}
                    />
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                      <input
                        type="checkbox"
                        checked={editPublic}
                        onChange={(e) => setEditPublic(e.target.checked)}
                        className="rounded accent-flamencalia-red"
                      />
                      Público
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdate(c.id)}
                        className="px-3 py-1.5 bg-flamencalia-red text-white rounded-lg text-sm"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 text-gray-500 text-sm"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <button
                      onClick={() => toggleExpand(c.id)}
                      className="flex-1 text-left"
                    >
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-flamencalia-black">
                          {c.name}
                        </h3>
                        {c.is_public && (
                          <span className="px-2 py-0.5 bg-flamencalia-albero/20 text-flamencalia-albero-dark text-[10px] font-medium rounded-full">
                            Público
                          </span>
                        )}
                      </div>
                      {c.description && (
                        <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">
                          {c.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {c.item_count}{" "}
                        {c.item_count === 1 ? "artículo" : "artículos"}
                      </p>
                    </button>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => startEdit(c)}
                        className="p-2 text-gray-400 hover:text-flamencalia-red transition-colors"
                        title="Editar"
                      >
                        <Icon name="pencil" className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        title="Eliminar"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                      <button
                        onClick={() => toggleExpand(c.id)}
                        className={`p-2 text-gray-400 hover:text-gray-600 transition-all ${expanded === c.id ? "rotate-180" : ""}`}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {expanded === c.id && (
                <div className="border-t border-gray-100 p-4 sm:p-5">
                  {loadingItems === c.id ? (
                    <div className="flex justify-center py-8">
                      <div className="w-6 h-6 border-2 border-flamencalia-red border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : !items[c.id]?.length ? (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      <p>Este armario está vacío</p>
                      <Link
                        href="/products"
                        className="text-flamencalia-red hover:underline mt-1 inline-block"
                      >
                        Explorar productos →
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {items[c.id].map((item) => (
                        <div
                          key={item.id}
                          className="group relative bg-gray-50 rounded-xl overflow-hidden"
                        >
                          <Link href={`/products/${item.product.id}`}>
                            <div className="aspect-square relative">
                              {item.product.images?.[0] ? (
                                <Image
                                  src={item.product.images[0]}
                                  alt={item.product.title}
                                  fill
                                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                  <Icon name="dress" className="w-8 h-8" />
                                </div>
                              )}
                            </div>
                            <div className="p-2">
                              <p className="text-xs font-medium text-flamencalia-black line-clamp-1">
                                {item.product.title}
                              </p>
                              <p className="text-xs text-flamencalia-red font-semibold">
                                {item.product.price.toFixed(2)} €
                              </p>
                            </div>
                          </Link>
                          <button
                            onClick={() => removeItem(c.id, item.product.id)}
                            className="absolute top-1.5 right-1.5 p-1.5 bg-white/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
                            title="Quitar del armario"
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                              viewBox="0 0 24 24"
                            >
                              <path d="M18 6 6 18M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
