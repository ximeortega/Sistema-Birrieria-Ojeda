/* =========================================================================
   Conexión con Supabase, ya puesta para que ningún dispositivo tenga que
   escribirla. Estos dos datos son públicos por diseño: viajan dentro de la
   página web. Lo que protege la información son las políticas del servidor
   (RLS), que exigen haber entrado con el correo del negocio.
   ========================================================================= */
window.BO_SUPABASE = {
  url: 'https://ppsehjxhditpkpsvrqrc.supabase.co',
  key: 'sb_publishable_PGKvbVh7-SU7OB9-1TZUwA_Vgf9Ntmq',
};
