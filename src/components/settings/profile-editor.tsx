"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Profile } from "@/types";
import { Icon } from "@/components/icons";

interface ProfileEditorProps {
  profile: Profile;
  email: string;
}

export function ProfileEditor({ profile, email }: ProfileEditorProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  const [displayName, setDisplayName] = useState(profile.display_name);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al subir imagen");

      setAvatarUrl(data.url);
      setMessage({ type: "success", text: "Foto actualizada" });
      startTransition(() => router.refresh());
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Error al subir imagen",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: displayName.trim(),
          bio: bio.trim() || null,
          phone: phone.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar");

      setMessage({ type: "success", text: "Perfil actualizado correctamente" });
      startTransition(() => router.refresh());
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Error al guardar",
      });
    } finally {
      setSaving(false);
    }
  };

  const isSeller = profile.role === "seller";
  const initial = displayName?.charAt(0).toUpperCase() ?? "U";

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden mb-6">
      <div className="p-6 border-b border-slate-50 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
          Perfil
        </h2>
      </div>
      <form onSubmit={handleSave} className="p-6">
        {/* Avatar */}
        <div className="flex items-center gap-5 mb-6">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="relative group cursor-pointer"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-20 h-20 rounded-full object-cover ring-2 ring-slate-100"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-linear-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-2xl ring-2 ring-slate-100">
                {initial}
              </div>
            )}
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              {uploading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Icon name="pencil" className="w-5 h-5 text-white" />
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </button>
          <div>
            <p className="text-sm font-semibold text-slate-800">
              {displayName}
            </p>
            <p className="text-xs text-slate-400">{email}</p>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="text-xs text-indigo-600 hover:text-indigo-700 mt-1 font-medium"
            >
              {uploading ? "Subiendo..." : "Cambiar foto"}
            </button>
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Nombre
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              minLength={2}
              maxLength={100}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder={
                isSeller
                  ? "Cuéntale a tus clientes sobre ti..."
                  : "Cuéntanos algo sobre ti..."
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all resize-none"
            />
            <p className="text-xs text-slate-300 mt-1 text-right">
              {bio.length}/500
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Teléfono
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={20}
              placeholder="+34 600 000 000"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
            />
          </div>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-2 gap-4 mt-5">
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs text-slate-400 mb-1">Rol</p>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">
                <Icon name={isSeller ? "store" : "cart"} className="w-5 h-5" />
              </span>
              <p className="text-sm font-semibold text-slate-700">
                {isSeller ? "Vendedor" : "Comprador"}
              </p>
            </div>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs text-slate-400 mb-1">Miembro desde</p>
            <p className="text-sm font-semibold text-slate-700">
              {new Date(profile.created_at).toLocaleDateString("es-ES", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mt-4 p-3 rounded-xl text-sm ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={saving || isPending || !displayName.trim()}
          className="mt-5 w-full bg-linear-to-r from-indigo-600 to-violet-600 text-white py-2.5 px-4 rounded-xl text-sm font-semibold hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 transition-all"
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}
