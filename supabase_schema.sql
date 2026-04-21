`-- Users table is managed by Supabase Auth (auth.users)

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Properties Table
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_name TEXT NOT NULL,
  owner_phone TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Rent', 'Sale')),
  price NUMERIC NOT NULL,
  address TEXT NOT NULL,
  google_map_link TEXT,
  configuration JSONB DEFAULT '{}'::jsonb, -- Store BHK, Size, Floor as JSON
  description TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Track creator
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Property Images Table
CREATE TABLE property_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clients Table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  requirement TEXT NOT NULL CHECK (requirement IN ('Rent', 'Buy')),
  budget NUMERIC NOT NULL,
  preferred_locations JSONB DEFAULT '[]'::jsonb, -- Store array of locations
  configuration JSONB DEFAULT '{}'::jsonb, -- Store detailed requirements (BHK, Area, etc.)
  notes TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Track creator
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security) Policies

-- Properties
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all authenticated users" ON properties FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON properties FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users only" ON properties FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Enable delete for authenticated users only" ON properties FOR DELETE TO authenticated USING (true);

-- Property Images
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all authenticated users" ON property_images FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON property_images FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users only" ON property_images FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Enable delete for authenticated users only" ON property_images FOR DELETE TO authenticated USING (true);

-- Clients
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all authenticated users" ON clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON clients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users only" ON clients FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Enable delete for authenticated users only" ON clients FOR DELETE TO authenticated USING (true);
`