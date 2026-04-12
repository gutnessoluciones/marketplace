-- ============================================
-- Migration 004: Security — Atomic operations for stock, offers, idempotency
-- ============================================

-- ============================================
-- C1: Atomic stock decrement (prevents double-sell race condition)
-- Returns the order row if successful, null if stock insufficient
-- ============================================
CREATE OR REPLACE FUNCTION create_order_atomic(
  p_buyer_id UUID,
  p_seller_id UUID,
  p_product_id UUID,
  p_quantity INTEGER,
  p_total_amount INTEGER,
  p_platform_fee INTEGER,
  p_shipping_address JSONB DEFAULT NULL,
  p_coupon_id UUID DEFAULT NULL,
  p_discount_amount INTEGER DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_order_id UUID;
  v_rows_affected INTEGER;
BEGIN
  -- Atomically decrement stock only if sufficient
  UPDATE products
  SET stock = stock - p_quantity
  WHERE id = p_product_id
    AND status = 'active'
    AND stock >= p_quantity;

  GET DIAGNOSTICS v_rows_affected = ROW_COUNT;

  IF v_rows_affected = 0 THEN
    RAISE EXCEPTION 'INSUFFICIENT_STOCK' USING ERRCODE = 'P0001';
  END IF;

  -- Create the order
  INSERT INTO orders (
    buyer_id, seller_id, product_id, quantity,
    total_amount, platform_fee, shipping_address,
    coupon_id, discount_amount, status
  ) VALUES (
    p_buyer_id, p_seller_id, p_product_id, p_quantity,
    p_total_amount, p_platform_fee, p_shipping_address,
    p_coupon_id, p_discount_amount, 'pending'
  ) RETURNING id INTO v_order_id;

  RETURN v_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- C4: Atomic offer acceptance (prevents double-accept race condition)
-- Only transitions pending→accepted, rejects all other pending offers
-- ============================================
CREATE OR REPLACE FUNCTION accept_offer_atomic(
  p_offer_id UUID,
  p_seller_id UUID,
  p_response TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_product_id UUID;
  v_rows_affected INTEGER;
BEGIN
  -- Atomically update only if still pending and belongs to seller
  UPDATE offers
  SET status = 'accepted',
      seller_response = p_response
  WHERE id = p_offer_id
    AND seller_id = p_seller_id
    AND status = 'pending'
  RETURNING product_id INTO v_product_id;

  GET DIAGNOSTICS v_rows_affected = ROW_COUNT;

  IF v_rows_affected = 0 THEN
    RETURN FALSE;
  END IF;

  -- Reject all other pending offers for this product
  UPDATE offers
  SET status = 'rejected',
      seller_response = 'Otra oferta fue aceptada'
  WHERE product_id = v_product_id
    AND status = 'pending'
    AND id != p_offer_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- C4: Atomic counter-offer acceptance (buyer side)
-- Only transitions countered→accepted
-- ============================================
CREATE OR REPLACE FUNCTION accept_counter_atomic(
  p_offer_id UUID,
  p_buyer_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_product_id UUID;
  v_counter_amount INTEGER;
  v_counter_expires TIMESTAMPTZ;
  v_rows_affected INTEGER;
BEGIN
  -- Get counter details atomically
  SELECT product_id, counter_amount, counter_expires_at
  INTO v_product_id, v_counter_amount, v_counter_expires
  FROM offers
  WHERE id = p_offer_id
    AND buyer_id = p_buyer_id
    AND status = 'countered'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Check expiry
  IF v_counter_expires IS NOT NULL AND v_counter_expires < NOW() THEN
    UPDATE offers SET status = 'expired' WHERE id = p_offer_id;
    RETURN FALSE;
  END IF;

  -- Accept and update amount
  UPDATE offers
  SET status = 'accepted',
      amount = v_counter_amount
  WHERE id = p_offer_id;

  -- Reject other pending offers for this product
  UPDATE offers
  SET status = 'rejected',
      seller_response = 'Otra oferta fue aceptada'
  WHERE product_id = v_product_id
    AND status = 'pending'
    AND id != p_offer_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- C2: Atomic offer-to-checkout (prevents marking paid before payment)
-- Sets status to 'checkout_pending' instead of 'paid'
-- ============================================
CREATE OR REPLACE FUNCTION offer_start_checkout(
  p_offer_id UUID,
  p_buyer_id UUID,
  p_order_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_rows_affected INTEGER;
BEGIN
  UPDATE offers
  SET status = 'checkout_pending',
      order_id = p_order_id
  WHERE id = p_offer_id
    AND buyer_id = p_buyer_id
    AND status = 'accepted'
  RETURNING id INTO p_offer_id;

  GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
  RETURN v_rows_affected > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- H5: Idempotent payment processing
-- Returns TRUE if this is a new payment, FALSE if already processed
-- ============================================
CREATE OR REPLACE FUNCTION process_payment_idempotent(
  p_order_id UUID,
  p_stripe_pi_id TEXT,
  p_amount INTEGER,
  p_platform_fee INTEGER,
  p_seller_payout INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  v_existing_count INTEGER;
BEGIN
  -- Check if this payment intent was already processed
  SELECT COUNT(*) INTO v_existing_count
  FROM payments
  WHERE stripe_payment_intent_id = p_stripe_pi_id;

  IF v_existing_count > 0 THEN
    RETURN FALSE; -- Already processed
  END IF;

  -- Update order status
  UPDATE orders
  SET status = 'paid',
      stripe_payment_intent_id = p_stripe_pi_id
  WHERE id = p_order_id
    AND status = 'pending';

  -- Insert payment record
  INSERT INTO payments (
    order_id, stripe_payment_intent_id, amount,
    platform_fee, seller_payout, status
  ) VALUES (
    p_order_id, p_stripe_pi_id, p_amount,
    p_platform_fee, p_seller_payout, 'succeeded'
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Add unique index on payments.stripe_payment_intent_id for idempotency
-- ============================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_stripe_pi_unique
  ON payments(stripe_payment_intent_id);

-- ============================================
-- Add 'checkout_pending' to offers status if not exists
-- (safe alter - add check constraint or update existing)
-- ============================================
DO $$
BEGIN
  -- Try to add the new status values to offers if the table has a check constraint
  -- This is a no-op if the constraint doesn't exist yet
  BEGIN
    ALTER TABLE offers DROP CONSTRAINT IF EXISTS offers_status_check;
    ALTER TABLE offers ADD CONSTRAINT offers_status_check
      CHECK (status IN ('pending', 'accepted', 'rejected', 'countered', 'expired', 'cancelled', 'paid', 'checkout_pending'));
  EXCEPTION WHEN OTHERS THEN
    NULL; -- Ignore if constraint management fails
  END;
END;
$$;
