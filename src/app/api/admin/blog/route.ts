import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/admin";
import { apiResponse, apiError } from "@/lib/utils";
import { z } from "zod";

const blogPostSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z.string().min(3).max(200),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(10),
  cover_image: z
    .preprocess(
      (v) =>
        typeof v === "string" && v.trim() === ""
          ? null
          : v === undefined
            ? null
            : v,
      z.string().url().nullable(),
    )
    .optional(),
  status: z.enum(["draft", "published"]).default("draft"),
  tags: z.array(z.string()).optional(),
});

// GET /api/admin/blog — List blog posts
export async function GET() {
  try {
    const auth = await isAdmin();
    if (!auth.authorized) return apiResponse({ error: "Forbidden" }, 403);

    const { data, error } = await supabaseAdmin
      .from("blog_posts")
      .select("*, author:profiles!author_id(display_name)")
      .order("created_at", { ascending: false });

    if (error) return apiResponse({ error: error.message }, 500);
    return apiResponse({ data });
  } catch (error) {
    return apiError(error);
  }
}

// POST /api/admin/blog — Create blog post
export async function POST(request: NextRequest) {
  try {
    const auth = await isAdmin();
    if (!auth.authorized) return apiResponse({ error: "Forbidden" }, 403);

    const body = await request.json();
    const parsed = blogPostSchema.safeParse(body);
    if (!parsed.success)
      return apiResponse({ error: parsed.error.flatten() }, 400);

    const { data, error } = await supabaseAdmin
      .from("blog_posts")
      .insert({
        ...parsed.data,
        author_id: auth.userId,
        published_at:
          parsed.data.status === "published" ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (error) return apiResponse({ error: error.message }, 500);
    return apiResponse({ data }, 201);
  } catch (error) {
    return apiError(error);
  }
}
