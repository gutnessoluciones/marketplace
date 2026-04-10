"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";

interface Setting {
  key: string;
  value: Record<string, unknown>;
  description: string | null;
  updated_at: string;
}

const settingLabels: Record<string, { label: string; icon: string }> = {
  general: { label: "General", icon: "store" },
  fees: { label: "Comisiones y pagos", icon: "dollar" },
  appearance: { label: "Apariencia", icon: "brush" },
  features: { label: "Funcionalidades", icon: "zap" },
  seo: { label: "SEO y metadatos", icon: "search" },
};

const fieldLabels: Record<string, string> = {
  site_name: "Nombre del sitio",
  tagline: "Eslogan",
  contact_email: "Email de contacto",
  logo_url: "URL del logo",
  platform_fee_percent: "Comisión (%)",
  min_payout: "Pago mínimo (cents)",
  primary_color: "Color principal",
  accent_color: "Color acento",
  hero_image: "Imagen del hero",
  reviews_enabled: "Reseñas habilitadas",
  registration_open: "Registro abierto",
  maintenance_mode: "Modo mantenimiento",
  meta_title: "Meta título",
  meta_description: "Meta descripción",
  og_image: "Imagen OG",
};

export default function SiteSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [editValues, setEditValues] = useState<
    Record<string, Record<string, unknown>>
  >({});

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        setSettings(data);
        const vals: Record<string, Record<string, unknown>> = {};
        for (const s of data) {
          vals[s.key] = { ...s.value };
        }
        setEditValues(vals);
      })
      .catch(() => setMessage({ type: "error", text: "Error al cargar" }))
      .finally(() => setLoading(false));
  }, []);

  const handleFieldChange = (
    settingKey: string,
    field: string,
    value: unknown,
  ) => {
    setEditValues((prev) => ({
      ...prev,
      [settingKey]: { ...prev[settingKey], [field]: value },
    }));
  };

  const handleSave = async (settingKey: string) => {
    setSaving(settingKey);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: settingKey,
          value: editValues[settingKey],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage({
        type: "success",
        text: `${settingLabels[settingKey]?.label || settingKey} guardado`,
      });
      startTransition(() => router.refresh());
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Error al guardar",
      });
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-flamencalia-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-flamencalia-black">
          Configuración del sitio
        </h1>
        <p className="text-sm text-neutral-400 mt-0.5">
          Ajustes generales de Flamencalia
        </p>
      </div>

      {message && (
        <div
          className={`mb-4 p-3 rounded-xl text-sm ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        {settings.map((setting) => {
          const meta = settingLabels[setting.key];
          const values = editValues[setting.key] || {};

          return (
            <div
              key={setting.key}
              className="bg-white border border-neutral-100 rounded-2xl shadow-sm overflow-hidden"
            >
              <div className="p-5 border-b border-neutral-50 flex items-center gap-3">
                {meta && (
                  <div className="w-8 h-8 rounded-lg bg-flamencalia-red/5 flex items-center justify-center text-flamencalia-red">
                    <Icon name={meta.icon} className="w-4 h-4" />
                  </div>
                )}
                <div>
                  <h2 className="text-sm font-semibold text-neutral-700">
                    {meta?.label || setting.key}
                  </h2>
                  {setting.description && (
                    <p className="text-xs text-neutral-400">
                      {setting.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="p-5 space-y-4">
                {Object.entries(values).map(([field, val]) => (
                  <div key={field}>
                    <label className="block text-xs font-medium text-neutral-500 mb-1.5">
                      {fieldLabels[field] || field}
                    </label>
                    {typeof val === "boolean" ? (
                      <button
                        type="button"
                        onClick={() =>
                          handleFieldChange(setting.key, field, !val)
                        }
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          val ? "bg-flamencalia-red" : "bg-neutral-200"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            val ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    ) : typeof val === "number" ? (
                      <input
                        type="number"
                        value={val}
                        onChange={(e) =>
                          handleFieldChange(
                            setting.key,
                            field,
                            Number(e.target.value),
                          )
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm text-flamencalia-black focus:outline-none focus:ring-2 focus:ring-flamencalia-red/20 focus:border-flamencalia-red"
                      />
                    ) : (
                      <input
                        type={field.includes("color") ? "color" : "text"}
                        value={String(val || "")}
                        onChange={(e) =>
                          handleFieldChange(setting.key, field, e.target.value)
                        }
                        className={`${
                          field.includes("color")
                            ? "h-10 w-20 p-1 rounded-lg border border-neutral-200 cursor-pointer"
                            : "w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm text-flamencalia-black focus:outline-none focus:ring-2 focus:ring-flamencalia-red/20 focus:border-flamencalia-red"
                        }`}
                      />
                    )}
                  </div>
                ))}
                <button
                  onClick={() => handleSave(setting.key)}
                  disabled={saving === setting.key || isPending}
                  className="mt-2 bg-flamencalia-red text-white py-2 px-5 rounded-xl text-sm font-semibold hover:bg-flamencalia-red-dark disabled:opacity-50 transition-all"
                >
                  {saving === setting.key ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
