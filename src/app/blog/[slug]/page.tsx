import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { Footer } from "@/components/layout/footer";
import { Icon } from "@/components/icons";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = getSupabaseAdmin();
  const { data: post } = await supabase
    .from("blog_posts")
    .select("title, excerpt")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!post) return { title: "Blog — Flamencalia" };
  return {
    title: `${post.title} — Flamencalia`,
    description: post.excerpt || undefined,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = getSupabaseAdmin();
  const { data: post } = await supabase
    .from("blog_posts")
    .select("*, author:profiles!author_id(display_name, avatar_url)")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!post) notFound();

  return (
    <div className="flex flex-col min-h-screen bg-flamencalia-cream">
      <SiteHeader />

      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-flamencalia-red mb-6 transition-colors"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path d="M15 19l-7-7 7-7" />
          </svg>
          Volver al blog
        </Link>

        {post.cover_image && (
          <div className="aspect-video rounded-2xl overflow-hidden mb-8 bg-neutral-100">
            <img
              src={post.cover_image}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="flex gap-1.5 mb-4 flex-wrap">
            {post.tags.map((tag: string) => (
              <span
                key={tag}
                className="text-[10px] px-2 py-0.5 rounded-full bg-flamencalia-albero-pale/30 text-flamencalia-red-dark font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 leading-tight mb-4">
          {post.title}
        </h1>

        <div className="flex items-center gap-3 text-sm text-neutral-500 mb-8 pb-8 border-b border-flamencalia-albero-pale/30">
          <div className="w-8 h-8 rounded-full bg-flamencalia-albero/10 flex items-center justify-center text-flamencalia-albero font-bold text-xs">
            {(
              post.author as unknown as {
                display_name: string;
                avatar_url: string;
              } | null
            )?.display_name
              ?.charAt(0)
              .toUpperCase() ?? "A"}
          </div>
          <span className="font-medium text-neutral-700">
            {
              (
                post.author as unknown as {
                  display_name: string;
                  avatar_url: string;
                } | null
              )?.display_name
            }
          </span>
          {post.published_at && (
            <>
              <span>·</span>
              <span>
                {new Date(post.published_at).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </>
          )}
        </div>

        <div className="prose prose-neutral prose-sm sm:prose-base max-w-none prose-headings:font-serif prose-a:text-flamencalia-red">
          {/* Render content as paragraphs — Markdown rendering can be added later */}
          {post.content.split("\n\n").map((paragraph: string, i: number) => {
            if (paragraph.startsWith("# ")) {
              return (
                <h2 key={i} className="text-xl font-bold mt-8 mb-3">
                  {paragraph.slice(2)}
                </h2>
              );
            }
            if (paragraph.startsWith("## ")) {
              return (
                <h3 key={i} className="text-lg font-bold mt-6 mb-2">
                  {paragraph.slice(3)}
                </h3>
              );
            }
            return (
              <p key={i} className="mb-4 leading-relaxed text-neutral-600">
                {paragraph}
              </p>
            );
          })}
        </div>
      </article>

      <Footer />
    </div>
  );
}
