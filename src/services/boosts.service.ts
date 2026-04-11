import { SupabaseClient } from "@supabase/supabase-js";
import { AppError } from "@/lib/utils";

const BOOST_DURATION_DAYS: Record<string, number> = {
  featured: 7,
  top: 3,
  highlight: 1,
};

export class BoostsService {
  constructor(private supabase: SupabaseClient) {}

  async create(sellerId: string, productId: string, boostType: string) {
    // Verify product ownership
    const { data: product, error: pErr } = await this.supabase
      .from("products")
      .select("id, seller_id, status")
      .eq("id", productId)
      .eq("seller_id", sellerId)
      .eq("status", "active")
      .single();

    if (pErr || !product) throw new AppError("Producto no encontrado", 404);

    // Check for active boost
    const { data: existing } = await this.supabase
      .from("product_boosts")
      .select("id")
      .eq("product_id", productId)
      .eq("active", true)
      .gt("ends_at", new Date().toISOString())
      .maybeSingle();

    if (existing)
      throw new AppError("Este producto ya tiene un boost activo", 409);

    const days = BOOST_DURATION_DAYS[boostType] ?? 7;
    const endsAt = new Date(
      Date.now() + days * 24 * 60 * 60 * 1000,
    ).toISOString();

    const { data, error } = await this.supabase
      .from("product_boosts")
      .insert({
        product_id: productId,
        seller_id: sellerId,
        boost_type: boostType,
        ends_at: endsAt,
      })
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);
    return data;
  }

  async getActiveBoost(productId: string) {
    const { data } = await this.supabase
      .from("product_boosts")
      .select("*")
      .eq("product_id", productId)
      .eq("active", true)
      .gt("ends_at", new Date().toISOString())
      .maybeSingle();

    return data;
  }

  async listBySeller(sellerId: string) {
    const { data, error } = await this.supabase
      .from("product_boosts")
      .select("*, product:products(id, title, images)")
      .eq("seller_id", sellerId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw new AppError(error.message, 500);
    return data ?? [];
  }

  /** Get boosted product IDs for prioritizing in listings */
  async getBoostedProductIds(): Promise<string[]> {
    const { data } = await this.supabase
      .from("product_boosts")
      .select("product_id")
      .eq("active", true)
      .gt("ends_at", new Date().toISOString());

    return data?.map((b) => b.product_id) ?? [];
  }
}
