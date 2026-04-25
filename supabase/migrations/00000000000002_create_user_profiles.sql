-- Migration: Create user_profiles table
-- Requirements: 1.2, 1.3, 1.4
-- Note: This table does NOT have a restaurant_id column (documented exception).
-- The PK is also the FK to auth.users.

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
