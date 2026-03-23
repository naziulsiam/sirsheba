-- SirSheba Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query

-- ─── Tutors Table ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tutors (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  full_name       TEXT NOT NULL,
  email           TEXT UNIQUE NOT NULL,
  phone           TEXT UNIQUE NOT NULL,
  password_hash   TEXT,
  pin_hash        TEXT,
  email_verified  BOOLEAN NOT NULL DEFAULT false,
  email_otp       TEXT,
  email_otp_expires_at TIMESTAMPTZ,
  plan_type       TEXT NOT NULL DEFAULT 'free' CHECK (plan_type IN ('free', 'basic', 'pro')),
  role            TEXT NOT NULL DEFAULT 'tutor' CHECK (role IN ('tutor', 'admin')),
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tutors_updated_at
  BEFORE UPDATE ON tutors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Login Sessions Table ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS login_sessions (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tutor_id    TEXT NOT NULL REFERENCES tutors(id) ON DELETE CASCADE,
  device      TEXT NOT NULL DEFAULT 'Unknown Device',
  ip          TEXT NOT NULL DEFAULT '0.0.0.0',
  user_agent  TEXT,
  last_active TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast session lookups
CREATE INDEX IF NOT EXISTS login_sessions_tutor_id ON login_sessions(tutor_id);
CREATE INDEX IF NOT EXISTS login_sessions_expires_at ON login_sessions(expires_at);

-- ─── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS tutors_email ON tutors(email);
CREATE INDEX IF NOT EXISTS tutors_phone ON tutors(phone);

-- ─── Row Level Security ────────────────────────────────────────────────────────
-- We use service_role key from API routes, so RLS is disabled.
-- All access goes through our Next.js API routes (not direct client access).
ALTER TABLE tutors DISABLE ROW LEVEL SECURITY;
ALTER TABLE login_sessions DISABLE ROW LEVEL SECURITY;
