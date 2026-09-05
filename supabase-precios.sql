-- =========================================================================
--  Birriería Ojeda · Revisar los precios del menú
--  Pega esto en Supabase → SQL Editor → Run.
--
--  Marca los productos que quedaron con el precio que trae el sistema de
--  fábrica. Si alguno sale marcado, corrígelo desde el sistema
--  (Menú → el producto → Editar): así se sube solo a todos los equipos.
-- =========================================================================

select
  p.name                                   as producto,
  p.price                                  as precio_ahora,
  f.precio_de_fabrica,
  case when p.price = f.precio_de_fabrica
       then '⚠ es el de fábrica, revísalo'
       else 'ok' end                       as revisar,
  to_char(p.updated_at at time zone 'America/Mexico_City', 'DD/MM/YYYY HH24:MI') as ultimo_cambio,
  p.active                                 as se_vende,
  p.id
from public.products p
left join (values
  ('p1', 35), ('p2', 45), ('p3', 40),  ('p4', 50), ('p5', 50),
  ('p6',180), ('p7',120), ('p8',120),  ('p9', 35), ('p10',30)
) as f(id, precio_de_fabrica) on f.id = p.id
order by (p.price = f.precio_de_fabrica) desc nulls last, p.category, p.name;
