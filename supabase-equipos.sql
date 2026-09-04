-- =========================================================================
--  Birriería Ojeda · Ver todos los equipos anotados
--  Pega esto en Supabase → SQL Editor → Run.
--
--  Sirve para comparar contra lo que muestra Ajustes → Equipos conectados:
--  las dos listas deben traer exactamente los mismos renglones.
-- =========================================================================

select
  coalesce(nombre, '(sin nombre)')            as quien_lo_usa,
  coalesce(plataforma, '?')                   as aparato,
  coalesce(navegador, '?')                    as navegador,
  coalesce(perfil, '(no ha puesto PIN)')      as entra_como,
  to_char(created_at at time zone 'America/Mexico_City', 'DD/MM/YYYY HH24:MI') as abrio_por_primera_vez,
  to_char(last_seen  at time zone 'America/Mexico_City', 'DD/MM/YYYY HH24:MI') as ultima_senal,
  jsonb_array_length(coalesce(historial, '[]'::jsonb))                          as ratos_guardados,
  id
from public.devices
order by last_seen desc;

-- Cuántos hay en total y cuántos siguen abiertos ahorita:
select count(*)                                                as equipos_en_total,
       count(*) filter (where last_seen > now() - interval '2 minutes')  as abiertos_ahora,
       count(*) filter (where nombre is null or nombre = '')             as sin_nombre
from public.devices;
