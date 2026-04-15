-- ============================================
-- Add subcategory column to products
-- ============================================
ALTER TABLE products ADD COLUMN IF NOT EXISTS subcategory TEXT;

CREATE INDEX IF NOT EXISTS idx_products_subcategory ON products(subcategory);
