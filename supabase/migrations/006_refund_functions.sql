-- Migration: Refund & account deletion support functions

-- Increment stock (for refunds)
CREATE OR REPLACE FUNCTION increment_stock(p_id UUID, qty INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE products SET stock = stock + qty WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION increment_stock(UUID, INTEGER) TO service_role;
