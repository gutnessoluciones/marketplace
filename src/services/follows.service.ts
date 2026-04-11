import { SupabaseClient } from "@supabase/supabase-js";
import { AppError } from "@/lib/utils";

export class FollowsService {
  constructor(private supabase: SupabaseClient) {}

  async isFollowing(followerId: string, followingId: string) {
    const { data } = await this.supabase
      .from("follows")
      .select("id")
      .eq("follower_id", followerId)
      .eq("following_id", followingId)
      .maybeSingle();
    return !!data;
  }

  async follow(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new AppError("No puedes seguirte a ti mismo", 400);
    }
    const { error } = await this.supabase
      .from("follows")
      .insert({ follower_id: followerId, following_id: followingId });

    if (error) {
      if (error.code === "23505") return; // already following
      throw new AppError(error.message, 500);
    }
  }

  async unfollow(followerId: string, followingId: string) {
    const { error } = await this.supabase
      .from("follows")
      .delete()
      .eq("follower_id", followerId)
      .eq("following_id", followingId);

    if (error) throw new AppError(error.message, 500);
  }

  async getFollowers(userId: string, page = 1, limit = 20) {
    const { data, error, count } = await this.supabase
      .from("follows")
      .select(
        "*, follower:profiles!follower_id(id, display_name, avatar_url, bio)",
        { count: "exact" },
      )
      .eq("following_id", userId)
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw new AppError(error.message, 500);
    return { data: data ?? [], total: count, page, limit };
  }

  async getFollowing(userId: string, page = 1, limit = 20) {
    const { data, error, count } = await this.supabase
      .from("follows")
      .select(
        "*, following:profiles!following_id(id, display_name, avatar_url, bio)",
        { count: "exact" },
      )
      .eq("follower_id", userId)
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw new AppError(error.message, 500);
    return { data: data ?? [], total: count, page, limit };
  }
}
