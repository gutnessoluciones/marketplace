import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { apiResponse, apiError } from "@/lib/utils";
import { z } from "zod";

const createCollectionSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(300).optional(),
  is_public: z.boolean().default(true),
});

// GET /api/collections — Get user's collections
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return apiResponse({ error: "Unauthorized" }, 401);

    const { data, error } = await supabaseAdmin
      .from("collections")
      .select("*, items:collection_items(count)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) return apiResponse({ error: error.message }, 500);
    return apiResponse({ data });
  } catch (error) {
    return apiError(error);
  }
}

// POST /api/collections — Create collection
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return apiResponse({ error: "Unauthorized" }, 401);

    const body = await request.json();
    const parsed = createCollectionSchema.safeParse(body);
    if (!parsed.success)
      return apiResponse({ error: parsed.error.flatten() }, 400);

    const { data, error } = await supabaseAdmin
      .from("collections")
      .insert({
        user_id: user.id,
        ...parsed.data,
      })
      .select()
      .single();

    if (error) return apiResponse({ error: error.message }, 500);
    return apiResponse({ data }, 201);
  } catch (error) {
    return apiError(error);
  }
}
