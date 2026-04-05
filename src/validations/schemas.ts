import { z } from "zod";

// ── Products ─────────────────────────────────────────────
export const createProductSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(5000).optional(),
  price: z.number().int().positive().max(99999999),
  category: z.string().max(50).optional(),
  stock: z.number().int().min(0).default(1),
  images: z.array(z.string().url()).max(10).optional(),
  status: z.enum(["active", "draft"]).optional(),
});

export const updateProductSchema = createProductSchema.partial();

// ── Orders ───────────────────────────────────────────────
export const createOrderSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().int().positive().default(1),
  shipping_address: z
    .object({
      line1: z.string().min(1),
      line2: z.string().optional(),
      city: z.string().min(1),
      state: z.string().min(1),
      postal_code: z.string().min(1),
      country: z.string().length(2),
    })
    .optional(),
});

// ── Checkout ─────────────────────────────────────────────
export const checkoutSchema = z.object({
  orderId: z.string().uuid(),
});

// ── Reviews ──────────────────────────────────────────────
export const createReviewSchema = z.object({
  order_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

// ── Auth ─────────────────────────────────────────────────
export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
  display_name: z.string().min(2).max(100),
  role: z.enum(["buyer", "seller"]).default("buyer"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// ── Profile ──────────────────────────────────────────────
export const updateProfileSchema = z.object({
  display_name: z.string().min(2).max(100).optional(),
  bio: z.string().max(500).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
});

// ── Site Settings ────────────────────────────────────────
export const updateSiteSettingSchema = z.object({
  key: z.string().min(1),
  value: z.record(z.string(), z.unknown()),
});
