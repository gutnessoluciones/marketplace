// ── Profile ──────────────────────────────────────────────
export interface Profile {
  id: string;
  role: "buyer" | "seller";
  display_name: string;
  avatar_url: string | null;
  banner_url: string | null;
  bio: string | null;
  phone: string | null;
  location: string | null;
  website: string | null;
  stripe_account_id: string | null;
  stripe_onboarding_complete: boolean;
  verification_status: string | null;
  verification_badge: string | null;
  is_banned: boolean;
  shipping_policy: string | null;
  return_policy: string | null;
  created_at: string;
  updated_at: string;
}

// ── Site Settings ────────────────────────────────────────
export interface SiteSetting {
  key: string;
  value: Record<string, unknown>;
  description: string | null;
  updated_at: string;
  updated_by: string | null;
}

// ── Admin User ───────────────────────────────────────────
export type AdminRole = "owner" | "dev" | "admin";

export interface AdminUser {
  id: string;
  user_id: string;
  role: AdminRole;
  created_at: string;
  profile?: Pick<Profile, "id" | "display_name" | "avatar_url">;
}

// ── Product ──────────────────────────────────────────────
export type ProductStatus = "draft" | "active" | "sold" | "archived";

export interface Product {
  id: string;
  seller_id: string;
  title: string;
  description: string | null;
  price: number; // cents
  currency: string;
  images: string[];
  status: ProductStatus;
  category: string;
  color: string | null;
  size: string | null;
  condition: string | null;
  brand: string | null;
  material: string | null;
  views_count: number;
  likes_count: number;
  negotiable: boolean;
  stock: number;
  weight_kg: number | null;
  shipping_from: string | null;
  created_at: string;
  updated_at: string;
  seller?: Pick<
    Profile,
    "id" | "display_name" | "avatar_url" | "verification_status"
  >;
}

// ── Order ────────────────────────────────────────────────
export type OrderStatus =
  | "pending"
  | "paid"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface Order {
  id: string;
  buyer_id: string;
  seller_id: string;
  product_id: string;
  quantity: number;
  total_amount: number;
  platform_fee: number;
  status: OrderStatus;
  stripe_payment_intent_id: string | null;
  stripe_checkout_session_id: string | null;
  shipping_address: Record<string, unknown> | null;
  coupon_id: string | null;
  discount_amount: number;
  created_at: string;
  updated_at: string;
  product?: Product;
  seller?: Pick<
    Profile,
    "id" | "display_name" | "avatar_url" | "verification_status"
  >;
}

// ── Payment ──────────────────────────────────────────────
export type PaymentStatus = "pending" | "succeeded" | "failed" | "refunded";

export interface Payment {
  id: string;
  order_id: string;
  stripe_payment_intent_id: string;
  amount: number;
  platform_fee: number;
  seller_payout: number;
  status: PaymentStatus;
  stripe_transfer_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

// ── Review ───────────────────────────────────────────────
export interface Review {
  id: string;
  order_id: string;
  product_id: string;
  buyer_id: string;
  seller_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  buyer?: Pick<Profile, "id" | "display_name" | "avatar_url">;
}

// ── Offer ────────────────────────────────────────────────
export type OfferStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "expired"
  | "cancelled"
  | "paid"
  | "countered";

export interface Offer {
  id: string;
  product_id: string;
  buyer_id: string;
  seller_id: string;
  amount: number; // cents
  original_price: number; // cents
  status: OfferStatus;
  message: string | null;
  seller_response: string | null;
  counter_amount: number | null;
  counter_expires_at: string | null;
  order_id: string | null;
  expires_at: string;
  created_at: string;
  updated_at: string;
  product?: Product;
  buyer?: Pick<Profile, "id" | "display_name" | "avatar_url">;
  seller?: Pick<
    Profile,
    "id" | "display_name" | "avatar_url" | "verification_status"
  >;
}

// ── Buyer Review ─────────────────────────────────────────
export interface BuyerReview {
  id: string;
  order_id: string;
  seller_id: string;
  buyer_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  seller?: Pick<
    Profile,
    "id" | "display_name" | "avatar_url" | "verification_status"
  >;
}

// ── Dispute ──────────────────────────────────────────────
export type DisputeStatus =
  | "open"
  | "in_review"
  | "resolved_buyer"
  | "resolved_seller"
  | "closed";
export type DisputeReason =
  | "not_received"
  | "defective"
  | "wrong_item"
  | "not_as_described"
  | "late_shipment"
  | "payment_issue"
  | "other";

export interface Dispute {
  id: string;
  order_id: string;
  reporter_id: string;
  reporter_role: "buyer" | "seller";
  reason: DisputeReason;
  description: string;
  evidence_urls: string[];
  status: DisputeStatus;
  admin_notes: string | null;
  resolution: string | null;
  created_at: string;
  updated_at: string;
  order?: Order;
}

// ── Coupon ───────────────────────────────────────────────
export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_purchase: number;
  max_uses: number | null;
  current_uses: number;
  valid_from: string;
  valid_until: string | null;
  active: boolean;
  created_at: string;
}

// ── Product Boost ────────────────────────────────────────
export interface ProductBoost {
  id: string;
  product_id: string;
  seller_id: string;
  boost_type: "featured" | "top" | "highlight";
  starts_at: string;
  ends_at: string;
  active: boolean;
  created_at: string;
}

// ── API Responses ────────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  total: number | null;
  page: number;
  limit: number;
}
