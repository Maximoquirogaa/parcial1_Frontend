# Flujos Principales

## Flujo 1: Navegación entre vistas
**Disparador**: clic en botón de navegación
**Actor**: cualquier visitante

**Pasos**:
1. Navegación] clic en botón `data-target="vista-X"`.
2. [navegacion.js] oculta la sección activa y muestra la targeta `#vista-X`.
3. [navegacion.js] actualiza estado activo del botón (accesibilidad).

**Casos de error**: ninguno relevante; si el target no existe, no hace nada visible.

## Flujo 2: Búsqueda en catálogo
**Disparador**: submit del formulario de búsqueda (con `preventDefault`)
**Actor**: visitante

**Pasos**:
1. [HTML] usuario escribe un título (o vacío) y presiona Buscar.
2. [catalogo.js] lee el valor, aplica trim.
3. [catalogo.js] filtra `libros` por coincidencia parcial case-insensitive del título.
4. [catalogo.js] renderiza tarjetas (`<article>`) con título, ISBN, editorial, género («Sin clasificar» si no tiene), autores y precio.
5. Si el resultado está vacío y había texto ⇒ mensaje «sin resultados»; si el texto está vacío ⇒ catálogo completo.

**Casos de error**:
- Sin coincidencias → mensaje claro (no lista vacía muda).

## Flujo 3: Alta de libro
**Disparador**: submit del formulario de libros
**Actor**: registrador de libros

**Pasos**:
1. [libros.js] `preventDefault`; lee título, ISBN, precio, editorialId, generoId (opcional), autoresIds (≥1).
2. [libros.js] valida: título/ISBN no vacíos; ISBN único normalizado (sin espacios/guiones, case-insensitive según normalización elegida); precio numérico > 0; editorial existe; autores existen y ≥1; género vacío o existe.
3. Si hay error → muestra mensajes cerca del formulario y no agrega.
4. Si pasa → crea libro con id nuevo, agrega al array, persiste en `localStorage`, limpia formulario, re-renderiza listado y refresca selectores de ventas.
5. Mensaje de éxito.

**Casos de error**:
- ISBN duplicado → rechazo con mensaje.
- Precio 0 / negativo / no numérico → rechazo.
- Sin autores → rechazo.

## Flujo 4: Alta de cliente
**Disparador**: submit del formulario de clientes
**Actor**: registrador de clientes

**Pasos**:
1. [clientes.js] `preventDefault`; lee nombreCompleto y email.
2. Valida: campos no vacíos; formato de email; email único (trim + case-insensitive).
3. Si hay error → mensajes cerca del formulario.
4. Si pasa → agrega cliente, persiste, actualiza listado y selector de clientes de ventas sin recargar; mensaje de éxito.

**Casos de error**:
- Email inválido o duplicado (incluso en mayúsculas) → rechazo.

## Flujo 5: Composición y confirmación de venta
**Disparador**: clic «Agregar Renglón» y luego «Confirmar Venta»
**Actor**: vendedor

**Pasos**:
1. Selecciona cliente existente.
2. Elige libro y cantidad (entera > 0); clic «Agregar Renglón».
3. Si el libro ya está en la venta → modifica la cantidad del renglón existente **o** informa duplicado (decisión de diseño registrada en 09).
4. Tabla de resumen: libro, precio unitario, cantidad, subtotal; total al pie (2 decimales).
5. Puede cambiar cantidades o quitar renglones antes de confirmar.
6. «Confirmar Venta» → valida cliente + ≥1 renglón + cantidades válidas.
7. Registra venta: id, fecha, cliente (+ nombre descriptivo), renglones con **precio unitario copiado**, total.
8. Persiste en `localStorage`; limpia el formulario; mensaje de éxito.

**Casos de error**:
- Sin cliente, sin renglones, cantidad 0/negativa/decimal → no se confirma.

## Flujo 6: Consulta de historial
**Disparador**: clic «Ver Detalle»
**Actor**: consultor de historial

**Pasos**:
1. [historial.js] renderiza lista de ventas: id, fecha, cliente, total.
2. Clic en detalle → muestra renglones con precio unitario, cantidad y subtotal **históricos** (leídos de la venta guardada, no del catálogo).
3. Sin opciones de edición/eliminación.

**Casos de error**: venta sin renglones no debería existir (imposible por validación previa).

## Flujo 7: Carga inicial y persistencia
**Disparador**: apertura de `index.html`
**Actor**: sistema

**Pasos**:
1. [storage.js] intenta leer `libreria_libros`, `libreria_clientes`, `libreria_ventas` de `localStorage`.
2. Si no existen → carga seed (ejemplos) y los persiste por primera vez.
3. Si existen → usa los guardados, sin duplicar ejemplos.
4. El resto de módulos renderiza desde el estado cargado.

**Casos de error**:
- `localStorage` no disponible (modo privado restrictivo) → degradar a memoria y avisar (decisión en 09).
