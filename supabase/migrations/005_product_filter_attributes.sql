-- ============================================
-- Add filterable attributes to products
-- ============================================
ALTER TABLE products ADD COLUMN IF NOT EXISTS color TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS size TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS condition TEXT CHECK (condition IN ('nuevo', 'como-nuevo', 'bueno', 'aceptable'));
ALTER TABLE products ADD COLUMN IF NOT EXISTS brand TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS material TEXT;

CREATE INDEX IF NOT EXISTS idx_products_color ON products(color);
CREATE INDEX IF NOT EXISTS idx_products_size ON products(size);
CREATE INDEX IF NOT EXISTS idx_products_condition ON products(condition);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
