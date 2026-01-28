-- Settings table to store key-value configuration
CREATE TABLE IF NOT EXISTS settings (
  setting_key VARCHAR(100) PRIMARY KEY,
  setting_value TEXT,
  category VARCHAR(50),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by VARCHAR(255)
);

-- Insert default settings
INSERT INTO settings (setting_key, setting_value, category) VALUES
  ('company_name', 'Star Skyline Limousine', 'company'),
  ('company_email', 'info@starskylimo.com', 'company'),
  ('company_phone', '+971-50-123-4567', 'company'),
  ('company_address', 'Dubai, UAE', 'company'),
  ('default_currency', 'AED', 'app'),
  ('timezone', 'Asia/Dubai', 'app'),
  ('google_maps_api_key', 'AIzaSyBO7G5z5PCC5B8HZapjLbHniqg17u-rRHk', 'api'),
  ('dashboard_version', '2.1.0', 'system'),
  ('last_updated', NOW(), 'system')
ON CONFLICT (setting_key) DO NOTHING;
