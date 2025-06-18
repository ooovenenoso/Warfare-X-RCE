-- =====================================================
-- CNQR STORE - COMPLETE DATABASE SCHEMA
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Users table (enhanced)
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    discord_id TEXT UNIQUE NOT NULL,
    username TEXT NOT NULL,
    email TEXT,
    avatar TEXT,
    balance INTEGER DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0.00,
    total_purchases INTEGER DEFAULT 0,
    first_purchase_at TIMESTAMP WITH TIME ZONE,
    last_purchase_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Credit packages table (enhanced)
CREATE TABLE IF NOT EXISTS credit_packages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    credits INTEGER NOT NULL CHECK (credits > 0),
    base_price DECIMAL(10,2) NOT NULL CHECK (base_price > 0),
    current_price DECIMAL(10,2) NOT NULL CHECK (current_price > 0),
    discount_percentage INTEGER DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
    image_url TEXT,
    icon TEXT,
    color_scheme TEXT DEFAULT 'default',
    is_popular BOOLEAN DEFAULT false,
    is_best_value BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    max_purchases_per_user INTEGER,
    max_purchases_per_day INTEGER,
    available_from TIMESTAMP WITH TIME ZONE,
    available_until TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Transactions table (comprehensive)
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    transaction_number TEXT UNIQUE NOT NULL DEFAULT 'TXN-' || EXTRACT(EPOCH FROM NOW())::bigint || '-' || FLOOR(RANDOM() * 1000),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    package_id UUID REFERENCES credit_packages(id) ON DELETE SET NULL,
    server_id TEXT,
    
    -- Payment details
    stripe_payment_intent_id TEXT UNIQUE,
    stripe_session_id TEXT UNIQUE,
    payment_method TEXT DEFAULT 'stripe',
    
    -- Transaction amounts
    base_amount DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    final_amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    
    -- Credits
    credits_purchased INTEGER NOT NULL,
    credits_delivered INTEGER DEFAULT 0,
    
    -- Status and tracking
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    delivery_status TEXT DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'delivered', 'failed')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    paid_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    
    -- Additional info
    ip_address INET,
    user_agent TEXT,
    refund_reason TEXT,
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Webhook tracking
    webhook_sent BOOLEAN DEFAULT false,
    webhook_sent_at TIMESTAMP WITH TIME ZONE,
    webhook_attempts INTEGER DEFAULT 0
);

-- =====================================================
-- PRICING AND PROMOTIONS
-- =====================================================

-- Price modes table
CREATE TABLE IF NOT EXISTS price_modes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    multiplier DECIMAL(4,3) NOT NULL DEFAULT 1.000 CHECK (multiplier > 0),
    is_active BOOLEAN DEFAULT false,
    color_scheme TEXT DEFAULT 'default',
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default price modes
INSERT INTO price_modes (name, display_name, description, multiplier, color_scheme, icon) VALUES 
('normal', 'Normal Mode', 'Standard pricing', 1.000, 'blue', 'BarChart3'),
('low_pop', 'Low Pop Mode', '50% discount on all packages', 0.500, 'green', 'TrendingDown'),
('high_season', 'High Season Mode', '15% increase on all packages', 1.150, 'orange', 'TrendingUp')
ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    multiplier = EXCLUDED.multiplier,
    color_scheme = EXCLUDED.color_scheme,
    icon = EXCLUDED.icon,
    updated_at = NOW();

-- Price mode history
CREATE TABLE IF NOT EXISTS price_mode_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    price_mode_id UUID REFERENCES price_modes(id),
    previous_mode TEXT,
    new_mode TEXT NOT NULL,
    changed_by UUID REFERENCES users(id),
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Promotions table
CREATE TABLE IF NOT EXISTS promotions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    code TEXT UNIQUE,
    discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed_amount', 'credits_bonus')),
    discount_value DECIMAL(10,2) NOT NULL,
    min_purchase_amount DECIMAL(10,2),
    max_discount_amount DECIMAL(10,2),
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    user_usage_limit INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    applicable_packages UUID[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Promotion usage tracking
CREATE TABLE IF NOT EXISTS promotion_usage (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    promotion_id UUID REFERENCES promotions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    discount_applied DECIMAL(10,2) NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(promotion_id, user_id, transaction_id)
);

-- =====================================================
-- WEBHOOK SYSTEM
-- =====================================================

-- Webhook endpoints
CREATE TABLE IF NOT EXISTS webhook_endpoints (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    secret_key TEXT,
    is_active BOOLEAN DEFAULT true,
    events TEXT[] DEFAULT '{}', -- ['purchase.completed', 'purchase.failed', etc.]
    retry_attempts INTEGER DEFAULT 3,
    timeout_seconds INTEGER DEFAULT 30,
    headers JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE
);

-- Webhook events log
CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    endpoint_id UUID REFERENCES webhook_endpoints(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'retrying')),
    response_status INTEGER,
    response_body TEXT,
    response_headers JSONB,
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    next_retry_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Related entities
    transaction_id UUID REFERENCES transactions(id),
    user_id UUID REFERENCES users(id),
    package_id UUID REFERENCES credit_packages(id)
);

-- =====================================================
-- ANALYTICS AND METRICS
-- =====================================================

-- Daily metrics
CREATE TABLE IF NOT EXISTS daily_metrics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    
    -- Revenue metrics
    total_revenue DECIMAL(12,2) DEFAULT 0.00,
    total_transactions INTEGER DEFAULT 0,
    successful_transactions INTEGER DEFAULT 0,
    failed_transactions INTEGER DEFAULT 0,
    refunded_transactions INTEGER DEFAULT 0,
    
    -- User metrics
    new_users INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    returning_customers INTEGER DEFAULT 0,
    
    -- Package metrics
    credits_sold INTEGER DEFAULT 0,
    average_order_value DECIMAL(10,2) DEFAULT 0.00,
    conversion_rate DECIMAL(5,2) DEFAULT 0.00,
    
    -- Popular packages (top 3)
    top_package_1 UUID REFERENCES credit_packages(id),
    top_package_2 UUID REFERENCES credit_packages(id),
    top_package_3 UUID REFERENCES credit_packages(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Package performance metrics
CREATE TABLE IF NOT EXISTS package_metrics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    package_id UUID REFERENCES credit_packages(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    
    -- Sales metrics
    units_sold INTEGER DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0.00,
    views INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0.00,
    
    -- User metrics
    unique_buyers INTEGER DEFAULT 0,
    repeat_buyers INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(package_id, date)
);

-- User behavior analytics
CREATE TABLE IF NOT EXISTS user_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id TEXT,
    event_type TEXT NOT NULL, -- 'page_view', 'package_view', 'purchase_attempt', 'purchase_completed'
    event_data JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SYSTEM CONFIGURATION
-- =====================================================

-- System settings
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value TEXT,
    value_type TEXT DEFAULT 'string' CHECK (value_type IN ('string', 'number', 'boolean', 'json')),
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    category TEXT DEFAULT 'general',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES users(id)
);

-- Insert default system settings
INSERT INTO system_settings (key, value, value_type, description, category) VALUES 
('current_price_mode', 'normal', 'string', 'Current active price mode', 'pricing'),
('maintenance_mode', 'false', 'boolean', 'Enable maintenance mode', 'system'),
('max_credits_per_purchase', '50000', 'number', 'Maximum credits per single purchase', 'limits'),
('webhook_retry_delay', '300', 'number', 'Webhook retry delay in seconds', 'webhooks'),
('analytics_retention_days', '365', 'number', 'Days to retain analytics data', 'analytics')
ON CONFLICT (key) DO NOTHING;

-- Admin users
CREATE TABLE IF NOT EXISTS admins (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    discord_id TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'moderator', 'viewer')),
    permissions TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- =====================================================
-- GAME INTEGRATION TABLES
-- =====================================================

-- Servers
CREATE TABLE IF NOT EXISTS servers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    max_credits_per_user INTEGER,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Username links (existing table, enhanced)
CREATE TABLE IF NOT EXISTS username_links (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    discord_id TEXT NOT NULL,
    server_id TEXT REFERENCES servers(id),
    username TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT false,
    linked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_verified_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(discord_id, server_id)
);

-- Economy balance (existing table, enhanced)
CREATE TABLE IF NOT EXISTS economy_balance (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    server_id TEXT REFERENCES servers(id),
    player_name TEXT NOT NULL,
    balance INTEGER DEFAULT 0,
    total_earned INTEGER DEFAULT 0,
    total_spent INTEGER DEFAULT 0,
    last_transaction_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(server_id, player_name)
);

-- Economy transactions (existing table, enhanced)
CREATE TABLE IF NOT EXISTS economy_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    server_id TEXT REFERENCES servers(id),
    sender TEXT,
    receiver TEXT NOT NULL,
    amount INTEGER NOT NULL,
    transaction_type TEXT NOT NULL,
    description TEXT,
    reference_id UUID, -- Can reference transactions.id for store purchases
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_discord_id ON users(discord_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login);

-- Credit packages indexes
CREATE INDEX IF NOT EXISTS idx_credit_packages_active ON credit_packages(is_active);
CREATE INDEX IF NOT EXISTS idx_credit_packages_popular ON credit_packages(is_popular);
CREATE INDEX IF NOT EXISTS idx_credit_packages_sort_order ON credit_packages(sort_order);
CREATE INDEX IF NOT EXISTS idx_credit_packages_price ON credit_packages(current_price);

-- Transactions indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_package_id ON transactions(package_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_stripe_session ON transactions(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_transactions_number ON transactions(transaction_number);

-- Webhook events indexes
CREATE INDEX IF NOT EXISTS idx_webhook_events_endpoint_id ON webhook_events(endpoint_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON webhook_events(status);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON webhook_events(created_at);
CREATE INDEX IF NOT EXISTS idx_webhook_events_transaction_id ON webhook_events(transaction_id);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_daily_metrics_date ON daily_metrics(date);
CREATE INDEX IF NOT EXISTS idx_package_metrics_package_date ON package_metrics(package_id, date);
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON user_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_event_type ON user_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_user_analytics_created_at ON user_analytics(created_at);

-- Game integration indexes
CREATE INDEX IF NOT EXISTS idx_username_links_discord_server ON username_links(discord_id, server_id);
CREATE INDEX IF NOT EXISTS idx_economy_balance_server_player ON economy_balance(server_id, player_name);
CREATE INDEX IF NOT EXISTS idx_economy_transactions_server ON economy_transactions(server_id);
CREATE INDEX IF NOT EXISTS idx_economy_transactions_receiver ON economy_transactions(receiver);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_credit_packages_updated_at BEFORE UPDATE ON credit_packages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_price_modes_updated_at BEFORE UPDATE ON price_modes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_promotions_updated_at BEFORE UPDATE ON promotions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_webhook_endpoints_updated_at BEFORE UPDATE ON webhook_endpoints FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_daily_metrics_updated_at BEFORE UPDATE ON daily_metrics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_servers_updated_at BEFORE UPDATE ON servers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_economy_balance_updated_at BEFORE UPDATE ON economy_balance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate package metrics
CREATE OR REPLACE FUNCTION calculate_package_metrics(package_uuid UUID, metric_date DATE)
RETURNS VOID AS $$
BEGIN
    INSERT INTO package_metrics (package_id, date, units_sold, revenue, unique_buyers)
    SELECT 
        package_uuid,
        metric_date,
        COUNT(*) as units_sold,
        SUM(final_amount) as revenue,
        COUNT(DISTINCT user_id) as unique_buyers
    FROM transactions 
    WHERE package_id = package_uuid 
        AND DATE(created_at) = metric_date 
        AND status = 'completed'
    ON CONFLICT (package_id, date) 
    DO UPDATE SET
        units_sold = EXCLUDED.units_sold,
        revenue = EXCLUDED.revenue,
        unique_buyers = EXCLUDED.unique_buyers;
END;
$$ LANGUAGE plpgsql;

-- Function to update daily metrics
CREATE OR REPLACE FUNCTION update_daily_metrics(metric_date DATE)
RETURNS VOID AS $$
BEGIN
    INSERT INTO daily_metrics (
        date, 
        total_revenue, 
        total_transactions, 
        successful_transactions, 
        failed_transactions,
        credits_sold,
        average_order_value
    )
    SELECT 
        metric_date,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN final_amount ELSE 0 END), 0),
        COUNT(*),
        COUNT(CASE WHEN status = 'completed' THEN 1 END),
        COUNT(CASE WHEN status = 'failed' THEN 1 END),
        COALESCE(SUM(CASE WHEN status = 'completed' THEN credits_purchased ELSE 0 END), 0),
        COALESCE(AVG(CASE WHEN status = 'completed' THEN final_amount END), 0)
    FROM transactions 
    WHERE DATE(created_at) = metric_date
    ON CONFLICT (date) 
    DO UPDATE SET
        total_revenue = EXCLUDED.total_revenue,
        total_transactions = EXCLUDED.total_transactions,
        successful_transactions = EXCLUDED.successful_transactions,
        failed_transactions = EXCLUDED.failed_transactions,
        credits_sold = EXCLUDED.credits_sold,
        average_order_value = EXCLUDED.average_order_value,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (discord_id = current_setting('app.current_user_discord_id', true));

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (discord_id = current_setting('app.current_user_discord_id', true));

-- RLS Policies for transactions
CREATE POLICY "Users can view their own transactions" ON transactions
    FOR SELECT USING (user_id IN (
        SELECT id FROM users WHERE discord_id = current_setting('app.current_user_discord_id', true)
    ));

-- Admin policies (bypass RLS for admins)
CREATE POLICY "Admins can view all data" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE discord_id = current_setting('app.current_user_discord_id', true) 
            AND is_active = true
        )
    );

CREATE POLICY "Admins can manage all transactions" ON transactions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE discord_id = current_setting('app.current_user_discord_id', true) 
            AND is_active = true
        )
    );

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Insert admin users
INSERT INTO admins (discord_id, role, permissions) VALUES 
('907231041167716352', 'admin', ARRAY['all']),
('1068270434702860358', 'admin', ARRAY['all'])
ON CONFLICT (discord_id) DO UPDATE SET
    role = EXCLUDED.role,
    permissions = EXCLUDED.permissions,
    is_active = true;

-- Insert default credit packages
INSERT INTO credit_packages (
    name, 
    description, 
    credits, 
    base_price, 
    current_price, 
    image_url, 
    is_popular, 
    is_best_value,
    sort_order,
    color_scheme
) VALUES 
(
    'Starter Pack', 
    'Perfect for new players getting started', 
    1000, 
    9.99, 
    9.99, 
    '/placeholder.svg?height=200&width=300&text=Starter', 
    false, 
    false,
    1,
    'blue'
),
(
    'Pro Pack', 
    'Most popular choice among players', 
    2500, 
    19.99, 
    19.99, 
    '/placeholder.svg?height=200&width=300&text=Pro', 
    true, 
    false,
    2,
    'purple'
),
(
    'Elite Pack', 
    'For serious gamers who want more', 
    6000, 
    39.99, 
    39.99, 
    '/placeholder.svg?height=200&width=300&text=Elite', 
    false, 
    false,
    3,
    'gold'
),
(
    'Ultimate Pack', 
    'Maximum value for hardcore players', 
    15000, 
    79.99, 
    79.99, 
    '/placeholder.svg?height=200&width=300&text=Ultimate', 
    false, 
    true,
    4,
    'diamond'
)
ON CONFLICT DO NOTHING;

-- Insert default servers
INSERT INTO servers (id, name, description) VALUES 
('server1', 'Main Server', 'Primary gaming server'),
('server2', 'PvP Server', 'Player vs Player focused server'),
('server3', 'Creative Server', 'Creative and building server'),
('server4', 'Survival Server', 'Hardcore survival experience'),
('server5', 'Events Server', 'Special events and competitions')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    is_active = true;

-- Insert default webhook endpoint (Discord)
INSERT INTO webhook_endpoints (
    name, 
    url, 
    events, 
    is_active
) VALUES (
    'Discord Notifications',
    COALESCE(current_setting('app.discord_webhook_url', true), 'https://discord.com/api/webhooks/placeholder'),
    ARRAY['purchase.completed', 'purchase.failed', 'user.registered'],
    true
) ON CONFLICT DO NOTHING;

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for transaction summary
CREATE OR REPLACE VIEW transaction_summary AS
SELECT 
    t.id,
    t.transaction_number,
    u.username,
    u.discord_id,
    cp.name as package_name,
    t.credits_purchased,
    t.final_amount,
    t.status,
    t.created_at,
    t.completed_at,
    s.name as server_name
FROM transactions t
LEFT JOIN users u ON t.user_id = u.id
LEFT JOIN credit_packages cp ON t.package_id = cp.id
LEFT JOIN servers s ON t.server_id = s.id;

-- View for package performance
CREATE OR REPLACE VIEW package_performance AS
SELECT 
    cp.id,
    cp.name,
    cp.current_price,
    cp.credits,
    COUNT(t.id) as total_sales,
    SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as successful_sales,
    SUM(CASE WHEN t.status = 'completed' THEN t.final_amount ELSE 0 END) as total_revenue,
    AVG(CASE WHEN t.status = 'completed' THEN t.final_amount END) as avg_order_value,
    COUNT(DISTINCT t.user_id) as unique_buyers
FROM credit_packages cp
LEFT JOIN transactions t ON cp.id = t.package_id
WHERE cp.is_active = true
GROUP BY cp.id, cp.name, cp.current_price, cp.credits
ORDER BY total_revenue DESC;

-- View for user statistics
CREATE OR REPLACE VIEW user_statistics AS
SELECT 
    u.id,
    u.username,
    u.discord_id,
    u.total_purchases,
    u.total_spent,
    u.first_purchase_at,
    u.last_purchase_at,
    COUNT(t.id) as transaction_count,
    SUM(CASE WHEN t.status = 'completed' THEN t.credits_purchased ELSE 0 END) as total_credits_purchased
FROM users u
LEFT JOIN transactions t ON u.id = t.user_id
GROUP BY u.id, u.username, u.discord_id, u.total_purchases, u.total_spent, u.first_purchase_at, u.last_purchase_at;

-- =====================================================
-- CLEANUP AND MAINTENANCE
-- =====================================================

-- Function to cleanup old analytics data
CREATE OR REPLACE FUNCTION cleanup_old_analytics(retention_days INTEGER DEFAULT 365)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM user_analytics 
    WHERE created_at < NOW() - INTERVAL '1 day' * retention_days;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    DELETE FROM webhook_events 
    WHERE created_at < NOW() - INTERVAL '1 day' * retention_days
    AND status IN ('sent', 'failed');
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- GRANTS AND PERMISSIONS
-- =====================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO PUBLIC;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO PUBLIC;
GRANT INSERT, UPDATE ON users, transactions, webhook_events, user_analytics TO PUBLIC;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO PUBLIC;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '🎉 CNQR Store database schema created successfully!';
    RAISE NOTICE '📊 Tables created: %, %, %, %', 
        (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%credit%'),
        (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%transaction%'),
        (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%webhook%'),
        (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%metric%');
    RAISE NOTICE '🔧 Functions and triggers configured';
    RAISE NOTICE '🛡️ Row Level Security enabled';
    RAISE NOTICE '📈 Analytics and metrics ready';
    RAISE NOTICE '🎯 System ready for production!';
END $$;
