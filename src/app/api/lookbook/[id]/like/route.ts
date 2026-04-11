import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { apiResponse, apiError } from "@/lib/utils";

// POST /api/lookbook/[id]/like — Toggle like
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return apiResponse({ error: "Unauthorized" }, 401);

    const { id } = await params;

    // Check if already liked
    const { data: existing } = await supabaseAdmin
      .from("lookbook_likes")
      .select("id")
      .eq("lookbook_post_id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      // Unlike
      await supabaseAdmin.from("lookbook_likes").delete().eq("id", existing.id);
      return apiResponse({ liked: false });
    } else {
      // Like
      await supabaseAdmin
        .from("lookbook_likes")
        .insert({ lookbook_post_id: id, user_id: user.id });
      return apiResponse({ liked: true });
    }
  } catch (error) {
    return apiError(error);
  }
}
