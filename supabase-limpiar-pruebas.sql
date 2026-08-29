-- =========================================================================
--  Birriería Ojeda · Borrar los días de prueba
--  Deja SOLO lo de hoy. Pega esto en Supabase → SQL Editor → Run.
--
--  Normalmente no hace falta: es más cómodo el botón
--  Ajustes → Zona de riesgo → "Borrar lo de días anteriores".
--  Esto sirve si quieres limpiarlo de un jalón desde la base.
-- =========================================================================

-- Primero mira qué se va a borrar (esto no borra nada):
select 'comandas' as que, count(*) as cuantas from public.orders   where date < current_date
union all
select 'gastos',            count(*)          from public.expenses where date < current_date
union all
select 'cortes',            count(*)          from public.cuts     where date < current_date;

-- Si estás de acuerdo, quita los dos guiones de las tres líneas y vuelve a correr:

-- delete from public.orders   where date < current_date;
-- delete from public.expenses where date < current_date;
-- delete from public.cuts     where date < current_date;

-- Comprobación: las tres deben quedar en 0.
-- select 'comandas', count(*) from public.orders   where date < current_date
-- union all select 'gastos', count(*) from public.expenses where date < current_date
-- union all select 'cortes', count(*) from public.cuts     where date < current_date;
