import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { apiResponse, apiError } from "@/lib/utils";
import { z } from "zod";

const createLookbookSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(500).optional(),
  images: z.array(z.string().url()).min(1).max(10),
  tagged_products: z.array(z.string().uuid()).optional(),
  tags: z.array(z.string()).optional(),
});

// GET /api/lookbook — List lookbook posts (public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") || "1");
    const limit = Math.min(Number(searchParams.get("limit") || "20"), 50);

    const { data, error } = await supabaseAdmin
      .from("lookbook_posts")
      .select(
        "*, author:profiles!user_id(id, display_name, avatar_url, verification_status)",
      )
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) return apiResponse({ error: error.message }, 500);

    // Get like counts
    if (data && data.length > 0) {
      const ids = data.map((d) => d.id);
      const { data: likes } = await supabaseAdmin
        .from("lookbook_likes")
        .select("lookbook_post_id")
        .in("lookbook_post_id", ids);

      const likeCounts: Record<string, number> = {};
      likes?.forEach((l) => {
        likeCounts[l.lookbook_post_id] =
          (likeCounts[l.lookbook_post_id] || 0) + 1;
      });

      const enriched = data.map((post) => ({
        ...post,
        like_count: likeCounts[post.id] || 0,
      }));

      return apiResponse({ data: enriched });
    }

    return apiResponse({ data });
  } catch (error) {
    return apiError(error);
  }
}

// POST /api/lookbook — Create lookbook post
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return apiResponse({ error: "Unauthorized" }, 401);

    const body = await request.json();
    const parsed = createLookbookSchema.safeParse(body);
    if (!parsed.success)
      return apiResponse({ error: parsed.error.flatten() }, 400);

    const { data, error } = await supabaseAdmin
      .from("lookbook_posts")
      .insert({
        user_id: user.id,
        ...parsed.data,
        status: "published",
      })
      .select()
      .single();

    if (error) return apiResponse({ error: error.message }, 500);
    return apiResponse({ data }, 201);
  } catch (error) {
    return apiError(error);
  }
}
