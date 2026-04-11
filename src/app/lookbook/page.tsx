"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { SiteHeader } from "@/components/layout/site-header";
import { Footer } from "@/components/layout/footer";

interface LookbookPost {
  id: string;
  title: string;
  description: string | null;
  images: string[];
  tagged_products: string[] | null;
  tags: string[] | null;
  like_count: number;
  created_at: string;
  author?: {
    id: string;
    display_name: string;
    avatar_url: string | null;
    verification_status: string;
  };
}

export default function LookbookPage() {
  const [posts, setPosts] = useState<LookbookPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/lookbook?limit=50")
      .then((r) => r.json())
      .then((json) => {
        setPosts(json.data || []);
        setLoading(false);
      });
  }, []);

  const handleLike = async (postId: string) => {
    const res = await fetch(`/api/lookbook/${postId}/like`, {
      method: "POST",
    });
    if (res.ok) {
      const data = await res.json();
      setLikedIds((prev) => {
        const next = new Set(prev);
        if (data.liked) next.add(postId);
        else next.delete(postId);
        return next;
      });
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                like_count: p.like_count + (data.liked ? 1 : -1),
              }
            : p,
        ),
      );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-flamencalia-cream">
      <SiteHeader />

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full">
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900">
              Inspiración
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Looks y estilismos de la comunidad flamenca
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-pulse text-sm text-neutral-400">
              Cargando...
            </div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <Icon
              name="sparkle"
              className="w-12 h-12 text-neutral-300 mx-auto mb-4"
            />
            <p className="text-neutral-500 mb-3">
              Aún no hay publicaciones de inspiración
            </p>
            <p className="text-xs text-neutral-400">
              Pronto las vendedoras compartirán sus mejores looks
            </p>
          </div>
        ) : (
          /* Pinterest-style masonry grid */
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 sm:gap-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="break-inside-avoid mb-3 sm:mb-4 group"
              >
                <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden hover:shadow-lg transition-all">
                  {/* Image */}
                  <div className="relative">
                    <img
                      src={post.images[0]}
                      alt={post.title}
                      className="w-full object-cover"
                      loading="lazy"
                    />
                    {/* Like overlay */}
                    <button
                      onClick={() => handleLike(post.id)}
                      className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:scale-110"
                    >
                      <Icon
                        name={likedIds.has(post.id) ? "heartFilled" : "heart"}
                        className={`w-4 h-4 ${likedIds.has(post.id) ? "text-flamencalia-red" : "text-neutral-600"}`}
                      />
                    </button>
                    {post.images.length > 1 && (
                      <div className="absolute top-2.5 left-2.5 text-[10px] px-1.5 py-0.5 rounded bg-black/50 text-white font-medium">
                        +{post.images.length - 1}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <h3 className="text-xs sm:text-sm font-semibold text-neutral-800 line-clamp-1">
                      {post.title}
                    </h3>
                    <div className="flex items-center justify-between mt-2">
                      <Link
                        href={`/sellers/${post.author?.id}`}
                        className="flex items-center gap-1.5 min-w-0"
                      >
                        <div className="w-5 h-5 rounded-full bg-flamencalia-albero/10 flex items-center justify-center text-flamencalia-albero text-[9px] font-bold shrink-0">
                          {post.author?.display_name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-[11px] text-neutral-500 truncate">
                          {post.author?.display_name}
                        </span>
                        {post.author?.verification_status === "verified" && (
                          <Icon
                            name="checkCircle"
                            className="w-3 h-3 text-emerald-500 shrink-0"
                          />
                        )}
                      </Link>
                      <div className="flex items-center gap-0.5 text-[11px] text-neutral-400">
                        <Icon name="heart" className="w-3 h-3" />
                        {post.like_count}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
