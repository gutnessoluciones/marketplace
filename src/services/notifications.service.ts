import { SupabaseClient } from "@supabase/supabase-js";
import { AppError } from "@/lib/utils";

export class NotificationsService {
  constructor(private supabase: SupabaseClient) {}

  async list(userId: string, page = 1, limit = 20) {
    const { data, error, count } = await this.supabase
      .from("notifications")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw new AppError(error.message, 500);
    return { data: data ?? [], total: count, page, limit };
  }

  async unreadCount(userId: string) {
    const { count, error } = await this.supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("read", false);

    if (error) throw new AppError(error.message, 500);
    return count ?? 0;
  }

  async markAsRead(userId: string, notificationId: string) {
    const { error } = await this.supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId)
      .eq("user_id", userId);

    if (error) throw new AppError(error.message, 500);
  }

  async markAllAsRead(userId: string) {
    const { error } = await this.supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId)
      .eq("read", false);

    if (error) throw new AppError(error.message, 500);
  }

  async create(input: {
    user_id: string;
    type: string;
    title: string;
    message: string;
    data?: Record<string, unknown>;
  }) {
    const { data, error } = await this.supabase
      .from("notifications")
      .insert(input)
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);
    return data;
  }
}
