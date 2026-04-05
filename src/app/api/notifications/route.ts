import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { NotificationsService } from "@/services/notifications.service";
import { apiResponse, apiError } from "@/lib/utils";

// GET /api/notifications?page=1
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return apiResponse({ error: "Unauthorized" }, 401);

    const { searchParams } = request.nextUrl;
    const page = Number(searchParams.get("page")) || 1;

    const service = new NotificationsService(supabase);
    const result = await service.list(user.id, page);
    const unread = await service.unreadCount(user.id);
    return apiResponse({ ...result, unread });
  } catch (error) {
    return apiError(error);
  }
}

// PATCH /api/notifications — mark all as read
export async function PATCH() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return apiResponse({ error: "Unauthorized" }, 401);

    const service = new NotificationsService(supabase);
    await service.markAllAsRead(user.id);
    return apiResponse({ success: true });
  } catch (error) {
    return apiError(error);
  }
}
