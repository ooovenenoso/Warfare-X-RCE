-- Create pixel war table
CREATE TABLE IF NOT EXISTS pixel_war (
  id SERIAL PRIMARY KEY,
  x INTEGER NOT NULL,
  y INTEGER NOT NULL,
  color VARCHAR(20) NOT NULL,
  choice VARCHAR(50) NOT NULL, -- 'welcome_kit' or 'builder_kit'
  user_identifier VARCHAR(255) NOT NULL, -- IP or cookie ID
  placed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(x, y)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_pixel_war_coordinates ON pixel_war(x, y);
CREATE INDEX IF NOT EXISTS idx_pixel_war_user ON pixel_war(user_identifier);
CREATE INDEX IF NOT EXISTS idx_pixel_war_placed_at ON pixel_war(placed_at);

-- Create cooldown tracking table
CREATE TABLE IF NOT EXISTS pixel_cooldowns (
  id SERIAL PRIMARY KEY,
  user_identifier VARCHAR(255) NOT NULL,
  last_placed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_identifier)
);

-- Create visitor tracking table
CREATE TABLE IF NOT EXISTS visitor_logs (
  id SERIAL PRIMARY KEY,
  ip_address INET,
  user_agent TEXT,
  country VARCHAR(100),
  city VARCHAR(100),
  device_type VARCHAR(50),
  browser VARCHAR(50),
  os VARCHAR(50),
  referrer TEXT,
  visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for visitor logs
CREATE INDEX IF NOT EXISTS idx_visitor_logs_ip ON visitor_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_visitor_logs_visited_at ON visitor_logs(visited_at);
