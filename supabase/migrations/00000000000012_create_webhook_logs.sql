-- Migration: Create webhook_logs table
-- Requirements: 1.2, 1.3, 1.4, 1.7, 1.8

CREATE TABLE webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  message_id TEXT UNIQUE,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'processed', 'failed', 'ignored')),
  error_message TEXT,
  processing_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
