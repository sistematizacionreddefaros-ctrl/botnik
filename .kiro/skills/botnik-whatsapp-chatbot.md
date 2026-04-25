# Botnik — Chatbot WhatsApp e Impresión

## M1 — Chatbot WhatsApp

### Flujo del Webhook Meta Cloud API

```
GET  /webhook → Verificación (hub.verify_token + hub.challenge)
POST /webhook → Recepción de mensajes
  1. Loguear payload crudo en webhook_logs (idempotencia por message_id)
  2. Extraer texto del mensaje
  3. Enviar a n8n AI Agent → LLM parsea a JSON estructurado
  4. Validar JSON contra schema Zod/AJV
  5. Verificar stock de insumos
  6. Crear orden en Supabase (status: pending)
  7. Responder confirmación al usuario vía API de Meta
  8. Si falla → responder mensaje de error amigable + loguear en webhook_logs
```

### Schema JSON de la IA

La salida del LLM debe cumplir exactamente este schema:

```json
{
  "order_type": "delivery | pickup",
  "customer_phone": "+521234567890",
  "customer_name": "string | null",
  "items": [
    {
      "menu_item_name": "string",
      "quantity": 1,
      "modifiers": ["sin cebolla", "extra queso"],
      "notes": "string | null"
    }
  ],
  "delivery_address": "string | null",
  "notes": "string | null"
}
```

Reglas de validación:

- `order_type` solo acepta `delivery` o `pickup`.
- `items` debe tener al menos 1 elemento.
- `quantity` debe ser >= 1.
- `delivery_address` es obligatorio si `order_type = delivery`.
- `menu_item_name` se resuelve con match fuzzy contra `menu_items.name`.
- Si el LLM no puede parsear → pedir aclaración al cliente (máx. 2 reintentos).

### Reglas del Chatbot

- Solo responde dentro de ventana de 24h de Meta.
- Idempotencia estricta por `message_id` (ignorar duplicados).
- Modificadores complejos soportados: `sin cebolla`, `extra queso`, `mitad y mitad`, `al punto`.
- Rate limit: máx. 80 msg/s por número (límite de Meta).
- Siempre loguear `message_id` + payload crudo en `webhook_logs`.

## M6 — Impresión Térmica

### Arquitectura

```
React (POS) → POST http://localhost:3000/print
  → Node.js bridge (tablet Android / Termux)
  → node-thermal-printer → impresora térmica (TCP/USB)
  → Timeout 2s → fallback window.print()
```

### Payload del Endpoint /print

```json
{
  "type": "order | receipt | kitchen",
  "restaurant_name": "string",
  "order_number": "string",
  "items": [
    { "name": "string", "qty": 1, "price": 10.5, "modifiers": ["extra queso"] }
  ],
  "subtotal": 42.0,
  "tax": 6.72,
  "total": 48.72,
  "payment_status": "paid",
  "table": "Mesa 5 | null",
  "cashier": "string",
  "timestamp": "ISO8601"
}
```

### Tipos de Ticket

- `order` — Ticket completo para el cliente (con precios).
- `kitchen` — Comanda para cocina (sin precios, con modificadores en texto grande).
- `receipt` — Recibo de cierre de turno.

### Reglas del Print Bridge

- CORS: solo aceptar requests de `localhost` y el dominio del POS.
- Timeout de conexión a impresora: 2 segundos.
- Si falla la impresión térmica → el frontend hace fallback a `window.print()`.
- El bridge corre en `print-bridge/` como servicio Node.js independiente.
