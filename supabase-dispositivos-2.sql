-- =========================================================================
--  Birriería Ojeda · Equipos: navegador e historial de conexiones
--  Pega esto en Supabase → SQL Editor → Run.
--  Se puede volver a ejecutar sin problema: no borra nada.
--
--  Sirve para que al picarle a un equipo salga con qué navegador entra
--  y a qué horas ha estado conectado.
-- =========================================================================

alter table public.devices add column if not exists navegador text;
alter table public.devices add column if not exists historial  jsonb not null default '[]'::jsonb;

-- Comprobación: deben aparecer las columnas nuevas.
select id, nombre, perfil, plataforma, navegador, last_seen, historial
  from public.devices
 order by last_seen desc;
