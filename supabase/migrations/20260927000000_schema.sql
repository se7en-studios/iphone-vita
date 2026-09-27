-- iPhone Vita — esquema de la tienda.
-- Se aplica con `npx supabase db push` (o pegándolo en el SQL Editor; es re-ejecutable).
--
-- Modelo de seguridad (mismo criterio que Poné La Pava, sin sus agujeros):
--   * El público solo LEE productos activos y la configuración.
--   * Nadie escribe con la anon key: todas las escrituras pasan por /api/admin,
--     que valida la sesión + admin_users y usa la service role key del servidor.
--   * admin_users no tiene policies: solo la service role la lee.

create extension if not exists pgcrypto;

-- ---------- productos ----------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (length(trim(name)) > 0),
  model text not null check (length(trim(model)) > 0),
  brand text not null default 'Apple',
  category text not null check (category in (
    'iphone','mac','ipad','apple-watch','airpods','accesorios',
    'audio','gaming','camaras-creators','wearables')),
  subcategory text check (subcategory in (
    'cables','cargadores','apple-pencil','airtags','auriculares')),
  condition text not null default 'nuevo' check (condition in ('nuevo','semi-nuevo')),
  -- USD. null = "Consultar precio" (deriva a WhatsApp, no entra al carrito)
  price numeric(10,2) check (price is null or price >= 0),
  -- Unidades exactas cuando se conocen. 0 = sin stock.
  stock integer check (stock is null or stock >= 0),
  stock_level text not null default 'alto' check (stock_level in ('alto','medio','bajo')),
  color text,
  color_hex text check (color_hex is null or color_hex ~ '^#[0-9A-Fa-f]{6}$'),
  storage text,
  battery_health integer check (battery_health is null or battery_health between 0 and 100),
  size text,
  band_size text,
  image text,
  gallery text[] not null default '{}',
  description text not null default '',
  specifications jsonb not null default '{}'::jsonb,
  featured boolean not null default false,
  wholesale boolean not null default false,
  -- false = oculto en la tienda sin borrarlo
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_model_idx on public.products (model);
create index if not exists products_category_idx on public.products (category);
create index if not exists products_sort_idx on public.products (sort_order, created_at);

create or replace function public.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

alter table public.products enable row level security;
drop policy if exists products_public_read on public.products;
create policy products_public_read on public.products
  for select to anon, authenticated using (active);

-- ---------- configuración de la tienda ----------
create table if not exists public.store_settings (
  id text primary key default 'default' check (id = 'default'),
  -- Cotización USD → ARS que muestra la web
  ars_rate numeric(10,2) not null default 1380 check (ars_rate > 0),
  -- Texto de la barra de anuncios (vacío = se usa el default del código)
  announcement text not null default '',
  updated_at timestamptz not null default now()
);
insert into public.store_settings (id) values ('default') on conflict do nothing;

drop trigger if exists store_settings_touch on public.store_settings;
create trigger store_settings_touch before update on public.store_settings
  for each row execute function public.touch_updated_at();

alter table public.store_settings enable row level security;
drop policy if exists store_settings_public_read on public.store_settings;
create policy store_settings_public_read on public.store_settings
  for select to anon, authenticated using (true);

-- ---------- administradores ----------
create table if not exists public.admin_users (
  email text primary key check (email = lower(trim(email))),
  role text not null default 'owner' check (role in ('owner','staff')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
-- Sin policies a propósito: solo la service role key la lee.

-- ---------- fotos ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880,
        array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
-- Sin policies de escritura: se sube desde /api/admin/products/upload con la service role.

-- ---------- primer admin ----------
-- 1) Authentication → Users → Add user (email + contraseña) para el dueño.
-- 2) Reemplazar el email y correr:
-- insert into public.admin_users (email, role) values ('dueno@ejemplo.com', 'owner')
--   on conflict (email) do update set active = true, role = 'owner';
