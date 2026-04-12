import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { apiResponse, apiError } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";
import { NextRequest } from "next/server";

// DELETE /api/auth/delete-account — GDPR account deletion
export async function DELETE(request: NextRequest) {
  try {
    const limited = await rateLimit(request, "api");
    if (limited) return limited;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return apiResponse({ error: "No autenticado" }, 401);

    const userId = user.id;

    // Soft-delete: anonymize profile instead of hard-delete
    // This preserves order history integrity
    await supabaseAdmin
      .from("profiles")
      .update({
        display_name: "Usuario eliminado",
        avatar_url: null,
        banner_url: null,
        bio: null,
        phone: null,
        location: null,
        website: null,
        is_banned: true,
      })
      .eq("id", userId);

    // Delete personal data
    await supabaseAdmin.from("addresses").delete().eq("user_id", userId);
    await supabaseAdmin
      .from("push_subscriptions")
      .delete()
      .eq("user_id", userId);
    await supabaseAdmin.from("favorites").delete().eq("user_id", userId);
    await supabaseAdmin.from("follows").delete().eq("follower_id", userId);
    await supabaseAdmin.from("follows").delete().eq("following_id", userId);
    await supabaseAdmin.from("user_interests").delete().eq("user_id", userId);

    // Archive products (don't delete — orders reference them)
    await supabaseAdmin
      .from("products")
      .update({ status: "archived" })
      .eq("seller_id", userId);

    // Delete Supabase auth user (sign out everywhere)
    await supabaseAdmin.auth.admin.deleteUser(userId);

    return apiResponse({ deleted: true });
  } catch (error) {
    return apiError(error);
  }
}
