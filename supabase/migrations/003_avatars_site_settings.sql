-- ============================================
-- Migration 003: Avatar storage bucket + site_settings
-- ============================================

-- ============================================
-- SUPABASE STORAGE: Avatars bucket
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "avatars: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars: authenticated upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "avatars: owner update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "avatars: owner delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================
-- SITE SETTINGS table (key-value config for owner/devs)
-- ============================================
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id)
);

-- Seed default settings
INSERT INTO site_settings (key, value, description) VALUES
  ('general', '{"site_name": "Flamencalia", "tagline": "Larga vida a tu Flamenca", "contact_email": "info@flamencalia.com", "logo_url": "/cliente/flamencalia.jpg"}', 'Configuración general del sitio'),
  ('fees', '{"platform_fee_percent": 10, "min_payout": 500}', 'Comisiones y pagos'),
  ('appearance', '{"primary_color": "#C8102E", "accent_color": "#D4A843", "hero_image": ""}', 'Apariencia del sitio'),
  ('features', '{"reviews_enabled": true, "registration_open": true, "maintenance_mode": false, "product_approval_required": true}', 'Funcionalidades del sitio'),
  ('seo', '{"meta_title": "Flamencalia — Larga vida a tu Flamenca", "meta_description": "Marketplace de moda flamenca: vestidos, mantones, flores, complementos y más. Compra a diseñadores y a la comunidad.", "og_image": ""}', 'SEO y metadatos')
ON CONFLICT (key) DO NOTHING;

-- Only admins (or service role) can manage site_settings
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "site_settings: public read" ON site_settings FOR SELECT USING (true);
-- Updates will be done through service role (admin API), so no user-level update policy needed

-- ============================================
-- ADMIN USERS table (email-based admin access)
-- ============================================
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('owner', 'dev', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_users: self read" ON admin_users FOR SELECT USING (user_id = auth.uid());
