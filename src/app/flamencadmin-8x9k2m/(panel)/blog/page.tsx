"use client";

import { useState, useEffect, useCallback } from "react";
import { Icon } from "@/components/icons";
import { AdminToast } from "@/components/admin/toast";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  status: string;
  tags: string[];
  published_at: string | null;
  created_at: string;
  author?: { display_name: string } | null;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    cover_image: "",
    status: "draft" as "draft" | "published",
    tags: "",
  });

  const loadPosts = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/blog");
    if (res.ok) {
      const json = await res.json();
      setPosts(json.data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const resetForm = () => {
    setForm({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      cover_image: "",
      status: "draft",
      tags: "",
    });
  };

  const openCreate = () => {
    resetForm();
    setEditing(null);
    setCreating(true);
  };

  const openEdit = (post: BlogPost) => {
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      content: post.content,
      cover_image: post.cover_image || "",
      status: post.status as "draft" | "published",
      tags: (post.tags || []).join(", "),
    });
    setEditing(post);
    setCreating(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const body = {
      title: form.title,
      slug: form.slug || slugify(form.title),
      excerpt: form.excerpt || undefined,
      content: form.content,
      cover_image: form.cover_image || undefined,
      status: form.status,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    const url = editing ? `/api/admin/blog/${editing.id}` : "/api/admin/blog";
    const method = editing ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setToast({
        msg: editing ? "Entrada actualizada" : "Entrada creada",
        type: "success",
      });
      setCreating(false);
      setEditing(null);
      resetForm();
      loadPosts();
    } else {
      const json = await res.json().catch(() => null);
      setToast({
        msg: json?.error || "Error al guardar la entrada",
        type: "error",
      });
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta entrada?")) return;
    const res = await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
    if (res.ok) {
      setToast({ msg: "Entrada eliminada", type: "success" });
      loadPosts();
    } else {
      setToast({ msg: "Error al eliminar la entrada", type: "error" });
    }
  };

  if (creating) {
    return (
      <div className="max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-flamencalia-black">
            {editing ? "Editar entrada" : "Nueva entrada"}
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
              Título *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => {
                setForm({
                  ...form,
                  title: e.target.value,
                  slug: form.slug || slugify(e.target.value),
                });
              }}
              className="w-full text-sm border border-neutral-200 rounded-xl p-3 focus:ring-2 focus:ring-flamencalia-albero/30 focus:border-flamencalia-albero outline-none"
              placeholder="Título de la entrada"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-600 mb-1 block">
              Slug
            </label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="w-full text-sm border border-neutral-200 rounded-xl p-3 focus:ring-2 focus:ring-flamencalia-albero/30 focus:border-flamencalia-albero outline-none font-mono"
              placeholder="url-amigable"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-600 mb-1 block">
              Extracto
            </label>
            <textarea
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              rows={2}
              className="w-full text-sm border border-neutral-200 rounded-xl p-3 focus:ring-2 focus:ring-flamencalia-albero/30 focus:border-flamencalia-albero outline-none resize-none"
              placeholder="Breve descripción..."
            />
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-600 mb-1 block">
              Contenido *
            </label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={12}
              className="w-full text-sm border border-neutral-200 rounded-xl p-3 focus:ring-2 focus:ring-flamencalia-albero/30 focus:border-flamencalia-albero outline-none resize-y font-mono"
              placeholder="Contenido en Markdown..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-neutral-600 mb-1 block">
                Imagen de portada (URL)
              </label>
              <input
                type="text"
                value={form.cover_image}
                onChange={(e) =>
                  setForm({ ...form, cover_image: e.target.value })
                }
                className="w-full text-sm border border-neutral-200 rounded-xl p-3 focus:ring-2 focus:ring-flamencalia-albero/30 focus:border-flamencalia-albero outline-none"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-600 mb-1 block">
                Tags (separados por coma)
              </label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                className="w-full text-sm border border-neutral-200 rounded-xl p-3 focus:ring-2 focus:ring-flamencalia-albero/30 focus:border-flamencalia-albero outline-none"
                placeholder="feria, moda, tendencias"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
            <select
              value={form.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.value as "draft" | "published",
                })
              }
              className="text-sm border border-neutral-200 rounded-xl p-2.5 focus:ring-2 focus:ring-flamencalia-albero/30 outline-none"
            >
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
            </select>
            <button
              onClick={handleSave}
              disabled={saving || !form.title || !form.content}
              className="text-sm px-5 py-2.5 rounded-xl font-medium text-white bg-flamencalia-black hover:bg-neutral-800 disabled:opacity-50"
            >
              {saving
                ? "Guardando..."
                : editing
                  ? "Actualizar"
                  : "Crear entrada"}
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
            Blog
          </h1>
          <p className="text-sm text-neutral-400 mt-0.5">
            {posts.length} entradas
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl font-medium text-white bg-flamencalia-black hover:bg-neutral-800"
        >
          <Icon name="plus" className="w-4 h-4" />
          Nueva entrada
        </button>
      </div>

      {loading ? (
        <div className="bg-white border border-neutral-100 rounded-2xl p-12 text-center">
          <div className="animate-pulse text-sm text-neutral-400">
            Cargando...
          </div>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white border border-neutral-100 rounded-2xl p-12 text-center">
          <Icon
            name="book"
            className="w-10 h-10 text-neutral-300 mx-auto mb-3"
          />
          <p className="text-sm text-neutral-500 mb-3">
            Aún no hay entradas de blog
          </p>
          <button
            onClick={openCreate}
            className="text-sm text-flamencalia-red font-medium hover:underline"
          >
            Crear la primera
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white border border-neutral-100 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {post.cover_image && (
                  <img
                    src={post.cover_image}
                    alt=""
                    className="w-14 h-14 rounded-xl object-cover shrink-0 hidden sm:block"
                  />
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-neutral-800 truncate">
                      {post.title}
                    </h3>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${
                        post.status === "published"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-neutral-100 text-neutral-500"
                      }`}
                    >
                      {post.status === "published" ? "Publicado" : "Borrador"}
                    </span>
                  </div>
                  {post.excerpt && (
                    <p className="text-xs text-neutral-500 truncate">
                      {post.excerpt}
                    </p>
                  )}
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    {post.author?.display_name} ·{" "}
                    {new Date(post.created_at).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => openEdit(post)}
                  className="text-xs px-3 py-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="text-xs px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
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
