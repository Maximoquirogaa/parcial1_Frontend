# Reglas de Negocio

Cada regla tiene un código único `RN-{DOMINIO}-{NN}` para trazabilidad. Fuente: consiga del Parcial 1.

## Dominio: Catálogo y búsqueda (RN-CAT)

- **RN-CAT-01**: El filtro por título ignora mayúsculas/minúsculas, busca coincidencias parciales y elimina espacios sobrantes (trim). — Consiga Ej. 3.
- **RN-CAT-02**: Una búsqueda vacía muestra el catálogo completo. — Ej. 3.
- **RN-CAT-03**: Una búsqueda sin coincidencias muestra un mensaje claro (no una lista vacía sin contexto). — Ej. 3.
- **RN-CAT-04**: Si un libro no tiene género asignado, se muestra «Sin clasificar». — Ej. 1.
- **RN-CAT-05**: El catálogo se genera desde el array de libros con JS; cada libro muestra título, ISBN, editorial, género, autores y precio. — Ej. 1 y 3.

## Dominio: Libros (RN-LIB)

- **RN-LIB-01**: Título y ISBN no pueden estar vacíos. — Ej. 4.
- **RN-LIB-02**: El ISBN debe ser único en el conjunto local; se compara **sin espacios ni guiones**; no se valida dígito de control. — Ej. 4.
- **RN-LIB-03**: El precio debe ser numérico y mayor que cero. — Ej. 4.
- **RN-LIB-04**: La editorial seleccionada debe existir en los datos locales (obligatoria). — Ej. 4.
- **RN-LIB-05**: Debe seleccionarse al menos un autor, y todos los seleccionados deben existir en los datos locales. — Ej. 4.
- **RN-LIB-06**: El género es opcional; si se asigna, debe existir en los datos locales. La opción «Sin clasificar» representa la ausencia. — Ej. 4.
- **RN-LIB-07**: El formulario usa `preventDefault`; los errores se muestran cerca del formulario; solo se agrega el registro si todas las comprobaciones pasan. — Ej. 4.
- **RN-LIB-08**: Tras un alta correcta, el listado y las opciones relacionadas (selectores de venta) se actualizan sin recargar la página. — Ej. 4.

## Dominio: Clientes (RN-CLI)

- **RN-CLI-01**: Nombre completo y email no pueden estar vacíos; no hay campo de apellido separado. — Ej. 4.
- **RN-CLI-02**: El email debe tener formato válido. — Ej. 4.
- **RN-CLI-03**: No puede existir otro cliente con el mismo email; la comparación es sin espacios exteriores y case-insensitive. — Ej. 4.
- **RN-CLI-04**: Tras un alta correcta, el listado y la selección de cliente en ventas se actualizan sin recargar. — Ej. 4.

## Dominio: Ventas (RN-VTA)

- **RN-VTA-01**: La venta requiere un cliente existente seleccionado. — Ej. 5.
- **RN-VTA-02**: Cada renglón requiere un libro existente y una cantidad **entera mayor que cero** (no decimales, no cero, no negativos). — Ej. 5.
- **RN-VTA-03**: No se admiten libros repetidos en la misma venta: se modifica la cantidad del renglón existente o se informa el duplicado. — Ej. 5.
- **RN-VTA-04**: Antes de confirmar se pueden cambiar cantidades y quitar renglones. — Ej. 5.
- **RN-VTA-05**: Cada renglón muestra libro, cantidad, precio unitario y subtotal; subtotal = cantidad × precio unitario; total = suma de subtotales; importes con dos decimales. — Ej. 5.
- **RN-VTA-06**: No se puede confirmar una venta sin cliente, sin renglones o con cantidades inválidas. — Ej. 5.
- **RN-VTA-07**: Al confirmar se registran id, fecha, cliente, renglones y total; el **precio unitario se copia al renglón como valor histórico** (no se relee del catálogo al consultar el historial). — Ej. 5.
- **RN-VTA-08**: La confirmación limpia el formulario para una nueva venta y muestra un mensaje de resultado. — Ej. 5.
- **RN-VTA-09**: Las ventas confirmadas no se editan ni eliminan desde la interfaz. — Ej. 5.

## Dominio: Persistencia (RN-PER)

- **RN-PER-01**: `localStorage` conserva libros, clientes y ventas. — Ej. 6.
- **RN-PER-02**: En el primer inicio se cargan los ejemplos; al volver a abrir se recuperan los registros guardados **sin duplicar** los datos iniciales. — Ej. 6.
- **RN-PER-03**: El README explica que el almacenamiento depende del navegador, del perfil y de la ubicación de apertura, y que no comparte información entre usuarios. — Ej. 6.

## Dominio: Interfaz y accesibilidad (RN-UI)

- **RN-UI-01**: HTML semántico: encabezado, navegación y contenido principal con etiquetas semánticas. — Ej. 1.
- **RN-UI-02**: Cada campo tiene etiqueta asociada; los botones describen su acción; las tablas tienen encabezados. — Ej. 1.
- **RN-UI-03**: Mensajes para listas vacías, búsquedas sin resultados y operaciones correctas o rechazadas. — Ej. 1.
- **RN-UI-04**: Flexbox o Grid para organizar el contenido. — Ej. 2.
- **RN-UI-05**: Verificación a 320 px y 1280 px: textos/controles legibles, sin desplazamiento horizontal de la página; las tablas se desplazan dentro de su propio contenedor. — Ej. 2.
- **RN-UI-06**: Foco visible y recorrido por teclado de los controles. — Ej. 2.
- **RN-UI-07**: Los mensajes de error se expresan con texto, no dependen únicamente del color. — Ej. 2.
- **RN-UI-08**: Las imágenes informativas tienen `alt`; las decorativas no repiten información innecesaria. — Ej. 2.

## Dominio: Técnico / alcance (RN-TEC)

- **RN-TEC-01**: Solo HTML, CSS y JavaScript nativos. Sin librerías, frameworks ni CDNs (incumple el alcance si se usan). — Consiga, contexto.
- **RN-TEC-02**: Los datos escritos por usuarios se insertan como texto en el DOM (no interpretarlos como HTML). — Ej. 3.
- **RN-TEC-03**: No se requiere fetch, API, servidor ni backend. — Contexto.
- **RN-TEC-04**: No se administran altas/bajas/modificaciones de editoriales, géneros o autores. — Ej. 3.
