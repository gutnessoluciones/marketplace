-- Migration 010: Phase 2 features
-- - Counteroffers: add counter_amount to offers
-- - Buyer reviews: seller can rate buyers
-- - Disputes system
-- - Coupons
-- - Product boosts
-- - Negotiable flag on products
-- - Shipping tracking fields (already exist on orders, just ensuring)

-- ── 1. Counteroffers ─────────────────────────────────────
ALTER TABLE offers ADD COLUMN IF NOT EXISTS counter_amount INTEGER CHECK (counter_amount > 0);
ALTER TABLE offers ADD COLUMN IF NOT EXISTS counter_expires_at TIMESTAMPTZ;

-- Drop and recreate the status check to include 'countered'
ALTER TABLE offers DROP CONSTRAINT IF EXISTS offers_status_check;
ALTER TABLE offers ADD CONSTRAINT offers_status_check
  CHECK (status IN ('pending', 'accepted', 'rejected', 'expired', 'cancelled', 'paid', 'countered'));

-- ── 2. Buyer reviews (seller → buyer) ───────────────────
CREATE TABLE IF NOT EXISTS buyer_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(order_id)
);

CREATE INDEX IF NOT EXISTS idx_buyer_reviews_buyer ON buyer_reviews(buyer_id);
CREATE INDEX IF NOT EXISTS idx_buyer_reviews_seller ON buyer_reviews(seller_id);

ALTER TABLE buyer_reviews ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'buyer_reviews_read') THEN
    CREATE POLICY buyer_reviews_read ON buyer_reviews FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'buyer_reviews_seller_insert') THEN
    CREATE POLICY buyer_reviews_seller_insert ON buyer_reviews
      FOR INSERT WITH CHECK (auth.uid() = seller_id);
  END IF;
END $$;

-- ── 3. Disputes ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reporter_role TEXT NOT NULL CHECK (reporter_role IN ('buyer', 'seller')),
  reason TEXT NOT NULL CHECK (reason IN (
    'not_received', 'defective', 'wrong_item', 'not_as_described',
    'late_shipment', 'payment_issue', 'other'
  )),
  description TEXT NOT NULL,
  evidence_urls TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'in_review', 'resolved_buyer', 'resolved_seller', 'closed')),
  admin_notes TEXT,
  resolution TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_disputes_order ON disputes(order_id);
CREATE INDEX IF NOT EXISTS idx_disputes_reporter ON disputes(reporter_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);

ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'disputes_reporter_read') THEN
    CREATE POLICY disputes_reporter_read ON disputes FOR SELECT
      USING (auth.uid() = reporter_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'disputes_order_party_read') THEN
    CREATE POLICY disputes_order_party_read ON disputes FOR SELECT
      USING (EXISTS (
        SELECT 1 FROM orders WHERE orders.id = disputes.order_id
        AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
      ));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'disputes_insert') THEN
    CREATE POLICY disputes_insert ON disputes
      FOR INSERT WITH CHECK (auth.uid() = reporter_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'disputes_update_reporter') THEN
    CREATE POLICY disputes_update_reporter ON disputes
      FOR UPDATE USING (auth.uid() = reporter_id);
  END IF;
END $$;

-- Updated_at trigger for disputes
CREATE OR REPLACE FUNCTION update_disputes_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_disputes_updated_at ON disputes;
CREATE TRIGGER trigger_disputes_updated_at
  BEFORE UPDATE ON disputes FOR EACH ROW
  EXECUTE FUNCTION update_disputes_updated_at();

-- ── 4. Coupons ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value INTEGER NOT NULL CHECK (discount_value > 0),
  min_purchase INTEGER DEFAULT 0,
  max_uses INTEGER,
  current_uses INTEGER NOT NULL DEFAULT 0,
  valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);

-- Coupon usage tracking
CREATE TABLE IF NOT EXISTS coupon_uses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(coupon_id, user_id)
);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_uses ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'coupons_read_active') THEN
    CREATE POLICY coupons_read_active ON coupons FOR SELECT USING (active = true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'coupon_uses_user_read') THEN
    CREATE POLICY coupon_uses_user_read ON coupon_uses FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'coupon_uses_insert') THEN
    CREATE POLICY coupon_uses_insert ON coupon_uses FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Add discount columns to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_id UUID REFERENCES coupons(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount INTEGER DEFAULT 0;

-- ── 5. Product boosts ────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_boosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  boost_type TEXT NOT NULL DEFAULT 'featured' CHECK (boost_type IN ('featured', 'top', 'highlight')),
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ends_at TIMESTAMPTZ NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_boosts_product ON product_boosts(product_id);
CREATE INDEX IF NOT EXISTS idx_boosts_active ON product_boosts(active, ends_at);

ALTER TABLE product_boosts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'boosts_read') THEN
    CREATE POLICY boosts_read ON product_boosts FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'boosts_seller_insert') THEN
    CREATE POLICY boosts_seller_insert ON product_boosts
      FOR INSERT WITH CHECK (auth.uid() = seller_id);
  END IF;
END $$;

-- ── 6. Negotiable flag on products ───────────────────────
ALTER TABLE products ADD COLUMN IF NOT EXISTS negotiable BOOLEAN DEFAULT false;
