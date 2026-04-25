# Botnik POS — Skill Principal

## Descripción

Botnik es un sistema POS web multi-tenant para restaurantes con chatbot de WhatsApp integrado. Esta skill contiene las reglas, convenciones y contexto necesario para desarrollar el proyecto correctamente.

## Stack Tecnológico

- Frontend: React 18 + Vite + TypeScript + Tailwind CSS
- Backend/DB: Supabase (PostgreSQL 15, Auth, Realtime, RLS, Edge Functions)
- Automatización: n8n autohospedado + Redis (Queue Mode)
- IA: n8n AI Agent → Groq (Llama-3.1-70b) / OpenRouter fallback
- WhatsApp: Meta Cloud API v21.0
- Impresión: Node.js + Express + `node-thermal-printer` (tablet Android / Termux)
- Hosting: Docker Compose + Nginx + Certbot SSL en VPS

## Estructura del Proyecto

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
└── requerimentos.md              # Documento fuente de requerimientos
```

## Referencia Completa

Para detalles completos del proyecto (esquema SQL, máquina de estados, payloads, etc.), consultar: #[[file:requerimentos.md]]
