-- Ventas del panel. Antes vivían en el localStorage de cada navegador (no se veían entre
-- dispositivos y arrancaban con 4 ventas de ejemplo). Sin policies: solo la service role.

create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products (id) on delete set null,
  product_name text not null check (length(trim(product_name)) between 1 and 200),
  condition text not null check (condition in ('nuevo', 'semi-nuevo')),
  quantity integer not null default 1 check (quantity between 1 and 1000),
  sale_price_usd numeric(12, 2) not null check (sale_price_usd > 0),
  cost_usd numeric(12, 2) not null default 0 check (cost_usd >= 0),
  sale_price_ars numeric(16, 2) not null default 0 check (sale_price_ars >= 0),
  payment_method text not null check (payment_method in
    ('efectivo_usd', 'transferencia_ars', 'canje', 'tarjeta', 'mixto')),
  customer_name text check (length(customer_name) <= 200),
  trade_in_model text check (length(trade_in_model) <= 200),
  notes text check (length(notes) <= 500),
  created_by text,
  created_at timestamptz not null default now()
);
create index if not exists sales_created_at on public.sales (created_at desc);
alter table public.sales enable row level security;
