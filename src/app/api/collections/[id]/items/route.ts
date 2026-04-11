import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { apiResponse, apiError } from "@/lib/utils";
import { z } from "zod";

const addItemSchema = z.object({
  product_id: z.string().uuid(),
});

// GET /api/collections/[id]/items — Get collection items
export async function GET(
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

    // Verify ownership or public
    const { data: collection } = await supabaseAdmin
      .from("collections")
      .select("user_id, is_public")
      .eq("id", id)
      .single();

    if (
      !collection ||
      (!collection.is_public && collection.user_id !== user.id)
    ) {
      return apiResponse({ error: "Not found" }, 404);
    }

    const { data, error } = await supabaseAdmin
      .from("collection_items")
      .select(
        "*, product:products(id, title, price, images, status, seller:profiles!seller_id(display_name))",
      )
      .eq("collection_id", id)
      .order("added_at", { ascending: false });

    if (error) return apiResponse({ error: error.message }, 500);
    return apiResponse({ data });
  } catch (error) {
    return apiError(error);
  }
}

// POST /api/collections/[id]/items — Add item to collection
export async function POST(
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

    // Verify ownership
    const { data: collection } = await supabaseAdmin
      .from("collections")
      .select("user_id")
      .eq("id", id)
      .single();

    if (!collection || collection.user_id !== user.id) {
      return apiResponse({ error: "Forbidden" }, 403);
    }

    const body = await request.json();
    const parsed = addItemSchema.safeParse(body);
    if (!parsed.success)
      return apiResponse({ error: parsed.error.flatten() }, 400);

    const { error } = await supabaseAdmin.from("collection_items").insert({
      collection_id: id,
      product_id: parsed.data.product_id,
    });

    if (error) {
      if (error.code === "23505") {
        return apiResponse({ error: "Ya está en la colección" }, 409);
      }
      return apiResponse({ error: error.message }, 500);
    }

    return apiResponse({ success: true }, 201);
  } catch (error) {
    return apiError(error);
  }
}

// DELETE /api/collections/[id]/items — Remove item from collection
export async function DELETE(
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

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("product_id");
    if (!productId) return apiResponse({ error: "product_id required" }, 400);

    // Verify ownership
    const { data: collection } = await supabaseAdmin
      .from("collections")
      .select("user_id")
      .eq("id", id)
      .single();

    if (!collection || collection.user_id !== user.id) {
      return apiResponse({ error: "Forbidden" }, 403);
    }

    const { error } = await supabaseAdmin
      .from("collection_items")
      .delete()
      .eq("collection_id", id)
      .eq("product_id", productId);

    if (error) return apiResponse({ error: error.message }, 500);
    return apiResponse({ success: true });
  } catch (error) {
    return apiError(error);
  }
}
