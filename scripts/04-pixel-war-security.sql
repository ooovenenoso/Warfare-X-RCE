-- Enable Row Level Security on pixel war tables
ALTER TABLE pixel_war ENABLE ROW LEVEL SECURITY;
ALTER TABLE pixel_cooldowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_logs ENABLE ROW LEVEL SECURITY;

-- Create security policies for pixel_war table
CREATE POLICY "Users can only read pixel_war data" ON pixel_war
    FOR SELECT USING (true);

CREATE POLICY "Users can only insert their own pixels" ON pixel_war
    FOR INSERT WITH CHECK (
        user_identifier = COALESCE(
            current_setting('request.headers.x-forwarded-for', true),
            inet_client_addr()::text
        )
    );

-- Prevent updates and deletes on pixel_war (pixels are permanent)
CREATE POLICY "No updates allowed on pixel_war" ON pixel_war
    FOR UPDATE USING (false);

CREATE POLICY "No deletes allowed on pixel_war" ON pixel_war
    FOR DELETE USING (false);

-- Create security policies for pixel_cooldowns
CREATE POLICY "Users can only see their own cooldowns" ON pixel_cooldowns
    FOR SELECT USING (
        user_identifier = COALESCE(
            current_setting('request.headers.x-forwarded-for', true),
            inet_client_addr()::text
        )
    );

CREATE POLICY "Users can only insert their own cooldowns" ON pixel_cooldowns
    FOR INSERT WITH CHECK (
        user_identifier = COALESCE(
            current_setting('request.headers.x-forwarded-for', true),
            inet_client_addr()::text
        )
    );

CREATE POLICY "Users can only update their own cooldowns" ON pixel_cooldowns
    FOR UPDATE USING (
        user_identifier = COALESCE(
            current_setting('request.headers.x-forwarded-for', true),
            inet_client_addr()::text
        )
    );

-- Visitor logs - only admins can see all data
CREATE POLICY "Only admins can read visitor_logs" ON visitor_logs
    FOR SELECT USING (
        current_user IN ('postgres', 'admin') OR
        current_setting('app.user_role', true) = 'admin'
    );

-- Add constraints to prevent invalid data
ALTER TABLE pixel_war 
ADD CONSTRAINT valid_coordinates CHECK (x >= 0 AND x < 50 AND y >= 0 AND y < 50),
ADD CONSTRAINT valid_choice CHECK (choice IN ('welcome_kit', 'builder_kit')),
ADD CONSTRAINT valid_color CHECK (color IN ('#3B82F6', '#EF4444'));

-- Add rate limiting constraint (max 1 pixel per user per 30 seconds)
CREATE OR REPLACE FUNCTION check_pixel_rate_limit()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if user has placed a pixel in the last 30 seconds
    IF EXISTS (
        SELECT 1 FROM pixel_war 
        WHERE user_identifier = NEW.user_identifier 
        AND placed_at > NOW() - INTERVAL '30 seconds'
    ) THEN
        RAISE EXCEPTION 'Rate limit exceeded. Please wait 30 seconds between pixel placements.';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pixel_rate_limit_trigger
    BEFORE INSERT ON pixel_war
    FOR EACH ROW
    EXECUTE FUNCTION check_pixel_rate_limit();

-- Create audit log table for security monitoring
CREATE TABLE IF NOT EXISTS pixel_war_audit (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL,
    operation VARCHAR(10) NOT NULL,
    user_identifier VARCHAR(255),
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audit trigger function
CREATE OR REPLACE FUNCTION audit_pixel_war()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO pixel_war_audit (
        table_name,
        operation,
        user_identifier,
        old_data,
        new_data,
        ip_address,
        user_agent
    ) VALUES (
        TG_TABLE_NAME,
        TG_OP,
        COALESCE(NEW.user_identifier, OLD.user_identifier),
        CASE WHEN TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN row_to_json(OLD) END,
        CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW) END,
        inet_client_addr(),
        current_setting('request.headers.user-agent', true)
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers
CREATE TRIGGER pixel_war_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON pixel_war
    FOR EACH ROW
    EXECUTE FUNCTION audit_pixel_war();

CREATE TRIGGER pixel_cooldowns_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON pixel_cooldowns
    FOR EACH ROW
    EXECUTE FUNCTION audit_pixel_war();

-- Create function to clean old cooldowns (run periodically)
CREATE OR REPLACE FUNCTION cleanup_old_cooldowns()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM pixel_cooldowns 
    WHERE last_placed_at < NOW() - INTERVAL '1 hour';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to get pixel war statistics securely
CREATE OR REPLACE FUNCTION get_pixel_war_stats()
RETURNS TABLE(
    welcome_kit_count BIGINT,
    builder_kit_count BIGINT,
    total_pixels BIGINT,
    unique_participants BIGINT,
    last_updated TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) FILTER (WHERE choice = 'welcome_kit') as welcome_kit_count,
        COUNT(*) FILTER (WHERE choice = 'builder_kit') as builder_kit_count,
        COUNT(*) as total_pixels,
        COUNT(DISTINCT user_identifier) as unique_participants,
        MAX(placed_at) as last_updated
    FROM pixel_war;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user can place pixel
CREATE OR REPLACE FUNCTION can_place_pixel(user_id VARCHAR(255))
RETURNS TABLE(
    can_place BOOLEAN,
    cooldown_remaining INTEGER,
    last_placed TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    last_placement TIMESTAMP WITH TIME ZONE;
    remaining_seconds INTEGER;
BEGIN
    SELECT last_placed_at INTO last_placement
    FROM pixel_cooldowns 
    WHERE user_identifier = user_id;
    
    IF last_placement IS NULL THEN
        RETURN QUERY SELECT true, 0, NULL::TIMESTAMP WITH TIME ZONE;
    ELSE
        remaining_seconds := GREATEST(0, 30 - EXTRACT(EPOCH FROM (NOW() - last_placement))::INTEGER);
        RETURN QUERY SELECT 
            remaining_seconds = 0,
            remaining_seconds,
            last_placement;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT SELECT ON pixel_war TO PUBLIC;
GRANT INSERT ON pixel_war TO PUBLIC;
GRANT SELECT, INSERT, UPDATE ON pixel_cooldowns TO PUBLIC;
GRANT USAGE ON SEQUENCE pixel_war_id_seq TO PUBLIC;
GRANT USAGE ON SEQUENCE pixel_cooldowns_id_seq TO PUBLIC;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_pixel_war_stats() TO PUBLIC;
GRANT EXECUTE ON FUNCTION can_place_pixel(VARCHAR) TO PUBLIC;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pixel_war_user_time ON pixel_war(user_identifier, placed_at DESC);
CREATE INDEX IF NOT EXISTS idx_pixel_war_choice ON pixel_war(choice);
CREATE INDEX IF NOT EXISTS idx_pixel_cooldowns_user_time ON pixel_cooldowns(user_identifier, last_placed_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON pixel_war_audit(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_user ON pixel_war_audit(user_identifier);

-- Add comments for documentation
COMMENT ON TABLE pixel_war IS 'Stores pixel placements for the pixel war game';
COMMENT ON TABLE pixel_cooldowns IS 'Tracks user cooldowns to prevent spam';
COMMENT ON TABLE pixel_war_audit IS 'Audit log for all pixel war related activities';
COMMENT ON FUNCTION check_pixel_rate_limit() IS 'Prevents users from placing pixels too frequently';
COMMENT ON FUNCTION get_pixel_war_stats() IS 'Returns current game statistics safely';
COMMENT ON FUNCTION can_place_pixel(VARCHAR) IS 'Checks if user can place a pixel and remaining cooldown';
