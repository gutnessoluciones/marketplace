-- Migration 011: Utility functions
-- increment_coupon_uses function
CREATE OR REPLACE FUNCTION increment_coupon_uses(coupon_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE coupons SET current_uses = current_uses + 1 WHERE id = coupon_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
