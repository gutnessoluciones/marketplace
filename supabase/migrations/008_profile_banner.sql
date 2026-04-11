-- Add banner_url to profiles for customizable cover photos
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- Create banners storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('banners', 'banners', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;
