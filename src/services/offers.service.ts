import { SupabaseClient } from "@supabase/supabase-js";
import { AppError } from "@/lib/utils";

const MIN_OFFER_PERCENT = 20; // minimum 20% of original price
const OFFER_EXPIRY_HOURS = 48;
const MAX_ACTIVE_OFFERS_PER_BUYER = 10;

// Conditions that allow offers (second-hand)
const OFFERABLE_CONDITIONS = ["como-nuevo", "bueno", "aceptable"];

interface CreateOfferInput {
  product_id: string;
  amount: number; // cents
  message?: string;
}

export class OffersService {
  constructor(private supabase: SupabaseClient) {}

  /** Check if a product accepts offers */
  static isOfferable(_condition: string | null, negotiable?: boolean): boolean {
    if (negotiable === false) return false;
    return true;
  }

  /** Create a new offer */
  async create(buyerId: string, input: CreateOfferInput) {
    // Expire old offers first
    await this.supabase.rpc("expire_pending_offers");

    // Fetch product
    const { data: product, error: pErr } = await this.supabase
      .from("products")
      .select("id, seller_id, price, stock, status, condition, negotiable")
      .eq("id", input.product_id)
      .eq("status", "active")
      .single();

    if (pErr || !product) throw new AppError("Producto no encontrado", 404);
    if (product.seller_id === buyerId)
      throw new AppError(
        "No puedes hacer ofertas en tus propios productos",
        400,
      );
    if (product.stock < 1) throw new AppError("Producto sin stock", 400);
    if (!OffersService.isOfferable(product.condition, product.negotiable))
      throw new AppError("Este producto no acepta ofertas", 400);

    // Validate amount
    const minAmount = Math.round(product.price * (MIN_OFFER_PERCENT / 100));
    if (input.amount < minAmount) {
      throw new AppError(
        `La oferta mínima es ${(minAmount / 100).toFixed(2)}€ (${MIN_OFFER_PERCENT}% del precio)`,
        400,
      );
    }
    if (input.amount >= product.price) {
      throw new AppError(
        "La oferta debe ser menor al precio del producto",
        400,
      );
    }

    // Check for existing pending offer
    const { data: existing } = await this.supabase
      .from("offers")
      .select("id")
      .eq("product_id", input.product_id)
      .eq("buyer_id", buyerId)
      .eq("status", "pending")
      .maybeSingle();

    if (existing)
      throw new AppError(
        "Ya tienes una oferta pendiente para este producto",
        409,
      );

    // Límite global de ofertas activas por comprador
    const { count: activeCount } = await this.supabase
      .from("offers")
      .select("id", { count: "exact", head: true })
      .eq("buyer_id", buyerId)
      .in("status", ["pending", "countered"]);

    if ((activeCount ?? 0) >= MAX_ACTIVE_OFFERS_PER_BUYER) {
      throw new AppError(
        `No puedes tener más de ${MAX_ACTIVE_OFFERS_PER_BUYER} ofertas activas a la vez`,
        429,
      );
    }

    const expiresAt = new Date(
      Date.now() + OFFER_EXPIRY_HOURS * 60 * 60 * 1000,
    ).toISOString();

    const { data: offer, error } = await this.supabase
      .from("offers")
      .insert({
        product_id: input.product_id,
        buyer_id: buyerId,
        seller_id: product.seller_id,
        amount: input.amount,
        original_price: product.price,
        message: input.message?.trim() || null,
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505")
        throw new AppError(
          "Ya tienes una oferta pendiente para este producto",
          409,
        );
      throw new AppError("Error al crear la oferta", 500);
    }

    return offer;
  }

  /** Accept an offer (seller only) — atomic to prevent race conditions */
  async accept(offerId: string, sellerId: string, response?: string) {
    await this.supabase.rpc("expire_pending_offers");

    // C4 FIX: Atomic acceptance via PostgreSQL function
    const { data: success, error } = await this.supabase.rpc(
      "accept_offer_atomic",
      {
        p_offer_id: offerId,
        p_seller_id: sellerId,
        p_response: response?.trim() || null,
      },
    );

    if (error) throw new AppError("Error al aceptar la oferta", 500);
    if (!success)
      throw new AppError(
        "Oferta no encontrada, ya no está pendiente, o no tienes permisos",
        400,
      );

    // Fetch the updated offer
    const { data: offer } = await this.supabase
      .from("offers")
      .select("*, product:products(id, price, stock, status, seller_id)")
      .eq("id", offerId)
      .single();

    if (!offer) throw new AppError("Oferta no encontrada", 404);
    return offer;
  }

  /** Reject an offer (seller only) */
  async reject(offerId: string, sellerId: string, response?: string) {
    const { data: offer, error: oErr } = await this.supabase
      .from("offers")
      .select("id, seller_id, buyer_id, amount, product_id, status")
      .eq("id", offerId)
      .single();

    if (oErr || !offer) throw new AppError("Oferta no encontrada", 404);
    if (offer.seller_id !== sellerId) throw new AppError("No autorizado", 403);
    if (offer.status !== "pending" && offer.status !== "countered")
      throw new AppError(`La oferta ya está ${offer.status}`, 400);

    const { error } = await this.supabase
      .from("offers")
      .update({
        status: "rejected",
        seller_response: response?.trim() || null,
      })
      .eq("id", offerId);

    if (error) throw new AppError("Error al rechazar la oferta", 500);
    return { ...offer, status: "rejected" };
  }

  /** Counter an offer (seller only) */
  async counter(
    offerId: string,
    sellerId: string,
    counterAmount: number,
    response?: string,
  ) {
    const { data: offer, error: oErr } = await this.supabase
      .from("offers")
      .select(
        "id, seller_id, buyer_id, amount, product_id, original_price, status",
      )
      .eq("id", offerId)
      .single();

    if (oErr || !offer) throw new AppError("Oferta no encontrada", 404);
    if (offer.seller_id !== sellerId) throw new AppError("No autorizado", 403);
    if (offer.status !== "pending")
      throw new AppError(`La oferta ya está ${offer.status}`, 400);

    if (counterAmount <= offer.amount)
      throw new AppError(
        "La contraoferta debe ser mayor a la oferta del comprador",
        400,
      );
    if (counterAmount >= offer.original_price)
      throw new AppError(
        "La contraoferta debe ser menor al precio original",
        400,
      );

    const counterExpires = new Date(
      Date.now() + OFFER_EXPIRY_HOURS * 60 * 60 * 1000,
    ).toISOString();

    const { error } = await this.supabase
      .from("offers")
      .update({
        status: "countered",
        counter_amount: counterAmount,
        counter_expires_at: counterExpires,
        seller_response: response?.trim() || null,
      })
      .eq("id", offerId);

    if (error) throw new AppError("Error al enviar la contraoferta", 500);
    return {
      ...offer,
      status: "countered",
      counter_amount: counterAmount,
      counter_expires_at: counterExpires,
    };
  }

  /** Accept a counteroffer (buyer only) — atomic */
  async acceptCounter(offerId: string, buyerId: string) {
    // C4 FIX: Atomic counter acceptance via PostgreSQL function
    const { data: success, error } = await this.supabase.rpc(
      "accept_counter_atomic",
      {
        p_offer_id: offerId,
        p_buyer_id: buyerId,
      },
    );

    if (error) throw new AppError("Error al aceptar la contraoferta", 500);
    if (!success)
      throw new AppError(
        "Contraoferta no encontrada, ha expirado, o no tienes permisos",
        400,
      );

    // Fetch updated offer
    const { data: offer } = await this.supabase
      .from("offers")
      .select(
        "id, buyer_id, seller_id, product_id, amount, counter_amount, status, counter_expires_at",
      )
      .eq("id", offerId)
      .single();

    if (!offer) throw new AppError("Oferta no encontrada", 404);
    return offer;
  }

  /** Reject a counteroffer (buyer only) */
  async rejectCounter(offerId: string, buyerId: string) {
    const { data: offer, error: oErr } = await this.supabase
      .from("offers")
      .select(
        "id, buyer_id, seller_id, product_id, amount, counter_amount, status",
      )
      .eq("id", offerId)
      .single();

    if (oErr || !offer) throw new AppError("Oferta no encontrada", 404);
    if (offer.buyer_id !== buyerId) throw new AppError("No autorizado", 403);
    if (offer.status !== "countered")
      throw new AppError("Esta oferta no tiene contraoferta activa", 400);

    const { error } = await this.supabase
      .from("offers")
      .update({ status: "rejected" })
      .eq("id", offerId);

    if (error) throw new AppError("Error al rechazar la contraoferta", 500);
    return { ...offer, status: "rejected" };
  }

  /** Cancel an offer (buyer only) */
  async cancel(offerId: string, buyerId: string) {
    const { data: offer, error: oErr } = await this.supabase
      .from("offers")
      .select("id, buyer_id, seller_id, amount, product_id, status")
      .eq("id", offerId)
      .single();

    if (oErr || !offer) throw new AppError("Oferta no encontrada", 404);
    if (offer.buyer_id !== buyerId) throw new AppError("No autorizado", 403);
    if (offer.status !== "pending")
      throw new AppError(
        `No se puede cancelar una oferta ${offer.status}`,
        400,
      );

    const { error } = await this.supabase
      .from("offers")
      .update({ status: "cancelled" })
      .eq("id", offerId);

    if (error) throw new AppError("Error al cancelar la oferta", 500);
    return { ...offer, status: "cancelled" };
  }

  /** List offers for a seller */
  async listBySeller(sellerId: string, status?: string, page = 1, limit = 20) {
    await this.supabase.rpc("expire_pending_offers");

    let query = this.supabase
      .from("offers")
      .select(
        "*, product:products(id, title, price, images, status), buyer:profiles!buyer_id(id, display_name, avatar_url)",
        { count: "exact" },
      )
      .eq("seller_id", sellerId);

    if (status) query = query.eq("status", status);

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw new AppError("Error al obtener ofertas", 500);
    return { data: data ?? [], total: count, page, limit };
  }

  /** List offers for a buyer */
  async listByBuyer(buyerId: string, page = 1, limit = 20) {
    await this.supabase.rpc("expire_pending_offers");

    const { data, error, count } = await this.supabase
      .from("offers")
      .select(
        "*, product:products(id, title, price, images, status, seller_id), seller:profiles!seller_id(id, display_name, avatar_url)",
        { count: "exact" },
      )
      .eq("buyer_id", buyerId)
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw new AppError("Error al obtener ofertas", 500);
    return { data: data ?? [], total: count, page, limit };
  }

  /** Get offers for a specific product */
  async listByProduct(productId: string, sellerId: string) {
    await this.supabase.rpc("expire_pending_offers");

    const { data, error } = await this.supabase
      .from("offers")
      .select("*, buyer:profiles!buyer_id(id, display_name, avatar_url)")
      .eq("product_id", productId)
      .eq("seller_id", sellerId)
      .order("created_at", { ascending: false });

    if (error) throw new AppError("Error al obtener ofertas", 500);
    return data ?? [];
  }

  /** Get buyer's active offer for a product */
  async getActiveOffer(productId: string, buyerId: string) {
    await this.supabase.rpc("expire_pending_offers");

    const { data, error } = await this.supabase
      .from("offers")
      .select("*")
      .eq("product_id", productId)
      .eq("buyer_id", buyerId)
      .in("status", ["pending", "accepted", "countered"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw new AppError("Error al obtener la oferta", 500);
    return data;
  }

  /** Count pending offers for seller (for badge) */
  async countPending(sellerId: string) {
    await this.supabase.rpc("expire_pending_offers");

    const { count, error } = await this.supabase
      .from("offers")
      .select("id", { count: "exact", head: true })
      .eq("seller_id", sellerId)
      .eq("status", "pending");

    if (error) throw new AppError("Error al contar ofertas", 500);
    return count ?? 0;
  }
}
