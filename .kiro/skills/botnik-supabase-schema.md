# Botnik — Esquema de Base de Datos Supabase

## Tablas del Sistema

Al crear o modificar tablas, respetar siempre este esquema. Referencia completa en #[[file:requerimentos.md]].

### Resumen de Tablas

| Tabla                 | Propósito                                                                     |
| --------------------- | ----------------------------------------------------------------------------- |
| `restaurants`         | Tenant principal. Todos los datos se filtran por este ID.                     |
| `user_profiles`       | Datos extra del usuario (extiende `auth.users`).                              |
| `user_restaurants`    | Relación N:N usuario↔restaurante con rol. Base del RLS.                       |
| `menu_items`          | Productos del menú con precio, categoría, disponibilidad.                     |
| `ingredients`         | Insumos con stock actual, mínimo y costo unitario.                            |
| `product_recipes`     | Receta: vincula menu_item con ingredientes y cantidades.                      |
| `tables`              | Mesas del restaurante con estado y zona.                                      |
| `shifts`              | Turnos de cajero con apertura/cierre y totales.                               |
| `orders`              | Órdenes con tipo, estado, mesa, turno, cliente.                               |
| `order_items`         | Items de cada orden con modificadores (JSONB).                                |
| `inventory_movements` | Registro de todo movimiento de stock (purchase/consumption/adjustment/waste). |
| `webhook_logs`        | Log crudo de webhooks de Meta (idempotencia por message_id).                  |
| `audit_logs`          | Auditoría de operaciones críticas con old_data/new_data.                      |

### Reglas de Esquema

- Todas las tablas de negocio requieren `restaurant_id` con FK a `restaurants`.
- PKs son UUID con `gen_random_uuid()`.
- Enums se implementan con CHECK constraints, no con tipos ENUM.
- `modifiers` en `order_items` es JSONB (array de strings).
- `old_data` y `new_data` en `audit_logs` son JSONB.
- `payload` en `webhook_logs` es JSONB.
- `webhook_logs.message_id` tiene constraint UNIQUE para idempotencia.

### RLS — Patrón Base

Todas las policies siguen este patrón:

```sql
-- Ejemplo para menu_items
CREATE POLICY "tenant_isolation" ON menu_items
  FOR ALL
  USING (
    restaurant_id IN (
      SELECT restaurant_id FROM user_restaurants
      WHERE user_id = auth.uid() AND is_active = true
    )
  );
```

Para operaciones de escritura, agregar verificación de rol:

```sql
-- Solo owner/admin pueden modificar menú
CREATE POLICY "menu_write" ON menu_items
  FOR INSERT
  WITH CHECK (
    restaurant_id IN (
      SELECT restaurant_id FROM user_restaurants
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
        AND is_active = true
    )
  );
```

### Índices Requeridos

```sql
CREATE INDEX idx_orders_restaurant ON orders(restaurant_id, created_at DESC);
CREATE INDEX idx_orders_status ON orders(restaurant_id, status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_menu_items_restaurant ON menu_items(restaurant_id, is_available);
CREATE INDEX idx_ingredients_restaurant ON ingredients(restaurant_id);
CREATE INDEX idx_inventory_movements_ingredient ON inventory_movements(ingredient_id, created_at DESC);
CREATE INDEX idx_shifts_restaurant_active ON shifts(restaurant_id, status) WHERE status = 'active';
CREATE INDEX idx_webhook_logs_message ON webhook_logs(message_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_user_restaurants_user ON user_restaurants(user_id);
CREATE INDEX idx_tables_restaurant ON tables(restaurant_id, status);
```

### Flujo de Inventario (Triggers/n8n)

Al confirmar orden (`status: confirmed`):

1. Para cada `order_item` → buscar receta en `product_recipes`
2. Para cada ingrediente de la receta → restar `quantity_needed × order_item.quantity` de `ingredients.current_stock`
3. Insertar registro en `inventory_movements` con `type: 'consumption'`
4. Si `current_stock <= min_stock` → emitir alerta

Al cancelar/reembolsar → revertir el proceso (sumar stock de vuelta).

### Tipos de Movimiento de Inventario

- `purchase` — Compra/reposición (+)
- `consumption` — Consumo por orden (-)
- `adjustment` — Ajuste manual (+/-)
- `waste` — Merma/desperdicio (-)
