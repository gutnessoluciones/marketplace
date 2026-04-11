"use client";

import { useState, useEffect, useCallback } from "react";
import { Icon } from "@/components/icons";
import { AdminToast } from "@/components/admin/toast";

interface Report {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  content_type: string;
  content_id: string | null;
  reason: string;
  description: string | null;
  status: string;
  resolution_notes: string | null;
  resolved_at: string | null;
  created_at: string;
  reporter?: { id: string; display_name: string; avatar_url: string | null };
  reported_user?: {
    id: string;
    display_name: string;
    avatar_url: string | null;
  };
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [resolveModal, setResolveModal] = useState<Report | null>(null);
  const [resolution, setResolution] = useState<"resolved" | "dismissed">(
    "resolved",
  );
  const [notes, setNotes] = useState("");
  const [acting, setActing] = useState(false);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  const loadReports = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/reports?status=${filter}`);
    if (res.ok) {
      const json = await res.json();
      setReports(json.data || []);
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleResolve = async () => {
    if (!resolveModal) return;
    setActing(true);

    const res = await fetch(`/api/admin/reports/${resolveModal.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: resolution,
        resolution_notes: notes || undefined,
      }),
    });

    if (res.ok) {
      setToast({
        msg:
          resolution === "resolved" ? "Reporte resuelto" : "Reporte descartado",
        type: "success",
      });
      setResolveModal(null);
      setNotes("");
      loadReports();
    } else {
      const json = await res.json().catch(() => null);
      setToast({
        msg: json?.error || "Error al procesar el reporte",
        type: "error",
      });
    }
    setActing(false);
  };

  const reasonLabel = (r: string) => {
    const map: Record<string, string> = {
      spam: "Spam",
      inappropriate: "Contenido inapropiado",
      fraud: "Fraude",
      harassment: "Acoso",
      sharing_contact: "Comparte datos de contacto",
      other: "Otro",
    };
    return map[r] || r;
  };

  const typeLabel = (t: string) => {
    const map: Record<string, string> = {
      product: "Producto",
      message: "Mensaje",
      review: "Reseña",
      profile: "Perfil",
      chat: "Chat",
    };
    return map[t] || t;
  };

  return (
    <div className="max-w-6xl">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-flamencalia-black">
            Reportes
          </h1>
          <p className="text-sm text-neutral-400 mt-0.5">
            Gestión de contenido reportado
          </p>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {[
            { value: "pending", label: "Pendientes" },
            { value: "resolved", label: "Resueltos" },
            { value: "dismissed", label: "Descartados" },
            { value: "all", label: "Todos" },
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

      {loading ? (
        <div className="bg-white border border-neutral-100 rounded-2xl p-12 text-center">
          <div className="animate-pulse text-sm text-neutral-400">
            Cargando reportes...
          </div>
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white border border-neutral-100 rounded-2xl p-12 text-center">
          <Icon
            name="checkCircle"
            className="w-10 h-10 text-emerald-400 mx-auto mb-3"
          />
          <p className="text-sm text-neutral-500">
            {filter === "pending"
              ? "No hay reportes pendientes"
              : "No hay reportes"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <div
              key={report.id}
              className={`bg-white border rounded-2xl p-4 sm:p-5 ${
                report.status === "pending"
                  ? "border-amber-200 bg-amber-50/20"
                  : "border-neutral-100"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                        report.status === "pending"
                          ? "bg-amber-100 text-amber-700"
                          : report.status === "resolved"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      {report.status === "pending"
                        ? "Pendiente"
                        : report.status === "resolved"
                          ? "Resuelto"
                          : "Descartado"}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
                      {typeLabel(report.content_type)}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-700 font-medium">
                      {reasonLabel(report.reason)}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-neutral-500 mb-2">
                    <span>
                      Reportado por:{" "}
                      <strong className="text-neutral-700">
                        {report.reporter?.display_name ?? "Desconocido"}
                      </strong>
                    </span>
                    <span>
                      Usuario reportado:{" "}
                      <strong className="text-neutral-700">
                        {report.reported_user?.display_name ?? "Desconocido"}
                      </strong>
                    </span>
                  </div>

                  {report.description && (
                    <p className="text-sm text-neutral-600 bg-neutral-50 rounded-lg p-3 mt-2">
                      {report.description}
                    </p>
                  )}

                  {report.resolution_notes && (
                    <p className="text-xs text-neutral-500 mt-2 italic">
                      Resolución: {report.resolution_notes}
                    </p>
                  )}

                  <p className="text-[11px] text-neutral-400 mt-2">
                    {new Date(report.created_at).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                {report.status === "pending" && (
                  <button
                    onClick={() => setResolveModal(report)}
                    className="text-xs px-4 py-2 rounded-xl bg-flamencalia-black text-white hover:bg-neutral-800 transition-colors shrink-0"
                  >
                    Resolver
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resolve Modal */}
      {resolveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-neutral-800 mb-1">
              Resolver reporte
            </h3>
            <p className="text-sm text-neutral-500 mb-4">
              {reasonLabel(resolveModal.reason)} — reportado por{" "}
              {resolveModal.reporter?.display_name}
            </p>

            <div className="mb-4">
              <label className="text-xs font-medium text-neutral-600 mb-2 block">
                Resolución
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setResolution("resolved")}
                  className={`flex-1 text-sm px-3 py-2.5 rounded-xl border-2 transition-colors ${
                    resolution === "resolved"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
                  }`}
                >
                  Aceptar reporte
                </button>
                <button
                  onClick={() => setResolution("dismissed")}
                  className={`flex-1 text-sm px-3 py-2.5 rounded-xl border-2 transition-colors ${
                    resolution === "dismissed"
                      ? "border-neutral-500 bg-neutral-50 text-neutral-700"
                      : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
                  }`}
                >
                  Descartar
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs font-medium text-neutral-600 mb-1 block">
                Notas (opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full text-sm border border-neutral-200 rounded-xl p-3 focus:ring-2 focus:ring-flamencalia-albero/30 focus:border-flamencalia-albero outline-none resize-none"
                placeholder="Notas sobre la resolución..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setResolveModal(null);
                  setNotes("");
                }}
                className="text-sm px-4 py-2 rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleResolve}
                disabled={acting}
                className="text-sm px-4 py-2 rounded-xl font-medium text-white bg-flamencalia-black hover:bg-neutral-800 disabled:opacity-50"
              >
                {acting ? "Procesando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
      {toast && (
        <AdminToast
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
