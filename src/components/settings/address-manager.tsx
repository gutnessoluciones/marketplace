"use client";

import { useState, useEffect } from "react";
import { Icon } from "@/components/icons";

interface Address {
  id: string;
  label: string;
  full_name: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string | null;
  is_default: boolean;
}

export function AddressManager() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAddresses();
  }, []);

  async function fetchAddresses() {
    try {
      const res = await fetch("/api/addresses");
      const data = await res.json();
      setAddresses(data.data ?? []);
    } catch {
      setError("Error al cargar direcciones");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const body = {
      label: formData.get("label") || "Casa",
      full_name: formData.get("full_name"),
      line1: formData.get("line1"),
      line2: formData.get("line2") || null,
      city: formData.get("city"),
      state: formData.get("state"),
      postal_code: formData.get("postal_code"),
      country: formData.get("country") || "ES",
      phone: formData.get("phone") || null,
      is_default: formData.get("is_default") === "on",
    };

    try {
      const url = editing ? `/api/addresses/${editing.id}` : "/api/addresses";
      const method = editing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error?.toString() || "Error al guardar");
        setSaving(false);
        return;
      }

      setShowForm(false);
      setEditing(null);
      await fetchAddresses();
    } catch {
      setError("Error de conexión");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta dirección?")) return;
    try {
      await fetch(`/api/addresses/${id}`, { method: "DELETE" });
      await fetchAddresses();
    } catch {
      setError("Error al eliminar");
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-center text-sm text-slate-400">
        Cargando direcciones...
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-4 border border-red-100">
          {error}
        </div>
      )}

      {/* Address List */}
      {addresses.length > 0 && !showForm && (
        <div className="space-y-3 mb-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="flex items-start justify-between border border-slate-100 rounded-xl p-4"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-slate-700">
                    {addr.label}
                  </p>
                  {addr.is_default && (
                    <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
                      Predeterminada
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-600">{addr.full_name}</p>
                <p className="text-xs text-slate-400">
                  {addr.line1}
                  {addr.line2 ? `, ${addr.line2}` : ""}
                </p>
                <p className="text-xs text-slate-400">
                  {addr.postal_code} {addr.city}, {addr.state}
                </p>
                {addr.phone && (
                  <p className="text-xs text-slate-400 mt-0.5">{addr.phone}</p>
                )}
              </div>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(addr);
                    setShowForm(true);
                  }}
                  className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors"
                >
                  <Icon name="pencil" className="w-3.5 h-3.5 text-slate-400" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(addr.id)}
                  className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center hover:bg-red-100 transition-colors"
                >
                  <svg
                    className="w-3.5 h-3.5 text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Etiqueta
              </label>
              <input
                name="label"
                defaultValue={editing?.label ?? "Casa"}
                placeholder="Casa, Oficina..."
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-slate-50/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Nombre completo *
              </label>
              <input
                name="full_name"
                required
                defaultValue={editing?.full_name ?? ""}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-slate-50/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Dirección *
            </label>
            <input
              name="line1"
              required
              defaultValue={editing?.line1 ?? ""}
              placeholder="Calle, número..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-slate-50/50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Apt, piso, puerta (opcional)
            </label>
            <input
              name="line2"
              defaultValue={editing?.line2 ?? ""}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-slate-50/50"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Ciudad *
              </label>
              <input
                name="city"
                required
                defaultValue={editing?.city ?? ""}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-slate-50/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Provincia *
              </label>
              <input
                name="state"
                required
                defaultValue={editing?.state ?? ""}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-slate-50/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                C.P. *
              </label>
              <input
                name="postal_code"
                required
                defaultValue={editing?.postal_code ?? ""}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-slate-50/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                País
              </label>
              <select
                name="country"
                defaultValue={editing?.country ?? "ES"}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-slate-50/50"
              >
                <option value="ES">España</option>
                <option value="MX">México</option>
                <option value="AR">Argentina</option>
                <option value="CO">Colombia</option>
                <option value="CL">Chile</option>
                <option value="US">Estados Unidos</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Teléfono
              </label>
              <input
                name="phone"
                type="tel"
                defaultValue={editing?.phone ?? ""}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-slate-50/50"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              name="is_default"
              type="checkbox"
              defaultChecked={editing?.is_default ?? addresses.length === 0}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-slate-600">
              Usar como dirección predeterminada
            </span>
          </label>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-linear-to-r from-indigo-600 to-violet-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 transition-all"
            >
              {saving
                ? "Guardando..."
                : editing
                  ? "Actualizar"
                  : "Guardar dirección"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditing(null);
              }}
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-xl p-4 text-sm text-slate-500 hover:border-indigo-400 hover:text-indigo-600 transition-all"
        >
          <Icon name="plus" className="w-4 h-4" />
          Añadir dirección
        </button>
      )}
    </div>
  );
}
