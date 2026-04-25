# Documento de Requerimientos — Landing Page Pública BOTNIK

## Introducción

Landing page pública para BOTNIK, un sistema POS web multi-tenant para restaurantes con chatbot de WhatsApp integrado. La página sirve como punto de entrada para visitantes no autenticados, presentando el producto y dirigiéndolos al login. Es 100% estática, sin dependencias de Supabase ni llamadas a backend.

## Glosario

- **Landing_Page**: Componente React que renderiza la página pública de presentación del producto BOTNIK en la ruta raíz "/"
- **Design_System**: Conjunto de tokens de diseño definidos en `tailwind.config.ts` que incluye colores (rose, mint, tangerine, slate, cream), fuentes (Fraunces para display, Nunito para body), border-radius (pill, card, icon) y sombras (card, btn-primary)
- **Hero_Section**: Sección principal visible al cargar la página, que contiene el logo, tagline y call-to-action principal
- **Feature_Card**: Componente visual que presenta un beneficio o funcionalidad del sistema con icono, título y descripción
- **CTA_Button**: Botón de llamada a la acción que dirige al usuario a la ruta "/login"
- **Router**: Sistema de enrutamiento de React Router DOM configurado en `App.tsx`
- **AuthGuard**: Componente existente que protege rutas y redirige usuarios no autenticados a "/login"
- **Visitante**: Usuario no autenticado que accede a la aplicación por primera vez

## Requerimientos

### Requerimiento 1: Ruta pública en "/"

**User Story:** Como visitante, quiero acceder a una página informativa en la ruta raíz del sitio, para conocer BOTNIK antes de iniciar sesión.

#### Criterios de Aceptación

1. WHEN un visitante no autenticado accede a la ruta "/", THE Router SHALL renderizar la Landing_Page sin requerir autenticación
2. WHEN un usuario autenticado accede a la ruta "/", THE Router SHALL redirigir al usuario a su vista por defecto según su rol (comportamiento actual del AuthGuard)
3. THE Landing_Page SHALL renderizarse sin realizar llamadas a Supabase ni a ningún servicio de backend
4. WHEN un visitante navega a una ruta inexistente, THE Router SHALL redirigir a la ruta "/"

### Requerimiento 2: Hero Section

**User Story:** Como visitante, quiero ver una presentación clara y atractiva del producto al llegar a la página, para entender rápidamente qué es BOTNIK.

#### Criterios de Aceptación

1. THE Hero_Section SHALL mostrar el logo de BOTNIK con "bot" en color slate (#5B8496) y "nik" en color tangerine (#F1943F) usando la fuente Fraunces con peso 900
2. THE Hero_Section SHALL mostrar un tagline descriptivo que comunique la propuesta de valor del sistema POS con chatbot de WhatsApp
3. THE Hero_Section SHALL incluir un CTA_Button principal que enlace a la ruta "/login"
4. THE Hero_Section SHALL usar el color cream (#FBF8F4) como fondo, consistente con el Design_System existente

### Requerimiento 3: Sección de Funcionalidades

**User Story:** Como visitante, quiero ver las funcionalidades principales del sistema, para evaluar si BOTNIK se adapta a las necesidades de mi restaurante.

#### Criterios de Aceptación

1. THE Landing_Page SHALL presentar al menos 4 Feature_Cards que describan las funcionalidades principales: punto de venta, chatbot de WhatsApp, gestión de inventario y control de mesas/comandas
2. WHEN la Landing_Page se renderiza, cada Feature_Card SHALL mostrar un icono representativo, un título en fuente Fraunces y una descripción en fuente Nunito
3. THE Feature_Card SHALL usar el border-radius "card" (20px) y la sombra "card" definidos en el Design_System
4. THE Landing_Page SHALL usar los colores rose, mint, tangerine y slate del Design_System para diferenciar visualmente cada Feature_Card

### Requerimiento 4: Sección "Cómo Funciona"

**User Story:** Como visitante, quiero entender el flujo simplificado de uso del sistema, para visualizar cómo BOTNIK se integra en la operación de un restaurante.

#### Criterios de Aceptación

1. THE Landing_Page SHALL presentar un flujo de 3 a 4 pasos que describa el proceso simplificado de uso de BOTNIK (registro, configuración, operación, análisis)
2. WHEN la Landing_Page se renderiza, cada paso del flujo SHALL mostrar un número de paso, un título y una descripción breve
3. THE Landing_Page SHALL presentar los pasos en orden secuencial con indicadores visuales de progresión

### Requerimiento 5: Call to Action Final

**User Story:** Como visitante, quiero tener un punto de acción claro al final de la página, para poder iniciar sesión o registrarme fácilmente.

#### Criterios de Aceptación

1. THE Landing_Page SHALL incluir una sección de cierre con un CTA_Button que enlace a la ruta "/login"
2. THE CTA_Button SHALL usar el estilo de botón primario del Design_System: fondo tangerine, texto blanco, border-radius pill (50px) y sombra btn-primary
3. WHEN el visitante hace hover sobre el CTA_Button, THE CTA_Button SHALL aplicar la sombra btn-primary-hover y un desplazamiento vertical de -2px, consistente con los botones existentes del proyecto

### Requerimiento 6: Footer

**User Story:** Como visitante, quiero ver información básica del producto al final de la página, para tener contexto adicional sobre BOTNIK.

#### Criterios de Aceptación

1. THE Landing_Page SHALL incluir un footer con el nombre "BOTNIK" y el año actual
2. THE Landing_Page SHALL mostrar el footer con fondo en color slate-deep (#3d5f6e) y texto en color cream (#FBF8F4)

### Requerimiento 7: Diseño Responsivo

**User Story:** Como visitante, quiero que la landing page se vea correctamente en cualquier dispositivo, para poder explorar BOTNIK desde mi celular, tablet o computadora.

#### Criterios de Aceptación

1. WHILE el viewport tiene un ancho menor a 768px, THE Landing_Page SHALL presentar las Feature_Cards en una sola columna apilada verticalmente
2. WHILE el viewport tiene un ancho de 768px o mayor, THE Landing_Page SHALL presentar las Feature_Cards en una cuadrícula de 2 columnas
3. WHILE el viewport tiene un ancho de 1024px o mayor, THE Landing_Page SHALL presentar las Feature_Cards en una cuadrícula de 2x2 o disposición adecuada para pantallas grandes
4. THE Landing_Page SHALL usar unidades relativas y clases responsivas de Tailwind CSS para adaptar tipografía y espaciado a cada breakpoint
5. THE Hero_Section SHALL mantener el logo y tagline centrados y legibles en todos los breakpoints

### Requerimiento 8: Accesibilidad

**User Story:** Como visitante con necesidades de accesibilidad, quiero que la landing page sea navegable y comprensible, para poder acceder a la información del producto.

#### Criterios de Aceptación

1. THE Landing_Page SHALL usar elementos HTML semánticos: `<header>`, `<main>`, `<section>`, `<footer>` y encabezados jerárquicos (`<h1>`, `<h2>`, `<h3>`)
2. THE Landing_Page SHALL asegurar que todos los elementos interactivos (enlaces y botones) sean accesibles mediante navegación por teclado con indicadores de foco visibles
3. THE Landing_Page SHALL mantener un ratio de contraste mínimo de 4.5:1 entre texto y fondo en todas las combinaciones de colores utilizadas
4. WHEN el logo de BOTNIK se renderiza como SVG, THE Landing_Page SHALL incluir atributos `role="img"` y `aria-label` descriptivo en el elemento SVG

### Requerimiento 9: Consistencia con el Design System

**User Story:** Como equipo de desarrollo, quiero que la landing page use exclusivamente los tokens del design system existente, para mantener coherencia visual con el resto de la aplicación.

#### Criterios de Aceptación

1. THE Landing_Page SHALL usar exclusivamente los colores definidos en `tailwind.config.ts`: rose, mint, tangerine, slate, cream y sus variantes (soft, dark, deep)
2. THE Landing_Page SHALL usar la fuente Fraunces (font-display) para títulos y encabezados, y Nunito (font-body) para texto de cuerpo y descripciones
3. THE Landing_Page SHALL usar los valores de border-radius definidos en el Design_System: pill (50px), card (20px) e icon (14px)
4. THE Landing_Page SHALL usar las sombras definidas en el Design_System: card, card-hover, btn-primary y btn-primary-hover según corresponda a cada elemento
