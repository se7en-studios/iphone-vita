# iPhone Vita — tienda web

Tienda de tecnología premium para **iPhone Vita**: iPhone nuevos y semi nuevos, Mac, iPad, Apple Watch, AirPods, accesorios y otras marcas (JBL, DJI, Anker, Casio, PS5).

Diseño y desarrollo: **Se7en Studio**.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- Tipografía Geist (paquete `geist`, sin depender de Google Fonts en el build)
- Deploy en Vercel

## Comandos

```bash
npm install      # instalar dependencias
npm run dev      # desarrollo en http://localhost:3000
npm run build    # build de producción (correr antes de mergear)
npm run start    # servir el build
```

## Variables de entorno

Copiar `.env.example` a `.env.local` y cargar las mismas en Vercel (Settings → Environment Variables):

| Variable | Para qué |
|---|---|
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Número de la tienda sin `+` ni espacios. Hoy: `5492994386853` |
| `NEXT_PUBLIC_SITE_URL` | URL pública, para metadata, Open Graph, sitemap y robots (`lib/site.ts`). Sin ella se usa `https://iphonevita.vercel.app`; cargarla al pasar a dominio propio |
| `NEXT_PUBLIC_SUPABASE_URL` | Proyecto Supabase (catálogo y admin) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública de Supabase (solo lectura por RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servidor para las escrituras del admin. Nunca `NEXT_PUBLIC_` |

## Estructura

```text
app/                    rutas
  (store)/              tienda pública (layout con navbar, carrito y footer)
  (store)/page.tsx      home editorial
  admin/                panel del dueño (login, productos, configuración)
  api/admin/            API protegida del panel
  productos/            catálogo con filtros (sidebar en desktop, drawer en mobile)
  producto/[slug]/      detalle con variantes de color, capacidad, tamaño y talle
  carrito/              carrito completo
  encontra-tu-iphone/   selector interactivo (lógica por filtros, sin IA)
components/             UI (cards, navbar, carrito, buscador, secciones de la home)
data/products.ts        catálogo semilla / fallback sin Supabase
supabase/               migrations/ (esquema) + seed.sql + config.toml (CLI)
lib/products.ts         acceso a datos de la tienda (Supabase o fallback)
lib/admin-products.ts   lecturas/escrituras del admin (service role)
lib/api-guard.ts        sesión + admin_users para /api/admin
lib/whatsapp.ts         links y mensajes de WhatsApp
lib/finder.ts           reglas de "Encontrá tu iPhone"
lib/format.ts           precios, stock y badges
types/index.ts          Product, Category, StockLevel, Condition, ...
public/images/          fotos (temporales, ver abajo)
```

## Cómo compra el cliente

- **Precio fijo** → se agrega al carrito. "Finalizar compra" abre WhatsApp con el pedido escrito (productos, cantidades y total).
- **Precio "Consultar"** (semi nuevos, cables mayoristas, transformadores, EarPods) → no entra al carrito; el botón abre WhatsApp con un mensaje del producto.
- Mercado Pago se puede sumar después en el paso "Finalizar compra" sin tocar las cards ni el catálogo.

## Panel admin y Supabase

El catálogo vive en Supabase y el dueño lo maneja desde **`/admin`** (productos, precios,
stock, fotos, visibilidad, destacados, cotización USD→ARS y barra de anuncios).
Plan completo y contrato de la API: `docs/PLAN-MEJORA.md`.

Puesta en marcha (una sola vez):

1. Crear un proyecto en Supabase.
2. Cargar esquema y productos con la CLI:
   `npx supabase login` → `npx supabase link --project-ref <ref>` → `npx supabase db push --include-seed`.
   (O a mano en el SQL Editor: `supabase/migrations/*_schema.sql` y después `supabase/seed.sql`.)
   El seed sale de `data/products.ts` y se regenera con `npx tsx scripts/seed-sql.ts`.
3. Cargar las tres variables de Supabase en Vercel y redeployar.
4. Authentication → Users → crear el usuario del dueño y correr el `insert into public.admin_users`
   que está comentado al final de la migración del esquema.

Seguridad: el público solo lee productos activos (RLS). Todas las escrituras pasan por
`/api/admin/*`, que valida la sesión y la tabla `admin_users` y recién ahí usa la service role.
Sin variables de Supabase, la tienda sigue andando con `data/products.ts`.

## Pendientes [COMPLETAR]

- **Fotos**: las de `public/images` son temporales (Unsplash, ver `CREDITOS.txt`) y no siempre coinciden con el modelo exacto. Los productos sin foto muestran una ilustración neutra con el color de la variante. Reemplazar por fotos propias y cargar la ruta en `image` / `gallery` de cada producto.
- **Logo**: hoy se usa un wordmark de texto (`components/Wordmark.tsx`). Cambiarlo por el logo en alta.
- **Instagram**: confirmar el usuario en `components/Footer.tsx`.
- **Textos legales**: `app/terminos` y `app/privacidad`.
- **Textos de confianza** (`components/sections/Trust.tsx`): confirmar con la tienda que cada afirmación es correcta.
