# Botnik — Reglas de Código y Convenciones

## Reglas Técnicas No Negociables

1. RLS obligatorio en TODAS las tablas. Filtrado por `restaurant_id` vía `user_restaurants`.
2. `SUPABASE_SERVICE_ROLE_KEY` NUNCA en frontend. Solo en n8n y Edge Functions.
3. Salida de IA → JSON estricto + validación con schema (Zod en frontend, AJV en n8n) antes de escribir en DB.
4. Puente de impresión: `POST http://localhost:3000/print` → timeout 2s → fallback `window.print()`.
5. Webhooks: loguear siempre `message_id` + payload crudo + timestamp en `webhook_logs`.
6. Todas las operaciones de escritura críticas generan registro en `audit_logs`.
7. Passwords y tokens: nunca en código. Solo variables de entorno.
8. CORS del puente de impresión: solo `localhost` y dominio del POS.
9. Backups automáticos diarios de Supabase (pg_dump vía cron en VPS).
10. Rate limiting en Edge Functions y webhook endpoint.

## Convenciones TypeScript / React

- Usar tipos estrictos generados desde el esquema de Supabase (`supabase gen types`).
- Componentes funcionales con hooks. No class components.
- Estado global con Zustand. Estado local con `useState`/`useReducer`.
- Realtime vía `supabase.channel` — suscripciones en custom hooks (`useOrders`, `useRealtime`).
- Validación de datos con Zod en frontend.
- Tailwind CSS para estilos. No CSS modules ni styled-components.
- Responsive-first: optimizado para tablet como dispositivo principal.

## Convenciones SQL / Supabase

- Todas las tablas llevan `created_at TIMESTAMPTZ DEFAULT now()`.
- Tablas con datos mutables llevan `updated_at TIMESTAMPTZ DEFAULT now()`.
- Todas las tablas de negocio llevan `restaurant_id UUID NOT NULL REFERENCES restaurants(id)`.
- UUIDs como primary keys (`gen_random_uuid()`).
- CHECK constraints para enums en lugar de tipos ENUM de PostgreSQL.
- Nombres de tablas en inglés, snake_case, plural.
- Nombres de columnas en inglés, snake_case.
- Migraciones en `supabase/migrations/` con formato `YYYYMMDDHHMMSS_descripcion.sql`.

## Convenciones de Naming

- Componentes React: PascalCase (`OrderList.tsx`, `KitchenQueue.tsx`).
- Hooks: camelCase con prefijo `use` (`useOrders.ts`, `useShift.ts`).
- Stores Zustand: camelCase (`orderStore.ts`, `authStore.ts`).
- Tipos/Interfaces: PascalCase con prefijo descriptivo (`Order`, `MenuItem`, `ShiftSummary`).
- Constantes: UPPER_SNAKE_CASE (`ORDER_STATUSES`, `TABLE_STATES`).
- Archivos de utilidad: camelCase (`formatCurrency.ts`, `validateOrder.ts`).

## Roles y Permisos

| Rol       | Caja | Cocina | Mesas | Inventario | Turnos | Config | Usuarios |
| --------- | ---- | ------ | ----- | ---------- | ------ | ------ | -------- |
| `owner`   | CRUD | CRUD   | CRUD  | CRUD       | CRUD   | CRUD   | CRUD     |
| `admin`   | CRUD | CRUD   | CRUD  | CRUD       | CRUD   | CRUD   | —        |
| `cashier` | CRUD | Read   | CRUD  | Read       | CRUD   | —      | —        |
| `waiter`  | —    | Read   | CRUD  | —          | CRUD   | —      | —        |
| `kitchen` | —    | CRUD   | Read  | Read       | CRUD   | —      | —        |

Las RLS policies deben respetar esta matriz. Cada query debe filtrar por `restaurant_id` del usuario autenticado consultando `user_restaurants`.

## Máquina de Estados — Órdenes

Transiciones válidas:

- `pending → confirmed` (Cajero / Chatbot auto) → descuenta inventario
- `confirmed → preparing` (Cocina)
- `preparing → ready` (Cocina)
- `ready → delivered` (Mesero / Cajero)
- `delivered → paid` (Cajero) → libera mesa si dinein
- `pending → cancelled` (Cajero / Admin)
- `confirmed → cancelled` (Cajero / Admin) → revierte inventario + motivo obligatorio
- `paid → refunded` (Admin / Owner) → revierte inventario + audit_log

Cualquier otra transición es inválida y debe ser rechazada.

## Estados de Mesa

- `free → occupied` (al asignar orden dinein)
- `occupied → free` (al cerrar/pagar orden)
- `free ↔ reserved` (reserva manual)
- `reserved → occupied` (al llegar el cliente)

Una mesa `occupied` solo puede tener 1 orden activa.
