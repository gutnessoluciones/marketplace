import { SupabaseClient } from "@supabase/supabase-js";
import { AppError } from "@/lib/utils";

export class FavoritesService {
  constructor(private supabase: SupabaseClient) {}

  async isFavorite(userId: string, productId: string) {
    const { data } = await this.supabase
      .from("favorites")
      .select("id")
      .eq("user_id", userId)
      .eq("product_id", productId)
      .maybeSingle();
    return !!data;
  }

  async getUserFavoriteIds(userId: string) {
    const { data } = await this.supabase
      .from("favorites")
      .select("product_id")
      .eq("user_id", userId);
    return (data ?? []).map((f) => f.product_id);
  }

  async toggle(userId: string, productId: string) {
    const existing = await this.isFavorite(userId, productId);

    if (existing) {
      const { error } = await this.supabase
        .from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("product_id", productId);
      if (error) throw new AppError(error.message, 500);
      return { favorited: false };
    } else {
      const { error } = await this.supabase
        .from("favorites")
        .insert({ user_id: userId, product_id: productId });
      if (error) throw new AppError(error.message, 500);
      return { favorited: true };
    }
  }

  async list(userId: string, page = 1, limit = 24) {
    const { data, error, count } = await this.supabase
      .from("favorites")
      .select(
        "*, product:products(*, seller:profiles!seller_id(id, display_name, avatar_url))",
        { count: "exact" },
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw new AppError(error.message, 500);
    return { data: data ?? [], total: count, page, limit };
  }
}
