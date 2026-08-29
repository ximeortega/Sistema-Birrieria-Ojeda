# Para empezar a usarlo

## Direcciones

- **El sistema**: tu dirección de Vercel (la del proyecto `Sistema-Birrieria-Ojeda`)
- **Base de datos**: https://supabase.com/dashboard/project/ppsehjxhditpkpsvrqrc
- **Código**: https://github.com/ximeortega/Sistema-Birrieria-Ojeda

## PIN de acceso

| Perfil | PIN | Qué ve |
|---|---|---|
| Administrador | 1234 | Todo |
| Mesera | 1111 | Comandas y Cocina |
| Cocina | 2222 | Cocina y Comandas |
| Caja | 3333 | Comandas, Caja, Gastos y Corte |

Ya no se muestran en la pantalla de acceso. Se cambian en
**Ajustes → Perfiles y accesos** (solo Administrador).

## Antes de abrir

1. **Deja limpio el día de pruebas**: entra como Administrador →
   `Ajustes → Administración → Zona de riesgo → Borrar las comandas de hoy`.
2. **Revisa los precios** en la pestaña **Menú**.
3. **Pon el fondo de caja** en `Corte → Fondo inicial de hoy`.
4. **Monta cada dispositivo** (una sola vez cada uno):
   abrir la dirección → si sale la franja ámbar *"Este equipo no está sincronizado"*,
   tocar **Conectar** → entrar con el correo y la contraseña del negocio → luego el PIN.
5. Comprueba que arriba **no aparezca** el aviso ámbar. Si no aparece, está sincronizado.

## El día

**Mesera** — Comandas → botón **+** → elige mesa → arma el pedido por platos →
*Enviar a cocina*. Para llevar pide nombre, teléfono y dirección; si es a domicilio,
también el costo del envío.

**Cocina** — ve solo lo que falta preparar, separado por plato. Toca cada producto
al terminarlo, o **Comanda lista** para todo. Al quedar lista desaparece y pasa a Caja.

**Caja** — la comanda aparece desde que se levanta. Cobrar → forma de pago →
con cuánto paga → el cambio sale en grande.

**Gastos** — de qué es, descripción, cantidad y quién lo hizo.

**Al cerrar** — `Corte` → captura el efectivo contado → **Guardar corte del día**.

## Cada semana

`Ajustes → Reportes y respaldo` → **Descargar respaldo**. Guárdalo en otro lado.
Ahí mismo salen los reportes de Excel (ventas, productos, gastos, resumen por día).

## Si algo se ve raro

- **Aviso ámbar arriba** → ese equipo no está conectado: tócalo y entra al negocio.
- **Un cambio no aparece en otro celular** → `Ajustes → Sincronización → Revisar conexión`.
  Compara lo que hay aquí contra lo que hay en la nube y dice qué hacer.
- **Nada carga** → recarga la página. Los datos quedan guardados en el equipo, no se pierden.

## Pendiente

Borra el usuario `diagnostico.claude@ejemplo.com` en
**Supabase → Authentication → Users**. Se creó al revisar la conexión y ya no sirve.
