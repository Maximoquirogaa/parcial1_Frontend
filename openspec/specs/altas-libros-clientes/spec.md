# altas-libros-clientes Specification

## Purpose

Permite registrar libros y clientes desde formularios validados con los datos locales, mostrando los listados actualizados y los errores junto al formulario, sin recargar la página.

## Requirements

### Requirement: Opciones de alta de libro generadas desde los datos locales
The system SHALL generar las opciones del formulario de libros desde `editoriales`, `generos` y `autores` de los datos locales: un selector de editorial, un selector de género que incluye «Sin clasificar» y un selector múltiple de autores.

#### Scenario: Editoriales y autores disponibles
- **WHEN** se carga la vista Libros
- **THEN** el selector de editorial contiene una opción por cada editorial local y el selector de autores contiene una opción por cada autor local

#### Scenario: Género con opción «Sin clasificar»
- **WHEN** se carga el selector de género del formulario de libros
- **THEN** incluye una opción «Sin clasificar» que representa la ausencia de género y una opción por cada género local

#### Scenario: Selección múltiple de autores
- **WHEN** el usuario despliega el selector de autores
- **THEN** puede seleccionar más de un autor en el mismo alta

### Requirement: Listado de libros registrados
The system SHALL renderizar `#tabla-libros` desde `libros[]`, con una fila por libro que muestre título, ISBN, editorial, género («Sin clasificar» si `generoId` es `null`) y precio, usando `textContent` y sin `innerHTML` con datos.

#### Scenario: Una fila por libro con sus campos
- **WHEN** se renderiza el listado de libros
- **THEN** existe una fila por cada libro de `libros[]` con título, ISBN, editorial, género y precio

#### Scenario: Libro sin género en el listado
- **WHEN** un libro tiene `generoId` igual a `null`
- **THEN** su fila muestra «Sin clasificar» en la columna de género

#### Scenario: Precio con formato de dos decimales
- **WHEN** se muestra el precio de un libro en el listado
- **THEN** se presenta con el formato `$` seguido del importe con dos decimales, consistente con el catálogo de C-03

#### Scenario: Render sin innerHTML con datos
- **WHEN** se inspecciona el render del listado de libros
- **THEN** las celdas se crean con `document.createElement` y se rellenan con `textContent`, sin `innerHTML` con datos del libro

### Requirement: RN-LIB-01 — Título e ISBN obligatorios
The system SHALL rechazar el alta de un libro cuando el título o el ISBN estén vacíos después de aplicar `trim`, considerando vacío un valor compuesto solo por espacios.

#### Scenario: Título vacío o solo espacios
- **WHEN** se envía el formulario con el título vacío o compuesto solo por espacios
- **THEN** el alta se rechaza con un error de título obligatorio

#### Scenario: ISBN vacío o solo espacios
- **WHEN** se envía el formulario con el ISBN vacío o compuesto solo por espacios
- **THEN** el alta se rechaza con un error de ISBN obligatorio

#### Scenario: ISBN sin caracteres válidos
- **WHEN** se envía un ISBN compuesto solo por espacios y guiones
- **THEN** el alta se rechaza con un error de ISBN obligatorio

#### Scenario: Título e ISBN con contenido
- **WHEN** el título y el ISBN tienen contenido distinto de espacios
- **THEN** el alta no se rechaza por esta regla

### Requirement: RN-LIB-02 — ISBN único normalizado
The system SHALL rechazar un ISBN que ya exista en `libros[]`, comparando sin espacios ni guiones y sin distinguir mayúsculas de minúsculas.

#### Scenario: ISBN exacto duplicado
- **WHEN** se intenta registrar un ISBN que coincide exactamente con uno existente
- **THEN** el alta se rechaza con un error de ISBN duplicado

#### Scenario: ISBN duplicado con guiones o espacios
- **WHEN** se intenta registrar un ISBN que, al quitarle espacios y guiones, coincide con uno existente
- **THEN** el alta se rechaza con un error de ISBN duplicado

#### Scenario: ISBN duplicado con distinta capitalización
- **WHEN** se intenta registrar un ISBN que solo difiere de uno existente en mayúsculas y minúsculas
- **THEN** el alta se rechaza con un error de ISBN duplicado

#### Scenario: ISBN nuevo
- **WHEN** se registra un ISBN que no coincide con ninguno existente tras la normalización
- **THEN** el alta no se rechaza por esta regla

### Requirement: RN-LIB-03 — Precio numérico mayor que cero
The system SHALL rechazar el alta de un libro cuando el precio no sea numérico o no sea mayor que cero.

#### Scenario: Precio cero
- **WHEN** se envía el formulario con precio `0`
- **THEN** el alta se rechaza con un error de precio mayor que cero

#### Scenario: Precio negativo
- **WHEN** se envía el formulario con un precio negativo
- **THEN** el alta se rechaza con un error de precio mayor que cero

#### Scenario: Precio no numérico o vacío
- **WHEN** se envía el formulario con un precio vacío o con texto no numérico
- **THEN** el alta se rechaza con un error de precio numérico

#### Scenario: Precio positivo
- **WHEN** se envía el formulario con un precio numérico mayor que cero
- **THEN** el alta no se rechaza por esta regla

### Requirement: RN-LIB-04 — Editorial existente y obligatoria
The system SHALL rechazar el alta de un libro cuando no se seleccione una editorial o cuando el id seleccionado no exista en `editoriales`.

#### Scenario: Sin editorial seleccionada
- **WHEN** se envía el formulario sin seleccionar editorial
- **THEN** el alta se rechaza con un error de editorial obligatoria

#### Scenario: Editorial inexistente
- **WHEN** se envía el formulario con un id de editorial que no existe en los datos locales
- **THEN** el alta se rechaza con un error de editorial inválida

#### Scenario: Editorial existente
- **WHEN** se selecciona una editorial que existe en los datos locales
- **THEN** el alta no se rechaza por esta regla

### Requirement: RN-LIB-05 — Al menos un autor existente
The system SHALL rechazar el alta de un libro cuando no se seleccione ningún autor o cuando alguno de los ids seleccionados no exista en `autores`.

#### Scenario: Sin autores seleccionados
- **WHEN** se envía el formulario sin ningún autor seleccionado
- **THEN** el alta se rechaza con un error de al menos un autor

#### Scenario: Autor inexistente
- **WHEN** se envía el formulario con un id de autor que no existe en los datos locales
- **THEN** el alta se rechaza con un error de autor inválido

#### Scenario: Varios autores existentes
- **WHEN** se seleccionan dos o más autores que existen en los datos locales
- **THEN** el alta no se rechaza por esta regla y el libro conserva todos los autores seleccionados

### Requirement: RN-LIB-06 — Género opcional válido
The system SHALL aceptar el alta de un libro sin género, representando la ausencia con `null` y mostrando «Sin clasificar», y SHALL rechazar un género asignado que no exista en `generos`.

#### Scenario: Alta sin género
- **WHEN** se envía el formulario con la opción «Sin clasificar» seleccionada
- **THEN** el libro se registra con `generoId` igual a `null`

#### Scenario: Género existente
- **WHEN** se selecciona un género que existe en los datos locales
- **THEN** el libro se registra con el id de ese género

#### Scenario: Género inexistente
- **WHEN** se envía el formulario con un id de género que no existe en los datos locales
- **THEN** el alta se rechaza con un error de género inválido

### Requirement: RN-LIB-07 — Envío controlado, errores cercanos y alta atómica
The system SHALL llamar `preventDefault` en el submit del formulario de libros, mostrar los errores como texto cerca del formulario y agregar el libro solo si todas las validaciones pasan.

#### Scenario: Submit sin recarga
- **WHEN** se envía el formulario de libros
- **THEN** el manejador llama `preventDefault` y la página no se recarga

#### Scenario: Errores cerca del formulario
- **WHEN** una o más validaciones fallan
- **THEN** se muestra un mensaje textual con los errores en el nodo de error del formulario de libros y los campos inválidos quedan marcados como inválidos

#### Scenario: Alta atómica con errores
- **WHEN** el formulario tiene al menos un error de validación
- **THEN** no se agrega ningún libro a `libros[]` y el formulario conserva los valores ingresados

#### Scenario: Alta exitosa
- **WHEN** todas las validaciones pasan
- **THEN** se agrega exactamente un libro a `libros[]` con un id nuevo y estable

### Requirement: RN-LIB-08 — Actualización sin recarga tras alta de libro
The system SHALL actualizar sin recargar la página, tras un alta válida, la tabla de libros, el catálogo, las opciones del formulario de libros y el selector de libros de ventas; además SHALL limpiar el formulario y mostrar un mensaje de éxito.

#### Scenario: Libro nuevo en listado y catálogo
- **WHEN** se registra un libro válido
- **THEN** el libro aparece en `#tabla-libros` y en el catálogo sin recargar la página

#### Scenario: Libro nuevo en el selector de ventas
- **WHEN** se registra un libro válido
- **THEN** el selector de libros de la vista Ventas incluye el libro nuevo sin recargar la página

#### Scenario: Formulario limpio y mensaje de éxito
- **WHEN** se registra un libro válido
- **THEN** el formulario de libros queda limpio y se muestra el mensaje de éxito

### Requirement: RN-CLI-01 — Nombre completo y email obligatorios
The system SHALL rechazar el alta de un cliente cuando el nombre completo o el email estén vacíos después de aplicar `trim`, considerando vacío un valor compuesto solo por espacios.

#### Scenario: Nombre vacío o solo espacios
- **WHEN** se envía el formulario con el nombre completo vacío o compuesto solo por espacios
- **THEN** el alta se rechaza con un error de nombre obligatorio

#### Scenario: Email vacío o solo espacios
- **WHEN** se envía el formulario con el email vacío o compuesto solo por espacios
- **THEN** el alta se rechaza con un error de email obligatorio

#### Scenario: Nombre y email con contenido
- **WHEN** el nombre completo y el email tienen contenido distinto de espacios
- **THEN** el alta no se rechaza por esta regla

### Requirement: RN-CLI-02 — Email con formato válido
The system SHALL rechazar un email que, tras `trim`, no tenga un formato válido con texto antes de `@`, texto después de `@` y un punto en el dominio.

#### Scenario: Email sin arroba
- **WHEN** se envía un email sin `@`
- **THEN** el alta se rechaza con un error de formato de email

#### Scenario: Email sin dominio o sin punto
- **WHEN** se envía un email sin texto después de `@` o sin punto en el dominio
- **THEN** el alta se rechaza con un error de formato de email

#### Scenario: Email con espacios internos
- **WHEN** se envía un email con espacios entre sus partes
- **THEN** el alta se rechaza con un error de formato de email

#### Scenario: Email válido
- **WHEN** se envía un email con texto antes de `@`, dominio después de `@` y un punto en el dominio
- **THEN** el alta no se rechaza por esta regla

### Requirement: RN-CLI-03 — Email único sin espacios exteriores y case-insensitive
The system SHALL rechazar un email que ya exista en `clientes[]`, comparando sin espacios exteriores y sin distinguir mayúsculas de minúsculas.

#### Scenario: Email exacto duplicado
- **WHEN** se intenta registrar un email que coincide exactamente con uno existente
- **THEN** el alta se rechaza con un error de email duplicado

#### Scenario: Email duplicado con mayúsculas
- **WHEN** se intenta registrar un email que solo difiere de uno existente en mayúsculas y minúsculas
- **THEN** el alta se rechaza con un error de email duplicado

#### Scenario: Email duplicado con espacios exteriores
- **WHEN** se intenta registrar un email que, al quitarle los espacios exteriores, coincide con uno existente
- **THEN** el alta se rechaza con un error de email duplicado

#### Scenario: Email nuevo
- **WHEN** se registra un email que no coincide con ninguno existente tras normalizar espacios y mayúsculas
- **THEN** el alta no se rechaza por esta regla

### Requirement: RN-CLI-04 — Actualización sin recarga tras alta de cliente
The system SHALL actualizar sin recargar la página, tras un alta válida, la tabla de clientes y el selector de clientes de ventas; además SHALL limpiar el formulario y mostrar un mensaje de éxito.

#### Scenario: Cliente nuevo en el listado
- **WHEN** se registra un cliente válido
- **THEN** el cliente aparece en `#tabla-clientes` sin recargar la página

#### Scenario: Cliente nuevo en el selector de ventas
- **WHEN** se registra un cliente válido
- **THEN** el selector de clientes de la vista Ventas incluye el cliente nuevo sin recargar la página

#### Scenario: Formulario limpio y mensaje de éxito
- **WHEN** se registra un cliente válido
- **THEN** el formulario de clientes queda limpio y se muestra el mensaje de éxito

### Requirement: Listado de clientes registrados
The system SHALL renderizar `#tabla-clientes` desde `clientes[]`, con una fila por cliente que muestre id, nombre completo y email, usando `textContent` y sin `innerHTML` con datos.

#### Scenario: Una fila por cliente con sus campos
- **WHEN** se renderiza el listado de clientes
- **THEN** existe una fila por cada cliente de `clientes[]` con id, nombre completo y email

#### Scenario: Render sin innerHTML con datos
- **WHEN** se inspecciona el render del listado de clientes
- **THEN** las celdas se crean con `document.createElement` y se rellenan con `textContent`, sin `innerHTML` con datos del cliente

### Requirement: Estado de listados vacíos
The system SHALL mostrar el mensaje de lista vacía correspondiente cuando no haya libros o no haya clientes, y ocultarlo cuando exista al menos un registro.

#### Scenario: Sin libros registrados
- **WHEN** `libros[]` está vacío
- **THEN** se muestra `#libros-vacio` y la tabla de libros no contiene filas

#### Scenario: Sin clientes registrados
- **WHEN** `clientes[]` está vacío
- **THEN** se muestra `#clientes-vacio` y la tabla de clientes no contiene filas

#### Scenario: Con registros disponibles
- **WHEN** existen libros o clientes
- **THEN** el mensaje de lista vacía correspondiente permanece oculto

### Requirement: Carga clásica con defer
The system SHALL cargar `js/libros.js` y `js/clientes.js` en `index.html` con `defer`, después de `js/datos.js` y `js/catalogo.js`, sin `type="module"`.

#### Scenario: Scripts con defer en orden
- **WHEN** se inspecciona `index.html`
- **THEN** existen `<script src="js/libros.js" defer>` y `<script src="js/clientes.js" defer>` después de los scripts de datos y catálogo

#### Scenario: Sin módulos ES
- **WHEN** se inspeccionan las etiquetas de script de libros y clientes
- **THEN** ninguna usa `type="module"`

### Requirement: Datos del usuario insertados como texto
The system SHALL insertar los datos ingresados por el usuario como texto en el DOM, sin interpretarlos como HTML.

#### Scenario: Nombre con caracteres HTML se muestra literalmente
- **WHEN** se registra un cliente cuyo nombre contiene caracteres como `<b>`
- **THEN** el nombre se muestra literalmente como texto y no se interpreta como HTML

#### Scenario: Título de libro con caracteres HTML se muestra literalmente
- **WHEN** se registra un libro cuyo título contiene caracteres como `<i>`
- **THEN** el título se muestra literalmente como texto en el listado y en el catálogo
