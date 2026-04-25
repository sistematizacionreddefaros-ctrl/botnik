-- Migration: Create user_restaurants table
-- Requirements: 1.2, 1.3, 1.4, 1.6, 1.7, 1.9, 4.1
-- Links users to restaurants with a specific role.
-- UNIQUE(user_id, restaurant_id) prevents duplicate roles per restaurant.

CREATE TABLE user_restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'cashier', 'waiter', 'kitchen')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, restaurant_id)
);
