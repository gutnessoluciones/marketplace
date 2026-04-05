"use client";

import { useState, useEffect } from "react";
import { Icon } from "@/components/icons";

interface AdminUserEntry {
  id: string;
  user_id: string;
  role: "owner" | "dev" | "admin";
  created_at: string;
  profile?: { id: string; display_name: string; avatar_url: string | null };
}

interface UserEntry {
  id: string;
  display_name: string;
  avatar_url: string | null;
  role: string;
}

const roleBadge: Record<string, { bg: string; text: string; label: string }> = {
  owner: { bg: "bg-amber-100", text: "text-amber-700", label: "Owner" },
  dev: { bg: "bg-blue-100", text: "text-blue-700", label: "Dev" },
  admin: { bg: "bg-slate-100", text: "text-slate-700", label: "Admin" },
};

export default function TeamPage() {
  const [admins, setAdmins] = useState<AdminUserEntry[]>([]);
  const [users, setUsers] = useState<UserEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<"dev" | "admin">("admin");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const loadAdmins = async () => {
    const res = await fetch("/api/admin/admins");
    const data = await res.json();
    setAdmins(data);
  };

  const loadUsers = async (q = "") => {
    const res = await fetch(
      `/api/admin/users?limit=50&q=${encodeURIComponent(q)}`,
    );
    const data = await res.json();
    setUsers(data.data || []);
  };

  useEffect(() => {
    Promise.all([loadAdmins(), loadUsers()])
      .catch(() => setMessage({ type: "error", text: "Error al cargar" }))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async () => {
    if (!selectedUser) return;
    setMessage(null);
    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: selectedUser, role: selectedRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage({ type: "success", text: "Admin añadido" });
      setShowAddModal(false);
      setSelectedUser(null);
      await loadAdmins();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Error",
      });
    }
  };

  const handleRemove = async (userId: string) => {
    if (!confirm("¿Eliminar este admin?")) return;
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/admins?user_id=${userId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage({ type: "success", text: "Admin eliminado" });
      await loadAdmins();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Error",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Equipo admin</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Gestiona quién tiene acceso al panel de administración
          </p>
        </div>
        <button
          onClick={() => {
            setShowAddModal(true);
            loadUsers("");
          }}
          className="bg-linear-to-r from-indigo-600 to-violet-600 text-white py-2 px-4 rounded-xl text-sm font-semibold hover:from-indigo-700 hover:to-violet-700 transition-all flex items-center gap-2"
        >
          <Icon name="plus" className="w-4 h-4" />
          Añadir
        </button>
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

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        {admins.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">
            No hay administradores configurados
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {admins.map((admin) => {
              const badge = roleBadge[admin.role];
              return (
                <div
                  key={admin.id}
                  className="p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    {admin.profile?.avatar_url ? (
                      <img
                        src={admin.profile.avatar_url}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm">
                        {admin.profile?.display_name?.charAt(0).toUpperCase() ??
                          "?"}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        {admin.profile?.display_name ?? "—"}
                      </p>
                      <p className="text-xs text-slate-400">
                        Desde{" "}
                        {new Date(admin.created_at).toLocaleDateString("es-ES")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`${badge.bg} ${badge.text} text-xs font-semibold px-2.5 py-1 rounded-full`}
                    >
                      {badge.label}
                    </span>
                    {admin.role !== "owner" && (
                      <button
                        onClick={() => handleRemove(admin.user_id)}
                        className="text-slate-300 hover:text-red-500 transition-colors"
                        title="Eliminar admin"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add admin modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 m-4">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              Añadir administrador
            </h3>

            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Buscar usuario
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  loadUsers(e.target.value);
                }}
                placeholder="Buscar por nombre..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
              />
            </div>

            <div className="max-h-48 overflow-y-auto border border-slate-100 rounded-xl mb-4">
              {users
                .filter((u) => !admins.some((a) => a.user_id === u.id))
                .map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => setSelectedUser(user.id)}
                    className={`w-full p-3 flex items-center gap-3 text-left hover:bg-slate-50 transition-colors ${
                      selectedUser === user.id ? "bg-indigo-50" : ""
                    }`}
                  >
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold">
                        {user.display_name?.charAt(0).toUpperCase() ?? "?"}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        {user.display_name}
                      </p>
                      <p className="text-xs text-slate-400 capitalize">
                        {user.role}
                      </p>
                    </div>
                    {selectedUser === user.id && (
                      <Icon
                        name="check"
                        className="w-4 h-4 text-indigo-600 ml-auto"
                      />
                    )}
                  </button>
                ))}
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Rol
              </label>
              <select
                value={selectedRole}
                onChange={(e) =>
                  setSelectedRole(e.target.value as "dev" | "admin")
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
              >
                <option value="admin">Admin</option>
                <option value="dev">Dev</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedUser(null);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleAdd}
                disabled={!selectedUser}
                className="flex-1 bg-linear-to-r from-indigo-600 to-violet-600 text-white py-2.5 px-4 rounded-xl text-sm font-semibold hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 transition-all"
              >
                Añadir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
