import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { apiResponse, apiError } from "@/lib/utils";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  is_public: z.boolean().optional(),
});

// PATCH /api/collections/[id] — Update collection
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return apiResponse({ error: "Unauthorized" }, 401);

    const { data: collection } = await supabaseAdmin
      .from("collections")
      .select("user_id")
      .eq("id", id)
      .single();

    if (!collection || collection.user_id !== user.id) {
      return apiResponse({ error: "Forbidden" }, 403);
    }

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success)
      return apiResponse({ error: parsed.error.flatten() }, 400);

    const { data, error } = await supabaseAdmin
      .from("collections")
      .update(parsed.data)
      .eq("id", id)
      .select()
      .single();

    if (error) return apiResponse({ error: error.message }, 500);
    return apiResponse({ data });
  } catch (error) {
    return apiError(error);
  }
}

// DELETE /api/collections/[id] — Delete collection
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return apiResponse({ error: "Unauthorized" }, 401);

    const { data: collection } = await supabaseAdmin
      .from("collections")
      .select("user_id")
      .eq("id", id)
      .single();

    if (!collection || collection.user_id !== user.id) {
      return apiResponse({ error: "Forbidden" }, 403);
    }

    const { error } = await supabaseAdmin
      .from("collections")
      .delete()
      .eq("id", id);

    if (error) return apiResponse({ error: error.message }, 500);
    return apiResponse({ success: true });
  } catch (error) {
    return apiError(error);
  }
}
