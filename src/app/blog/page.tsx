import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { Footer } from "@/components/layout/footer";
import { Icon } from "@/components/icons";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const revalidate = 3600;

export const metadata = {
  title: "Blog — Flamencalia",
  description:
    "Tendencias, inspiración y todo sobre el mundo flamenco en el blog de Flamencalia.",
};

export default async function BlogPage() {
  const supabase = getSupabaseAdmin();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select(
      "id, title, slug, excerpt, cover_image, tags, published_at, author:profiles!author_id(display_name)",
    )
    .eq("status", "published")
    .order("published_at", { ascending: false });

  return (
    <div className="flex flex-col min-h-screen bg-flamencalia-cream">
      <SiteHeader />

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full">
        <div className="mb-8">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900">
            Blog
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Inspiración, tendencias y consejos del mundo flamenco
          </p>
        </div>

        {!posts || posts.length === 0 ? (
          <div className="text-center py-20">
            <Icon
              name="book"
              className="w-12 h-12 text-neutral-300 mx-auto mb-4"
            />
            <p className="text-neutral-500">
              Próximamente publicaremos nuestras primeras entradas.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group bg-white rounded-2xl border border-neutral-100 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-0.5"
              >
                {post.cover_image ? (
                  <div className="aspect-video bg-neutral-100 overflow-hidden">
                    <img
                      src={post.cover_image}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-linear-to-br from-flamencalia-albero-pale to-flamencalia-cream flex items-center justify-center">
                    <Icon
                      name="book"
                      className="w-10 h-10 text-flamencalia-albero/40"
                    />
                  </div>
                )}
                <div className="p-4 sm:p-5">
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex gap-1.5 mb-2 flex-wrap">
                      {post.tags.slice(0, 3).map((tag: string) => (
                        <span
                          key={tag}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-flamencalia-albero-pale/30 text-flamencalia-red-dark font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <h2 className="text-sm sm:text-base font-bold text-neutral-800 group-hover:text-flamencalia-red transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="text-xs text-neutral-500 mt-1.5 line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-3 text-[11px] text-neutral-400">
                    <span>
                      {
                        (
                          post.author as unknown as {
                            display_name: string;
                          } | null
                        )?.display_name
                      }
                    </span>
                    {post.published_at && (
                      <>
                        <span>·</span>
                        <span>
                          {new Date(post.published_at).toLocaleDateString(
                            "es-ES",
                            { day: "numeric", month: "long", year: "numeric" },
                          )}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
