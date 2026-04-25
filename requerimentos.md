# 📋 BOTNIK — Requerimientos del Sistema

## 🎯 Objetivo

Sistema POS web multi-tenant para restaurantes + Chatbot de WhatsApp con IA para recibir pedidos. Incluye inventario por insumos con recetas, comandas por mesa, control de turnos, roles granulares e impresión térmica 100% web vía puente local.

---

## 🛠️ Stack Tecnológico

| Capa           | Tecnología                                                            |
| -------------- | --------------------------------------------------------------------- |
| Frontend       | React 18 + Vite + TypeScript + Tailwind CSS                           |
| Backend / DB   | Supabase (PostgreSQL 15, Auth, Realtime, RLS, Edge Functions)         |
| Automatización | n8n autohospedado + Redis (Queue Mode)                                |
| IA             | n8n AI Agent → Groq (Llama-3.1-70b) o OpenRouter como fallback        |
| WhatsApp       | Meta Cloud API v21.0 (ventana 24 h, sin plantillas proactivas)        |
| Impresión      | Node.js + Express + `node-thermal-printer` en tablet Android (Termux) |
| Hosting        | Hostinger VPS · Docker Compose + Nginx + Certbot SSL                  |
| Monitoreo      | Logs estructurados en Supabase + alertas n8n → Telegram/email         |

---

## � Roles y Permisos

| Rol       | Caja | Cocina | Mesas | Inventario | Turnos | Config | Usuarios |
| --------- | ---- | ------ | ----- | ---------- | ------ | ------ | -------- |
| `owner`   | ✅   | ✅     | ✅    | ✅         | ✅     | ✅     | ✅       |
| `admin`   | ✅   | ✅     | ✅    | ✅         | ✅     | ✅     | ❌       |
| `cashier` | ✅   | 👁️     | ✅    | 👁️         | ✅     | ❌     | ❌       |
| `waiter`  | ❌   | 👁️     | ✅    | ❌         | ✅     | ❌     | ❌       |
| `kitchen` | ❌   | ✅     | 👁️    | 👁️         | ✅     | ❌     | ❌       |

✅ = CRUD · �️ = Solo lectura · ❌ = Sin acceso

---

## ✅ Funcionalidades por Módulo

### 🤖 M1 — Chatbot WhatsApp

**Flujo del webhook Meta Cloud API:**

```
GET  /webhook → Verificación (hub.verify_token + hub.challenge)
POST /webhook → Recepción de mensajes
  1. Loguear payload crudo en `webhook_logs` (idempotencia por `message_id`)
  2. Extraer texto del mensaje
  3. Enviar a n8n AI Agent → LLM parsea a JSON estructurado
  4. Validar JSON contra schema Zod/AJV
  5. Verificar stock de insumos
  6. Crear orden en Supabase (status: pending)
  7. Responder confirmación al usuario vía API de Meta
  8. Si falla → responder mensaje de error amigable + loguear en `webhook_logs`
```

**Schema JSON esperado de la IA:**

```jsonc
{
  "order_type": "delivery" | "pickup",
  "customer_phone": "+521234567890",
  "customer_name": "string | null",
  "items": [
    {
      "menu_item_name": "string",       // match fuzzy contra menu_items.name
      "quantity": 1,
      "modifiers": ["sin cebolla", "extra queso"],
      "notes": "string | null"
    }
  ],
  "delivery_address": "string | null",  // obligatorio si order_type = delivery
  "notes": "string | null"
}
```

**Reglas:**

- Solo responde dentro de ventana de 24 h de Meta.
- Idempotencia estricta por `message_id` (ignorar duplicados).
- Si el LLM no puede parsear → pedir aclaración al cliente (máx. 2 reintentos).
- Modificadores complejos: `sin cebolla`, `extra queso`, `mitad y mitad`, `al punto`.
- Rate limit: máx. 80 mensajes/segundo por número (límite de Meta).

---

### 🖥️ M2 — POS (React SPA)

**Vistas principales:**

| Vista      | Descripción                                                         |
| ---------- | ------------------------------------------------------------------- |
| Caja       | Crear/editar órdenes, cambiar estado de pago, ver totales del turno |
| Cocina     | Cola de órdenes pendientes/en preparación, marcar como lista        |
| Mesas      | Mapa visual de mesas con estado (libre/ocupada/reservada)           |
| Inventario | Stock actual, alertas de mínimos, movimientos, recetas              |
| Turnos     | Apertura/cierre, resumen de ventas por turno                        |
| Config     | Menú, mesas, ingredientes, usuarios (solo owner/admin)              |

**Comportamiento:**

- Realtime vía `supabase.channel` (órdenes nuevas, cambios de estado, stock bajo).
- Multi-tenant estricto: RLS filtra todo por `restaurant_id`.
- Pago manual: toggle `pending → paid → refunded`. Sin pasarela.
- Responsive: optimizado para tablet (uso principal en restaurante).
- Offline-first: service worker para cache de menú y UI básica.

---

### 📦 M3 — Inventario por Insumos

**Modelo:**

- Cada `ingredient` tiene: `name`, `unit` (`g`, `ml`, `unit`), `current_stock`, `min_stock`, `cost_per_unit`.
- Cada `menu_item` se vincula a N ingredientes vía `product_recipes` con `quantity_needed`.
- Al confirmar pedido → trigger descuenta stock automáticamente.

**Flujo de descuento:**

```
Orden confirmada (status: confirmed)
  → Para cada order_item:
    → Buscar receta en product_recipes
    → Para cada ingrediente:
      → Restar (quantity_needed × order_item.quantity) de current_stock
      → Insertar registro en inventory_movements (type: 'consumption')
      → Si current_stock <= min_stock → emitir alerta
```

**Tipos de movimiento (`inventory_movements.type`):**

- `purchase` — Compra/reposición (+)
- `consumption` — Consumo por orden (-)
- `adjustment` — Ajuste manual (+/-)
- `waste` — Merma/desperdicio (-)

---

### 🍽️ M4 — Comandas y Mesas

**Estados de mesa:**

```
free → occupied (al asignar orden dinein)
occupied → free (al cerrar/pagar orden)
free ↔ reserved (reserva manual)
reserved → occupied (al llegar el cliente)
```

**Reglas:**

- `order_type: dinein` obliga `table_id` no nulo.
- Una mesa `occupied` solo puede tener 1 orden activa.
- Al cambiar orden a `paid` o `cancelled` → mesa vuelve a `free`.

---

### ⏱️ M5 — Turnos

**Flujo:**

```
Cajero abre turno → shift.status = 'active', opening_cash registrado
  → Durante turno: todas las órdenes se vinculan al shift_id activo
Cajero cierra turno → shift.status = 'closed'
  → Se calcula: total_sales, total_orders, expected_cash, actual_cash, difference
```

**Reglas:**

- Solo 1 turno activo por usuario por restaurante.
- No se pueden crear órdenes sin turno activo (para cajeros).
- El cierre genera un snapshot inmutable para auditoría.

---

### 🖨️ M6 — Impresión Térmica

**Arquitectura:**

```
React (POS) → POST http://localhost:3000/print
  → Node.js bridge (en tablet Android vía Termux)
  → node-thermal-printer → impresora térmica (TCP/USB)
  → Timeout 2s → fallback window.print()
```

**Payload del endpoint `/print`:**

```jsonc
{
  "type": "order" | "receipt" | "kitchen",
  "restaurant_name": "string",
  "order_number": "string",
  "items": [
    { "name": "string", "qty": 1, "price": 10.50, "modifiers": ["extra queso"] }
  ],
  "subtotal": 42.00,
  "tax": 6.72,
  "total": 48.72,
  "payment_status": "paid",
  "table": "Mesa 5 | null",
  "cashier": "string",
  "timestamp": "ISO8601"
}
```

**Tipos de ticket:**

- `order` — Ticket completo para el cliente (con precios).
- `kitchen` — Comanda para cocina (sin precios, con modificadores grandes).
- `receipt` — Recibo de cierre de turno.

---

## 🔄 Máquina de Estados — Órdenes

```
pending → confirmed → preparing → ready → delivered → paid
                                                    ↘ refunded
pending → cancelled
confirmed → cancelled (con motivo obligatorio)
```

| Transición              | Quién la ejecuta        | Efecto                                       |
| ----------------------- | ----------------------- | -------------------------------------------- |
| `pending → confirmed`   | Cajero / Chatbot (auto) | Descuenta inventario                         |
| `confirmed → preparing` | Cocina                  | Notifica pantalla cocina                     |
| `preparing → ready`     | Cocina                  | Notifica caja/mesero                         |
| `ready → delivered`     | Mesero / Cajero         | —                                            |
| `delivered → paid`      | Cajero                  | Libera mesa si dinein                        |
| `* → cancelled`         | Cajero / Admin          | Revierte inventario + motivo obligatorio     |
| `paid → refunded`       | Admin / Owner           | Revierte inventario + registra en audit_logs |

---

## 🔒 Reglas Técnicas No Negociables

1. **RLS obligatorio** en TODAS las tablas. Filtrado por `restaurant_id` vía `user_restaurants`.
2. `SUPABASE_SERVICE_ROLE_KEY` **NUNCA** en frontend. Solo en n8n y Edge Functions.
3. Salida de IA → **JSON estricto** + validación con schema (Zod en frontend, AJV en n8n) antes de escribir en DB.
4. Puente de impresión: `POST http://localhost:3000/print` → timeout 2 s → fallback `window.print()`.
5. Webhooks: loguear siempre `message_id` + payload crudo + timestamp en `webhook_logs`.
6. Todas las operaciones de escritura críticas generan registro en `audit_logs`.
7. Passwords y tokens: nunca en código. Solo variables de entorno.
8. CORS del puente de impresión: solo `localhost` y dominio del POS.
9. Backups automáticos diarios de Supabase (pg_dump vía cron en VPS).
10. Rate limiting en Edge Functions y webhook endpoint.

---

## 🗄️ Esquema de Base de Datos

### `restaurants`

```sql
CREATE TABLE restaurants (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,           -- identificador URL-friendly
  phone         TEXT,
  address       TEXT,
  timezone      TEXT DEFAULT 'America/Mexico_City',
  currency      TEXT DEFAULT 'MXN',
  tax_rate      NUMERIC(5,4) DEFAULT 0.16,      -- 16% IVA
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);
```

### `users` (gestionado por Supabase Auth)

Se usa `auth.users` de Supabase. Datos extra en:

```sql
CREATE TABLE user_profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT NOT NULL,
  avatar_url    TEXT,
  phone         TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);
```

### `user_restaurants` (relación N:N con rol)

```sql
CREATE TABLE user_restaurants (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurant_id   UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  role            TEXT NOT NULL CHECK (role IN ('owner','admin','cashier','waiter','kitchen')),
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, restaurant_id)
);
```

### `menu_items`

```sql
CREATE TABLE menu_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id   UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  description     TEXT,
  price           NUMERIC(10,2) NOT NULL,
  category        TEXT NOT NULL,                -- 'entrada', 'plato_fuerte', 'bebida', etc.
  image_url       TEXT,
  is_available     BOOLEAN DEFAULT true,
  sort_order      INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
```

### `ingredients`

```sql
CREATE TABLE ingredients (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id   UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  unit            TEXT NOT NULL CHECK (unit IN ('g','ml','unit')),
  current_stock   NUMERIC(12,3) NOT NULL DEFAULT 0,
  min_stock       NUMERIC(12,3) NOT NULL DEFAULT 0,
  cost_per_unit   NUMERIC(10,4) DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
```

### `product_recipes`

```sql
CREATE TABLE product_recipes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id    UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  ingredient_id   UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity_needed NUMERIC(10,3) NOT NULL,       -- en la unidad del ingrediente
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(menu_item_id, ingredient_id)
);
```

### `tables`

```sql
CREATE TABLE tables (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id   UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  label           TEXT NOT NULL,                -- 'Mesa 1', 'Barra 2', etc.
  capacity        INT DEFAULT 4,
  status          TEXT NOT NULL DEFAULT 'free' CHECK (status IN ('free','occupied','reserved')),
  zone            TEXT,                         -- 'terraza', 'interior', 'barra'
  sort_order      INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

### `shifts`

```sql
CREATE TABLE shifts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id   UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id),
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','closed')),
  opening_cash    NUMERIC(10,2) NOT NULL DEFAULT 0,
  closing_cash    NUMERIC(10,2),
  expected_cash   NUMERIC(10,2),
  total_sales     NUMERIC(10,2),
  total_orders    INT,
  difference      NUMERIC(10,2),
  notes           TEXT,
  opened_at       TIMESTAMPTZ DEFAULT now(),
  closed_at       TIMESTAMPTZ
);
```

### `orders`

```sql
CREATE TABLE orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id   UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  order_number    TEXT NOT NULL,                -- secuencial por restaurante por día
  order_type      TEXT NOT NULL CHECK (order_type IN ('dinein','pickup','delivery','whatsapp')),
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','confirmed','preparing','ready','delivered','paid','cancelled','refunded')),
  table_id        UUID REFERENCES tables(id),  -- obligatorio si dinein
  shift_id        UUID REFERENCES shifts(id),
  customer_name   TEXT,
  customer_phone  TEXT,
  delivery_address TEXT,
  subtotal        NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax             NUMERIC(10,2) NOT NULL DEFAULT 0,
  total           NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_status  TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','refunded')),
  notes           TEXT,
  cancel_reason   TEXT,                        -- obligatorio si cancelled
  wa_message_id   TEXT,                        -- para idempotencia WhatsApp
  created_by      UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
```

### `order_items`

```sql
CREATE TABLE order_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id    UUID NOT NULL REFERENCES menu_items(id),
  quantity        INT NOT NULL DEFAULT 1,
  unit_price      NUMERIC(10,2) NOT NULL,
  subtotal        NUMERIC(10,2) NOT NULL,
  modifiers       JSONB DEFAULT '[]',          -- ["sin cebolla", "extra queso"]
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

### `inventory_movements`

```sql
CREATE TABLE inventory_movements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id   UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  ingredient_id   UUID NOT NULL REFERENCES ingredients(id),
  type            TEXT NOT NULL CHECK (type IN ('purchase','consumption','adjustment','waste')),
  quantity        NUMERIC(12,3) NOT NULL,       -- positivo o negativo
  reference_id    UUID,                         -- order_id o shift_id según contexto
  notes           TEXT,
  created_by      UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

### `webhook_logs`

```sql
CREATE TABLE webhook_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id   UUID,
  message_id      TEXT UNIQUE,                  -- idempotencia
  direction       TEXT NOT NULL CHECK (direction IN ('inbound','outbound')),
  payload         JSONB NOT NULL,
  status          TEXT DEFAULT 'received' CHECK (status IN ('received','processed','failed','ignored')),
  error_message   TEXT,
  processing_ms   INT,
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

### `audit_logs`

```sql
CREATE TABLE audit_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id   UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES auth.users(id),
  action          TEXT NOT NULL,                -- 'order.cancelled', 'shift.closed', 'stock.adjusted'
  entity_type     TEXT NOT NULL,                -- 'order', 'shift', 'ingredient', etc.
  entity_id       UUID NOT NULL,
  old_data        JSONB,
  new_data        JSONB,
  ip_address      TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

---

## 📐 Índices Recomendados

```sql
-- Búsquedas frecuentes por tenant
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

---

## 🗺️ Roadmap Priorizado

### Fase 1 — Fundación (Semana 1-2)

- Schema SQL completo + migraciones + RLS policies
- Auth con Supabase (login, registro, asignación de roles)
- Seed data para desarrollo (restaurante demo, menú, ingredientes)
- Webhook endpoint Meta: verificación GET + recepción POST + log en `webhook_logs`
- Estructura base del proyecto React (routing, layout, auth guard)

### Fase 2 — Core POS (Semana 3-4)

- Vista Caja: crear orden manual, seleccionar items, asignar mesa
- n8n AI Agent: parsing de mensajes WhatsApp → JSON → crear orden
- Realtime: órdenes nuevas aparecen en Caja y Cocina automáticamente
- Vista Cocina: cola de órdenes, cambio de estado (preparing → ready)
- Máquina de estados de órdenes completa

### Fase 3 — Operaciones (Semana 5-6)

- Vista Mesas: mapa visual con estados
- Puente de impresión: endpoint Node.js + integración desde React
- Turnos: apertura, cierre, resumen
- Inventario: recetas, descuento automático, alertas de stock bajo

### Fase 4 — Hardening (Semana 7-8)

- Vista Config: gestión de menú, mesas, ingredientes, usuarios
- Audit logs completos
- Pruebas de concurrencia (stock, órdenes simultáneas)
- Manejo de errores robusto en todos los flujos
- Optimización de queries y caché

### Fase 5 — Deploy (Semana 9)

- Docker Compose: Supabase (self-hosted o cloud) + n8n + Redis + Nginx
- SSL con Certbot
- Backups automáticos (pg_dump diario + retención 30 días)
- Monitoreo básico: health checks + alertas por Telegram
- Documentación de operación

---

## ⚙️ Variables de Entorno

```env
# Supabase
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # NUNCA en frontend

# WhatsApp Meta Cloud API
WHATSAPP_PHONE_ID=
WHATSAPP_TOKEN=
WHATSAPP_VERIFY_TOKEN=

# LLM
LLM_API_KEY=
LLM_MODEL=llama-3.1-70b
LLM_FALLBACK_PROVIDER=openrouter    # fallback si Groq falla

# n8n
N8N_REDIS_URL=redis://localhost:6379
N8N_WEBHOOK_URL=https://n8n.tudominio.com

# Impresión
PRINTER_INTERFACE=tcp://192.168.1.50:9100
PRINTER_TIMEOUT_MS=2000

# General
APP_URL=https://pos.tudominio.com
NODE_ENV=production
```

---

## 📁 Estructura del Proyecto

```
botnik/
├── src/                          # React SPA
│   ├── components/
│   │   ├── layout/               # Sidebar, Header, AuthGuard
│   │   ├── pos/                  # Componentes de Caja
│   │   ├── kitchen/              # Vista Cocina
│   │   ├── tables/               # Mapa de Mesas
│   │   ├── inventory/            # Inventario
│   │   ├── shifts/               # Turnos
│   │   └── config/               # Configuración
│   ├── hooks/                    # Custom hooks (useOrders, useRealtime, etc.)
│   ├── lib/
│   │   ├── supabase.ts           # Cliente Supabase
│   │   ├── types.ts              # Tipos TypeScript (generados de DB)
│   │   └── constants.ts
│   ├── pages/                    # Rutas principales
│   ├── stores/                   # Estado global (Zustand)
│   ├── App.tsx
│   └── main.tsx
├── supabase/
│   ├── migrations/               # SQL migraciones ordenadas
│   ├── seed.sql                  # Datos de desarrollo
│   └── functions/                # Edge Functions (webhook handler)
├── print-bridge/                 # Servicio Node.js para impresión
│   ├── server.ts
│   └── package.json
├── docker-compose.yml
├── .env.example
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
└── requerimentos.md
```
