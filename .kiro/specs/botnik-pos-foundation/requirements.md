# Requirements Document

## Introduction

BOTNIK Fase 1 — Fundación: establece la infraestructura base del sistema POS multi-tenant para restaurantes. Incluye el esquema completo de base de datos con Row Level Security, autenticación y autorización basada en roles, datos semilla para desarrollo, el endpoint webhook de Meta Cloud API para WhatsApp, y la estructura base del frontend React con routing protegido y layout responsivo.

## Glossary

- **System**: El sistema BOTNIK en su conjunto (frontend + backend + servicios).
- **Database**: La instancia PostgreSQL 15 gestionada por Supabase.
- **Migration_Runner**: El proceso que ejecuta migraciones SQL en orden secuencial contra la Database.
- **RLS_Engine**: El motor de Row Level Security de PostgreSQL que aplica políticas de acceso a nivel de fila.
- **Auth_Service**: El servicio de autenticación de Supabase (auth.users + JWT + sesiones).
- **Auth_Guard**: El componente React que protege rutas verificando sesión activa y rol del usuario.
- **Webhook_Handler**: La Edge Function de Supabase que recibe y procesa requests del webhook de Meta Cloud API.
- **Seed_Script**: El script SQL que inserta datos de demostración para desarrollo.
- **Router**: El sistema de enrutamiento del frontend React (React Router).
- **Layout**: El componente de estructura visual que envuelve las vistas (sidebar, header, contenido).
- **Tenant**: Un restaurante individual dentro del sistema multi-tenant.
- **User_Restaurant**: La relación que vincula un usuario con un restaurante y define su rol.

## Requirements

### Requirement 1: Schema SQL y Migraciones

**User Story:** Como desarrollador, quiero tener el esquema completo de base de datos definido en migraciones SQL ordenadas, para que la estructura de datos sea reproducible y versionada.

#### Acceptance Criteria

1. THE Migration_Runner SHALL ejecutar migraciones desde `supabase/migrations/` en orden cronológico usando el formato `YYYYMMDDHHMMSS_descripcion.sql`.
2. THE Database SHALL crear las 13 tablas del sistema: `restaurants`, `user_profiles`, `user_restaurants`, `menu_items`, `ingredients`, `product_recipes`, `tables`, `shifts`, `orders`, `order_items`, `inventory_movements`, `webhook_logs`, `audit_logs`.
3. THE Database SHALL usar UUIDs generados con `gen_random_uuid()` como primary keys en todas las tablas.
4. THE Database SHALL incluir la columna `created_at TIMESTAMPTZ DEFAULT now()` en todas las tablas.
5. THE Database SHALL incluir la columna `updated_at TIMESTAMPTZ DEFAULT now()` en todas las tablas que contienen datos mutables (`restaurants`, `menu_items`, `ingredients`, `orders`).
6. THE Database SHALL incluir la columna `restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE` en todas las tablas de negocio excepto `user_profiles`.
7. THE Database SHALL implementar enums mediante CHECK constraints en lugar de tipos ENUM de PostgreSQL para las columnas: `user_restaurants.role`, `ingredients.unit`, `tables.status`, `shifts.status`, `orders.order_type`, `orders.status`, `orders.payment_status`, `inventory_movements.type`, `webhook_logs.direction`, `webhook_logs.status`.
8. THE Database SHALL aplicar el constraint UNIQUE en `webhook_logs.message_id` para garantizar idempotencia de webhooks.
9. THE Database SHALL aplicar el constraint UNIQUE en `user_restaurants(user_id, restaurant_id)` para evitar roles duplicados.
10. THE Database SHALL aplicar el constraint UNIQUE en `product_recipes(menu_item_id, ingredient_id)` para evitar recetas duplicadas.
11. THE Database SHALL crear los 11 índices definidos en el esquema para optimizar consultas frecuentes por tenant, estado y relaciones.

### Requirement 2: Row Level Security (RLS)

**User Story:** Como propietario de restaurante, quiero que los datos de mi negocio estén aislados de otros restaurantes, para que ningún usuario pueda acceder a información que no le corresponde.

#### Acceptance Criteria

1. THE RLS_Engine SHALL estar habilitado en todas las 13 tablas del sistema.
2. THE RLS_Engine SHALL aplicar una política de aislamiento por tenant en todas las tablas de negocio, filtrando filas donde `restaurant_id` coincida con los restaurantes activos del usuario autenticado según `user_restaurants`.
3. THE RLS_Engine SHALL permitir operaciones de escritura en `menu_items` solo a usuarios con rol `owner` o `admin` en el restaurante correspondiente.
4. THE RLS_Engine SHALL permitir operaciones de escritura en `ingredients` solo a usuarios con rol `owner`, `admin` o `cashier` en el restaurante correspondiente.
5. THE RLS_Engine SHALL permitir operaciones de escritura en `orders` a usuarios con rol `owner`, `admin` o `cashier` en el restaurante correspondiente.
6. THE RLS_Engine SHALL permitir operaciones de escritura en `tables` a usuarios con rol `owner`, `admin`, `cashier` o `waiter` en el restaurante correspondiente.
7. THE RLS_Engine SHALL permitir lectura de `user_profiles` solo al propio usuario autenticado o a usuarios con rol `owner` en el mismo restaurante.
8. THE RLS_Engine SHALL permitir inserción en `webhook_logs` sin autenticación de usuario (para el webhook handler que usa service_role_key).
9. THE RLS_Engine SHALL permitir inserción en `audit_logs` a cualquier usuario autenticado que pertenezca al restaurante correspondiente.
10. WHEN un usuario no tiene ningún registro activo en `user_restaurants`, THE RLS_Engine SHALL retornar cero filas en todas las tablas de negocio.

### Requirement 3: Autenticación con Supabase

**User Story:** Como usuario del sistema, quiero poder registrarme e iniciar sesión con email y contraseña, para acceder al POS de mi restaurante de forma segura.

#### Acceptance Criteria

1. THE Auth_Service SHALL permitir registro de nuevos usuarios con email y contraseña.
2. THE Auth_Service SHALL permitir inicio de sesión con email y contraseña, retornando un JWT válido.
3. THE Auth_Service SHALL permitir cierre de sesión invalidando la sesión activa del usuario.
4. WHEN un usuario se registra exitosamente, THE System SHALL crear un registro en `user_profiles` con el `id` del usuario y su `full_name`.
5. WHEN un usuario inicia sesión, THE Auth_Service SHALL retornar los datos de sesión incluyendo el JWT de acceso y el token de refresco.
6. WHEN el JWT de acceso expira, THE Auth_Service SHALL renovar la sesión automáticamente usando el token de refresco.
7. IF las credenciales proporcionadas son inválidas, THEN THE Auth_Service SHALL retornar un error descriptivo sin revelar si el email existe en el sistema.

### Requirement 4: Asignación de Roles

**User Story:** Como propietario de restaurante, quiero asignar roles a los miembros de mi equipo, para que cada persona tenga acceso solo a las funciones que le corresponden.

#### Acceptance Criteria

1. THE System SHALL soportar exactamente 5 roles: `owner`, `admin`, `cashier`, `waiter`, `kitchen`.
2. THE System SHALL almacenar la relación usuario-restaurante-rol en la tabla `user_restaurants`.
3. WHEN un usuario con rol `owner` asigna un rol a otro usuario, THE System SHALL crear un registro en `user_restaurants` con el `user_id`, `restaurant_id` y `role` especificados.
4. THE System SHALL impedir que un usuario tenga más de un rol por restaurante, respetando el constraint UNIQUE en `(user_id, restaurant_id)`.
5. WHEN se consulta el rol de un usuario, THE System SHALL verificar que el campo `is_active` sea `true` en `user_restaurants`.
6. IF un usuario sin rol `owner` intenta asignar roles, THEN THE System SHALL rechazar la operación.

### Requirement 5: Seed Data para Desarrollo

**User Story:** Como desarrollador, quiero tener datos de demostración precargados, para poder probar todas las funcionalidades del sistema sin configuración manual.

#### Acceptance Criteria

1. THE Seed_Script SHALL crear un restaurante demo con nombre, slug, teléfono, dirección, timezone `America/Mexico_City`, moneda `MXN` y tasa de impuesto `0.16`.
2. THE Seed_Script SHALL crear al menos un usuario por cada uno de los 5 roles (`owner`, `admin`, `cashier`, `waiter`, `kitchen`) vinculados al restaurante demo.
3. THE Seed_Script SHALL crear al menos 10 items de menú distribuidos en al menos 3 categorías distintas (entrada, plato_fuerte, bebida) con precios y disponibilidad.
4. THE Seed_Script SHALL crear al menos 10 ingredientes con unidades variadas (`g`, `ml`, `unit`), stock actual, stock mínimo y costo unitario.
5. THE Seed_Script SHALL crear recetas en `product_recipes` vinculando al menos 5 items del menú con sus ingredientes correspondientes.
6. THE Seed_Script SHALL crear al menos 5 mesas con labels, capacidades, zonas y estados variados.
7. THE Seed_Script SHALL ser idempotente: ejecutar el script múltiples veces no genera datos duplicados.

### Requirement 6: Webhook Endpoint Meta — Verificación

**User Story:** Como desarrollador, quiero que el endpoint de webhook responda correctamente a la verificación de Meta, para que la integración con WhatsApp Cloud API se establezca exitosamente.

#### Acceptance Criteria

1. WHEN Meta envía un request GET al endpoint `/webhook` con los parámetros `hub.mode=subscribe`, `hub.verify_token` y `hub.challenge`, THE Webhook_Handler SHALL validar que `hub.verify_token` coincida con la variable de entorno `WHATSAPP_VERIFY_TOKEN`.
2. WHEN el `hub.verify_token` es válido, THE Webhook_Handler SHALL responder con status HTTP 200 y el valor de `hub.challenge` como cuerpo de la respuesta.
3. IF el `hub.verify_token` no coincide, THEN THE Webhook_Handler SHALL responder con status HTTP 403.
4. IF falta alguno de los parámetros requeridos (`hub.mode`, `hub.verify_token`, `hub.challenge`), THEN THE Webhook_Handler SHALL responder con status HTTP 400.

### Requirement 7: Webhook Endpoint Meta — Recepción de Mensajes

**User Story:** Como sistema, quiero recibir y registrar los mensajes entrantes de WhatsApp, para que puedan ser procesados posteriormente por el chatbot de IA.

#### Acceptance Criteria

1. WHEN Meta envía un request POST al endpoint `/webhook` con un payload de mensaje, THE Webhook_Handler SHALL registrar el payload crudo completo en `webhook_logs` con `direction: 'inbound'` y `status: 'received'`.
2. THE Webhook_Handler SHALL extraer el `message_id` del payload y almacenarlo en `webhook_logs.message_id`.
3. WHEN se recibe un `message_id` que ya existe en `webhook_logs`, THE Webhook_Handler SHALL ignorar el mensaje duplicado y responder con status HTTP 200 sin procesarlo nuevamente.
4. THE Webhook_Handler SHALL responder con status HTTP 200 a Meta dentro de los primeros 5 segundos para evitar reintentos.
5. IF el payload no contiene una estructura válida de mensaje de WhatsApp, THEN THE Webhook_Handler SHALL registrar el evento en `webhook_logs` con `status: 'ignored'` y responder con status HTTP 200.
6. IF ocurre un error durante el procesamiento, THEN THE Webhook_Handler SHALL registrar el error en `webhook_logs` con `status: 'failed'` y `error_message`, y responder con status HTTP 200.
7. THE Webhook_Handler SHALL registrar el tiempo de procesamiento en milisegundos en `webhook_logs.processing_ms`.

### Requirement 8: Estructura Base del Proyecto React

**User Story:** Como desarrollador, quiero tener la estructura base del proyecto React configurada con routing, layout y protección de rutas, para poder desarrollar los módulos del POS sobre una base sólida.

#### Acceptance Criteria

1. THE System SHALL configurar un proyecto React 18 con Vite, TypeScript y Tailwind CSS.
2. THE Router SHALL definir rutas para las vistas principales: login, caja, cocina, mesas, inventario, turnos y configuración.
3. THE Router SHALL redirigir a la página de login cuando un usuario no autenticado intenta acceder a una ruta protegida.
4. WHEN un usuario autenticado accede a una ruta protegida, THE Auth_Guard SHALL verificar que el usuario tiene un rol activo en al menos un restaurante.
5. WHEN un usuario autenticado accede a una ruta que requiere un rol específico, THE Auth_Guard SHALL verificar que el rol del usuario permite el acceso según la matriz de permisos definida.
6. IF un usuario autenticado no tiene el rol requerido para una vista, THEN THE Auth_Guard SHALL redirigir al usuario a una vista permitida para su rol.
7. THE Layout SHALL incluir una barra lateral de navegación que muestre solo las opciones accesibles según el rol del usuario.
8. THE Layout SHALL ser responsivo, optimizado para tablet como dispositivo principal de uso.
9. THE System SHALL inicializar el cliente Supabase en `src/lib/supabase.ts` usando las variables de entorno `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
10. THE System SHALL configurar un store de autenticación con Zustand en `src/stores/authStore.ts` que gestione el estado de sesión, usuario y rol activo.
