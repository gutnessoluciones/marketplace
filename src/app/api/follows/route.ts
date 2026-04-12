import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { FollowsService } from "@/services/follows.service";
import { apiResponse, apiError } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// GET /api/follows?following_id=xxx — check if current user follows someone
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return apiResponse({ following: false });

    const followingId = request.nextUrl.searchParams.get("following_id");
    if (!followingId)
      return apiResponse({ error: "following_id required" }, 400);

    if (!uuidRegex.test(followingId))
      return apiResponse({ error: "following_id inválido" }, 400);

    const service = new FollowsService(supabase);
    const following = await service.isFollowing(user.id, followingId);
    return apiResponse({ following });
  } catch (error) {
    return apiError(error);
  }
}

// POST /api/follows — follow a user
export async function POST(request: NextRequest) {
  const rl = await rateLimit(request, "api");
  if (rl) return rl;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return apiResponse({ error: "Unauthorized" }, 401);

    const body = await request.json();
    const followingId = body.following_id;
    if (!followingId)
      return apiResponse({ error: "following_id required" }, 400);

    // UUID validation
    if (!uuidRegex.test(followingId))
      return apiResponse({ error: "following_id inválido" }, 400);

    const service = new FollowsService(supabase);
    await service.follow(user.id, followingId);
    return apiResponse({ success: true });
  } catch (error) {
    return apiError(error);
  }
}

// DELETE /api/follows — unfollow a user
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return apiResponse({ error: "Unauthorized" }, 401);

    const followingId = request.nextUrl.searchParams.get("following_id");
    if (!followingId)
      return apiResponse({ error: "following_id required" }, 400);

    // UUID validation
    if (!uuidRegex.test(followingId))
      return apiResponse({ error: "following_id inválido" }, 400);

    const service = new FollowsService(supabase);
    await service.unfollow(user.id, followingId);
    return apiResponse({ success: true });
  } catch (error) {
    return apiError(error);
  }
}
