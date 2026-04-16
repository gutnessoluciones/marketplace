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
  const bannerRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  const [displayName, setDisplayName] = useState(profile.display_name);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [shippingPolicy, setShippingPolicy] = useState(
    profile.shipping_policy ?? "",
  );
  const [returnPolicy, setReturnPolicy] = useState(profile.return_policy ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
  const [bannerUrl, setBannerUrl] = useState(profile.banner_url);
  const [uploading, setUploading] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
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

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBanner(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/profile/banner", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al subir imagen");

      setBannerUrl(data.url);
      setMessage({ type: "success", text: "Portada actualizada" });
      startTransition(() => router.refresh());
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Error al subir portada",
      });
    } finally {
      setUploadingBanner(false);
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
          shipping_policy: shippingPolicy.trim() || null,
          return_policy: returnPolicy.trim() || null,
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

  const initial = displayName?.charAt(0).toUpperCase() ?? "U";

  return (
    <div className="bg-white border border-neutral-100 rounded-2xl shadow-sm overflow-hidden mb-6">
      {/* Banner + Avatar visual header */}
      <div className="relative">
        {/* Banner */}
        <button
          type="button"
          onClick={() => bannerRef.current?.click()}
          disabled={uploadingBanner}
          className="relative w-full h-36 sm:h-44 group cursor-pointer overflow-hidden"
        >
          {bannerUrl ? (
            <img
              src={bannerUrl}
              alt="Portada"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-flamencalia-black via-flamencalia-black/90 to-flamencalia-red-dark/70">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-1/4 w-48 h-48 bg-flamencalia-albero rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-flamencalia-red rounded-full blur-3xl" />
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
              {uploadingBanner ? (
                <div className="w-4 h-4 border-2 border-flamencalia-red border-t-transparent rounded-full animate-spin" />
              ) : (
                <Icon
                  name="pencil"
                  className="w-4 h-4 text-flamencalia-black"
                />
              )}
              <span className="text-xs font-semibold text-flamencalia-black">
                {uploadingBanner ? "Subiendo..." : "Cambiar portada"}
              </span>
            </div>
          </div>
          <input
            ref={bannerRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleBannerChange}
            className="hidden"
          />
        </button>

        {/* Avatar — overlapping banner */}
        <div className="absolute -bottom-10 left-6">
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
                className="w-20 h-20 rounded-full object-cover ring-4 ring-white shadow-lg"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-linear-to-br from-flamencalia-red to-flamencalia-red-dark flex items-center justify-center text-white font-bold text-2xl ring-4 ring-white shadow-lg">
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
        </div>
      </div>

      {/* Name + email — next to avatar */}
      <div className="pt-3 pl-28 pr-6 pb-4 border-b border-neutral-100">
        <p className="text-sm font-semibold text-flamencalia-black">
          {displayName}
        </p>
        <p className="text-xs text-neutral-400">{email}</p>
        <div className="flex items-center gap-3 mt-1">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="text-[11px] text-flamencalia-red hover:text-flamencalia-red-dark font-medium"
          >
            {uploading ? "Subiendo..." : "Cambiar foto"}
          </button>
          <span className="text-neutral-200">·</span>
          <button
            type="button"
            onClick={() => bannerRef.current?.click()}
            disabled={uploadingBanner}
            className="text-[11px] text-flamencalia-red hover:text-flamencalia-red-dark font-medium"
          >
            {uploadingBanner ? "Subiendo..." : "Cambiar portada"}
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="p-6">
        {/* Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1.5">
              Nombre
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              minLength={2}
              maxLength={100}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm text-flamencalia-black focus:outline-none focus:ring-2 focus:ring-flamencalia-red/20 focus:border-flamencalia-red transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1.5">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Cuéntale a tus clientes sobre ti..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm text-flamencalia-black focus:outline-none focus:ring-2 focus:ring-flamencalia-red/20 focus:border-flamencalia-red transition-all resize-none"
            />
            <p className="text-xs text-neutral-300 mt-1 text-right">
              {bio.length}/500
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1.5">
              Teléfono
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={20}
              placeholder="+34 600 000 000"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm text-flamencalia-black focus:outline-none focus:ring-2 focus:ring-flamencalia-red/20 focus:border-flamencalia-red transition-all"
            />
          </div>

          {/* Campos de política */}
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1.5">
              Política de envío
            </label>
            <textarea
              value={shippingPolicy}
              onChange={(e) => setShippingPolicy(e.target.value)}
              maxLength={1000}
              rows={3}
              placeholder="Ej: Envío en 2-3 días laborables. Envío gratis para pedidos superiores a 50€..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm text-flamencalia-black focus:outline-none focus:ring-2 focus:ring-flamencalia-red/20 focus:border-flamencalia-red transition-all resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1.5">
              Política de devoluciones
            </label>
            <textarea
              value={returnPolicy}
              onChange={(e) => setReturnPolicy(e.target.value)}
              maxLength={1000}
              rows={3}
              placeholder="Ej: Aceptamos devoluciones en un plazo de 14 días. El artículo debe estar sin usar..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm text-flamencalia-black focus:outline-none focus:ring-2 focus:ring-flamencalia-red/20 focus:border-flamencalia-red transition-all resize-none"
            />
          </div>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-2 gap-4 mt-5">
          <div className="bg-neutral-50 rounded-xl p-4">
            <p className="text-xs text-neutral-400 mb-1">Rol</p>
            <div className="flex items-center gap-2">
              <span className="text-neutral-400">
                <Icon name="store" className="w-5 h-5" />
              </span>
              <p className="text-sm font-semibold text-neutral-700">Miembro</p>
            </div>
          </div>
          <div className="bg-neutral-50 rounded-xl p-4">
            <p className="text-xs text-neutral-400 mb-1">Miembro desde</p>
            <p className="text-sm font-semibold text-neutral-700">
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
          className="mt-5 w-full bg-flamencalia-red text-white py-2.5 px-4 rounded-xl text-sm font-semibold hover:bg-flamencalia-red-dark disabled:opacity-50 transition-all"
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}
