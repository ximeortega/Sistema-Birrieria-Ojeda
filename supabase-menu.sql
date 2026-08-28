-- =========================================================================
--  Birriería Ojeda · Menú y precios
--  Pega esto en Supabase → SQL Editor → Run.
--  Se puede volver a ejecutar: actualiza los precios en vez de duplicar.
-- =========================================================================

with negocio as (
  select id
  from auth.users
  -- Si creaste más de un usuario, quita los dos guiones de la línea de abajo
  -- y escribe el correo del negocio para no equivocarse de cuenta:
  -- where email = 'birrieria@ojeda.com'
  order by created_at
  limit 1
)
insert into public.products (id, owner, name, price, category, active)
select m.id, negocio.id, m.name, m.price, m.category, true
from negocio,
     (values
        ('p1',  'Taco suave',            35,  'ALIMENTOS'),
        ('p2',  'Taco ahogado',          45,  'ALIMENTOS'),
        ('p3',  'Taco dorado',           40,  'ALIMENTOS'),
        ('p4',  'Quesabirria',           50,  'ALIMENTOS'),
        ('p5',  'Dorado con queso',      50,  'ALIMENTOS'),
        ('p6',  'Orden de birria',       180, 'ALIMENTOS'),
        ('p7',  'Media orden de birria', 120, 'ALIMENTOS'),
        ('p8',  'Torta de birria',       120, 'ALIMENTOS'),
        ('p9',  'Refresco',              35,  'BEBIDAS'),
        ('p10', 'Agua natural',          30,  'BEBIDAS')
     ) as m(id, name, price, category)
on conflict (id) do update
  set name     = excluded.name,
      price    = excluded.price,
      category = excluded.category,
      active   = true;

-- Comprobación: debe devolver los 10 productos con su precio.
select name, price, category
from public.products
order by category, price desc;
