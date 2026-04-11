-- Migration 009: Offers system (Vinted-style)

-- ── Offers table ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL CHECK (amount > 0),          -- cents
  original_price INTEGER NOT NULL CHECK (original_price > 0), -- product price snapshot
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'rejected', 'expired', 'cancelled', 'paid')),
  message TEXT,                                         -- optional buyer message
  seller_response TEXT,                                 -- optional seller response
  order_id UUID REFERENCES orders(id),                  -- linked order after acceptance
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '48 hours'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_offers_product ON offers(product_id);
CREATE INDEX IF NOT EXISTS idx_offers_buyer ON offers(buyer_id);
CREATE INDEX IF NOT EXISTS idx_offers_seller ON offers(seller_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status);
CREATE INDEX IF NOT EXISTS idx_offers_expires ON offers(expires_at) WHERE status = 'pending';

-- Only one pending offer per buyer per product at a time
CREATE UNIQUE INDEX IF NOT EXISTS idx_offers_unique_pending
  ON offers(product_id, buyer_id) WHERE status = 'pending';

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_offers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_offers_updated_at ON offers;
CREATE TRIGGER trigger_offers_updated_at
  BEFORE UPDATE ON offers
  FOR EACH ROW
  EXECUTE FUNCTION update_offers_updated_at();

-- Auto-expire offers (called by cron or on read)
CREATE OR REPLACE FUNCTION expire_pending_offers()
RETURNS void AS $$
BEGIN
  UPDATE offers
  SET status = 'expired', updated_at = NOW()
  WHERE status = 'pending' AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── RLS ──────────────────────────────────────────────────
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'offers_buyer_read') THEN
    CREATE POLICY offers_buyer_read ON offers
      FOR SELECT USING (auth.uid() = buyer_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'offers_seller_read') THEN
    CREATE POLICY offers_seller_read ON offers
      FOR SELECT USING (auth.uid() = seller_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'offers_buyer_insert') THEN
    CREATE POLICY offers_buyer_insert ON offers
      FOR INSERT WITH CHECK (auth.uid() = buyer_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'offers_buyer_update') THEN
    CREATE POLICY offers_buyer_update ON offers
      FOR UPDATE USING (auth.uid() = buyer_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'offers_seller_update') THEN
    CREATE POLICY offers_seller_update ON offers
      FOR UPDATE USING (auth.uid() = seller_id);
  END IF;
END $$;
