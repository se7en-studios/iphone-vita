-- Ingreso al panel con PIN numérico (reemplaza email + contraseña de Supabase Auth).
--   * pin_hash = sha256('iphone-vita-admin:' || pin) en hex. Lo calcula lib/admin-session.ts.
--   * admin_login_failures alimenta el bloqueo por intentos: sin él un PIN de 4 dígitos
--     se adivina en minutos.
-- Alta de un admin nuevo (PIN 1234 de ejemplo):
--   insert into public.admin_users (email, name, role, pin_hash)
--   values ('nombre', 'Nombre', 'staff', encode(sha256(convert_to('iphone-vita-admin:1234', 'UTF8')), 'hex'));

alter table public.admin_users
  add column if not exists name text,
  add column if not exists pin_hash text unique
    check (pin_hash is null or pin_hash ~ '^[0-9a-f]{64}$');

create table if not exists public.admin_login_failures (
  id bigint generated always as identity primary key,
  ip text not null,
  at timestamptz not null default now()
);
create index if not exists admin_login_failures_at on public.admin_login_failures (at);
alter table public.admin_login_failures enable row level security;
-- Sin policies a propósito: solo la service role la lee y escribe.
