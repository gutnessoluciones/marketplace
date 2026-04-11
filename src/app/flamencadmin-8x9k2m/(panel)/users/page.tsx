"use client";

import { useState, useEffect, useCallback } from "react";
import { Icon } from "@/components/icons";
import { AdminToast } from "@/components/admin/toast";

interface User {
  id: string;
  display_name: string;
  role: string;
  avatar_url: string | null;
  stripe_account_id: string | null;
  stripe_onboarding_complete: boolean;
  is_banned: boolean;
  ban_reason: string | null;
  verification_status: string;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionModal, setActionModal] = useState<{
    user: User;
    type: "ban" | "unban" | "verify";
  } | null>(null);
  const [reason, setReason] = useState("");
  const [verifyStatus, setVerifyStatus] = useState("verified");
  const [acting, setActing] = useState(false);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: "20",
    });
    if (search) params.set("q", search);

    const res = await fetch(`/api/admin/users?${params}`);
    const json = await res.json();
    setUsers(json.data || []);
    setTotal(json.total || 0);
    setLoading(false);
  }, [page, search]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleAction = async () => {
    if (!actionModal) return;
    setActing(true);

    const { user, type } = actionModal;
    let body: Record<string, string> = {};

    if (type === "ban") {
      body = { action: "ban", reason };
    } else if (type === "unban") {
      body = { action: "unban" };
    } else if (type === "verify") {
      body = { action: "verify", status: verifyStatus };
    }

    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const label =
        type === "ban"
          ? "Usuario baneado"
          : type === "unban"
            ? "Usuario desbaneado"
            : "Verificación actualizada";
      setToast({ msg: label, type: "success" });
      setActionModal(null);
      setReason("");
      loadUsers();
    } else {
      const json = await res.json().catch(() => null);
      setToast({
        msg: json?.error || "Error al procesar la acción",
        type: "error",
      });
    }
    setActing(false);
  };

  const totalPages = Math.ceil(total / 20);

  const verificationBadge = (status: string) => {
    const map: Record<string, { label: string; cls: string }> = {
      verified: {
        label: "Verificada",
        cls: "bg-emerald-50 text-emerald-700",
      },
      top_seller: {
        label: "Top Seller",
        cls: "bg-amber-50 text-amber-700",
      },
      creator: {
        label: "Creadora",
        cls: "bg-purple-50 text-purple-700",
      },
      pending: {
        label: "Pendiente",
        cls: "bg-blue-50 text-blue-700",
      },
    };
    return map[status] || null;
  };

  return (
    <div className="max-w-6xl">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-flamencalia-black">
            Usuarios
          </h1>
          <p className="text-sm text-neutral-400 mt-0.5">
            {total} usuarios registrados
          </p>
        </div>
        <div className="relative">
          <Icon
            name="search"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400"
          />
          <input
            type="text"
            placeholder="Buscar usuario..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-xl bg-white focus:ring-2 focus:ring-flamencalia-albero/30 focus:border-flamencalia-albero outline-none w-full sm:w-64"
          />
        </div>
      </div>

      <div className="bg-white border border-neutral-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-100">
                <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 sm:px-5 py-3">
                  Usuario
                </th>
                <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 sm:px-5 py-3 hidden sm:table-cell">
                  Rol
                </th>
                <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 sm:px-5 py-3 hidden md:table-cell">
                  Estado
                </th>
                <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 sm:px-5 py-3 hidden lg:table-cell">
                  Registro
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
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center text-sm text-neutral-400"
                  >
                    No se encontraron usuarios
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const badge = verificationBadge(user.verification_status);
                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-neutral-50/50 ${user.is_banned ? "bg-red-50/30" : ""}`}
                    >
                      <td className="px-4 sm:px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-flamencalia-red/10 flex items-center justify-center text-flamencalia-red font-bold text-sm shrink-0">
                            {user.display_name?.charAt(0).toUpperCase() ?? "?"}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-medium text-neutral-700 truncate">
                                {user.display_name}
                              </p>
                              {user.is_banned && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-medium shrink-0">
                                  BANEADO
                                </span>
                              )}
                              {badge && (
                                <span
                                  className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${badge.cls}`}
                                >
                                  {badge.label}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-neutral-400 font-mono">
                              {user.id.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-5 py-3 hidden sm:table-cell">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            user.role === "seller"
                              ? "bg-flamencalia-albero-pale/30 text-flamencalia-red-dark"
                              : "bg-neutral-100 text-neutral-600"
                          }`}
                        >
                          {user.role === "seller" ? "Vendedor" : "Comprador"}
                        </span>
                      </td>
                      <td className="px-4 sm:px-5 py-3 hidden md:table-cell">
                        {user.stripe_onboarding_complete ? (
                          <span className="text-emerald-500 flex items-center gap-1 text-xs">
                            <Icon name="checkCircle" className="w-4 h-4" />
                            Stripe OK
                          </span>
                        ) : user.stripe_account_id ? (
                          <span className="text-amber-500 text-xs">
                            Stripe pendiente
                          </span>
                        ) : (
                          <span className="text-xs text-neutral-300">
                            Sin Stripe
                          </span>
                        )}
                      </td>
                      <td className="px-4 sm:px-5 py-3 text-xs text-neutral-500 hidden lg:table-cell">
                        {new Date(user.created_at).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 sm:px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {!user.is_banned ? (
                            <button
                              onClick={() =>
                                setActionModal({ user, type: "ban" })
                              }
                              className="text-xs px-2.5 py-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                              title="Banear"
                            >
                              Banear
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                setActionModal({ user, type: "unban" })
                              }
                              className="text-xs px-2.5 py-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                              title="Desbanear"
                            >
                              Desbanear
                            </button>
                          )}
                          {user.role === "seller" && (
                            <button
                              onClick={() =>
                                setActionModal({ user, type: "verify" })
                              }
                              className="text-xs px-2.5 py-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Verificar"
                            >
                              Verificar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-neutral-100">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="text-xs px-3 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <span className="text-xs text-neutral-500">
              Página {page} de {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="text-xs px-3 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-neutral-800 mb-1">
              {actionModal.type === "ban"
                ? "Banear usuario"
                : actionModal.type === "unban"
                  ? "Desbanear usuario"
                  : "Verificar vendedora"}
            </h3>
            <p className="text-sm text-neutral-500 mb-4">
              {actionModal.user.display_name} ({actionModal.user.id.slice(0, 8)}
              ...)
            </p>

            {actionModal.type === "ban" && (
              <div className="mb-4">
                <label className="text-xs font-medium text-neutral-600 mb-1 block">
                  Motivo del baneo *
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="w-full text-sm border border-neutral-200 rounded-xl p-3 focus:ring-2 focus:ring-flamencalia-red/30 focus:border-flamencalia-red outline-none resize-none"
                  placeholder="Ej: Compartir datos personales en chat..."
                />
              </div>
            )}

            {actionModal.type === "unban" && (
              <p className="text-sm text-neutral-600 mb-4">
                Motivo del baneo:{" "}
                <span className="font-medium">
                  {actionModal.user.ban_reason || "Sin motivo registrado"}
                </span>
              </p>
            )}

            {actionModal.type === "verify" && (
              <div className="mb-4">
                <label className="text-xs font-medium text-neutral-600 mb-1 block">
                  Tipo de verificación
                </label>
                <select
                  value={verifyStatus}
                  onChange={(e) => setVerifyStatus(e.target.value)}
                  className="w-full text-sm border border-neutral-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none"
                >
                  <option value="verified">Verificada</option>
                  <option value="top_seller">Top Seller</option>
                  <option value="creator">Creadora</option>
                  <option value="none">Quitar verificación</option>
                </select>
              </div>
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
                disabled={acting || (actionModal.type === "ban" && !reason)}
                className={`text-sm px-4 py-2 rounded-xl font-medium text-white disabled:opacity-50 ${
                  actionModal.type === "ban"
                    ? "bg-red-600 hover:bg-red-700"
                    : actionModal.type === "unban"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {acting
                  ? "Procesando..."
                  : actionModal.type === "ban"
                    ? "Banear"
                    : actionModal.type === "unban"
                      ? "Desbanear"
                      : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
      {toast && <AdminToast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
