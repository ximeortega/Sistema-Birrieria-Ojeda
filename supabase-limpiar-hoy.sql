-- =========================================================================
--  Birriería Ojeda · Borrar lo de HOY
--  Para cuando el día fue solo una prueba y no quieres que cuente.
--  Pega esto en Supabase → SQL Editor → Run.
--
--  Si es una sola comanda, es más rápido borrarla desde la app:
--  Comandas → la tocas → Borrar (solo el perfil Administrador lo ve).
-- =========================================================================

-- 1) Primero mira qué hay hoy. Esto NO borra nada.
select 'comandas' as que, count(*) as cuantas from public.orders   where date = current_date
union all
select 'gastos',            count(*)          from public.expenses where date = current_date
union all
select 'cortes',            count(*)          from public.cuts     where date = current_date;

-- 2) Si estás de acuerdo, quítale los dos guiones a las líneas que necesites
--    y vuelve a correr. Borra solo lo de hoy; los días anteriores no se tocan.

-- delete from public.orders   where date = current_date;
-- delete from public.expenses where date = current_date;
-- delete from public.cuts     where date = current_date;

-- 3) Comprobación: las tres deben quedar en 0.
-- select 'comandas', count(*) from public.orders   where date = current_date
-- union all select 'gastos', count(*) from public.expenses where date = current_date
-- union all select 'cortes', count(*) from public.cuts     where date = current_date;
