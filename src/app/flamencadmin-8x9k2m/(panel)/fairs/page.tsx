"use client";

import { useState, useEffect, useCallback } from "react";
import { Icon } from "@/components/icons";
import { AdminToast } from "@/components/admin/toast";

const PROVINCES = [
  "Almería",
  "Cádiz",
  "Córdoba",
  "Granada",
  "Huelva",
  "Jaén",
  "Málaga",
  "Sevilla",
];

interface Fair {
  id: string;
  name: string;
  location: string;
  province: string;
  start_date: string;
  end_date: string;
  description: string | null;
  image_url: string | null;
  website_url: string | null;
  is_verified: boolean;
  created_at: string;
}

export default function AdminFairsPage() {
  const [fairs, setFairs] = useState<Fair[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Fair | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);
  const [filterProvince, setFilterProvince] = useState("all");

  const [form, setForm] = useState({
    name: "",
    location: "",
    province: "Sevilla",
    start_date: "",
    end_date: "",
    description: "",
    image_url: "",
    website_url: "",
    is_verified: false,
  });

  const loadFairs = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/fairs");
    if (res.ok) {
      const json = await res.json();
      setFairs(json.data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadFairs();
  }, [loadFairs]);

  const resetForm = () => {
    setForm({
      name: "",
      location: "",
      province: "Sevilla",
      start_date: "",
      end_date: "",
      description: "",
      image_url: "",
      website_url: "",
      is_verified: false,
    });
  };

  const openCreate = () => {
    resetForm();
    setEditing(null);
    setCreating(true);
  };

  const openEdit = (fair: Fair) => {
    setForm({
      name: fair.name,
      location: fair.location,
      province: fair.province,
      start_date: fair.start_date,
      end_date: fair.end_date,
      description: fair.description || "",
      image_url: fair.image_url || "",
      website_url: fair.website_url || "",
      is_verified: fair.is_verified,
    });
    setEditing(fair);
    setCreating(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const body = {
      name: form.name,
      location: form.location,
      province: form.province,
      start_date: form.start_date,
      end_date: form.end_date,
      description: form.description || undefined,
      image_url: form.image_url || undefined,
      website_url: form.website_url || undefined,
      is_verified: form.is_verified,
    };

    const url = editing ? `/api/admin/fairs/${editing.id}` : "/api/admin/fairs";
    const method = editing ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setToast({
        msg: editing ? "Feria actualizada" : "Feria creada",
        type: "success",
      });
      setCreating(false);
      setEditing(null);
      resetForm();
      loadFairs();
    } else {
      const json = await res.json().catch(() => null);
      setToast({
        msg: json?.error || "Error al guardar la feria",
        type: "error",
      });
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta feria?")) return;
    const res = await fetch(`/api/admin/fairs/${id}`, { method: "DELETE" });
    if (res.ok) {
      setToast({ msg: "Feria eliminada", type: "success" });
      loadFairs();
    } else {
      setToast({ msg: "Error al eliminar la feria", type: "error" });
    }
  };

  const filtered =
    filterProvince === "all"
      ? fairs
      : fairs.filter((f) => f.province === filterProvince);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    });

  if (creating) {
    return (
      <div className="max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-flamencalia-black">
            {editing ? "Editar feria" : "Nueva feria"}
          </h1>
          <button
            onClick={() => {
              setCreating(false);
              setEditing(null);
            }}
            className="text-sm text-neutral-500 hover:text-neutral-700"
          >
            Cancelar
          </button>
        </div>

        <div className="bg-white border border-neutral-100 rounded-2xl shadow-sm p-5 sm:p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-neutral-600 mb-1 block">
              Nombre de la feria *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full text-sm border border-neutral-200 rounded-xl p-3 focus:ring-2 focus:ring-flamencalia-albero/30 focus:border-flamencalia-albero outline-none"
              placeholder="Feria de Abril de Sevilla"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-neutral-600 mb-1 block">
                Localidad *
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full text-sm border border-neutral-200 rounded-xl p-3 focus:ring-2 focus:ring-flamencalia-albero/30 focus:border-flamencalia-albero outline-none"
                placeholder="Sevilla"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-600 mb-1 block">
                Provincia *
              </label>
              <select
                value={form.province}
                onChange={(e) => setForm({ ...form, province: e.target.value })}
                className="w-full text-sm border border-neutral-200 rounded-xl p-3 focus:ring-2 focus:ring-flamencalia-albero/30 outline-none"
              >
                {PROVINCES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-neutral-600 mb-1 block">
                Fecha inicio *
              </label>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) =>
                  setForm({ ...form, start_date: e.target.value })
                }
                className="w-full text-sm border border-neutral-200 rounded-xl p-3 focus:ring-2 focus:ring-flamencalia-albero/30 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-600 mb-1 block">
                Fecha fin *
              </label>
              <input
                type="date"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                className="w-full text-sm border border-neutral-200 rounded-xl p-3 focus:ring-2 focus:ring-flamencalia-albero/30 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-600 mb-1 block">
              Descripción
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={3}
              className="w-full text-sm border border-neutral-200 rounded-xl p-3 focus:ring-2 focus:ring-flamencalia-albero/30 outline-none resize-none"
              placeholder="Información sobre la feria..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-neutral-600 mb-1 block">
                URL imagen
              </label>
              <input
                type="text"
                value={form.image_url}
                onChange={(e) =>
                  setForm({ ...form, image_url: e.target.value })
                }
                className="w-full text-sm border border-neutral-200 rounded-xl p-3 focus:ring-2 focus:ring-flamencalia-albero/30 outline-none"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-600 mb-1 block">
                Web oficial
              </label>
              <input
                type="text"
                value={form.website_url}
                onChange={(e) =>
                  setForm({ ...form, website_url: e.target.value })
                }
                className="w-full text-sm border border-neutral-200 rounded-xl p-3 focus:ring-2 focus:ring-flamencalia-albero/30 outline-none"
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_verified}
                onChange={(e) =>
                  setForm({ ...form, is_verified: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-neutral-200 peer-focus:ring-2 peer-focus:ring-flamencalia-albero/30 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500" />
            </label>
            <span className="text-sm text-neutral-600">Fechas verificadas</span>
          </div>

          <div className="flex items-center justify-end pt-4 border-t border-neutral-100">
            <button
              onClick={handleSave}
              disabled={
                saving ||
                !form.name ||
                !form.location ||
                !form.start_date ||
                !form.end_date
              }
              className="text-sm px-5 py-2.5 rounded-xl font-medium text-white bg-flamencalia-black hover:bg-neutral-800 disabled:opacity-50"
            >
              {saving ? "Guardando..." : editing ? "Actualizar" : "Crear feria"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-flamencalia-black">
            Ferias de Andalucía
          </h1>
          <p className="text-sm text-neutral-400 mt-0.5">
            {fairs.length} ferias registradas
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl font-medium text-white bg-flamencalia-black hover:bg-neutral-800"
        >
          <Icon name="plus" className="w-4 h-4" />
          Añadir feria
        </button>
      </div>

      {/* Province filter */}
      <div className="mb-4 flex gap-1.5 flex-wrap">
        <button
          onClick={() => setFilterProvince("all")}
          className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
            filterProvince === "all"
              ? "bg-flamencalia-black text-white"
              : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
          }`}
        >
          Todas
        </button>
        {PROVINCES.map((p) => (
          <button
            key={p}
            onClick={() => setFilterProvince(p)}
            className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
              filterProvince === p
                ? "bg-flamencalia-black text-white"
                : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white border border-neutral-100 rounded-2xl p-12 text-center">
          <div className="animate-pulse text-sm text-neutral-400">
            Cargando...
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-neutral-100 rounded-2xl p-12 text-center">
          <Icon
            name="mapPin"
            className="w-10 h-10 text-neutral-300 mx-auto mb-3"
          />
          <p className="text-sm text-neutral-500 mb-3">
            No hay ferias registradas
          </p>
          <button
            onClick={openCreate}
            className="text-sm text-flamencalia-red font-medium hover:underline"
          >
            Añadir la primera
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((fair) => {
            const now = new Date();
            const start = new Date(fair.start_date);
            const end = new Date(fair.end_date);
            const isActive = now >= start && now <= end;
            const isPast = now > end;

            return (
              <div
                key={fair.id}
                className={`bg-white border rounded-2xl p-4 sm:p-5 ${
                  isActive
                    ? "border-emerald-200 bg-emerald-50/20"
                    : isPast
                      ? "border-neutral-100 opacity-60"
                      : "border-neutral-100"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-sm font-semibold text-neutral-800">
                        {fair.name}
                      </h3>
                      {fair.is_verified && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium">
                          Verificada
                        </span>
                      )}
                      {isActive && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500 text-white font-medium animate-pulse">
                          EN CURSO
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-neutral-500">
                      <span className="flex items-center gap-1">
                        <Icon name="mapPin" className="w-3 h-3" />
                        {fair.location}, {fair.province}
                      </span>
                      <span>
                        {formatDate(fair.start_date)} —{" "}
                        {formatDate(fair.end_date)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEdit(fair)}
                      className="text-xs px-3 py-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(fair.id)}
                      className="text-xs px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {toast && <AdminToast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
