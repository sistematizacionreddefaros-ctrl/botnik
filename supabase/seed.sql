-- =============================================================================
-- BOTNIK POS — Seed Data for Development
-- Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7
-- 
-- All inserts use INSERT ... ON CONFLICT DO NOTHING for idempotency.
-- Fixed UUIDs ensure repeated runs produce no duplicates.
-- =============================================================================

-- 1. Demo Restaurant (Req 5.1)
INSERT INTO restaurants (id, name, slug, phone, address, timezone, currency, tax_rate, is_active)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'La Cantina de Botnik',
  'cantina-botnik',
  '+52 55 1234 5678',
  'Av. Reforma 123, Col. Centro, CDMX',
  'America/Mexico_City',
  'MXN',
  0.16,
  true
)
ON CONFLICT (slug) DO NOTHING;

-- 2. Demo Users — auth.users (Req 5.2)
--    Password for all: "Demo1234!" (bcrypt hash)
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token
)
VALUES
  ('b0000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','owner@botnik.demo','$2a$10$PznXGKWFiRCKLGHMO0sM0OXH3ocHRXdNuuPGx5GOYsdeIjqFRFMa2',now(),'{"provider":"email","providers":["email"]}','{"full_name":"Carlos Mendoza"}',now(),now(),'',''),
  ('b0000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','admin@botnik.demo','$2a$10$PznXGKWFiRCKLGHMO0sM0OXH3ocHRXdNuuPGx5GOYsdeIjqFRFMa2',now(),'{"provider":"email","providers":["email"]}','{"full_name":"Ana García"}',now(),now(),'',''),
  ('b0000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000000','authenticated','authenticated','cashier@botnik.demo','$2a$10$PznXGKWFiRCKLGHMO0sM0OXH3ocHRXdNuuPGx5GOYsdeIjqFRFMa2',now(),'{"provider":"email","providers":["email"]}','{"full_name":"Luis Ramírez"}',now(),now(),'',''),
  ('b0000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000000','authenticated','authenticated','waiter@botnik.demo','$2a$10$PznXGKWFiRCKLGHMO0sM0OXH3ocHRXdNuuPGx5GOYsdeIjqFRFMa2',now(),'{"provider":"email","providers":["email"]}','{"full_name":"María Torres"}',now(),now(),'',''),
  ('b0000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000000','authenticated','authenticated','kitchen@botnik.demo','$2a$10$PznXGKWFiRCKLGHMO0sM0OXH3ocHRXdNuuPGx5GOYsdeIjqFRFMa2',now(),'{"provider":"email","providers":["email"]}','{"full_name":"Roberto Sánchez"}',now(),now(),'','')
ON CONFLICT (id) DO NOTHING;

-- 3. User Profiles (Req 5.2)
INSERT INTO user_profiles (id, full_name, phone)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Carlos Mendoza',  '+52 55 1111 0001'),
  ('b0000000-0000-0000-0000-000000000002', 'Ana García',      '+52 55 1111 0002'),
  ('b0000000-0000-0000-0000-000000000003', 'Luis Ramírez',    '+52 55 1111 0003'),
  ('b0000000-0000-0000-0000-000000000004', 'María Torres',    '+52 55 1111 0004'),
  ('b0000000-0000-0000-0000-000000000005', 'Roberto Sánchez', '+52 55 1111 0005')
ON CONFLICT (id) DO NOTHING;

-- 4. User-Restaurant Assignments (Req 5.2)
INSERT INTO user_restaurants (id, user_id, restaurant_id, role, is_active)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'owner',   true),
  ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'admin',   true),
  ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'cashier', true),
  ('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'waiter',  true),
  ('c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'kitchen', true)
ON CONFLICT (user_id, restaurant_id) DO NOTHING;

-- 5. Menu Items — 12 items in 3+ categories (Req 5.3)
INSERT INTO menu_items (id, restaurant_id, name, description, price, category, is_available, sort_order)
VALUES
  ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Guacamole Clásico',     'Aguacate fresco con cebolla, cilantro, chile serrano y limón',  95.00,  'entrada',       true,  1),
  ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Queso Fundido',         'Queso Oaxaca gratinado con chorizo y tortillas de maíz',       120.00,  'entrada',       true,  2),
  ('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Sopa de Tortilla',      'Caldo de jitomate con tiras de tortilla, aguacate y crema',     85.00,  'entrada',       true,  3),
  ('d0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Ensalada Botnik',       'Lechugas mixtas, mango, jícama, pepino y aderezo de limón',     90.00,  'entrada',       true,  4),
  ('d0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Tacos al Pastor',       'Tres tacos de cerdo adobado con piña, cebolla y cilantro',    145.00,  'plato_fuerte',  true,  5),
  ('d0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'Enchiladas Verdes',     'Tres enchiladas de pollo bañadas en salsa verde con crema',   155.00,  'plato_fuerte',  true,  6),
  ('d0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'Arrachera a la Parrilla','Corte de res marinado con guarnición de nopales y frijoles',  220.00,  'plato_fuerte',  true,  7),
  ('d0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'Mole Poblano',          'Pollo bañado en mole tradicional con arroz y tortillas',      185.00,  'plato_fuerte',  true,  8),
  ('d0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', 'Chilaquiles Rojos',     'Totopos en salsa roja con pollo, crema, queso y cebolla',     130.00,  'plato_fuerte',  false, 9),
  ('d0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', 'Agua de Horchata',      'Bebida tradicional de arroz con canela y vainilla',            45.00,  'bebida',        true,  10),
  ('d0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000001', 'Margarita Clásica',     'Tequila, triple sec, jugo de limón y sal en el borde',        135.00,  'bebida',        true,  11),
  ('d0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000001', 'Cerveza Artesanal',     'Cerveza local de barril, estilo lager mexicana',               75.00,  'bebida',        true,  12)
ON CONFLICT (id) DO NOTHING;

-- 6. Ingredients — 12 ingredients (Req 5.4)
INSERT INTO ingredients (id, restaurant_id, name, unit, current_stock, min_stock, cost_per_unit)
VALUES
  ('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Aguacate',          'unit', 50.00,  10.00, 35.0000),
  ('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Queso Oaxaca',      'g',    5000.00, 500.00, 0.2200),
  ('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Tortilla de Maíz',  'unit', 200.00, 50.00,  1.5000),
  ('e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Cerdo Adobado',     'g',    8000.00, 1000.00, 0.1800),
  ('e0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Pechuga de Pollo',  'g',    6000.00, 800.00, 0.1500),
  ('e0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'Salsa Verde',       'ml',   3000.00, 500.00, 0.0800),
  ('e0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'Salsa Roja',        'ml',   3000.00, 500.00, 0.0700),
  ('e0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'Arroz',             'g',    10000.00, 2000.00, 0.0300),
  ('e0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', 'Tequila Blanco',    'ml',   5000.00, 1000.00, 0.3500),
  ('e0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', 'Limón',             'unit', 100.00, 20.00,  3.0000),
  ('e0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000001', 'Cebolla',           'unit', 40.00,  10.00,  8.0000),
  ('e0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000001', 'Crema Ácida',       'ml',   2000.00, 300.00, 0.0600)
ON CONFLICT (id) DO NOTHING;

-- 7. Product Recipes (Req 5.5)
INSERT INTO product_recipes (id, menu_item_id, ingredient_id, quantity_needed)
VALUES
  ('f0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 2.00),
  ('f0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000010', 3.00),
  ('f0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000011', 0.50),
  ('f0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002', 200.00),
  ('f0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000003', 4.00),
  ('f0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000004', 250.00),
  ('f0000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000003', 3.00),
  ('f0000000-0000-0000-0000-000000000008', 'd0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000011', 0.50),
  ('f0000000-0000-0000-0000-000000000009', 'd0000000-0000-0000-0000-000000000006', 'e0000000-0000-0000-0000-000000000005', 200.00),
  ('f0000000-0000-0000-0000-000000000010', 'd0000000-0000-0000-0000-000000000006', 'e0000000-0000-0000-0000-000000000006', 150.00),
  ('f0000000-0000-0000-0000-000000000011', 'd0000000-0000-0000-0000-000000000006', 'e0000000-0000-0000-0000-000000000003', 3.00),
  ('f0000000-0000-0000-0000-000000000012', 'd0000000-0000-0000-0000-000000000006', 'e0000000-0000-0000-0000-000000000012', 50.00),
  ('f0000000-0000-0000-0000-000000000013', 'd0000000-0000-0000-0000-000000000008', 'e0000000-0000-0000-0000-000000000005', 250.00),
  ('f0000000-0000-0000-0000-000000000014', 'd0000000-0000-0000-0000-000000000008', 'e0000000-0000-0000-0000-000000000008', 150.00),
  ('f0000000-0000-0000-0000-000000000015', 'd0000000-0000-0000-0000-000000000008', 'e0000000-0000-0000-0000-000000000003', 3.00),
  ('f0000000-0000-0000-0000-000000000016', 'd0000000-0000-0000-0000-000000000011', 'e0000000-0000-0000-0000-000000000009', 60.00),
  ('f0000000-0000-0000-0000-000000000017', 'd0000000-0000-0000-0000-000000000011', 'e0000000-0000-0000-0000-000000000010', 2.00),
  ('f0000000-0000-0000-0000-000000000018', 'd0000000-0000-0000-0000-000000000009', 'e0000000-0000-0000-0000-000000000003', 6.00),
  ('f0000000-0000-0000-0000-000000000019', 'd0000000-0000-0000-0000-000000000009', 'e0000000-0000-0000-0000-000000000007', 200.00),
  ('f0000000-0000-0000-0000-000000000020', 'd0000000-0000-0000-0000-000000000009', 'e0000000-0000-0000-0000-000000000005', 150.00),
  ('f0000000-0000-0000-0000-000000000021', 'd0000000-0000-0000-0000-000000000009', 'e0000000-0000-0000-0000-000000000012', 40.00)
ON CONFLICT (menu_item_id, ingredient_id) DO NOTHING;

-- 8. Tables — 6 tables (Req 5.6)
INSERT INTO tables (id, restaurant_id, label, capacity, status, zone, sort_order)
VALUES
  ('aa000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Mesa 1',  4, 'free',     'Terraza',  1),
  ('aa000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Mesa 2',  2, 'occupied', 'Terraza',  2),
  ('aa000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Mesa 3',  6, 'reserved', 'Interior', 3),
  ('aa000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Mesa 4',  4, 'free',     'Interior', 4),
  ('aa000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Mesa 5',  8, 'occupied', 'Salón VIP', 5),
  ('aa000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'Barra 1', 2, 'free',     'Barra',    6)
ON CONFLICT (id) DO NOTHING;
