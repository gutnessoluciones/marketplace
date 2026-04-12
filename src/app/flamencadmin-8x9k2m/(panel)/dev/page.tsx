"use client";

import { useEffect, useState, useCallback } from "react";
import { Icon } from "@/components/icons";

// ── Types ────────────────────────────────────────────────
interface Metric {
  name: string;
  current: number | null;
  limit: number | null;
  unit: string;
  note?: string;
}

interface ServiceStats {
  label: string;
  plan: string;
  metrics: Metric[];
  tables?: Array<{ table: string; rows: number }>;
  dashboardUrl: string;
  pricingUrl: string;
  note?: string;
}

interface Alert {
  service: string;
  metric: string;
  percent: number;
  level: "ok" | "warn" | "critical";
  message: string;
}

interface DevStatsResponse {
  services: Record<string, ServiceStats>;
  alerts: Alert[];
  thresholds: { warn: number; critical: number };
  updatedAt: string;
}

// ── Helpers ──────────────────────────────────────────────
function pct(current: number | null, limit: number | null): number | null {
  if (current == null || limit == null || limit === 0) return null;
  return Math.min(100, Math.round((current / limit) * 100));
}

function barColor(p: number | null): string {
  if (p == null) return "bg-neutral-300";
  if (p >= 90) return "bg-red-500";
  if (p >= 70) return "bg-amber-500";
  return "bg-emerald-500";
}

function badgeColor(level: string): string {
  if (level === "critical") return "bg-red-100 text-red-700 border-red-200";
  if (level === "warn") return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-emerald-100 text-emerald-700 border-emerald-200";
}

const SERVICE_ICONS: Record<string, string> = {
  supabase: "database" as string,
  vercel: "globe",
  stripe: "dollar",
  resend: "message",
  upstash: "zap",
};

const SERVICE_COLORS: Record<string, string> = {
  supabase: "from-emerald-500 to-emerald-700",
  vercel: "from-neutral-800 to-neutral-950",
  stripe: "from-indigo-500 to-indigo-700",
  resend: "from-violet-500 to-violet-700",
  upstash: "from-red-500 to-red-700",
};

// ── Main Component ───────────────────────────────────────
export default function DevZonePage() {
  const [data, setData] = useState<DevStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alertEmail, setAlertEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/dev-stats");
      if (!res.ok) throw new Error("Error cargando stats");
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const sendAlert = async () => {
    if (!data?.alerts.length || !alertEmail.trim()) return;
    setSending(true);
    setSendResult(null);
    try {
      const emails = alertEmail
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean);
      const res = await fetch("/api/admin/dev-stats/alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alerts: data.alerts, recipients: emails }),
      });
      const json = await res.json();
      if (json.sent) {
        setSendResult("✅ Email de alerta enviado correctamente");
      } else {
        setSendResult(`❌ ${json.error || "Error enviando"}`);
      }
    } catch {
      setSendResult("❌ Error de conexión");
    } finally {
      setSending(false);
    }
  };

  // ── Loading / Error states ─────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-flamencalia-red border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-neutral-500">
            Recopilando datos de servicios…
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-red-500 font-medium">{error}</p>
          <button
            onClick={fetchStats}
            className="mt-3 px-4 py-2 bg-flamencalia-red text-white text-sm rounded-xl hover:bg-flamencalia-red/90 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const serviceEntries = Object.entries(data.services);
  const hasCritical = data.alerts.some((a) => a.level === "critical");
  const hasWarn = data.alerts.some((a) => a.level === "warn");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-flamencalia-black flex items-center gap-3">
            <Icon name="code" className="w-7 h-7 text-flamencalia-red" />
            Zona Desarrolladores
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Estado de servicios, uso vs. límites y alertas
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-400">
            Actualizado:{" "}
            {new Date(data.updatedAt).toLocaleString("es-ES", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <button
            onClick={fetchStats}
            className="px-3 py-1.5 bg-white border border-neutral-200 rounded-xl text-sm hover:bg-neutral-50 transition-colors flex items-center gap-1.5"
          >
            <Icon name="activity" className="w-3.5 h-3.5" />
            Refrescar
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      {data.alerts.length > 0 && (
        <div
          className={`rounded-2xl border p-5 ${hasCritical ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"}`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${hasCritical ? "bg-red-100" : "bg-amber-100"}`}
            >
              <Icon
                name="alertTriangle"
                className={`w-5 h-5 ${hasCritical ? "text-red-600" : "text-amber-600"}`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3
                className={`font-semibold ${hasCritical ? "text-red-700" : "text-amber-700"}`}
              >
                {data.alerts.length} alerta
                {data.alerts.length > 1 ? "s" : ""} activa
                {data.alerts.length > 1 ? "s" : ""}
              </h3>
              <div className="mt-2 space-y-1">
                {data.alerts.map((a, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${badgeColor(a.level)}`}
                    >
                      {a.percent}%
                    </span>
                    <span className="text-neutral-700">{a.message}</span>
                  </div>
                ))}
              </div>

              {/* Send Alert Email */}
              <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <input
                  type="email"
                  value={alertEmail}
                  onChange={(e) => setAlertEmail(e.target.value)}
                  placeholder="email@ejemplo.com (separar con comas)"
                  className="flex-1 px-3 py-1.5 border border-neutral-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-flamencalia-red/50 w-full sm:w-auto"
                />
                <button
                  onClick={sendAlert}
                  disabled={sending || !alertEmail.trim()}
                  className="px-4 py-1.5 bg-flamencalia-red text-white text-sm rounded-lg hover:bg-flamencalia-red/90 transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  {sending ? "Enviando…" : "📧 Enviar alerta"}
                </button>
                {sendResult && (
                  <span className="text-xs text-neutral-600">{sendResult}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Alerts */}
      {data.alerts.length === 0 && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Icon name="check" className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-semibold text-emerald-700">
              Todos los servicios OK
            </h3>
            <p className="text-sm text-emerald-600 mt-0.5">
              Ningún servicio ha superado el {data.thresholds.warn}% de su
              límite gratuito.
            </p>
          </div>
        </div>
      )}

      {/* Service Cards Grid */}
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {serviceEntries.map(([key, svc]) => (
          <ServiceCard key={key} serviceKey={key} service={svc} />
        ))}
      </div>

      {/* Supabase Tables Detail */}
      {data.services.supabase?.tables &&
        data.services.supabase.tables.length > 0 && (
          <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <h2 className="text-lg font-semibold text-flamencalia-black mb-4 flex items-center gap-2">
              <Icon name="receipt" className="w-5 h-5 text-flamencalia-red" />
              Tablas de Base de Datos
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 text-neutral-500">
                    <th className="text-left py-2 px-3 font-medium">Tabla</th>
                    <th className="text-right py-2 px-3 font-medium">Filas</th>
                    <th className="text-left py-2 px-3 font-medium w-1/3">
                      Distribución
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.services.supabase.tables.map((t) => {
                    const maxRows = Math.max(
                      ...data.services.supabase.tables!.map((r) => r.rows),
                      1,
                    );
                    const w = Math.max(2, (t.rows / maxRows) * 100);
                    return (
                      <tr
                        key={t.table}
                        className="border-b border-neutral-100 hover:bg-neutral-50"
                      >
                        <td className="py-2 px-3 font-mono text-xs">
                          {t.table}
                        </td>
                        <td className="py-2 px-3 text-right font-medium tabular-nums">
                          {t.rows.toLocaleString("es-ES")}
                        </td>
                        <td className="py-2 px-3">
                          <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full transition-all"
                              style={{ width: `${w}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      {/* Quick Links */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-flamencalia-black mb-4">
          Enlaces Rápidos
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {serviceEntries.map(([key, svc]) => (
            <div key={key} className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                {svc.label}
              </span>
              <a
                href={svc.dashboardUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-flamencalia-red hover:underline"
              >
                Dashboard →
              </a>
              <a
                href={svc.pricingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-neutral-500 hover:text-neutral-700 hover:underline"
              >
                Pricing →
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Thresholds Info */}
      <div className="text-center text-xs text-neutral-400 pb-4">
        Umbrales: ⚠️ Aviso al {data.thresholds.warn}% · 🔴 Crítico al{" "}
        {data.thresholds.critical}% · Las métricas marcadas como "—" requieren
        consultar el dashboard del servicio.
      </div>
    </div>
  );
}

// ── Service Card Component ───────────────────────────────
function ServiceCard({
  serviceKey,
  service,
}: {
  serviceKey: string;
  service: ServiceStats;
}) {
  const iconName = SERVICE_ICONS[serviceKey] || "gear";
  const gradient =
    SERVICE_COLORS[serviceKey] || "from-neutral-600 to-neutral-800";

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Card Header */}
      <div
        className={`bg-linear-to-r ${gradient} px-5 py-4 flex items-center justify-between`}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <Icon name={iconName} className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold">{service.label}</h3>
            <span className="text-white/70 text-xs">Plan: {service.plan}</span>
          </div>
        </div>
        <a
          href={service.dashboardUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/80 hover:text-white transition-colors"
          title={`Abrir ${service.label}`}
        >
          <Icon name="globe" className="w-4 h-4" />
        </a>
      </div>

      {/* Metrics */}
      <div className="p-5 space-y-4">
        {service.metrics.map((m, i) => {
          const p = pct(m.current, m.limit);
          return (
            <div key={i}>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-neutral-600">{m.name}</span>
                <span className="font-medium tabular-nums text-neutral-800">
                  {m.current != null ? (
                    <>
                      {m.current.toLocaleString("es-ES")}
                      {m.limit != null && (
                        <span className="text-neutral-400">
                          {" "}
                          / {m.limit.toLocaleString("es-ES")}
                        </span>
                      )}
                      {m.unit && (
                        <span className="text-neutral-400 text-xs ml-0.5">
                          {m.unit}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-neutral-400 text-xs">
                      {m.note || "—"}
                    </span>
                  )}
                </span>
              </div>
              {m.limit != null && (
                <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${barColor(p)}`}
                    style={{ width: `${p ?? 0}%` }}
                  />
                </div>
              )}
              {p != null && (
                <span
                  className={`text-[10px] font-medium mt-0.5 inline-block ${
                    p >= 90
                      ? "text-red-500"
                      : p >= 70
                        ? "text-amber-500"
                        : "text-emerald-500"
                  }`}
                >
                  {p}% utilizado
                </span>
              )}
            </div>
          );
        })}

        {service.note && (
          <p className="text-xs text-neutral-400 italic pt-1 border-t border-neutral-100">
            {service.note}
          </p>
        )}
      </div>
    </div>
  );
}
