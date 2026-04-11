import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/admin";
import { apiResponse, apiError } from "@/lib/utils";
import { z } from "zod";

const updateFairSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  location: z.string().min(2).max(200).optional(),
  province: z.string().min(2).max(100).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  description: z.string().max(1000).optional(),
  image_url: z.string().url().nullable().optional(),
  website_url: z.string().url().nullable().optional(),
  is_verified: z.boolean().optional(),
});

// PATCH /api/admin/fairs/[id] — Update fair
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await isAdmin();
    if (!auth.authorized) return apiResponse({ error: "Forbidden" }, 403);

    const { id } = await params;
    const body = await request.json();
    const parsed = updateFairSchema.safeParse(body);
    if (!parsed.success)
      return apiResponse({ error: parsed.error.flatten() }, 400);

    const { data, error } = await supabaseAdmin
      .from("fairs")
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

// DELETE /api/admin/fairs/[id] — Delete fair
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await isAdmin();
    if (!auth.authorized) return apiResponse({ error: "Forbidden" }, 403);

    const { id } = await params;
    const { error } = await supabaseAdmin.from("fairs").delete().eq("id", id);

    if (error) return apiResponse({ error: error.message }, 500);
    return apiResponse({ success: true });
  } catch (error) {
    return apiError(error);
  }
}
