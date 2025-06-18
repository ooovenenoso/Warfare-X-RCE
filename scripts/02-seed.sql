-- =====================================================
-- SAMPLE DATA FOR TESTING AND DEVELOPMENT
-- =====================================================

-- Insert sample users
INSERT INTO users (discord_id, username, email, avatar, balance) VALUES 
('123456789012345678', 'TestUser1', 'test1@example.com', '/placeholder.svg?height=40&width=40&text=T1', 5000),
('234567890123456789', 'TestUser2', 'test2@example.com', '/placeholder.svg?height=40&width=40&text=T2', 3000),
('345678901234567890', 'TestUser3', 'test3@example.com', '/placeholder.svg?height=40&width=40&text=T3', 7500),
('456789012345678901', 'TestUser4', 'test4@example.com', '/placeholder.svg?height=40&width=40&text=T4', 1200),
('567890123456789012', 'TestUser5', 'test5@example.com', '/placeholder.svg?height=40&width=40&text=T5', 9800)
ON CONFLICT (discord_id) DO NOTHING;

-- Insert sample transactions
INSERT INTO transactions (
    user_id, 
    package_id, 
    server_id, 
    base_amount, 
    final_amount, 
    credits_purchased, 
    credits_delivered,
    status, 
    payment_status, 
    delivery_status,
    created_at,
    completed_at
) 
SELECT 
    u.id,
    cp.id,
    'server' || (FLOOR(RANDOM() * 3) + 1)::text,
    cp.base_price,
    cp.current_price,
    cp.credits,
    cp.credits,
    'completed',
    'paid',
    'delivered',
    NOW() - INTERVAL '1 day' * FLOOR(RANDOM() * 30),
    NOW() - INTERVAL '1 day' * FLOOR(RANDOM() * 30) + INTERVAL '1 hour'
FROM users u
CROSS JOIN credit_packages cp
WHERE RANDOM() < 0.3 -- 30% chance for each user-package combination
LIMIT 50;

-- Insert sample username links
INSERT INTO username_links (discord_id, server_id, username, is_verified) 
SELECT 
    u.discord_id,
    s.id,
    u.username || '_' || s.id,
    true
FROM users u
CROSS JOIN servers s
WHERE RANDOM() < 0.6; -- 60% chance for each user-server combination

-- Insert sample economy balances
INSERT INTO economy_balance (server_id, player_name, balance, total_earned, total_spent)
SELECT 
    ul.server_id,
    ul.username,
    FLOOR(RANDOM() * 10000) + 1000,
    FLOOR(RANDOM() * 50000) + 5000,
    FLOOR(RANDOM() * 20000) + 1000
FROM username_links ul
WHERE ul.is_verified = true;

-- Insert sample promotions
INSERT INTO promotions (
    name, 
    description, 
    code, 
    discount_type, 
    discount_value, 
    usage_limit,
    is_active,
    expires_at
) VALUES 
('Welcome Bonus', 'First time buyer discount', 'WELCOME10', 'percentage', 10.00, 1000, true, NOW() + INTERVAL '30 days'),
('Flash Sale', 'Limited time 25% off', 'FLASH25', 'percentage', 25.00, 500, true, NOW() + INTERVAL '7 days'),
('VIP Discount', 'Exclusive VIP member discount', 'VIP15', 'percentage', 15.00, 100, true, NOW() + INTERVAL '60 days'),
('Credits Bonus', 'Extra 500 credits on any purchase', 'BONUS500', 'credits_bonus', 500.00, 200, true, NOW() + INTERVAL '14 days');

-- Update daily metrics for the last 30 days
DO $$
DECLARE
    current_date DATE;
BEGIN
    FOR i IN 0..29 LOOP
        current_date := CURRENT_DATE - i;
        PERFORM update_daily_metrics(current_date);
    END LOOP;
END $$;

-- Insert sample webhook events
INSERT INTO webhook_events (
    endpoint_id,
    event_type,
    payload,
    status,
    response_status,
    attempts,
    transaction_id,
    created_at,
    sent_at
)
SELECT 
    we.id,
    'purchase.completed',
    jsonb_build_object(
        'transaction_id', t.id,
        'user_id', t.user_id,
        'amount', t.final_amount,
        'credits', t.credits_purchased,
        'timestamp', t.created_at
    ),
    CASE WHEN RANDOM() < 0.9 THEN 'sent' ELSE 'failed' END,
    CASE WHEN RANDOM() < 0.9 THEN 200 ELSE 500 END,
    1,
    t.id,
    t.created_at,
    t.created_at + INTERVAL '5 seconds'
FROM webhook_endpoints we
CROSS JOIN transactions t
WHERE t.status = 'completed'
LIMIT 100;

-- Insert sample user analytics
INSERT INTO user_analytics (user_id, session_id, event_type, event_data, created_at)
SELECT 
    u.id,
    'session_' || FLOOR(RANDOM() * 1000000),
    event_types.event_type,
    jsonb_build_object(
        'page', '/store',
        'package_id', cp.id,
        'timestamp', NOW() - INTERVAL '1 day' * FLOOR(RANDOM() * 7)
    ),
    NOW() - INTERVAL '1 day' * FLOOR(RANDOM() * 7)
FROM users u
CROSS JOIN (VALUES ('page_view'), ('package_view'), ('purchase_attempt')) AS event_types(event_type)
CROSS JOIN credit_packages cp
WHERE RANDOM() < 0.1 -- 10% chance
LIMIT 500;

RAISE NOTICE '🎯 Sample data inserted successfully!';
RAISE NOTICE '👥 Users: %', (SELECT COUNT(*) FROM users);
RAISE NOTICE '💳 Transactions: %', (SELECT COUNT(*) FROM transactions);
RAISE NOTICE '🔗 Username Links: %', (SELECT COUNT(*) FROM username_links);
RAISE NOTICE '💰 Economy Balances: %', (SELECT COUNT(*) FROM economy_balance);
RAISE NOTICE '🎁 Promotions: %', (SELECT COUNT(*) FROM promotions);
RAISE NOTICE '📊 Analytics Events: %', (SELECT COUNT(*) FROM user_analytics);
