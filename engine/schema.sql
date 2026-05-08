-- ══════════════════════════════════════════════════════════════════════════════
-- CRAFTBIKELAB — Production Database Schema for 500K+ Products
-- Optimized for Supabase Free Tier (500 MB) → Pro Tier (8 GB)
-- ══════════════════════════════════════════════════════════════════════════════

-- ──────────────────────────────────────────────────────────────────────────────
-- TABLE: affiliate_products
-- Stores motorcycle accessories/parts with platform links
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS affiliate_products (
  id BIGSERIAL PRIMARY KEY,
  
  -- Product Information
  name TEXT NOT NULL,
  brand TEXT,
  category TEXT DEFAULT 'other',
  price NUMERIC(10, 2),
  status TEXT DEFAULT 'active',
  
  -- Platform Links (at least one required)
  shopee_link TEXT,
  lazada_link TEXT,
  tiktok_link TEXT,
  
  -- Image URLs from Cloudflare R2
  image_urls JSONB DEFAULT '[]',
  
  -- Metadata (specs, affiliate IDs, AI-extracted data)
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- UNIQUE CONSTRAINTS: Prevent duplicate products
-- ──────────────────────────────────────────────────────────────────────────────

-- Unique constraint on shopee_link (for upsert on_conflict)
CREATE UNIQUE INDEX idx_shopee_link_unique 
ON affiliate_products(shopee_link) 
WHERE shopee_link IS NOT NULL;

-- Unique constraint on lazada_link (backup identifier)
CREATE UNIQUE INDEX idx_lazada_link_unique 
ON affiliate_products(lazada_link) 
WHERE lazada_link IS NOT NULL;

-- Unique constraint on tiktok_link (backup identifier)
CREATE UNIQUE INDEX idx_tiktok_link_unique 
ON affiliate_products(tiktok_link) 
WHERE tiktok_link IS NOT NULL;

-- ──────────────────────────────────────────────────────────────────────────────
-- INDEXES: Performance optimization for 500K+ rows
-- ──────────────────────────────────────────────────────────────────────────────

-- Index on category for filtering (crashbar, exhaust, etc.)
CREATE INDEX idx_products_category 
ON affiliate_products(category) 
WHERE status = 'active';

-- Index on status for active/inactive filtering
CREATE INDEX idx_products_status 
ON affiliate_products(status);

-- Index on created_at for sorting by newest
CREATE INDEX idx_products_created_at 
ON affiliate_products(created_at DESC);

-- Composite index for category + price (common filter)
CREATE INDEX idx_products_category_price 
ON affiliate_products(category, price) 
WHERE status = 'active';

-- GIN index on metadata JSONB for flexible queries
CREATE INDEX idx_products_metadata_gin 
ON affiliate_products USING GIN(metadata);

-- ──────────────────────────────────────────────────────────────────────────────
-- TABLE: product_model_mapping
-- Many-to-Many relationship: Products ↔ Motorcycle Models
-- One accessory (e.g., universal exhaust) can fit multiple bike models
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS product_model_mapping (
  id BIGSERIAL PRIMARY KEY,
  
  -- Foreign Keys
  product_id BIGINT NOT NULL REFERENCES affiliate_products(id) ON DELETE CASCADE,
  model_slug TEXT NOT NULL,  -- e.g., 'adv350', 'forza350', 'pcx160'
  
  -- Prevent duplicate mappings
  UNIQUE(product_id, model_slug),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- INDEXES: Fast lookups by model_slug (most common query)
-- ──────────────────────────────────────────────────────────────────────────────

-- Index on product_id for JOIN operations
CREATE INDEX idx_mapping_product_id 
ON product_model_mapping(product_id);

-- Index on model_slug for filtering products by motorcycle model
CREATE INDEX idx_mapping_model_slug 
ON product_model_mapping(model_slug);

-- Composite index for combined queries
CREATE INDEX idx_mapping_product_model 
ON product_model_mapping(product_id, model_slug);

-- ──────────────────────────────────────────────────────────────────────────────
-- TABLE: model_aliases (Optional but recommended)
-- Maps common aliases to canonical model_slug
-- Example: "adv 350" → "adv350", "forza 300" → "forza300"
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS model_aliases (
  alias TEXT PRIMARY KEY,
  model_slug TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for prefix matching (for autocomplete/search)
CREATE INDEX idx_aliases_prefix 
ON model_aliases(alias text_pattern_ops);

-- ──────────────────────────────────────────────────────────────────────────────
-- TRIGGER: Auto-update updated_at timestamp
-- ──────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_products_timestamp
  BEFORE UPDATE ON affiliate_products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ──────────────────────────────────────────────────────────────────────────────
-- FUNCTION: Estimate database size (for free tier monitoring)
-- Note: pg_database_size() is restricted in Supabase, so we estimate from rows
-- ──────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION estimate_database_size()
RETURNS TABLE(
  product_count BIGINT,
  mapping_count BIGINT,
  estimated_mb NUMERIC
) AS $$
DECLARE
  p_count BIGINT;
  m_count BIGINT;
  est_size_mb NUMERIC;
BEGIN
  -- Count products
  SELECT COUNT(*) INTO p_count FROM affiliate_products;
  
  -- Count mappings
  SELECT COUNT(*) INTO m_count FROM product_model_mapping;
  
  -- Estimate: 
  -- - Each product row ≈ 5 KB (name, brand, links, metadata)
  -- - Each mapping row ≈ 100 bytes
  -- - Indexes ≈ 30% of data size
  est_size_mb := ((p_count * 5 + m_count * 0.1) * 1.3) / 1024;
  
  RETURN QUERY SELECT p_count, m_count, est_size_mb;
END;
$$ LANGUAGE plpgsql;

-- ──────────────────────────────────────────────────────────────────────────────
-- SAMPLE DATA: Insert some model aliases for testing
-- ──────────────────────────────────────────────────────────────────────────────

INSERT INTO model_aliases (alias, model_slug) VALUES
  ('adv350', 'adv350'),
  ('adv 350', 'adv350'),
  ('honda adv350', 'adv350'),
  ('forza350', 'forza350'),
  ('forza 350', 'forza350'),
  ('pcx160', 'pcx160'),
  ('pcx 160', 'pcx160'),
  ('cbr650r', 'cbr650r'),
  ('cbr 650r', 'cbr650r'),
  ('yamaha xmax', 'xmax300'),
  ('xmax300', 'xmax300')
ON CONFLICT (alias) DO NOTHING;

-- ──────────────────────────────────────────────────────────────────────────────
-- VERIFICATION QUERIES
-- ──────────────────────────────────────────────────────────────────────────────

-- Check estimated database size
-- SELECT * FROM estimate_database_size();

-- Check if indexes exist
-- SELECT tablename, indexname FROM pg_indexes WHERE schemaname = 'public';

-- ══════════════════════════════════════════════════════════════════════════════
-- END OF SCHEMA
-- ══════════════════════════════════════════════════════════════════════════════
