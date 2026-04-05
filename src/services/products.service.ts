import { SupabaseClient } from "@supabase/supabase-js";
import { AppError } from "@/lib/utils";

interface CreateProductInput {
  title: string;
  description?: string;
  price: number;
  category?: string;
  stock?: number;
  images?: string[];
  status?: "active" | "draft";
}

export class ProductsService {
  constructor(private supabase: SupabaseClient) {}

  async list(page = 1, limit = 20, category?: string, q?: string) {
    let query = this.supabase
      .from("products")
      .select("*, seller:profiles!seller_id(id, display_name, avatar_url)", {
        count: "exact",
      })
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (category) query = query.eq("category", category);
    if (q) {
      // Use full-text search if available, fallback to ilike
      const ftsQuery = q.trim().split(/\s+/).join(" & ");
      query = query.or(`fts.wfts(spanish).${ftsQuery},title.ilike.%${q}%`);
    }

    const { data, error, count } = await query;

    // If FTS column doesn't exist yet (migration not applied), fallback
    if (error?.message?.includes("fts")) {
      let fallbackQuery = this.supabase
        .from("products")
        .select("*, seller:profiles!seller_id(id, display_name, avatar_url)", {
          count: "exact",
        })
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (category) fallbackQuery = fallbackQuery.eq("category", category);
      if (q) fallbackQuery = fallbackQuery.ilike("title", `%${q}%`);

      const fallback = await fallbackQuery;
      if (fallback.error) throw new AppError(fallback.error.message, 500);
      return { data: fallback.data ?? [], total: fallback.count, page, limit };
    }

    if (error) throw new AppError(error.message, 500);
    return { data: data ?? [], total: count, page, limit };
  }

  async getById(id: string) {
    const { data, error } = await this.supabase
      .from("products")
      .select("*, seller:profiles!seller_id(id, display_name, avatar_url)")
      .eq("id", id)
      .single();

    if (error || !data) throw new AppError("Product not found", 404);
    return data;
  }

  async listBySeller(sellerId: string) {
    const { data, error } = await this.supabase
      .from("products")
      .select("*")
      .eq("seller_id", sellerId)
      .order("created_at", { ascending: false });

    if (error) throw new AppError(error.message, 500);
    return data ?? [];
  }

  async create(sellerId: string, input: CreateProductInput) {
    const { data, error } = await this.supabase
      .from("products")
      .insert({
        ...input,
        seller_id: sellerId,
        status: input.status ?? "active",
      })
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);
    return data;
  }

  async update(
    id: string,
    sellerId: string,
    input: Partial<CreateProductInput>,
  ) {
    const { data, error } = await this.supabase
      .from("products")
      .update(input)
      .eq("id", id)
      .eq("seller_id", sellerId)
      .select()
      .single();

    if (error || !data)
      throw new AppError("Product not found or unauthorized", 404);
    return data;
  }

  async delete(id: string, sellerId: string) {
    const { error, count } = await this.supabase
      .from("products")
      .delete()
      .eq("id", id)
      .eq("seller_id", sellerId);

    if (error) throw new AppError("Failed to delete product", 500);
    if (count === 0)
      throw new AppError("Product not found or unauthorized", 404);
  }
}
