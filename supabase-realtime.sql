-- =========================================================================
--  Birriería Ojeda · Arreglo del tiempo real
--  Pega esto en Supabase → SQL Editor → Run. Tarda un segundo.
--
--  Por qué hace falta: con la seguridad por filas (RLS) encendida, Supabase
--  necesita la fila completa para saber a quién le puede avisar de un cambio.
--  Sin esto, los INSERT llegan pero los UPDATE no: por eso al cambiar un
--  precio los demás dispositivos seguían viendo el viejo.
-- =========================================================================

do $$
declare t text;
begin
  foreach t in array array['products','orders','expenses','cuts','settings'] loop
    -- Manda la fila completa en los avisos de cambio y borrado
    execute format('alter table public.%I replica identity full', t);

    -- Asegura que la tabla esté publicada para tiempo real
    begin
      execute format('alter publication supabase_realtime add table public.%I', t);
    exception when duplicate_object then
      null;   -- ya estaba
    end;
  end loop;
end $$;

-- Comprobación: deben aparecer las 5 tablas, todas con identidad "f" (full).
select c.relname as tabla,
       c.relreplident as identidad,
       (select count(*) > 0
          from pg_publication_tables p
         where p.pubname = 'supabase_realtime'
           and p.schemaname = 'public'
           and p.tablename = c.relname) as publicada
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('products','orders','expenses','cuts','settings')
order by c.relname;
