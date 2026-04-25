-- Migration: Create shifts table
-- Requirements: 1.2, 1.3, 1.4, 1.6, 1.7
-- Tracks cashier shifts with opening/closing cash, sales totals, and notes.

CREATE TABLE shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  opening_cash NUMERIC(10,2) NOT NULL DEFAULT 0,
  closing_cash NUMERIC(10,2),
  expected_cash NUMERIC(10,2),
  total_sales NUMERIC(10,2),
  total_orders INTEGER,
  difference NUMERIC(10,2),
  notes TEXT,
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
