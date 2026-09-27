# iPhone Vita — Plan de mejora (sep 2026)

Objetivo: que el dueño maneje **todo su catálogo solo** desde un panel admin (igual al de
Poné La Pava) y que la landing venda más, entendida como lo que es: **un e-commerce**, no una
página institucional.

Repo: `C:\Users\franc\OneDrive\Documentos\UNIVERSIDAD\webs\iphone-vita` · Next.js 15.5 (App
Router) + React 19 + Tailwind 4 · deploy Vercel · checkout por WhatsApp (sin pasarela todavía).
Referencia del admin: `C:\Users\franc\OneDrive\Documentos\UNIVERSIDAD\webs\ponelapava\src`
(`components/admin/*`, `app/admin/(panel)/*`, `lib/useAdminProducts.ts`).

---

## Fase 0 — Backend (HECHO, commit 917bf1c)

- `supabase/migrations/20260927000000_schema.sql`: `products`, `store_settings` (cotización USD→ARS + anuncio),
  `admin_users`, bucket `product-images`. RLS: el público solo lee productos `active`.
  Nadie escribe con la anon key.
- `supabase/seed.sql`: los 70 productos actuales (generado con `npx tsx scripts/seed-sql.ts`).
- `lib/products.ts`: lee Supabase (cacheado, tag `products`) o `data/products.ts` si no hay env.
- `lib/settings.ts` → `getSettings(): { arsRate, announcement }`.
- `middleware.ts`: sesión obligatoria en `/admin/*` (salvo `/admin/login`) y `/api/admin/*`.
- `lib/api-guard.ts`: `getAdminUser()` / `requireAdmin(role?)` / `handle()` (sesión + `admin_users`
  leída con service role).
- Tienda movida a `app/(store)/` (su layout tiene navbar, carrito, footer, WhatsApp). `/admin`
  vive afuera y no hereda nada de eso.

### Contrato de la API (no cambiar sin avisar)

| Método | Ruta | Body | Respuesta |
|---|---|---|---|
| GET | `/api/admin/products` | — | `Product[]` (incluye ocultos) |
| POST | `/api/admin/products` | producto completo | `Product` (201) |
| GET/PUT | `/api/admin/products/:id` | producto completo (PUT) | `Product` |
| DELETE | `/api/admin/products/:id` | — | `{ ok }` · solo `owner` |
| POST | `/api/admin/products/bulk` | `{ ids, action: "patch", patch: { price?, stock?, stockLevel?, active?, featured? } }` | `{ count, products }` |
| POST | `/api/admin/products/bulk` | `{ ids, action: "adjust-price", percent }` | `{ count, products }` |
| POST | `/api/admin/products/bulk` | `{ ids, action: "delete" }` · solo `owner` | `{ count, products }` |
| POST | `/api/admin/products/upload` | `FormData` con `file` (JPG/PNG/WebP ≤ 5 MB) | `{ url }` (201) |
| GET/PUT | `/api/admin/settings` | `{ arsRate, announcement }` · PUT solo `owner` | `StoreSettings` |

Errores: `{ error: string }` con 400 (validación, mensaje para mostrar al usuario), 401/403, 500.
Producto completo = campos de `Product` en `types/index.ts` (camelCase). `slug` es opcional: si
no viene se arma con nombre + variante. `price: null` = "Consultar precio". Las specs derivadas
(Capacidad, Color, Tamaño, Talle, Salud de batería, Condición) las recalcula el servidor.

---

## Fase 1 — Panel admin (Agente A)

**Es dueño de:** `app/admin/**`, `components/admin/**`, `lib/admin-client.ts` (si lo necesita).
**No toca:** `app/(store)/**`, `components/*` fuera de `admin/`, `lib/*` existentes, API, SQL.

Tiene que **verse y comportarse como el admin de Poné La Pava**: misma estructura (sidebar
fija en desktop, bottom nav / drawer en mobile, header con título + acciones), mismas piezas
(AdminCard, AdminButton, AdminField, AdminModal, AdminToast, ConfirmDialog, EmptyState,
TableSkeleton, AdminToggle), mismo flujo de ProductForm. Leer esos archivos y portarlos,
adaptando la paleta a iPhone Vita (claro estilo Apple: fondo `#f5f5f7`, superficies blancas,
texto `#1d1d1f`, acento `#0071e3`, Geist). Estilos del panel aislados (clases Tailwind o
`app/admin/admin.css` importado solo en el layout del admin), sin tocar `app/globals.css`.

Pantallas:

1. **`/admin/login`** — email + contraseña (Supabase Auth, `lib/supabase-browser.ts`), errores
   en castellano, `?error=unauthorized` muestra "Tu usuario no tiene acceso".
2. **Layout `app/admin/(panel)/layout.tsx`** — `getAdminUser()`; si null → `redirect("/admin/login?error=unauthorized")`.
   Si `!isSupabaseConfigured` → pantalla "Configurar Supabase" con los 4 pasos (crear proyecto,
   correr la migración y seed.sql, cargar las 3 env vars en Vercel, crear usuario + insert en
   admin_users). `robots: noindex`. Botón "Ver tienda" y "Cerrar sesión".
3. **`/admin` → `/admin/productos`** (el dueño entra a trabajar sobre el catálogo).
4. **`/admin/dashboard` (Resumen)** — KPIs: productos activos, ocultos, sin stock (`stock === 0`),
   últimas unidades (`stockLevel === "bajo"`), "consultar precio", sin foto, destacados.
   Lista "Requieren atención" (sin foto, sin stock, sin precio) con link a editar.
5. **`/admin/productos`** — el corazón:
   - Tabla en desktop, cards en mobile. Foto, nombre + variante (`fullName`), categoría,
     condición, precio USD (+ ARS chico con la cotización actual), stock, estado.
   - Buscador (nombre/modelo/color/capacidad/slug), filtros (categoría, condición, estado
     activo/oculto, stock: sin stock / bajo / con foto / sin foto), orden (catálogo, precio,
     nombre, recientes). Filtros en la URL (`?q=&cat=`) para no perderlos al volver.
   - **Edición rápida inline** de precio y stock (Enter guarda, Esc cancela, optimista con
     rollback y toast) + toggles activo/destacado → `bulk` con `action: "patch"` y un id.
   - **Selección múltiple** + barra de acciones: mostrar, ocultar, destacar, quitar destacado,
     marcar sin stock, **ajustar precio %** (modal con preview antes/después), borrar (solo owner,
     ConfirmDialog).
   - Agrupar por modelo (toggle) para ver las variantes juntas.
   - Botones por fila: editar, **duplicar como variante** (abre el form precargado sin slug ni
     id, para cargar otro color/capacidad en 10 segundos), ver en la tienda, borrar.
   - Exportar CSV del listado filtrado.
6. **ProductForm (modal grande o página `/admin/productos/[id]` y `/admin/productos/nuevo`)** —
   secciones: Básico (nombre, marca, categoría → subcategoría solo si es accesorios, modelo con
   autocompletado de modelos existentes, condición), Variante (color + color hex con picker,
   capacidad, tamaño, talle, salud de batería si es semi nuevo), Precio y stock (USD con preview
   en ARS, checkbox "Consultar precio" que pone `price: null`, stock en unidades, nivel de stock),
   Fotos (drag & drop múltiple, subir a `/upload`, reordenar, elegir principal, borrar, pegar
   URL), Descripción, Especificaciones (editor clave/valor), Visibilidad (activo, destacado,
   mayorista, orden). Validación en cliente con los mismos límites que `lib/validation.ts`,
   mostrar el `error` del servidor tal cual. Aviso de cambios sin guardar al cerrar.
   Preview en vivo de la card como se ve en la tienda.
7. **`/admin/configuracion`** — cotización USD→ARS (con ejemplo "USD 1.000 = $ …") y texto
   de la barra de anuncios. Staff la ve en solo lectura.

Roles: `staff` no ve borrar ni puede guardar configuración (la API igual lo bloquea).
Accesibilidad: labels reales, foco visible, modales con foco atrapado y Esc, targets ≥ 40px.
Puede agregar `lucide-react` (lo usa Poné La Pava). Nada más sin justificar.

## Fase 2 — Landing e-commerce (Agente B)

**Es dueño de:** `app/(store)/**`, `app/layout.tsx`, `app/sitemap.ts`, `components/**` fuera de
`components/admin/`, `lib/format.ts`, `lib/whatsapp.ts`, `lib/finder.ts`.
**No toca:** `app/admin/**`, `components/admin/**`, `app/api/**`, `lib/products.ts`,
`lib/product-row.ts`, `lib/validation.ts`, `lib/api-guard.ts`, `lib/admin-products.ts`, SQL.

Lo que el admin ahora controla tiene que reflejarse en la tienda:

1. **La home no puede romperse por el catálogo.** Hoy `app/(store)/page.tsx` hace `notFound()`
   si no existe `iphone-18-pro` y usa listas de modelos hardcodeadas. Si el dueño borra u oculta
   un modelo, la home tiene que degradar sola (tomar otro destacado, saltear secciones vacías).
   El **destacado del hero y "Lo más elegido" salen del flag `featured`** que maneja el admin
   (con fallback al orden actual si no hay ninguno).
2. **Cotización y anuncio dinámicos**: `getSettings()` en el layout de la tienda → contexto
   (`useStoreSettings()` o similar) → todo `formatARS`/`priceLabelARS` usa `arsRate` real, y
   `AnnouncementBar` usa `announcement` si no está vacío. Nada de `DEFAULT_ARS_RATE` en la UI.
3. **Sin stock**: `stock === 0` → badge "Sin stock", no se puede agregar al carrito, botón pasa a
   "Avisame cuando llegue" (WhatsApp). El carrito descarta/avisa líneas de productos que ya no
   existen, se ocultaron o se quedaron sin stock.

Mejoras de conversión (auditar la home actual primero; mantener la estética Apple ya lograda):

4. Above the fold: qué vendés + precio "desde" en USD **y en pesos** + CTA "Comprar" que lleva
   al producto/catálogo, no solo storytelling. Barra de confianza pegada al hero (garantía,
   envío a todo el país, pago en pesos/USD, plan canje) — sin inventar datos que la tienda no
   confirmó (ver `components/sections/Trust.tsx`).
5. **Comprar por categoría** bien arriba (tiles iPhone / Mac / iPad / Watch / AirPods /
   Accesorios / Otras marcas) con "desde USD X" calculado del catálogo real.
6. Sección **semi nuevos** con batería y precio visibles (son el gancho de precio).
7. Revisar el largo de la home: todo lo que no ayuda a comprar se achica o sale. Pocas
   secciones bien hechas > muchas.
8. Ficha de producto: precio ARS con la cotización real, disponibilidad clara, qué incluye,
   cómo compro (WhatsApp) y relacionados; JSON-LD `Product` con `offers` (precio, moneda USD,
   `availability` según stock).
9. Catálogo `/productos`: que "sin stock" quede al final, orden por precio, contador de
   resultados, estado vacío útil.
10. Mensaje de WhatsApp del carrito: productos, cantidades, total USD y ARS con la cotización.
11. Mobile primero (375px): nada de scroll horizontal, CTA siempre alcanzable.

## Reglas para los dos agentes

- Trabajan **en paralelo sobre el mismo working tree**: respetar la lista de archivos propios.
  Si necesitan algo fuera de su zona, lo anotan en el reporte final en vez de tocarlo.
- **No commitear, no pushear, no correr `npm run build`** (dos builds a la vez pisan `.next`).
  Verificar con `npx tsc --noEmit -p .`. El build, la revisión y el push los hace el orquestador.
- Nada de `console.log` ni código muerto. Castellano rioplatense en toda la UI.
- Reporte final: archivos creados/modificados, decisiones, pendientes y dudas.

## Fase 3 — Salida (orquestador)

`npm run build` limpio → revisión de código (seguridad del admin incluida) → commits
convencionales → push a `main` → verificar deploy en Vercel.

### Lo que tiene que hacer el dueño/Franco (no automatizable desde acá)

1. Crear un proyecto Supabase para iPhone Vita (la cuenta conectada ya tiene 2 proyectos
   activos, el límite del plan gratis).
2. SQL Editor → correr `supabase/migrations/20260927000000_schema.sql` y después `supabase/seed.sql`.
3. Vercel → Settings → Environment Variables: `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` → redeploy.
4. Authentication → Users → crear el usuario del dueño y correr el insert en `admin_users`
   (al final de la migración del esquema).

Hasta entonces la tienda sigue funcionando con `data/products.ts` y `/admin` muestra esta guía.
