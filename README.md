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
| `NEXT_PUBLIC_SITE_URL` | URL pública, para metadata y Open Graph |

## Estructura

```text
app/                    rutas
  page.tsx              home editorial
  productos/            catálogo con filtros (sidebar en desktop, drawer en mobile)
  producto/[slug]/      detalle con variantes de color, capacidad, tamaño y talle
  carrito/              carrito completo
  encontra-tu-iphone/   selector interactivo (lógica por filtros, sin IA)
components/             UI (cards, navbar, carrito, buscador, secciones de la home)
data/products.ts        catálogo: única fuente de productos
lib/products.ts         acceso a datos (getProducts, getProductBySlug, ...)
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

## Pasar a Supabase

Ningún componente declara productos: todo sale de `lib/products.ts`. Para conectar Supabase:

1. Crear la tabla `products` con los campos de `types/index.ts`.
2. Reemplazar el cuerpo de `getProducts()`, `getProductBySlug()`, etc. por consultas a Supabase.
3. Subir las fotos a Supabase Storage (el dominio `*.supabase.co` ya está permitido en `next.config.ts`).

El mismo modelo sirve para el panel de administración: alta y edición de productos, precio, stock, imágenes, categoría y nuevo / semi nuevo.

## Pendientes [COMPLETAR]

- **Fotos**: las de `public/images` son temporales (Unsplash, ver `CREDITOS.txt`) y no siempre coinciden con el modelo exacto. Los productos sin foto muestran una ilustración neutra con el color de la variante. Reemplazar por fotos propias y cargar la ruta en `image` / `gallery` de cada producto.
- **Logo**: hoy se usa un wordmark de texto (`components/Wordmark.tsx`). Cambiarlo por el logo en alta.
- **Instagram**: confirmar el usuario en `components/Footer.tsx`.
- **Textos legales**: `app/terminos` y `app/privacidad`.
- **Textos de confianza** (`components/sections/Trust.tsx`): confirmar con la tienda que cada afirmación es correcta.
