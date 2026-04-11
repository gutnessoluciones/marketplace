-- Migration 012: Phase 3 — Community, Inspiration & Admin
-- Lookbook, Collections, Verifications, Blog, Fairs Calendar, Shipping, Admin moderation

-- ════════════════════════════════════════════════════════
-- 1. LOOKBOOK — Instagram-style looks feed
-- ════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS lookbook_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  tagged_products UUID[] DEFAULT '{}',
  likes_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'removed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lookbook_user ON lookbook_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_lookbook_status ON lookbook_posts(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_lookbook_created ON lookbook_posts(created_at DESC);

CREATE TABLE IF NOT EXISTS lookbook_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES lookbook_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE lookbook_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE lookbook_likes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'lookbook_posts_read') THEN
    CREATE POLICY lookbook_posts_read ON lookbook_posts FOR SELECT USING (status = 'active' OR user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'lookbook_posts_insert') THEN
    CREATE POLICY lookbook_posts_insert ON lookbook_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'lookbook_posts_update') THEN
    CREATE POLICY lookbook_posts_update ON lookbook_posts FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'lookbook_posts_delete') THEN
    CREATE POLICY lookbook_posts_delete ON lookbook_posts FOR DELETE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'lookbook_likes_read') THEN
    CREATE POLICY lookbook_likes_read ON lookbook_likes FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'lookbook_likes_insert') THEN
    CREATE POLICY lookbook_likes_insert ON lookbook_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'lookbook_likes_delete') THEN
    CREATE POLICY lookbook_likes_delete ON lookbook_likes FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Trigger to update likes_count
CREATE OR REPLACE FUNCTION update_lookbook_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE lookbook_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE lookbook_posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_lookbook_likes_count ON lookbook_likes;
CREATE TRIGGER trigger_lookbook_likes_count
  AFTER INSERT OR DELETE ON lookbook_likes
  FOR EACH ROW EXECUTE FUNCTION update_lookbook_likes_count();

-- ════════════════════════════════════════════════════════
-- 2. COLLECTIONS — User curated collections ("armarios")
-- ════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  is_public BOOLEAN DEFAULT true,
  products_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS collection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(collection_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_collections_user ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_collection ON collection_items(collection_id);

ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'collections_read') THEN
    CREATE POLICY collections_read ON collections FOR SELECT USING (is_public = true OR user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'collections_insert') THEN
    CREATE POLICY collections_insert ON collections FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'collections_update') THEN
    CREATE POLICY collections_update ON collections FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'collections_delete') THEN
    CREATE POLICY collections_delete ON collections FOR DELETE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'collection_items_read') THEN
    CREATE POLICY collection_items_read ON collection_items FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'collection_items_insert') THEN
    CREATE POLICY collection_items_insert ON collection_items FOR INSERT WITH CHECK (
      EXISTS (SELECT 1 FROM collections WHERE id = collection_id AND user_id = auth.uid())
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'collection_items_delete') THEN
    CREATE POLICY collection_items_delete ON collection_items FOR DELETE USING (
      EXISTS (SELECT 1 FROM collections WHERE id = collection_id AND user_id = auth.uid())
    );
  END IF;
END $$;

-- Trigger for products_count
CREATE OR REPLACE FUNCTION update_collection_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE collections SET products_count = products_count + 1, updated_at = NOW() WHERE id = NEW.collection_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE collections SET products_count = products_count - 1, updated_at = NOW() WHERE id = OLD.collection_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_collection_count ON collection_items;
CREATE TRIGGER trigger_collection_count
  AFTER INSERT OR DELETE ON collection_items
  FOR EACH ROW EXECUTE FUNCTION update_collection_count();

-- ════════════════════════════════════════════════════════
-- 3. SELLER VERIFICATIONS
-- ════════════════════════════════════════════════════════
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'none'
  CHECK (verification_status IN ('none', 'pending', 'verified', 'top_seller', 'creator'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_badge TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ban_reason TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banned_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS shipping_policy TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS return_policy TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS featured_products UUID[] DEFAULT '{}';

-- ════════════════════════════════════════════════════════
-- 4. BLOG POSTS
-- ════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image TEXT,
  tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_status ON blog_posts(status) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_blog_published ON blog_posts(published_at DESC);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'blog_posts_public_read') THEN
    CREATE POLICY blog_posts_public_read ON blog_posts FOR SELECT USING (status = 'published');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'blog_posts_admin_all') THEN
    CREATE POLICY blog_posts_admin_all ON blog_posts FOR ALL USING (
      EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
    );
  END IF;
END $$;

-- ════════════════════════════════════════════════════════
-- 5. FAIRS CALENDAR
-- ════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS fairs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  description TEXT,
  image_url TEXT,
  location_url TEXT,
  is_major BOOLEAN DEFAULT false,
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM NOW()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fairs_dates ON fairs(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_fairs_province ON fairs(province);
CREATE INDEX IF NOT EXISTS idx_fairs_year ON fairs(year);

ALTER TABLE fairs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'fairs_public_read') THEN
    CREATE POLICY fairs_public_read ON fairs FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'fairs_admin_all') THEN
    CREATE POLICY fairs_admin_all ON fairs FOR ALL USING (
      EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
    );
  END IF;
END $$;

-- ════════════════════════════════════════════════════════
-- 6. ADMIN MODERATION — Reports & content flags
-- ════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS content_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reported_product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  reported_conversation_id UUID,
  reason TEXT NOT NULL CHECK (reason IN (
    'inappropriate_content', 'spam', 'fake_product', 'scam',
    'sharing_contact', 'external_links', 'harassment', 'other'
  )),
  description TEXT,
  evidence_urls TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  admin_notes TEXT,
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON content_reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_reported_user ON content_reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_reports_created ON content_reports(created_at DESC);

ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'reports_user_insert') THEN
    CREATE POLICY reports_user_insert ON content_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'reports_user_read_own') THEN
    CREATE POLICY reports_user_read_own ON content_reports FOR SELECT USING (
      auth.uid() = reporter_id OR EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'reports_admin_update') THEN
    CREATE POLICY reports_admin_update ON content_reports FOR UPDATE USING (
      EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
    );
  END IF;
END $$;

-- Admin action log for audit trail
CREATE TABLE IF NOT EXISTS admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES profiles(id),
  action TEXT NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('user', 'product', 'order', 'conversation', 'report', 'blog', 'fair')),
  target_id UUID NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_actions_created ON admin_actions(created_at DESC);

ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admin_actions_read') THEN
    CREATE POLICY admin_actions_read ON admin_actions FOR SELECT USING (
      EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admin_actions_insert') THEN
    CREATE POLICY admin_actions_insert ON admin_actions FOR INSERT WITH CHECK (
      EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
    );
  END IF;
END $$;

-- ════════════════════════════════════════════════════════
-- 7. SHIPPING LABELS & TRACKING
-- ════════════════════════════════════════════════════════
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_weight_kg NUMERIC(5,2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_cost INTEGER DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_carrier TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_label_url TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_delivery DATE;

ALTER TABLE products ADD COLUMN IF NOT EXISTS weight_kg NUMERIC(5,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS shipping_from TEXT;

-- ════════════════════════════════════════════════════════
-- 8. PUSH NOTIFICATION SUBSCRIPTIONS
-- ════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'push_subs_own') THEN
    CREATE POLICY push_subs_own ON push_subscriptions FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- ════════════════════════════════════════════════════════
-- 9. RECOMMENDATION TRACKING
-- ════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS user_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category TEXT,
  color TEXT,
  size TEXT,
  price_range_min INTEGER,
  price_range_max INTEGER,
  score NUMERIC(5,2) DEFAULT 1.0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, category, color, size)
);

CREATE INDEX IF NOT EXISTS idx_user_interests_user ON user_interests(user_id);

ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'user_interests_own') THEN
    CREATE POLICY user_interests_own ON user_interests FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;
