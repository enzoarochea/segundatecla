# Segunda Tecla: tienda local de laptops reacondicionadas (Guatemala)

Catálogo con filtros, ficha completa de cada laptop y panel de administración. Corre en tu PC, sin hosting.
El nombre y los colores son provisionales y se cambian en `src/config/brand.ts`.

## Cómo correrlo

Necesitás Node.js 20.19 o más nuevo.

```bash
npm install
cp .env.example .env      # en Windows: copy .env.example .env
```

Abrí `.env` y poné tu correo de admin y una contraseña de al menos 12 caracteres. Después:

```bash
npm run setup             # crea la base SQLite, carga las 15 laptops demo y el usuario admin
npm run dev               # http://localhost:3000
```

Para usarlo más rápido en el día a día: `npm run build` una vez y luego `npm run start`.

- Tienda: http://localhost:3000
- Admin: http://localhost:3000/admin (entra con los datos de tu `.env`)

## Qué hace el admin

Crear, editar, ocultar y borrar laptops; cambiar precio y stock desde la tabla; subir hasta 8 fotos por laptop
(JPG, PNG o WebP de hasta 5 MB), escribir su descripción y elegir la portada. Las fotos quedan en `uploads/`.
Todo se valida en el servidor.

## Comandos

| Comando | Para qué |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` / `npm run start` | Versión optimizada |
| `npm test` | Pruebas (filtros, ficha, admin con permisos) |
| `npm run typecheck` / `npm run lint` | Tipos y estilo |
| `npm run db:seed` | Vuelve a cargar los datos demo |

## Dónde cambiar cada cosa

- Nombre, colores, contacto, textos de grados y políticas: `src/config/brand.ts`
- Botón "Lo quiero" (hoy dice "Compra disponible pronto"): `src/lib/purchase.ts`, función `startPurchase`
- Dónde se guardan las fotos (hoy carpeta local; se puede pasar a S3/R2): `src/lib/storage.ts`

## Pendiente antes de vender

- Las 15 laptops son **demo** (precios y specs de ejemplo, marcados "Dato demo"). Borralas y cargá las reales.
- Fotos reales: hoy se ven ilustraciones SVG etiquetadas como tales.
- Garantía, devoluciones y envíos son **propuestas** ("Política propuesta, por confirmar").
- WhatsApp, correo, dirección y horario: "Por confirmar" en `src/config/brand.ts`.
- Compra: no hay carrito ni pagos (fuera de alcance).

Decisiones y registro del proyecto: `.agents/web/brief.md`.
