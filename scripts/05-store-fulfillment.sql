-- Idempotent Stripe-to-Supabase credit delivery. Apply after scripts/01-schema.sql.
-- The Rust server plugin should read public.economy_balance and public.economy_transactions.
CREATE OR REPLACE FUNCTION public.fulfill_paid_store_transaction(
  p_stripe_session_id text,
  p_payment_intent_id text,
  p_amount_cents integer
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
DECLARE
  v_tx public.transactions%ROWTYPE;
  v_discord_id text;
  v_player_name text;
BEGIN
  SELECT * INTO v_tx FROM public.transactions WHERE stripe_session_id = p_stripe_session_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Store transaction not found'; END IF;
  IF p_amount_cents IS NULL OR p_amount_cents <> ROUND(v_tx.final_amount * 100)::integer THEN
    RAISE EXCEPTION 'Stripe amount does not match the store transaction';
  END IF;
  IF v_tx.status = 'completed' AND v_tx.delivery_status = 'delivered' THEN
    RETURN jsonb_build_object('delivered', true, 'status', 'delivered', 'credits', v_tx.credits_delivered, 'duplicate', true);
  END IF;
  IF v_tx.status NOT IN ('pending', 'processing') OR v_tx.payment_status IN ('failed', 'refunded') THEN
    RAISE EXCEPTION 'Store transaction is not eligible for fulfillment';
  END IF;
  UPDATE public.transactions SET status = 'processing', payment_status = 'paid',
    paid_at = COALESCE(paid_at, NOW()),
    stripe_payment_intent_id = COALESCE(p_payment_intent_id, stripe_payment_intent_id)
  WHERE id = v_tx.id;
  SELECT u.discord_id INTO v_discord_id FROM public.users AS u WHERE u.id = v_tx.user_id;
  SELECT ul.username INTO v_player_name FROM public.username_links AS ul
  WHERE ul.discord_id = v_discord_id AND ul.server_id = v_tx.server_id AND ul.is_verified = true LIMIT 1;
  IF v_player_name IS NULL THEN
    RETURN jsonb_build_object('delivered', false, 'status', 'pending_link', 'credits', v_tx.credits_purchased);
  END IF;
  INSERT INTO public.economy_balance AS eb (server_id, player_name, balance, total_earned, total_spent, last_transaction_at, created_at, updated_at)
  VALUES (v_tx.server_id, v_player_name, v_tx.credits_purchased, v_tx.credits_purchased, 0, NOW(), NOW(), NOW())
  ON CONFLICT (server_id, player_name) DO UPDATE SET
    balance = eb.balance + EXCLUDED.balance,
    total_earned = eb.total_earned + EXCLUDED.total_earned,
    last_transaction_at = NOW(), updated_at = NOW();
  INSERT INTO public.economy_transactions (server_id, sender, receiver, amount, transaction_type, description, reference_id, timestamp)
  VALUES (v_tx.server_id, 'Store', v_player_name, v_tx.credits_purchased, 'store_purchase',
    'Store credit purchase ' || v_tx.transaction_number, v_tx.id, NOW());
  UPDATE public.transactions SET status = 'completed', payment_status = 'paid', delivery_status = 'delivered',
    credits_delivered = credits_purchased, paid_at = COALESCE(paid_at, NOW()), delivered_at = NOW(), completed_at = NOW(),
    stripe_payment_intent_id = COALESCE(p_payment_intent_id, stripe_payment_intent_id)
  WHERE id = v_tx.id;
  UPDATE public.users SET total_spent = COALESCE(total_spent, 0) + v_tx.final_amount,
    total_purchases = COALESCE(total_purchases, 0) + 1,
    first_purchase_at = COALESCE(first_purchase_at, NOW()), last_purchase_at = NOW(), updated_at = NOW()
  WHERE id = v_tx.user_id;
  RETURN jsonb_build_object('delivered', true, 'status', 'delivered', 'credits', v_tx.credits_purchased, 'duplicate', false);
END;
$$;
REVOKE ALL ON FUNCTION public.fulfill_paid_store_transaction(text, text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fulfill_paid_store_transaction(text, text, integer) TO service_role;
