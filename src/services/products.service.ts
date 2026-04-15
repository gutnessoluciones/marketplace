import { SupabaseClient } from "@supabase/supabase-js";
import { AppError } from "@/lib/utils";

interface CreateProductInput {
  title: string;
  description?: string;
  price: number;
  category: string;
  subcategory?: string | null;
  color?: string | null;
  size?: string | null;
  condition?: string | null;
  brand?: string | null;
  material?: string | null;
  stock?: number;
  images?: string[];
  status?: "active" | "draft";
}

export class ProductsService {
  constructor(private supabase: SupabaseClient) {}

  async list(
    page = 1,
    limit = 20,
    category?: string,
    q?: string,
    sellerId?: string,
    filters?: {
      color?: string;
      size?: string;
      condition?: string;
      brand?: string;
      subcategory?: string;
      priceMin?: number;
      priceMax?: number;
      sort?: string;
    },
  ) {
    let query = this.supabase
      .from("products")
      .select(
        "*, seller:profiles!seller_id(id, display_name, avatar_url, verification_status)",
        {
          count: "exact",
        },
      )
      .eq("status", "active")
      .range((page - 1) * limit, page * limit - 1);

    if (category) query = query.eq("category", category);
    if (sellerId) query = query.eq("seller_id", sellerId);
    if (filters?.subcategory)
      query = query.eq("subcategory", filters.subcategory);
    if (filters?.color) query = query.eq("color", filters.color);
    if (filters?.size) query = query.eq("size", filters.size);
    if (filters?.condition) query = query.eq("condition", filters.condition);
    if (filters?.brand) query = query.ilike("brand", `%${filters.brand}%`);
    if (filters?.priceMin) query = query.gte("price", filters.priceMin);
    if (filters?.priceMax) query = query.lte("price", filters.priceMax);

    // Sorting
    if (filters?.sort === "price-asc") {
      query = query.order("price", { ascending: true });
    } else if (filters?.sort === "price-desc") {
      query = query.order("price", { ascending: false });
    } else if (filters?.sort === "newest") {
      query = query.order("created_at", { ascending: false });
    } else {
      // Default: most popular first
      query = query
        .order("views_count", { ascending: false })
        .order("created_at", { ascending: false });
    }

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
        .select(
          "*, seller:profiles!seller_id(id, display_name, avatar_url, verification_status)",
          {
            count: "exact",
          },
        )
        .eq("status", "active")
        .range((page - 1) * limit, page * limit - 1);

      if (category) fallbackQuery = fallbackQuery.eq("category", category);
      if (sellerId) fallbackQuery = fallbackQuery.eq("seller_id", sellerId);
      if (q) fallbackQuery = fallbackQuery.ilike("title", `%${q}%`);
      if (filters?.subcategory)
        fallbackQuery = fallbackQuery.eq("subcategory", filters.subcategory);
      if (filters?.color)
        fallbackQuery = fallbackQuery.eq("color", filters.color);
      if (filters?.size) fallbackQuery = fallbackQuery.eq("size", filters.size);
      if (filters?.condition)
        fallbackQuery = fallbackQuery.eq("condition", filters.condition);
      if (filters?.brand)
        fallbackQuery = fallbackQuery.ilike("brand", `%${filters.brand}%`);
      if (filters?.priceMin)
        fallbackQuery = fallbackQuery.gte("price", filters.priceMin);
      if (filters?.priceMax)
        fallbackQuery = fallbackQuery.lte("price", filters.priceMax);

      if (filters?.sort === "price-asc") {
        fallbackQuery = fallbackQuery.order("price", { ascending: true });
      } else if (filters?.sort === "price-desc") {
        fallbackQuery = fallbackQuery.order("price", { ascending: false });
      } else if (filters?.sort === "newest") {
        fallbackQuery = fallbackQuery.order("created_at", { ascending: false });
      } else {
        fallbackQuery = fallbackQuery
          .order("views_count", { ascending: false })
          .order("created_at", { ascending: false });
      }

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
      .select(
        "*, seller:profiles!seller_id(id, display_name, avatar_url, verification_status)",
      )
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
