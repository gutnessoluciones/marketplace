import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { apiResponse, apiError } from "@/lib/utils";
import { z } from "zod";

const subscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
});

// POST /api/push/subscribe — Subscribe to push notifications
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return apiResponse({ error: "Unauthorized" }, 401);

    const body = await request.json();
    const parsed = subscribeSchema.safeParse(body);
    if (!parsed.success)
      return apiResponse({ error: parsed.error.flatten() }, 400);

    // Upsert subscription
    const { error } = await supabaseAdmin.from("push_subscriptions").upsert(
      {
        user_id: user.id,
        endpoint: parsed.data.endpoint,
        p256dh: parsed.data.keys.p256dh,
        auth: parsed.data.keys.auth,
      },
      { onConflict: "endpoint" },
    );

    if (error) return apiResponse({ error: error.message }, 500);
    return apiResponse({ success: true }, 201);
  } catch (error) {
    return apiError(error);
  }
}

// DELETE /api/push/subscribe — Unsubscribe from push notifications
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return apiResponse({ error: "Unauthorized" }, 401);

    const { endpoint } = await request.json();
    if (!endpoint) return apiResponse({ error: "Endpoint required" }, 400);

    const { error } = await supabaseAdmin
      .from("push_subscriptions")
      .delete()
      .eq("user_id", user.id)
      .eq("endpoint", endpoint);

    if (error) return apiResponse({ error: error.message }, 500);
    return apiResponse({ success: true });
  } catch (error) {
    return apiError(error);
  }
}
