-- =========================================================================
--  Birriería Ojeda · Registro de dispositivos
--  Pega esto en Supabase → SQL Editor → Run.
--
--  Sirve para ver desde Ajustes qué equipos tienen abierto el sistema,
--  con qué perfil y cuándo fue la última vez que se usaron.
-- =========================================================================

create table if not exists public.devices (
  id          text primary key,          -- identificador del equipo, se genera solo
  owner       uuid not null default auth.uid() references auth.users on delete cascade,
  nombre      text,                      -- "Tablet mesera", "Cel de cocina"…
  perfil      text,                      -- con qué perfil se está usando
  plataforma  text,                      -- Android, iPhone, Windows…
  last_seen   timestamptz not null default now(),
  created_at  timestamptz not null default now()
);

create index if not exists devices_owner_idx on public.devices (owner, last_seen desc);

-- Cada negocio solo ve sus propios equipos.
alter table public.devices enable row level security;
drop policy if exists "solo lo propio" on public.devices;
create policy "solo lo propio" on public.devices for all
  using (owner = auth.uid()) with check (owner = auth.uid());

-- Que la lista se actualice sola en la pantalla de Ajustes.
alter table public.devices replica identity full;
do $$
begin
  alter publication supabase_realtime add table public.devices;
exception when duplicate_object then
  null;   -- ya estaba publicada
end $$;

-- Comprobación: debe devolver la tabla vacía, sin error.
select * from public.devices;
