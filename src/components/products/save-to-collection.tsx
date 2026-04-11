"use client";

import { useState, useEffect, useRef } from "react";
import { Icon } from "@/components/icons";

interface Collection {
  id: string;
  name: string;
  item_count: number;
}

export function SaveToCollection({ productId }: { productId: string }) {
  const [open, setOpen] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchCollections = async () => {
    setLoading(true);
    const res = await fetch("/api/collections");
    const json = await res.json();
    if (json.data) setCollections(json.data);
    setLoading(false);
  };

  const handleToggle = () => {
    if (!open) fetchCollections();
    setOpen(!open);
  };

  const addToCollection = async (collectionId: string) => {
    setSaving(collectionId);
    const res = await fetch(`/api/collections/${collectionId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productId }),
    });
    if (res.ok || res.status === 409) {
      setSaved((prev) => new Set(prev).add(collectionId));
    }
    setSaving(null);
  };

  const createAndAdd = async () => {
    if (!newName.trim()) return;
    setSaving("new");
    const res = await fetch("/api/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    const json = await res.json();
    if (json.data) {
      await fetch(`/api/collections/${json.data.id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId }),
      });
      setSaved((prev) => new Set(prev).add(json.data.id));
      setCollections((prev) => [json.data, ...prev]);
    }
    setNewName("");
    setShowCreate(false);
    setSaving(null);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleToggle}
        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border border-flamencalia-albero-pale/40 rounded-xl text-sm font-medium text-flamencalia-black hover:bg-flamencalia-albero-pale/10 transition-colors"
        title="Guardar en armario"
      >
        <Icon name="closet" className="w-4 h-4" />
        <span className="hidden sm:inline">Guardar en armario</span>
        <span className="sm:hidden">Armario</span>
      </button>

      {open && (
        <div className="absolute right-0 sm:left-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            <p className="text-sm font-medium text-flamencalia-black">
              Guardar en armario
            </p>
          </div>

          <div className="max-h-48 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="w-5 h-5 border-2 border-flamencalia-red border-t-transparent rounded-full animate-spin" />
              </div>
            ) : collections.length === 0 && !showCreate ? (
              <div className="p-4 text-center text-sm text-gray-400">
                No tienes armarios
              </div>
            ) : (
              collections.map((c) => (
                <button
                  key={c.id}
                  onClick={() => addToCollection(c.id)}
                  disabled={saving === c.id || saved.has(c.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors disabled:opacity-60"
                >
                  <Icon
                    name="closet"
                    className="w-4 h-4 text-gray-400 shrink-0"
                  />
                  <span className="flex-1 truncate">{c.name}</span>
                  {saved.has(c.id) ? (
                    <Icon
                      name="check"
                      className="w-4 h-4 text-green-500 shrink-0"
                    />
                  ) : saving === c.id ? (
                    <div className="w-4 h-4 border-2 border-flamencalia-red border-t-transparent rounded-full animate-spin shrink-0" />
                  ) : (
                    <span className="text-xs text-gray-400 shrink-0">
                      {c.item_count}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>

          {showCreate ? (
            <div className="p-3 border-t border-gray-100">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nombre del armario"
                className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-flamencalia-red/20 focus:border-flamencalia-red outline-none mb-2"
                maxLength={100}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") createAndAdd();
                }}
              />
              <div className="flex gap-2">
                <button
                  onClick={createAndAdd}
                  disabled={saving === "new" || !newName.trim()}
                  className="flex-1 px-3 py-1.5 bg-flamencalia-red text-white rounded-lg text-xs font-medium disabled:opacity-50"
                >
                  {saving === "new" ? "..." : "Crear y guardar"}
                </button>
                <button
                  onClick={() => setShowCreate(false)}
                  className="px-3 py-1.5 text-gray-500 text-xs"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowCreate(true)}
              className="w-full flex items-center gap-2 px-3 py-2.5 border-t border-gray-100 text-sm text-flamencalia-red hover:bg-flamencalia-red/5 transition-colors"
            >
              <Icon name="plus" className="w-4 h-4" />
              Nuevo armario
            </button>
          )}
        </div>
      )}
    </div>
  );
}
