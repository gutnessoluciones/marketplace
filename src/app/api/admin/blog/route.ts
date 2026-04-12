import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/admin";
import { apiResponse, apiError } from "@/lib/utils";
import { z } from "zod";

const blogPostSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z
    .string()
    .min(3)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message:
        "El slug solo puede contener letras minúsculas, números y guiones",
    }),
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
export async function GET(request: NextRequest) {
  try {
    const auth = await isAdmin();
    if (!auth.authorized) return apiResponse({ error: "Forbidden" }, 403);

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(Math.max(1, Number(searchParams.get("limit")) || 20), 100);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabaseAdmin
      .from("blog_posts")
      .select("*, author:profiles!author_id(display_name)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) return apiResponse({ error: "Error al obtener posts" }, 500);
    return apiResponse({ data, total: count, page, limit });
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

    if (error) return apiResponse({ error: "Error al crear post" }, 500);
    return apiResponse({ data }, 201);
  } catch (error) {
    return apiError(error);
  }
}
