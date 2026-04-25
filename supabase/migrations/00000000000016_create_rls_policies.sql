-- Migration: Create RLS policies for all tables
-- Requirements: 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10

-- ============================================================================
-- 1. restaurants
-- ============================================================================

CREATE POLICY "restaurants_select"
  ON restaurants FOR SELECT
  USING (
    id IN (
      SELECT restaurant_id FROM user_restaurants
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "restaurants_insert"
  ON restaurants FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_restaurants
      WHERE user_id = auth.uid()
        AND restaurant_id = restaurants.id
        AND is_active = true
        AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "restaurants_update"
  ON restaurants FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_restaurants
      WHERE user_id = auth.uid()
        AND restaurant_id = restaurants.id
        AND is_active = true
        AND role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_restaurants
      WHERE user_id = auth.uid()
        AND restaurant_id = restaurants.id
        AND is_active = true
        AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "restaurants_delete"
  ON restaurants FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_restaurants
      WHERE user_id = auth.uid()
        AND restaurant_id = restaurants.id
        AND is_active = true
        AND role IN ('owner', 'admin')
    )
  );

-- ============================================================================
-- 2. user_profiles
-- ============================================================================

CREATE POLICY "user_profiles_select"
  ON user_profiles FOR SELECT
  USING (
    id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_restaurants ur_owner
      WHERE ur_owner.user_id = auth.uid()
        AND ur_owner.is_active = true
        AND ur_owner.role = 'owner'
        AND ur_owner.restaurant_id IN (
          SELECT ur_target.restaurant_id FROM user_restaurants ur_target
          WHERE ur_target.user_id = user_profiles.id
            AND ur_target.is_active = true
        )
    )
  );

CREATE POLICY "user_profiles_insert"
  ON user_profiles FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "user_profiles_update"
  ON user_profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "user_profiles_delete"
  ON user_profiles FOR DELETE
  USING (id = auth.uid());

-- ============================================================================
-- 3. user_restaurants
-- ============================================================================

CREATE POLICY "user_restaurants_select"
  ON user_restaurants FOR SELECT
  USING (
    restaurant_id IN (
      SELECT restaurant_id FROM user_restaurants
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "user_restaurants_insert"
  ON user_restaurants FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_restaurants
      WHERE user_id = auth.uid()
        AND restaurant_id = user_restaurants.restaurant_id
        AND is_active = true
        AND role = 'owner'
    )
  );

CREATE POLICY "user_restaurants_update"
  ON user_restaurants FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_restaurants ur_check
      WHERE ur_check.user_id = auth.uid()
        AND ur_check.restaurant_id = user_restaurants.restaurant_id
        AND ur_check.is_active = true
        AND ur_check.role = 'owner'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_restaurants ur_check
      WHERE ur_check.user_id = auth.uid()
        AND ur_check.restaurant_id = user_restaurants.restaurant_id
        AND ur_check.is_active = true
        AND ur_check.role = 'owner'
    )
  );

CREATE POLICY "user_restaurants_delete"
  ON user_restaurants FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_restaurants ur_check
      WHERE ur_check.user_id = auth.uid()
        AND ur_check.restaurant_id = user_restaurants.restaurant_id
        AND ur_check.is_active = true
        AND ur_check.role = 'owner'
    )
  );

-- ============================================================================
-- 4. menu_items
-- ============================================================================

CREATE POLICY "menu_items_select"
  ON menu_items FOR SELECT
  USING (
    restaurant_id IN (
      SELECT restaurant_id FROM user_restaurants
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "menu_items_insert"
  ON menu_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_restaurants
      WHERE user_id = auth.uid()
        AND restaurant_id = menu_items.restaurant_id
        AND is_active = true
        AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "menu_items_update"
  ON menu_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_restaurants
      WHERE user_id = auth.uid()
        AND restaurant_id = menu_items.restaurant_id
        AND is_active = true
        AND role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_restaurants
      WHERE user_id = auth.uid()
        AND restaurant_id = menu_items.restaurant_id
        AND is_active = true
        AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "menu_items_delete"
  ON menu_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_restaurants
      WHERE user_id = auth.uid()
        AND restaurant_id = menu_items.restaurant_id
        AND is_active = true
        AND role IN ('owner', 'admin')
    )
  );

-- ============================================================================
-- 5. ingredients
-- ============================================================================

CREATE POLICY "ingredients_select"
  ON ingredients FOR SELECT
  USING (
    restaurant_id IN (
      SELECT restaurant_id FROM user_restaurants
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "ingredients_insert"
  ON ingredients FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_restaurants
      WHERE user_id = auth.uid()
        AND restaurant_id = ingredients.restaurant_id
        AND is_active = true
        AND role IN ('owner', 'admin', 'cashier')
    )
  );

CREATE POLICY "ingredients_update"
  ON ingredients FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_restaurants
      WHERE user_id = auth.uid()
        AND restaurant_id = ingredients.restaurant_id
        AND is_active = true
        AND role IN ('owner', 'admin', 'cashier')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_restaurants
      WHERE user_id = auth.uid()
        AND restaurant_id = ingredients.restaurant_id
        AND is_active = true
        AND role IN ('owner', 'admin', 'cashier')
    )
  );

CREATE POLICY "ingredients_delete"
  ON ingredients FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_restaurants
      WHERE user_id = auth.uid()
        AND restaurant_id = ingredients.restaurant_id
        AND is_active = true
        AND role IN ('owner', 'admin', 'cashier')
    )
  );

-- ============================================================================
-- 6. product_recipes
-- ============================================================================

CREATE POLICY "product_recipes_select"
  ON product_recipes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM menu_items
      WHERE menu_items.id = product_recipes.menu_item_id
        AND menu_items.restaurant_id IN (
          SELECT restaurant_id FROM user_restaurants
          WHERE user_id = auth.uid() AND is_active = true
        )
    )
  );

CREATE POLICY "product_recipes_insert"
  ON product_recipes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM menu_items
      JOIN user_restaurants ON user_restaurants.restaurant_id = menu_items.restaurant_id
      WHERE menu_items.id = product_recipes.menu_item_id
        AND user_restaurants.user_id = auth.uid()
        AND user_restaurants.is_active = true
        AND user_restaurants.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "product_recipes_update"
  ON product_recipes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM menu_items
      JOIN user_restaurants ON user_restaurants.restaurant_id = menu_items.restaurant_id
      WHERE menu_items.id = product_recipes.menu_item_id
        AND user_restaurants.user_id = auth.uid()
        AND user_restaurants.is_active = true
        AND user_restaurants.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM menu_items
      JOIN user_restaurants ON user_restaurants.restaurant_id = menu_items.restaurant_id
      WHERE menu_items.id = product_recipes.menu_item_id
        AND user_restaurants.user_id = auth.uid()
        AND user_restaurants.is_active = true
        AND user_restaurants.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "product_recipes_delete"
  ON product_recipes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM menu_items
      JOIN user_restaurants ON user_restaurants.restaurant_id = menu_items.restaurant_id
      WHERE menu_items.id = product_recipes.menu_item_id
        AND user_restaurants.user_id = auth.uid()
        AND user_restaurants.is_active = true
        AND user_restaurants.role IN ('owner', 'admin')
    )
  );

-- ============================================================================
-- 7. tables
-- ============================================================================

CREATE POLICY "tables_select"
  ON tables FOR SELECT
  USING (
    restaurant_id IN (
      SELECT restaurant_id FROM user_restaurants
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "tables_insert"
  ON tables FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_restaurants
      WHERE user_id = auth.uid()
        AND restaurant_id = tables.restaurant_id
        AND is_active = true
        AND role IN ('owner', 'admin', 'cashier', 'waiter')
    )
  );

CREATE POLICY "tables_update"
  ON tables FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_restaurants
      WHERE user_id = auth.uid()
        AND restaurant_id = tables.restaurant_id
        AND is_active = true
        AND role IN ('owner', 'admin', 'cashier', 'waiter')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_restaurants
      WHERE user_id = auth.uid()
        AND restaurant_id = tables.restaurant_id
        AND is_active = true
        AND role IN ('owner', 'admin', 'cashier', 'waiter')
    )
  );

CREATE POLICY "tables_delete"
  ON tables FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_restaurants
      WHERE user_id = auth.uid()
        AND restaurant_id = tables.restaurant_id
        AND is_active = true
        AND role IN ('owner', 'admin', 'cashier', 'waiter')
    )
  );

-- ============================================================================
-- 8. shifts
-- ============================================================================

CREATE POLICY "shifts_select"
  ON shifts FOR SELECT
  USING (
    restaurant_id IN (
      SELECT restaurant_id FROM user_restaurants
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "shifts_insert"
  ON shifts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_restaurants
      WHERE user_id = auth.uid()
        AND restaurant_id = shifts.restaurant_id
        AND is_active = true
        AND role IN ('owner', 'admin', 'cashier', 'waiter', 'kitchen')
    )
  );

CREATE POLICY "shifts_update"
  ON shifts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_restaurants
      WHERE user_id = auth.uid()
        AND restaurant_id = shifts.restaurant_id
        AND is_active = true
        AND role IN ('owner', 'admin', 'cashier', 'waiter', 'kitchen')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_restaurants
      WHERE user_id = auth.uid()
        AND restaurant_id = shifts.restaurant_id
        AND is_active = true
        AND role IN ('owner', 'admin', 'cashier', 'waiter', 'kitchen')
    )
  );

CREATE POLICY "shifts_delete"
  ON shifts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_restaurants
      WHERE user_id = auth.uid()
        AND restaurant_id = shifts.restaurant_id
        AND is_active = true
        AND role IN ('owner', 'admin', 'cashier', 'waiter', 'kitchen')
    )
  );

-- ============================================================================
-- 9. orders
-- ============================================================================

CREATE POLICY "orders_select"
  ON orders FOR SELECT
  USING (
    restaurant_id IN (
      SELECT restaurant_id FROM user_restaurants
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "orders_insert"
  ON orders FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_restaurants
      WHERE user_id = auth.uid()
        AND restaurant_id = orders.restaurant_id
        AND is_active = true
        AND role IN ('owner', 'admin', 'cashier')
    )
  );

CREATE POLICY "orders_update"
  ON orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_restaurants
      WHERE user_id = auth.uid()
        AND restaurant_id = orders.restaurant_id
        AND is_active = true
        AND role IN ('owner', 'admin', 'cashier')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_restaurants
      WHERE user_id = auth.uid()
        AND restaurant_id = orders.restaurant_id
        AND is_active = true
        AND role IN ('owner', 'admin', 'cashier')
    )
  );

CREATE POLICY "orders_delete"
  ON orders FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_restaurants
      WHERE user_id = auth.uid()
        AND restaurant_id = orders.restaurant_id
        AND is_active = true
        AND role IN ('owner', 'admin', 'cashier')
    )
  );

-- ============================================================================
-- 10. order_items
-- ============================================================================

CREATE POLICY "order_items_select"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND orders.restaurant_id IN (
          SELECT restaurant_id FROM user_restaurants
          WHERE user_id = auth.uid() AND is_active = true
        )
    )
  );

CREATE POLICY "order_items_insert"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      JOIN user_restaurants ON user_restaurants.restaurant_id = orders.restaurant_id
      WHERE orders.id = order_items.order_id
        AND user_restaurants.user_id = auth.uid()
        AND user_restaurants.is_active = true
        AND user_restaurants.role IN ('owner', 'admin', 'cashier')
    )
  );

CREATE POLICY "order_items_update"
  ON order_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM orders
      JOIN user_restaurants ON user_restaurants.restaurant_id = orders.restaurant_id
      WHERE orders.id = order_items.order_id
        AND user_restaurants.user_id = auth.uid()
        AND user_restaurants.is_active = true
        AND user_restaurants.role IN ('owner', 'admin', 'cashier')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      JOIN user_restaurants ON user_restaurants.restaurant_id = orders.restaurant_id
      WHERE orders.id = order_items.order_id
        AND user_restaurants.user_id = auth.uid()
        AND user_restaurants.is_active = true
        AND user_restaurants.role IN ('owner', 'admin', 'cashier')
    )
  );

CREATE POLICY "order_items_delete"
  ON order_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM orders
      JOIN user_restaurants ON user_restaurants.restaurant_id = orders.restaurant_id
      WHERE orders.id = order_items.order_id
        AND user_restaurants.user_id = auth.uid()
        AND user_restaurants.is_active = true
        AND user_restaurants.role IN ('owner', 'admin', 'cashier')
    )
  );

-- ============================================================================
-- 11. inventory_movements
-- ============================================================================

CREATE POLICY "inventory_movements_select"
  ON inventory_movements FOR SELECT
  USING (
    restaurant_id IN (
      SELECT restaurant_id FROM user_restaurants
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "inventory_movements_insert"
  ON inventory_movements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_restaurants
      WHERE user_id = auth.uid()
        AND restaurant_id = inventory_movements.restaurant_id
        AND is_active = true
        AND role IN ('owner', 'admin', 'cashier')
    )
  );

CREATE POLICY "inventory_movements_update"
  ON inventory_movements FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_restaurants
      WHERE user_id = auth.uid()
        AND restaurant_id = inventory_movements.restaurant_id
        AND is_active = true
        AND role IN ('owner', 'admin', 'cashier')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_restaurants
      WHERE user_id = auth.uid()
        AND restaurant_id = inventory_movements.restaurant_id
        AND is_active = true
        AND role IN ('owner', 'admin', 'cashier')
    )
  );

CREATE POLICY "inventory_movements_delete"
  ON inventory_movements FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_restaurants
      WHERE user_id = auth.uid()
        AND restaurant_id = inventory_movements.restaurant_id
        AND is_active = true
        AND role IN ('owner', 'admin', 'cashier')
    )
  );

-- ============================================================================
-- 12. webhook_logs
-- ============================================================================

CREATE POLICY "webhook_logs_select"
  ON webhook_logs FOR SELECT
  USING (
    restaurant_id IS NULL
    OR restaurant_id IN (
      SELECT restaurant_id FROM user_restaurants
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "webhook_logs_insert"
  ON webhook_logs FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- 13. audit_logs
-- ============================================================================

CREATE POLICY "audit_logs_select"
  ON audit_logs FOR SELECT
  USING (
    restaurant_id IN (
      SELECT restaurant_id FROM user_restaurants
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "audit_logs_insert"
  ON audit_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_restaurants
      WHERE user_id = auth.uid()
        AND restaurant_id = audit_logs.restaurant_id
        AND is_active = true
    )
  );
