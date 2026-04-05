// ── Profile ──────────────────────────────────────────────
export interface Profile {
  id: string;
  role: "buyer" | "seller";
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  phone: string | null;
  stripe_account_id: string | null;
  stripe_onboarding_complete: boolean;
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
  category: string | null;
  stock: number;
  created_at: string;
  updated_at: string;
  seller?: Pick<Profile, "id" | "display_name" | "avatar_url">;
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
  created_at: string;
  updated_at: string;
  product?: Product;
  seller?: Pick<Profile, "id" | "display_name" | "avatar_url">;
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

// ── API Responses ────────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  total: number | null;
  page: number;
  limit: number;
}
