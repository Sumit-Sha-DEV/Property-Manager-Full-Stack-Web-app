-- Supabase Database Performance Indexes
-- Run these in your Supabase SQL Editor to improve query execution speed.

-- 1. Index foreign keys to optimize joins and RLS policy checks (prevents full-table scans)
CREATE INDEX IF NOT EXISTS idx_properties_user_id ON properties(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON property_images(property_id);
CREATE INDEX IF NOT EXISTS idx_property_videos_property_id ON property_videos(property_id);

-- 2. Index created_at for fast sorting and paginated list queries
CREATE INDEX IF NOT EXISTS idx_properties_created_at_desc ON properties(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clients_created_at_desc ON clients(created_at DESC);

-- 3. Index frequently filtered columns to optimize dashboard searches
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(type);
CREATE INDEX IF NOT EXISTS idx_clients_requirement ON clients(requirement);
