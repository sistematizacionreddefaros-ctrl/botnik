# Plan de Implementación: Landing Page Pública BOTNIK

## Overview

Implementar la landing page pública en la ruta `"/"` reestructurando el routing de `App.tsx`, creando el componente `LandingPage.tsx` con todas sus secciones (hero, funcionalidades, cómo funciona, CTA final, footer), y añadiendo tests unitarios y property-based tests para validar el comportamiento.

## Tasks

- [x] 1. Reestructurar routing en App.tsx y crear PublicRoute
  - [x] 1.1 Crear componente PublicRoute en App.tsx
    - Definir `PublicRoute` que lea `session`, `role`, `isLoading` de `useAuthStore`
    - Si `isLoading`, retornar `null`
    - Si `session && role`, redirigir a `getDefaultRoute(role)` con `<Navigate replace />`
    - Si no autenticado, renderizar `children`
    - _Requirements: 1.1, 1.2_

  - [x] 1.2 Reestructurar rutas en App.tsx
    - Agregar ruta pública `"/"` con `<PublicRoute><LandingPage /></PublicRoute>`
    - Mover rutas protegidas bajo un layout route sin index que use `<AuthGuard><AppLayout /></AuthGuard>`
    - Mantener `/login` como ruta pública
    - Cambiar catch-all `"*"` para redirigir a `"/"`
    - Importar `LandingPage` desde `src/pages/LandingPage.tsx`
    - _Requirements: 1.1, 1.2, 1.4_

- [x] 2. Crear componente LandingPage con Hero Section
  - [x] 2.1 Crear archivo `src/pages/LandingPage.tsx` con estructura base
    - Usar estructura semántica: `<header>`, `<main>` con `<section>`s, `<footer>`
    - Implementar Hero Section dentro de `<header>`:
      - Logo BOTNIK con "bot" en color slate (`text-slate`) y "nik" en tangerine (`text-tangerine`) usando `font-display font-black`
      - Tagline descriptivo sobre POS + chatbot WhatsApp en `font-body`
      - CTA Button como `<Link to="/login">` con estilo primario: `bg-tangerine text-white rounded-pill shadow-btn-primary` y hover con `shadow-btn-primary-hover hover:-translate-y-[2px]`
    - Fondo cream (`bg-cream`) consistente con el Design System
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 8.1, 8.4, 9.1, 9.2, 9.3, 9.4_

- [x] 3. Implementar sección de Funcionalidades
  - [x] 3.1 Definir constantes FEATURES y crear grid de Feature Cards
    - Definir interfaz `FeatureCard` con `icon`, `title`, `description`, `color`
    - Crear array `FEATURES` con al menos 4 items: Punto de Venta (tangerine), Chatbot WhatsApp (mint), Inventario (rose), Mesas y Comandas (slate)
    - Renderizar `<section>` con heading `<h2>` y grid responsivo:
      - Mobile (<768px): 1 columna (`grid-cols-1`)
      - Tablet (≥768px): 2 columnas (`md:grid-cols-2`)
      - Desktop (≥1024px): 2x2 (`lg:grid-cols-2`)
    - Cada card con `rounded-card shadow-card`, icono, título en `font-display` y descripción en `font-body`
    - Usar colores del Design System para diferenciar cada card
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 7.1, 7.2, 7.3, 7.4, 9.1, 9.2, 9.3, 9.4_

- [x] 4. Implementar sección "Cómo Funciona"
  - [x] 4.1 Definir constantes STEPS y crear flujo visual de pasos
    - Definir interfaz `Step` con `number`, `title`, `description`
    - Crear array `STEPS` con 3-4 pasos: Regístrate, Configura tu menú, Opera tu restaurante, Analiza resultados
    - Renderizar `<section>` con heading `<h2>` y lista de pasos en orden secuencial
    - Cada paso muestra número de paso con indicador visual, título en `font-display` y descripción en `font-body`
    - Incluir indicadores visuales de progresión entre pasos
    - _Requirements: 4.1, 4.2, 4.3, 9.1, 9.2_

- [x] 5. Implementar CTA Final y Footer
  - [x] 5.1 Crear sección CTA final
    - Renderizar `<section>` con texto motivacional y CTA Button `<Link to="/login">`
    - Botón con estilo primario: `bg-tangerine text-white rounded-pill shadow-btn-primary`
    - Hover: `shadow-btn-primary-hover hover:-translate-y-[2px]`
    - _Requirements: 5.1, 5.2, 5.3, 9.4_

  - [x] 5.2 Crear footer
    - Renderizar `<footer>` con fondo `bg-slate-deep` y texto `text-cream`
    - Mostrar "BOTNIK © {new Date().getFullYear()}"
    - _Requirements: 6.1, 6.2_

- [x] 6. Accesibilidad y responsividad final
  - [x] 6.1 Verificar y ajustar accesibilidad
    - Asegurar jerarquía de encabezados: `<h1>` en hero, `<h2>` en cada sección
    - Verificar que todos los botones y enlaces sean accesibles por teclado con indicadores de foco visibles (`focus:outline`, `focus:ring`)
    - Verificar ratio de contraste 4.5:1 en todas las combinaciones texto/fondo
    - Si el logo es SVG, incluir `role="img"` y `aria-label` descriptivo
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [x] 6.2 Verificar responsividad
    - Confirmar que Hero Section mantiene logo y tagline centrados en todos los breakpoints
    - Confirmar que Feature Cards usan grid responsivo correcto (1 col → 2 col)
    - Usar unidades relativas y clases responsivas de Tailwind para tipografía y espaciado
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 7. Checkpoint — Verificar integración visual
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Tests
  - [x] 8.1 Instalar dependencias de testing de UI
    - Agregar `@testing-library/react`, `@testing-library/jest-dom` y `jsdom` como devDependencies
    - Configurar `vitest.config.ts` con environment `jsdom` si no está configurado

  - [x] 8.2 Write property test: Redirección de usuario autenticado por rol
    - **Property 1: Para cualquier rol válido (owner, admin, cashier, waiter, kitchen), PublicRoute redirige a getDefaultRoute(role)**
    - Usar `fast-check` para generar roles arbitrarios con `fc.constantFrom(...)`
    - Mockear `useAuthStore` para simular usuario autenticado con cada rol
    - Verificar que `<Navigate>` apunta a `getDefaultRoute(role)`
    - Mínimo 100 iteraciones
    - Archivo: `tests/landing-page.test.tsx`
    - **Validates: Requirements 1.2**

  - [x] 8.3 Write unit tests para LandingPage
    - Verificar que `"/"` renderiza LandingPage sin sesión activa
    - Verificar estructura semántica: `<header>`, `<main>`, `<section>`, `<footer>`, `<h1>`, `<h2>`
    - Verificar Hero: logo BOTNIK, tagline, CTA con enlace a `/login`
    - Verificar al menos 4 Feature Cards con icono, título y descripción
    - Verificar 3-4 pasos en "Cómo Funciona" con número, título y descripción
    - Verificar CTA final con enlace a `/login` y clases de estilo primario
    - Verificar footer con "BOTNIK" y año actual
    - Verificar `role="img"` y `aria-label` en logo SVG
    - Verificar clases de grid responsivo en contenedor de Feature Cards
    - Archivo: `tests/landing-page-ui.test.tsx`
    - **Validates: Requirements 1.1, 2.1, 2.2, 2.3, 3.1, 3.2, 4.1, 4.2, 5.1, 6.1, 7.1, 7.2, 8.1, 8.4**

  - [x] 8.4 Write unit test para catch-all redirect
    - Verificar que rutas inexistentes redirigen a `"/"`
    - Archivo: `tests/landing-page-ui.test.tsx`
    - **Validates: Requirements 1.4**

- [x] 9. Checkpoint final — Verificar que todos los tests pasan
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia los requerimientos específicos para trazabilidad
- Los checkpoints aseguran validación incremental
- El property test valida la propiedad universal de corrección (redirect por rol)
- Los unit tests validan ejemplos específicos y estructura de UI
- El proyecto ya usa TypeScript, React, React Router DOM, Tailwind CSS, Vitest y fast-check
