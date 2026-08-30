# Birriería Ojeda · Sistema de operación (prototipo)

Prototipo funcional basado en el archivo `BIRRIERIA_OJEDA_COMANDERO_RAPIDO.xlsx`.
Corre sin instalar nada: son tres archivos (`index.html`, `styles.css`, `app.js`) y los datos
se guardan en el `localStorage` del navegador.

## Pestañas

### Inicio · panel del dueño
- Ventas cobradas de hoy con comparativo contra ayer, utilidad del día, ticket promedio y
  efectivo esperado en caja.
- Gráfica de **ventas por hora** (hoy) o **por día** (últimos 7 días).
- Ranking de lo más vendido, últimas comandas y mapa de mesas en tiempo real.
- El panel se adapta al rol: mesera y cocina ven la operación; administrador y caja ven el dinero.

### Comandas · un solo botón “+”
- La pestaña abre con el botón **+ Nueva comanda** a la derecha, más uno flotante que sigue
  al bajar por el historial.
- Al tocarlo, lo primero es **elegir la mesa**: se ven todas con su estado (libre, u ocupada
  con su total). Si la mesa ya tiene comanda abierta, se abre esa para seguir agregándole.
  “Para llevar” siempre levanta un pedido nuevo y, antes de capturarlo, pide los
  **datos de entrega**: nombre, teléfono, dirección, referencias y si pasan por él o va a
  domicilio. Esa información viaja a cocina, a caja y al ticket, y sale en el reporte de ventas.
- **Servicio a domicilio**: al elegir esa opción se abre su apartado con el **costo del envío**,
  la hora aproximada y quién lo lleva. El envío **se suma al total** y se cobra en caja como
  parte de la cuenta; en el corte aparece como su propio renglón, separado de los productos.
  Un envío a domicilio no se guarda sin dirección.
- Ya adentro se buscan productos por nombre o categoría y se arma el ticket. Cada renglón
  admite nota para cocina (“sin cebolla”).
- **Todo va por plato**: arriba del menú hay una barra de platos. Toda comanda empieza con
  *Plato 1* y lo que toques se carga al plato activo, que muestra su propio subtotal.
  Con *Otro plato* se agregan los que hagan falta.
  El ticket **siempre** se agrupa por plato — también cuando hay uno solo — y así llega a
  cocina (cada producto trae su etiqueta) y al ticket de caja.
  Se pueden renombrar (*Papá*, *niño*, *mesa chica*) o quitar.
- Debajo del “+” está el **historial completo del día** con filtros: abiertas, cobradas o
  todas, más el resumen de comandas, piezas, por cobrar y cobrado.
- **Borrar una comanda** (solo Administrador): botón en cada tarjeta y en el ticket. Avisa si
  ya estaba cobrada, porque ese dinero deja de contar en el corte y en los reportes. El
  borrado también viaja a los demás equipos.
- **Enviar por WhatsApp**: el botón verde de cada comanda abre WhatsApp con el pedido ya
  escrito — cliente, teléfono, dirección, referencias, los productos separados por plato y el
  total. Se puede mandar a quien reparte (si se guardó su número en Ajustes), al teléfono del
  cliente, o elegir el contacto en el momento. También se puede copiar el texto.
  No hace falta ninguna cuenta de empresa ni conectar nada.

### Cocina
- Una sola lista: **solo lo que falta preparar**. Sin columnas ni pasos intermedios.
- Cada comanda viene **separada por plato**, con el nombre del plato y su avance
  (*2/3*); el encabezado se pone verde cuando ese plato queda completo.
- Un toque en el producto lo marca listo (otro toque lo regresa). El botón
  **“Comanda lista”** marca todo de golpe.
- La comanda **desaparece de cocina** cuando se marcan todos sus productos
  o cuando se cobra la cuenta.
- Cronómetro por comanda que cambia de color a los 10 y 20 minutos.

### Flujo de una comanda
1. Se levanta la comanda → entra **al mismo tiempo** a Cocina y a Caja.
2. Cocina la marca lista → sale de Cocina y se queda esperando en Caja.
3. Se cobra → sale de Caja y pasa al historial del día.

Si se cobra antes de que cocina la marque, también sale de Cocina: solo hay dos
estados, *en cocina* y *lista para cobrar*.

### Caja
- Pedidos ordenados poniendo primero los que ya salieron de cocina.
- Cobro en tres pasos claros: **total en grande → forma de pago → con cuánto paga**,
  con teclado numérico en pantalla (no hace falta teclado físico en la tablet),
  botones de billete rápido y el cambio a devolver en un recuadro verde.
  Si falta dinero, el recuadro se pone rojo y el botón de cobrar se bloquea.
- Bitácora de los cobros del día con su **ticket imprimible**: sale del ancho de una impresora
  de caja (80 mm), con el negocio, la comanda separada por plato, el desglose del envío si lo
  hubo, la forma de pago y el mensaje de despedida. Se imprime solo el ticket, no la pantalla.

### Gastos
Cuatro campos y ya:

1. **¿De qué es el gasto?** — lista desplegable (carne, insumos, tortillas, bebidas, gas,
   servicios, nómina, otros).
2. **Descripción** — cuadro de texto, **opcional**. Si se deja vacío se usa la categoría.
3. **Cantidad** — el importe.
4. **¿Quién lo hizo?**

Abajo, el total del día, el desglose por categoría y la lista de movimientos.
Los gastos capturados con la versión anterior, que traían varios conceptos, se siguen
consultando con el botón *Ver* y se exportan completos.

### Corte
Dos cosas nada más:

- **Corte del día** — ventas, gastos, utilidad y el control de efectivo
  (fondo inicial + ventas en efectivo − gastos = lo que debe haber, contra lo contado),
  y el botón para guardarlo.
  El **fondo inicial es de cada día**: se captura aquí y no modifica los días anteriores.
  En Ajustes se define con cuánto sueles abrir caja, y ese valor se usa en los días nuevos.
- **Historial de cortes** — todos los días que lleves guardados. Al tocar un renglón se abre
  el detalle completo de ese día: resumen de la venta, tickets, piezas, ticket promedio,
  efectivo contra tarjeta, control de caja, **venta por producto** y **los gastos de ese día**.
  Cada corte guarda su propia fotografía, así que el histórico no cambia después.

### Menú y precios
- Alta, edición, ocultado y borrado de productos, con categorías nuevas si hacen falta.

### Ajustes · administración (solo Administrador)
- **Perfiles y accesos**: por cada perfil se cambia el nombre, el PIN y **qué pestañas puede ver**.
  No deja repetir PIN. Inicio siempre está disponible y el Administrador conserva Ajustes,
  para que nadie se quede fuera de la configuración.
- **Datos del negocio**: nombre, número de mesas (1 a 40) y el fondo con el que abres caja
  (valor predeterminado para los días nuevos; el fondo de hoy se ajusta en Corte).
- **Respaldo**: descargar toda la información en un archivo `.json` y restaurarla después.
  Como los datos viven en este navegador, conviene respaldar seguido.
- **Descargar reportes**: se elige el periodo (hoy, ayer, últimos 7 días, este mes, mes
  anterior o todo el histórico), se marca lo que se quiera y se baja en **Excel** o en **PDF**:
  - **Corte del día** — ventas, efectivo, gastos, utilidad y el control de caja.
  - **Resumen por día** — una fila por día: comandas, tickets, piezas, ventas, efectivo,
    tarjeta, sin cobrar, gastos, utilidad y ticket promedio, con su renglón de totales.
  - **Ventas por comanda** — folio, mesa, cliente, envío, total, forma de pago, quién cobró.
  - **Productos vendidos** — piezas, importe y porcentaje sobre la venta.
  - **Gastos** — fecha, categoría, descripción, cantidad y responsable.
  - **Cortes guardados** — con el efectivo esperado, el contado y la diferencia.

  En **Excel** baja **un solo archivo** `.xlsx` con **una hoja por reporte**: encabezados en el
  rojo del negocio, fila de totales resaltada, importes con formato de moneda (sumables, no
  texto), columnas al ancho del contenido, filtros y encabezado fijo al desplazar.
  En **PDF** sale un solo documento con portada, secciones y tablas con los mismos colores;
  el navegador abre el diálogo de impresión y ahí se elige *Guardar como PDF*.

## Diseño
- Panel lateral en rojo de la marca.
- **Tu logo**: en `Ajustes → Logo del negocio` se sube la imagen (PNG, JPG o WEBP) y se usa
  tal cual en el login, el menú lateral y la pestaña del navegador. Queda guardada en el
  navegador y entra en el respaldo.
  Como alternativa, basta con dejar el archivo `logo.png` en esta carpeta.
  Si no hay ninguno de los dos, se usa el `logo.svg` incluido.
- Login con selección de perfil y teclado numérico de PIN, pensado para tablet o celular.
- **Recargar no interrumpe**: el equipo recuerda el perfil y la pestaña abierta, así que
  volver a cargar en plena corrida deja a cada quien donde estaba.
- Interfaz responsiva: menú lateral en escritorio, barra inferior en celular; la hoja de
  comanda se vuelve pantalla completa con el ticket como cajón deslizable.

## Productos y precios cargados desde el Excel
- Taco suave — $35
- Taco ahogado — $45
- Taco dorado — $40
- Quesabirria — $50
- Dorado con queso — $50
- Orden de birria — $180
- Media orden de birria — $120
- Torta de birria — $120
- Refresco — $35
- Agua natural — $30

## Accesos de fábrica
- Administrador: 1234
- Mesera: 1111
- Cocina: 2222
- Caja: 3333

Ya no se muestran en la pantalla de acceso. Se consultan y se cambian desde
**Ajustes → Perfiles y accesos**, entrando como Administrador.

## Cómo abrirlo
1. Abre `index.html` directamente en el navegador, **o**
2. Levanta un servidor local en la carpeta y entra a `http://localhost:5500`:

   ```
   python -m http.server 5500
   ```

3. Atajo para revisar el diseño sin capturar PIN: `index.html?demo=admin`
   (también `?demo=mesera`, `?demo=cocina`, `?demo=caja`).

No requiere instalar paquetes.

## Sincronización entre dispositivos (Supabase)
Sin configurar, el sistema guarda todo en el navegador de cada equipo: la mesera y la cocina
no verían las mismas comandas. Con Supabase conectado, **todos los dispositivos comparten la
información en tiempo real**.

### Cómo conectarlo
1. Crea un proyecto gratis en [supabase.com](https://supabase.com) (New project).
2. Abre **SQL Editor**, pega todo `supabase-schema.sql` y dale **Run**.
3. En **Settings → API** copia la *Project URL* y la clave *anon public*.
4. En el sistema entra a `Ajustes → Sincronización entre dispositivos → Conectar con Supabase`
   y pega los dos datos.
5. Se abre la pantalla de acceso del negocio: la primera vez usa
   **Crea el acceso del negocio** con un correo y contraseña. En las demás tablets, **Entrar**
   con esos mismos datos.

### Cómo funciona
- Cada comanda es **una fila**: la mesera puede levantar una mientras cocina marca otra lista,
  sin que se pisen.
- Solo se sube lo que cambió, no toda la información.
- **Dos vías, para que nunca se quede algo sin llegar**: el aviso instantáneo de Supabase, y
  un repaso cada 10 segundos que trae solo lo modificado desde la última revisión. También
  se pone al día al volver a la app y al recuperar internet.
- Lo que este equipo cambió y aún no sube **manda sobre lo que baja de la nube**, para que un
  aviso no pise una edición reciente.
- Si el aviso instantáneo no llega a conectar, todo sigue funcionando con el repaso; en
  `Ajustes → Revisar conexión` se ve el estado de ambos.

> Para que los cambios lleguen **al instante** hay que ejecutar también `supabase-realtime.sql`.
> Sin eso, Supabase no entrega los avisos de actualización cuando las tablas tienen RLS,
> y los cambios tardan hasta 10 segundos en aparecer.
- Se conserva una copia local en cada equipo, así que si se cae el internet se sigue trabajando.
- Los datos están protegidos: cada negocio solo ve lo suyo (RLS por usuario en Supabase).
