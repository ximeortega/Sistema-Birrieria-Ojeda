-- =========================================================================
--  Birriería Ojeda · Qué días tienen corte guardado y cuáles no
--  Pega esto en Supabase → SQL Editor → Run. Solo consulta, no cambia nada.
--
--  Sirve para saber si a un día le falta el corte, o si ese día
--  simplemente no hubo movimiento.
-- =========================================================================

select
  d.dia,
  to_char(d.dia, 'TMDay')                     as que_dia_fue,
  d.comandas,
  d.cobradas,
  d.venta,
  case when c.id is null then 'NO SE GUARDÓ EL CORTE'
       else 'corte guardado ' || c.time end   as corte
from (
  select o.date as dia,
         count(*)                                        as comandas,
         count(*) filter (where o.paid)                   as cobradas,
         coalesce(sum(case when o.paid then
           (select coalesce(sum((i->>'price')::numeric * (i->>'qty')::numeric), 0)
              from jsonb_array_elements(o.items) i)
         else 0 end), 0)                                  as venta
    from public.orders o
   group by o.date
) d
left join public.cuts c on c.date = d.dia
order by d.dia desc;
