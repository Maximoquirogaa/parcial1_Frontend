# venta-historial Specification

## Purpose

Permite componer ventas validadas con renglones (cliente, libro, cantidad entera > 0), calcular subtotal y total, confirmar la venta registrando el precio unitario como valor histórico, y consultar un historial inmutable de ventas con detalle de renglones, sin edición ni eliminación.

## Requirements

### Requirement: Composición de venta con cliente, libro y cantidad
The system SHALL permitir seleccionar un cliente existente, elegir un libro y una cantidad entera mayor que cero, y agregar un renglón a la venta actual sin duplicar libros (modifica la cantidad del renglón existente e informa).

#### Scenario: Cliente y libro seleccionados con cantidad válida
- **WHEN** se selecciona un cliente, un libro y una cantidad entera mayor que cero
- **THEN** se agrega un renglón a la venta actual con libro, precio unitario, cantidad y subtotal

#### Scenario: Libro repetido suma cantidad del renglón existente
- **WHEN** se agrega un libro que ya está en la venta actual
- **THEN** se modifica la cantidad del renglón existente y se informa al usuario del duplicado

#### Scenario: Renglón nuevo se crea cuando el libro no está en la venta
- **WHEN** se agrega un libro que no está en la venta actual
- **THEN** se crea un nuevo renglón con el libro, precio unitario, cantidad y subtotal

### Requirement: RN-VTA-01 — Cliente requerido y existente
The system SHALL rechazar una venta cuando no se haya seleccionado un cliente o cuando el id del cliente seleccionado no exista en `clientes[]`.

#### Scenario: Sin cliente seleccionado
- **WHEN** se intenta confirmar una venta sin cliente seleccionado
- **THEN** la venta se rechaza con un error de cliente obligatorio

#### Scenario: Cliente inexistente
- **WHEN** se intenta confirmar una venta con un id de cliente que no existe en `clientes[]`
- **THEN** la venta se rechaza con un error de cliente inválido

### Requirement: RN-VTA-02 — Cantidad entera mayor que cero
The system SHALL rechazar una cantidad que no sea un número entero mayor que cero, rechazando decimales, cero, negativos, vacíos y valores no numéricos.

#### Scenario: Cantidad decimal rechazada
- **WHEN** se ingresa una cantidad con decimales (ej. 2.5)
- **THEN** la cantidad se rechaza como inválida

#### Scenario: Cantidad cero rechazada
- **WHEN** se ingresa una cantidad igual a 0
- **THEN** la cantidad se rechaza como inválida

#### Scenario: Cantidad negativa rechazada
- **WHEN** se ingresa una cantidad negativa
- **THEN** la cantidad se rechaza como inválida

#### Scenario: Cantidad vacía o no numérica rechazada
- **WHEN** se ingresa una cantidad vacía o con texto no numérico
- **THEN** la cantidad se rechaza como inválida

#### Scenario: Cantidad entera positiva aceptada
- **WHEN** se ingresa una cantidad entera mayor que cero (1, 2, 10)
- **THEN** la cantidad es aceptada

### Requirement: RN-VTA-03 — No libros repetidos en la misma venta
The system SHALL no permitir libros repetidos en la misma venta: cuando se agrega un libro ya presente, se suma la cantidad al renglón existente e informa al usuario.

#### Scenario: Libro duplicado suma cantidad
- **WHEN** se agrega un libro que ya tiene un renglón en la venta
- **THEN** la cantidad del renglón existente se incrementa y se muestra un mensaje informativo

### Requirement: RN-VTA-04 — Cambios de cantidad y quita de renglones antes de confirmar
The system SHALL permitir modificar cantidades y quitar renglones antes de confirmar la venta.

#### Scenario: Quitar renglón existente
- **WHEN** se quita un renglón de la venta actual
- **THEN** el renglón se elimina y el total se recalcula

#### Scenario: Quitar renglón inexistente no modifica
- **WHEN** se intenta quitar un renglón que no está en la venta
- **THEN** la venta no se modifica

### Requirement: RN-VTA-05 — Cálculos de subtotal y total con dos decimales
The system SHALL calcular subtotal = cantidad × precio unitario por renglón y total = suma de subtotales, mostrando importes con dos decimales.

#### Scenario: Subtotal por renglón
- **WHEN** se calcula el subtotal de un renglón con cantidad y precio unitario
- **THEN** subtotal = cantidad × precio unitario

#### Scenario: Total suma de subtotales
- **WHEN** se calcula el total de una venta con varios renglones
- **THEN** total = suma de los subtotales de todos los renglones

#### Scenario: Importes con dos decimales
- **WHEN** se muestra un importe (subtotal o total)
- **THEN** se presenta con dos decimales

### Requirement: RN-VTA-06 — Confirmación atómica sin cliente, sin renglones o cantidades inválidas
The system SHALL no confirmar una venta sin cliente, sin renglones o con cantidades inválidas, usando `preventDefault` y mostrando errores cerca del formulario.

#### Scenario: Confirmar sin cliente rechazado
- **WHEN** se envía el formulario de venta sin cliente seleccionado
- **THEN** la venta no se registra y se muestra un error textual cerca del formulario

#### Scenario: Confirmar sin renglones rechazado
- **WHEN** se envía el formulario de venta sin renglones
- **THEN** la venta no se registra y se muestra un error textual cerca del formulario

#### Scenario: Confirmar con cantidad inválida rechazado
- **WHEN** se envía el formulario de venta con una cantidad inválida
- **THEN** la venta no se registra y se muestra un error textual cerca del formulario

#### Scenario: Alta atómica con errores
- **WHEN** el formulario de venta tiene al menos un error de validación
- **THEN** no se registra ninguna venta y el formulario conserva los valores ingresados

### Requirement: RN-VTA-07 — Registro de venta con precio unitario histórico
The system SHALL registrar al confirmar una venta con id, fecha, cliente, renglones y total, copiando el precio unitario al renglón como valor histórico (no se relee del catálogo al consultar el historial).

#### Scenario: Venta registra id nuevo y estable
- **WHEN** se confirma una venta válida
- **THEN** se registra exactamente una venta con un id nuevo y estable

#### Scenario: Venta registra fecha ISO al confirmar
- **WHEN** se confirma una venta válida
- **THEN** la venta se registra con fecha generada al momento de la confirmación

#### Scenario: Precio unitario copiado como valor histórico (DD-06)
- **WHEN** se confirma una venta con un libro cuyo precio unitario es X
- **THEN** el renglón registrado guarda precioUnitario = X y el historial lee ese precio, no el precio actual del catálogo

#### Scenario: Renglones con libro, cantidad, precio unitario y subtotal
- **WHEN** se registra una venta
- **THEN** cada renglón guarda libroId, libroTitulo, precioUnitario, cantidad y subtotal

### Requirement: RN-VTA-08 — Limpieza de formulario y mensaje de éxito tras confirmar
The system SHALL limpiar el formulario para una nueva venta y mostrar un mensaje de resultado tras una confirmación exitosa.

#### Scenario: Formulario limpio tras confirmar
- **WHEN** se confirma una venta válida
- **THEN** el formulario de venta queda limpio

#### Scenario: Mensaje de éxito tras confirmar
- **WHEN** se confirma una venta válida
- **THEN** se muestra un mensaje de éxito

### Requirement: RN-VTA-09 — Ventas confirmadas inmutables (sin edición ni eliminación)
The system SHALL no permitir editar ni eliminar ventas confirmadas desde la interfaz.

#### Scenario: Historial de solo lectura
- **WHEN** se consulta el historial de ventas
- **THEN** no hay opciones de edición ni eliminación de ventas

#### Scenario: Detalle inmutable al hacer clic Ver Detalle
- **WHEN** se hace clic en «Ver Detalle» de una venta
- **THEN** se muestra el detalle de renglones sin botones de editar o eliminar

### Requirement: Historial de ventas (lista inmutable)
The system SHALL renderizar una lista inmutable de ventas confirmadas con id, fecha, cliente y total, y permitir consultar el detalle de renglones de cada venta.

#### Scenario: Una fila por venta en el historial
- **WHEN** se renderiza el historial de ventas
- **THEN** existe una fila por cada venta confirmada con id, fecha, cliente y total

#### Scenario: Total con formato de dos decimales en el historial
- **WHEN** se muestra el total de una venta en el historial
- **THEN** se presenta con el formato `$` seguido del importe con dos decimales

#### Scenario: Detalle de renglones leído de la venta guardada
- **WHEN** se consulta el detalle de una venta confirmada
- **THEN** los renglones se leen de la venta guardada, con precios unitarios históricos, no del catálogo

#### Scenario: Estado vacío del historial
- **WHEN** no hay ventas confirmadas
- **THEN** se muestra el mensaje de historial vacío

### Requirement: Render seguro con textContent y sin innerHTML con datos
The system SHALL insertar los datos de ventas y renglones como texto en el DOM usando `textContent`, sin interpretarlos como HTML.

#### Scenario: Celdas rellenas con textContent
- **WHEN** se renderizan tablas de renglones, historial o detalle
- **THEN** las celdas se crean con `document.createElement` y se rellenan con `textContent`, sin `innerHTML` con datos

### Requirement: Carga clásica con defer
The system SHALL cargar `js/ventas.js` y `js/historial.js` en `index.html` con `defer`, después de `js/datos.js`, `js/catalogo.js`, `js/libros.js` y `js/clientes.js`, sin `type="module"`.

#### Scenario: Scripts con defer en orden
- **WHEN** se inspecciona `index.html`
- **THEN** existen `<script src="js/ventas.js" defer>` y `<script src="js/historial.js" defer>` después de los scripts de datos, catálogo, libros y clientes

#### Scenario: Sin módulos ES
- **WHEN** se inspeccionan las etiquetas de script de ventas e historial
- **THEN** ninguna usa `type="module"`

## Datos del modelo

### Entidad Venta
- `id` (number | string, generado al confirmar)
- `fecha` (string ISO o `toLocaleDateString`, al confirmar)
- `clienteId` + `clienteNombre` (descriptivo para leer el historial sin dependencias frágiles)
- `renglones` (Renglón[])
- `total` (number, suma de subtotales, 2 decimales al mostrar)

### Entidad Renglón (dentro de Venta)
- `libroId`
- `libroTitulo` (descriptivo, copiado)
- `precioUnitario` (copiado al confirmar — valor histórico, no se relee del catálogo)
- `cantidad` (integer > 0)
- `subtotal` (= precioUnitario × cantidad, 2 decimales al mostrar)

## Reglas de negocio aplicadas

- RN-VTA-01: cliente requerido y existente
- RN-VTA-02: cantidad entera mayor que cero
- RN-VTA-03: no libros repetidos en la misma venta
- RN-VTA-04: cambios de cantidad y quita de renglones antes de confirmar
- RN-VTA-05: cálculos de subtotal y total con dos decimales
- RN-VTA-06: confirmación atómica (cliente, renglones, cantidades válidas)
- RN-VTA-07: registro con precio unitario histórico (DD-06)
- RN-VTA-08: limpieza de formulario y mensaje de éxito
- RN-VTA-09: ventas confirmadas inmutables (sin edición ni eliminación)

## Flujos principales

- Flujo 5: Composición y confirmación de venta (cliente → libro/cantidad → agregar renglón → confirmar con preventDefault → registrar venta con precio histórico → limpiar y mostrar éxito)
- Flujo 6: Consulta de historial (lista inmutable → clic Ver Detalle → detalle inmutable con precios históricos → sin edición ni eliminación)

## Impacto

- **Archivos nuevos**: `js/ventas.js`, `js/historial.js`, `tests/ventas.test.js`, `tests/historial.test.js`
- **Archivos existentes afectados**: `index.html` (dos `<script defer>` para `js/ventas.js` y `js/historial.js`); `tests/shim.js` (elementos de venta)
- **Dependencias**: C-04 completo (`window.libreria` con `libros[]`, `clientes[]`; `poblarSelectorVentaLibros`/`poblarSelectorVentaClientes`); C-03 (`window.libreria`, catálogo)
- **Consumidores posteriores**: C-06 persiste `libreria.ventas` y restaura ventas al abrir
