-- Migration: Contact messages table + seller balance view
-- For: Contact form storage

CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: only service_role can insert/read (API routes use supabaseAdmin)
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow service_role full access (no user-facing RLS policies needed)
