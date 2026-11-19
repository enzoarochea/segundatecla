# Brief: ecommerce de laptops refurbished (Guatemala)

Fecha: 2026-11-18. Estado: build local, sin hosting. Todo lo marcado **[pendiente]** necesita contenido real del dueño.

## Fase 0: tipo de sitio y stack

- **Tipo:** tienda online (catálogo + ficha + admin). Sin carrito, checkout ni pagos (fuera de alcance).
- **Stack (pedido por el usuario, confirmado):** Next.js 16.4 (App Router, `cacheComponents` activo por defecto) + React 19.3 + TypeScript + Tailwind 4.3.
- **Datos:** Prisma 7.10.1 + SQLite (`prisma/dev.db`) vía `@prisma/adapter-better-sqlite3`. Migrable a Postgres cambiando `provider` y el adapter en `src/lib/db.ts`.
  - Se fijó Prisma **7.10.1** (estable): el tag `latest` de npm apunta a `8.0.0-rc.34`, una release candidate.
- **Imágenes:** interfaz `ImageStorage` en `src/lib/storage.ts`; implementación local en `./uploads` servida por `src/app/uploads/[file]/route.ts`. Cambiar a S3/R2 = otra implementación de la misma interfaz.
- **Dependencias añadidas y por qué** (modo ponytail):
  - `zod`: validación en servidor de un formulario de ~20 campos; a mano sería más código y más frágil.
  - `vitest` (dev): tests de los flujos clave.
  - `tsx` (dev): ejecutar el seed TypeScript.
  - Sin librería de auth: contraseña con `scrypt` de Node + sesiones en BD (token aleatorio; en BD solo su hash SHA-256).
  - Sin GSAP/Lenis: CSS (scroll-driven animations) + `<ViewTransition>` de React 19.3 cubren transiciones y reveal sin JS extra. Mejor para Lighthouse.
- **Cambios al scaffold:** `@types/node` subido a 26 (coincide con Node 26 instalado y lo exige vitest 5).

## Fase 1: marca provisional (marco de `ecc:brand-discovery`, versión corta)

La skill es una entrevista de varias sesiones con el dueño. No hubo entrevista: esto es una **propuesta provisional** para arrancar. **[pendiente]** entrevista real antes de fijar la marca.

- **Nombre provisional:** **Segunda Tecla**. Una laptop que vuelve a empezar; corto, recordable, no promete nada que no se pueda probar.
- **Propósito (borrador):** que comprar una laptop usada deje de ser una apuesta.
- **Posicionamiento (borrador, plantilla Moore):** Para estudiantes y particulares en Guatemala que necesitan una laptop confiable sin pagar precio de nueva, Segunda Tecla es una tienda de laptops reacondicionadas que muestra el estado real de cada equipo (batería, grado cosmético, qué incluye) antes de comprar. A diferencia de los anuncios sueltos en redes, cada ficha sigue el mismo formato y explica qué significa cada dato.
- **Audiencia:** estudiantes universitarios y de diversificado, papás comprando para sus hijos, profesionales independientes. Les importa: precio en quetzales, que aguante el día, no llevarse sorpresas.
- **Personalidad (arquetipo):** el *Cuidador* con algo del *Sabio*: explica, no vende humo.
- **Wordmark:** "segunda tecla" en Archivo ancho, minúsculas, con una tecla (cuadro redondeado) que lleva un "2". Componente `src/components/wordmark.tsx`.
- **Cambiar la marca:** nombre, colores, contacto, políticas y grados viven en `src/config/brand.ts`; las fuentes en `src/config/fonts.ts`.

## Voz y tono (`ecc:brand-voice`)

`ecc:brand-voice` deriva la voz de textos existentes del dueño; no hay ninguno, así que estas reglas son la propuesta inicial. **[pendiente]** ajustar con textos reales (chats con clientes, publicaciones).

- Español de Guatemala, **voseo** ("elegí", "revisá", "te llevás"), cercano sin ser chabacano.
- Frases cortas. Un dato por frase. Precios en quetzales con `Q` y sin decimales (Q3,450).
- Nunca: superlativos sin prueba ("la mejor", "calidad garantizada"), reseñas, contadores de clientes, "certificado" sin certificación.
- Lo no confirmado se dice: "Política propuesta, por confirmar", "Dato demo", "Ilustración, no es foto del equipo".

## Fase 2: contenido

- Inventario: 15 laptops demo realistas (precios GTQ aproximados de mercado refurbished, **no verificados**), todas `isDemo = true` con etiqueta visible "Dato demo". Una agotada y una oculta para mostrar estados.
- Políticas propuestas (garantía, devoluciones, envíos) en `brand.policies`, siempre con la etiqueta "Política propuesta, por confirmar". Sin cifras legales.
- Escala de grado cosmético A/B/C propuesta en `brand.grades`, misma etiqueta.
- Contacto (WhatsApp, correo, dirección): **[pendiente]**, se muestra como "por confirmar".

## Fase 3: dirección de diseño (hallmark, custom)

- **Idea:** la ficha de inspección es el producto. Cada laptop se presenta con sus datos medidos en grande (grado, batería, RAM/almacenamiento) como una hoja de revisión de taller, no como un anuncio.
- **Signature:** la tarjeta de inspección: letra de grado enorme en Archivo ancho, barra de salud de batería, precio en quetzales. Aparece en el hero (laptop destacada real del inventario), en cada tarjeta y en la ficha.
- **Look:**
  - Fondo aluminio claro `oklch(97.5% 0.004 240)`: la carcasa de una laptop, no papel crema.
  - Tinta grafito `oklch(22% 0.015 250)`.
  - Acento **jade** `oklch(50% 0.1 178)`: la piedra de Guatemala; hue 178 libre en el catálogo hallmark.
  - Señal **maíz** `oklch(86% 0.16 92)` solo para el botón "Lo quiero" (energía, contraste alto con tinta).
  - Tipos: **Archivo** (display, eje de ancho variable, expandido para cifras) + **Onest** (texto). Libres en el catálogo hallmark; Google Fonts vía `next/font` (auto-hospedados).
  - Ejes hallmark: `light/grotesk-heavy/chromatic-teal`.
- **Imágenes:** ilustraciones SVG propias de laptop (4 siluetas × 3 vistas) en colores de la marca, rotuladas "Ilustración". Nunca fotos IA. El admin sube fotos reales que reemplazan las ilustraciones.
- **Movimiento** (CSS primero):
  - `<ViewTransition>` (React 19.3): crossfade entre páginas, morph de la ilustración de la tarjeta a la galería de la ficha, crossfade de resultados al filtrar.
  - Reveal al scroll con `animation-timeline: view()` (sin JS; contenido visible si no hay soporte).
  - Hover de tarjetas, chips de filtro animados, botón con estados.
  - Todo desactivado con `prefers-reduced-motion: reduce`.

## Arquitectura de páginas

| Ruta | Qué hace |
|---|---|
| `/` | Hero + laptop destacada, por uso, recién llegadas, cómo leer el grado y la batería, políticas propuestas |
| `/laptops` | Catálogo con filtros en la URL: `marca`, `ram`, `almacenamiento`, `min`, `max`, `grado`, `uso`, `orden` |
| `/laptops/[slug]` | Ficha: galería, specs, grado explicado, batería, garantía, qué incluye, relacionadas |
| `/politicas` | Garantía, devoluciones, envíos (propuestas) |
| `/admin/login`, `/admin`, `/admin/laptops/nueva`, `/admin/laptops/[id]` | Panel: crear, editar, ocultar, borrar, fotos, stock y precio |

## Punto único de compra

`src/lib/purchase.ts` → `startPurchase(item)`. Hoy devuelve "Compra disponible pronto". Conectar WhatsApp o checkout cambiando solo esa función.

## Seguridad

- Contraseña admin: hash `scrypt` con sal aleatoria; el usuario se crea en el seed desde variables de entorno, nunca en código.
- Sesión: token de 32 bytes aleatorios en cookie `httpOnly`, `sameSite=lax`, `secure` en producción, 12 h; en BD solo el SHA-256.
- Cada página y server action del admin re-verifica la sesión. Validación zod en servidor. Límite de intentos de login en memoria.
- Subidas: solo JPEG/PNG/WebP verificados por bytes mágicos, ≤ 5 MB, nombre aleatorio.

## Registro de decisiones

- 2026-11-18: se mantuvo `cacheComponents` (default de Next 16.4): lo público se cachea con `"use cache"` + `cacheTag("laptops")`; el admin invalida con `updateTag`.
- 2026-11-18: filtros como `<form method="get">` (funcionan sin JS); con JS se aplican al cambiar, sin recargar.
- 2026-11-18: `uses` se guarda como texto `,estudio,oficina,` en SQLite (no hay listas escalares); en Postgres puede pasar a `String[]`.
- 2026-11-18: revisión de seguridad (`ecc:security-review`): auth, sesiones, server actions, subidas y ruta `/uploads` sin hallazgos críticos; se agregaron cabeceras (`frame-ancestors 'none'`, `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`). CSP sin `script-src` a propósito: Next necesita nonces por request y eso apaga las páginas estáticas. `npm audit`: 0 vulnerabilidades.
- 2026-11-18: sloplint (hallmark): 0 FAIL. El anillo de foco del input ya no se anima; el check de los filtros se oculta con `scale(0)`. Waiver 24b: paddings de controles ajustados a targets de 40-44 px.
- 2026-11-18: Lighthouse móvil: Accesibilidad, Buenas prácticas y SEO 100 en las páginas públicas. Puntaje de Rendimiento oficial NO obtenido (el Lighthouse de chrome-devtools omite las métricas de rendimiento y `npx lighthouse` fue bloqueado); en su lugar trazas con CPU 4x + Slow 4G: LCP 844-957 ms, CLS 0.
