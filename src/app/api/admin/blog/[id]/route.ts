import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/admin";
import { apiResponse, apiError } from "@/lib/utils";
import { z } from "zod";

const updateBlogSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  slug: z.string().min(3).max(200).optional(),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(10).optional(),
  cover_image: z.string().url().nullable().optional(),
  status: z.enum(["draft", "published"]).optional(),
  tags: z.array(z.string()).optional(),
});

// PATCH /api/admin/blog/[id] — Update blog post
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await isAdmin();
    if (!auth.authorized) return apiResponse({ error: "Forbidden" }, 403);

    const { id } = await params;
    const body = await request.json();
    const parsed = updateBlogSchema.safeParse(body);
    if (!parsed.success)
      return apiResponse({ error: parsed.error.flatten() }, 400);

    const updates: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.status === "published") {
      updates.published_at = new Date().toISOString();
    }

    const { data, error } = await supabaseAdmin
      .from("blog_posts")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) return apiResponse({ error: error.message }, 500);
    return apiResponse({ data });
  } catch (error) {
    return apiError(error);
  }
}

// DELETE /api/admin/blog/[id] — Delete blog post
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await isAdmin();
    if (!auth.authorized) return apiResponse({ error: "Forbidden" }, 403);

    const { id } = await params;
    const { error } = await supabaseAdmin
      .from("blog_posts")
      .delete()
      .eq("id", id);

    if (error) return apiResponse({ error: error.message }, 500);
    return apiResponse({ success: true });
  } catch (error) {
    return apiError(error);
  }
}
