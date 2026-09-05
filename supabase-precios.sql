-- =========================================================================
--  Birriería Ojeda · Devolver el menú a como estaba
--
--  Toma los precios del respaldo del 4 de septiembre de 2026, o sea de
--  antes de que el menú de fábrica los pisara. Pega TODO esto en
--  Supabase → SQL Editor → Run. Una sola vez basta: los precios llegan
--  solos a todos los celulares en unos segundos.
--
--  No borra comandas, gastos ni cortes. Solo toca el menú.
-- =========================================================================

-- 1) Así están AHORA, antes de tocar nada:
select name as producto, price as precio_ahora, id from public.products order by category, name;

-- 2) Se devuelven los precios buenos.
insert into public.products (id, name, price, category, active)
values
  ('17c3dfce-dfac-4ab7-a4f2-79bdba169911', 'Té', 35, 'BEBIDAS', true),
  ('p8', 'Torta de birria', 120, 'ALIMENTOS', true),
  ('p9', 'Refresco', 35, 'BEBIDAS', true),
  ('p10', 'Agua natural', 30, 'BEBIDAS', true),
  ('5d0f8670-1ac1-4659-a49f-32eafbaf9c21', 'Agua de horchata', 30, 'BEBIDAS', true),
  ('a3a2e96e-a388-4d88-aa53-f709f0aa651d', 'Agua de limon', 30, 'BEBIDAS', true),
  ('4c6e71b9-392a-4f50-a216-fb2e258f2a7a', 'Agua de jamaica', 30, 'BEBIDAS', true),
  ('d58f0d95-bce0-4db4-8a6f-acd7411c2f67', 'Agua de tamarindo', 30, 'BEBIDAS', true),
  ('480f760a-de75-4d13-ab41-01cd7bf8e648', 'Agua de piña', 30, 'BEBIDAS', true),
  ('p7', 'Media orden de birria', 130, 'ALIMENTOS', true),
  ('p6', 'Orden de birria', 200, 'ALIMENTOS', true),
  ('p1', 'Taco suave', 40, 'ALIMENTOS', true),
  ('p3', 'Taco dorado', 50, 'ALIMENTOS', true),
  ('p5', 'Dorado con queso', 60, 'ALIMENTOS', true),
  ('p2', 'Taco ahogado', 50, 'ALIMENTOS', true),
  ('586665eb-3540-40f2-ad71-2cc50951766c', 'Quesabirria Sencilla', 55, 'ALIMENTOS', true),
  ('28cfb0b1-2d0a-49fb-8660-8f9db45d788f', 'Quesabirria doble', 80, 'ALIMENTOS', true)
on conflict (id) do update
  set name       = excluded.name,
      price      = excluded.price,
      category   = excluded.category,
      active     = excluded.active,
      updated_at = now();

-- 3) El menú de fábrica revivió un producto que tú ya habías borrado
--    (p4). Se quita de nuevo.
delete from public.products where id in ('p4');

-- 4) Comprobación: así queda el menú.
select name as producto, price as precio, category as categoria, active as se_vende
  from public.products order by category, name;
