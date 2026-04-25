-- Migration: Create restaurants table
-- Requirements: 1.1, 1.2, 1.3, 1.4, 1.5

CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  phone TEXT,
  address TEXT,
  timezone TEXT NOT NULL DEFAULT 'America/Mexico_City',
  currency TEXT NOT NULL DEFAULT 'MXN',
  tax_rate NUMERIC(5,4) NOT NULL DEFAULT 0.16,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
