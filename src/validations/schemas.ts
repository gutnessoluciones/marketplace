import { z } from "zod";

// ── Products ─────────────────────────────────────────────
export const VALID_CATEGORIES = [
  "feria",
  "camino",
  "complementos-flamencos",
  "invitada-flamenca",
  "moda-infantil",
  "equitacion",
  "zapatos",
] as const;

export const VALID_COLORS = [
  "blanco",
  "negro",
  "rojo",
  "rosa",
  "fucsia",
  "naranja",
  "amarillo",
  "verde",
  "azul",
  "morado",
  "burdeos",
  "dorado",
  "plateado",
  "beige",
  "marron",
  "multicolor",
] as const;

export const VALID_CONDITIONS = [
  "nuevo",
  "como-nuevo",
  "bueno",
  "aceptable",
] as const;

export const VALID_SIZES = [
  "XXS",
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "3XL",
  "34",
  "36",
  "38",
  "40",
  "42",
  "44",
  "46",
  "48",
  "unica",
] as const;

export const createProductSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(5000).optional(),
  price: z.number().int().positive().max(99999999),
  category: z.enum(VALID_CATEGORIES),
  color: z.string().max(30).optional().nullable(),
  size: z.string().max(10).optional().nullable(),
  condition: z.enum(VALID_CONDITIONS).optional().nullable(),
  brand: z.string().max(100).optional().nullable(),
  material: z.string().max(100).optional().nullable(),
  stock: z.number().int().min(0).default(1),
  images: z.array(z.string().url()).max(10).optional(),
  status: z.enum(["active", "draft"]).optional(),
  negotiable: z.boolean().optional(),
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
  coupon_code: z.string().max(50).optional(),
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
  location: z.string().max(100).optional().nullable(),
  website: z.string().max(200).optional().nullable(),
});

// ── Site Settings ────────────────────────────────────────
export const updateSiteSettingSchema = z.object({
  key: z.string().min(1),
  value: z.record(z.string(), z.unknown()),
});

// ── Offers ───────────────────────────────────────────────
export const createOfferSchema = z.object({
  product_id: z.string().uuid(),
  amount: z.number().int().positive().max(99999999),
  message: z.string().max(500).optional(),
});

export const respondOfferSchema = z.object({
  response: z.string().max(500).optional(),
});
