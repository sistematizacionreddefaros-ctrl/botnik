-- Migration: Create indexes for optimized queries
-- Requirements: 1.11

CREATE INDEX idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_menu_items_restaurant ON menu_items(restaurant_id);
CREATE INDEX idx_ingredients_restaurant ON ingredients(restaurant_id);
CREATE INDEX idx_inventory_movements_ingredient ON inventory_movements(ingredient_id);
CREATE INDEX idx_shifts_restaurant_active ON shifts(restaurant_id) WHERE status = 'active';
CREATE INDEX idx_webhook_logs_message ON webhook_logs(message_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_user_restaurants_user ON user_restaurants(user_id);
CREATE INDEX idx_tables_restaurant ON tables(restaurant_id);
