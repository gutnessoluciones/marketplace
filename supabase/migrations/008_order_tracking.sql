-- Migration: Add tracking carrier + timestamp fields to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_carrier TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;
