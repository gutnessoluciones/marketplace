import { supabaseAdmin } from "@/lib/supabase/admin";
import { apiResponse, apiError } from "@/lib/utils";

// GET /api/blog — Public blog posts (published only)
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("blog_posts")
      .select(
        "id, title, slug, excerpt, cover_image, tags, published_at, author:profiles!author_id(display_name)",
      )
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (error) return apiResponse({ error: error.message }, 500);
    return apiResponse({ data });
  } catch (error) {
    return apiError(error);
  }
}
