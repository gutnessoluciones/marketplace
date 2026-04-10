-- ============================================
-- Add bio, phone, location, website to profiles
-- ============================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS website TEXT;

-- ============================================
-- Make category NOT NULL on products with a valid value
-- ============================================
-- First, update any existing products with NULL category
UPDATE products SET category = 'complementos-flamencos' WHERE category IS NULL;
UPDATE products SET category = 'complementos-flamencos'
  WHERE category NOT IN ('feria', 'camino', 'complementos-flamencos', 'invitada-flamenca', 'moda-infantil', 'equitacion', 'zapatos');

-- Add NOT NULL constraint
ALTER TABLE products ALTER COLUMN category SET NOT NULL;

-- Add CHECK constraint for valid categories
ALTER TABLE products ADD CONSTRAINT products_category_check
  CHECK (category IN ('feria', 'camino', 'complementos-flamencos', 'invitada-flamenca', 'moda-infantil', 'equitacion', 'zapatos'));
