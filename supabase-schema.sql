-- =========================================================================
--  Birriería Ojeda · Base de datos en Supabase
--  Pega TODO este archivo en Supabase → SQL Editor → Run.
--  Se puede volver a ejecutar sin problema: no borra nada de lo que ya haya.
-- =========================================================================

-- ---------- Tablas -------------------------------------------------------

-- Menú y precios
create table if not exists public.products (
  id          text primary key,
  owner       uuid not null default auth.uid() references auth.users on delete cascade,
  name        text not null,
  price       numeric not null default 0,
  category    text not null default 'ALIMENTOS',
  active      boolean not null default true,
  updated_at  timestamptz not null default now()
);

-- Comandas. Los productos van dentro de `items` para que cada comanda sea
-- una sola fila: así la mesera y la cocina pueden trabajar a la vez sin pisarse.
create table if not exists public.orders (
  id           text primary key,
  owner        uuid not null default auth.uid() references auth.users on delete cascade,
  folio        text,
  date         date not null,
  table_name   text not null,
  customer     text default '',
  created_at   timestamptz not null default now(),
  created_time text,
  waiter       text,
  items        jsonb not null default '[]'::jsonb,
  paid         boolean not null default false,
  payment      jsonb,
  updated_at   timestamptz not null default now()
);

-- Gastos
create table if not exists public.expenses (
  id          text primary key,
  owner       uuid not null default auth.uid() references auth.users on delete cascade,
  date        date not null,
  time        text,
  category    text,
  description text,
  amount      numeric not null default 0,
  responsible text,
  items       jsonb,
  updated_at  timestamptz not null default now()
);

-- Cortes guardados (cada uno lleva su fotografía del día)
create table if not exists public.cuts (
  id         text primary key,
  owner      uuid not null default auth.uid() references auth.users on delete cascade,
  date       date not null,
  time       text,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Configuración del negocio: perfiles, PIN, mesas, fondos, nombre y logo.
-- Una sola fila por negocio.
create table if not exists public.settings (
  owner      uuid primary key default auth.uid() references auth.users on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ---------- Índices ------------------------------------------------------
create index if not exists orders_owner_date_idx   on public.orders (owner, date);
create index if not exists expenses_owner_date_idx on public.expenses (owner, date);
create index if not exists cuts_owner_date_idx     on public.cuts (owner, date);

-- ---------- Seguridad ----------------------------------------------------
-- Cada negocio solo ve y modifica lo suyo. Todas las tablets que inicien
-- sesión con el mismo correo comparten la información.

alter table public.products enable row level security;
alter table public.orders   enable row level security;
alter table public.expenses enable row level security;
alter table public.cuts     enable row level security;
alter table public.settings enable row level security;

do $$
declare t text;
begin
  foreach t in array array['products','orders','expenses','cuts','settings'] loop
    execute format('drop policy if exists "solo lo propio" on public.%I', t);
    execute format(
      'create policy "solo lo propio" on public.%I for all
         using (owner = auth.uid()) with check (owner = auth.uid())', t);
  end loop;
end $$;

-- ---------- Marca de tiempo automática -----------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array array['products','orders','expenses','cuts','settings'] loop
    execute format('drop trigger if exists touch_%I on public.%I', t, t);
    execute format(
      'create trigger touch_%I before update on public.%I
         for each row execute function public.touch_updated_at()', t, t);
  end loop;
end $$;

-- ---------- Tiempo real --------------------------------------------------
-- Para que cocina vea la comanda en cuanto la mesera la manda.
do $$
declare t text;
begin
  foreach t in array array['products','orders','expenses','cuts','settings'] loop
    begin
      execute format('alter publication supabase_realtime add table public.%I', t);
    exception when duplicate_object then
      null;   -- ya estaba publicada
    end;
  end loop;
end $$;

-- Listo. Ahora ve a Settings → API y copia la Project URL y la clave anon.
