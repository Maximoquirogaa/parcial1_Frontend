# Design

## Context

C-03 dejó `js/datos.js` exponiendo `window.libreria` con `editoriales`, `generos`, `autores`, `libros` y `clientes`, y `js/catalogo.js` con `filtrarLibros(texto)` / `renderCatalogo(libros, texto)` que renderiza tarjetas con `textContent`. `index.html` ya contiene los formularios de `#vista-libros` y `#vista-clientes`, las tablas `#tabla-libros` / `#tabla-clientes`, los nodos de estado (`#libros-exito`, `#libros-error`, `#libros-vacio`, equivalentes de clientes) y los selectores de venta `#venta-libro` / `#venta-cliente`, todos vacíos. `css/styles.css` (C-02) ya estiliza formularios, tablas y mensajes. El harness de tests es Node puro (`node:test` + `tests/shim.js`), sin npm.

Ver `proposal.md` para la motivación. Las reglas de comportamiento están en `specs/altas-libros-clientes/spec.md`.

## Goals / Non-Goals

**Goals:**
- Altas de libro y cliente con validación completa (RN-LIB-01…08, RN-CLI-01…04) y errores textuales cerca del formulario.
- Funciones de validación puras y exportadas, testeables con el harness Node existente sin DOM.
- Listados, catálogo y selectores relacionados actualizados sin recargar, desde una única fuente de verdad (`window.libreria`).
- Render seguro con `textContent` en tablas y opciones.

**Non-Goals:**
- Persistencia en `localStorage` y seed idempotente (C-06).
- Composición, cálculo y confirmación de ventas (C-05); acá solo se pueblan las opciones de `#venta-libro` / `#venta-cliente`.
- Edición o baja de libros/clientes (fuera del Ej. 4).
- Altas/bajas de editoriales, géneros o autores (RN-TEC-04).
- Cambios de identidad visual o de estructura de vistas (C-01/C-02).
- Validación de dígito de control del ISBN.

## Decisions

### D1 — Un módulo por entidad, con validación pura separada del DOM
- **Decisión**: `js/libros.js` y `js/clientes.js` son IIFE con `'use strict'` que exponen `window.libros` y `window.clientes`. Cada módulo exporta funciones puras (`normalizarIsbn`, `normalizarEmail`, `parsearPrecio`, `validarLibro`, `validarCliente`, `siguienteId`) y funciones de UI (`renderTablaLibros`, `poblarSelectores`, `inicializar`).
- **Alternativas**: validar dentro del handler de `submit`; un único `js/altas.js`; un módulo `validaciones.js` aparte.
- **Rationale**: el harness de tests corre scripts clásicos en un sandbox VM y no necesita DOM para las reglas; separar validación de render permite tests unitarios deterministas y deja el handler delgado. Un módulo por entidad respeta la separación de responsabilidades que evalúa la consigna.

### D2 — `window.libreria` como única fuente de verdad
- **Decisión**: las altas hacen `libreria.libros.push(...)` / `libreria.clientes.push(...)` sobre los arrays existentes; no se mantienen copias locales ni se reasignan los arrays.
- **Alternativas**: reemplazar el array por uno nuevo; estado duplicado en cada módulo.
- **Rationale**: catálogo, listados, selectores y (en C-06) persistencia leen el mismo array; mutar en sitio evita desincronizaciones y mantiene las referencias ya capturadas por `catalogo.js`.

### D3 — Ids nuevos con `siguienteId(coleccion)`
- **Decisión**: `siguienteId(coleccion)` devuelve `Math.max(0, ...ids) + 1` como entero; nunca reutiliza ids.
- **Alternativas**: `coleccion.length + 1` (colisiona si los ids no son contiguos); UUID (inconsistente con los ids enteros estables del seed).
- **Rationale**: mantiene la convención de ids enteros estables de C-03 y es robusto ante futuras bajas.

### D4 — Normalización de ISBN para comparar, no para almacenar
- **Decisión**: `normalizarIsbn(valor)` = `String(valor).replace(/[\s-]/g, '').toUpperCase()`. La unicidad compara `normalizarIsbn(nuevo)` contra `normalizarIsbn(libro.isbn)` de todos los existentes. El ISBN se guarda con `trim()` del valor ingresado (se conservan guiones para mostrar); un ISBN cuyo valor normalizado quede vacío (por ejemplo `---`) se rechaza como inválido.
- **Alternativas**: guardar siempre el ISBN normalizado; comparación exacta sin normalizar.
- **Rationale**: la consigna exige comparar sin espacios ni guiones y no validar dígito de control; normalizar solo para comparar evita alterar el dato mostrado. La capitalización se ignora porque un dígito verificador `X` puede venir en minúscula.

### D5 — Precio numérico parseado explícitamente
- **Decisión**: `parsearPrecio(valor)` hace `String(valor).trim()`; si queda vacío devuelve `NaN`; si no, `Number(...)`. La validación exige `Number.isFinite(precio) && precio > 0`. Se guarda como `number`. Los atributos `min`/`step` del HTML son ayuda de UX, no la validación.
- **Alternativas**: confiar en `input[type=number]`; `parseFloat` (acepta `"12abc"`).
- **Rationale**: `Number('')` es `0` y `parseFloat` es tolerante; el parseo explícito cubre precio vacío, no numérico, cero y negativo. Se permiten decimales porque la consigna solo exige “numérico y mayor que cero”.

### D6 — Género vacío ⇒ `null`; «Sin clasificar» es una opción de UI
- **Decisión**: el `<select id="libro-genero">` mantiene `<option value="">«Sin clasificar»</option>`; al leer, `''` se traduce a `null`. Un valor no vacío se parsea a entero y debe existir en `generos`.
- **Alternativas**: agregar «Sin clasificar» como entrada del array `generos`; usar un checkbox aparte.
- **Rationale**: el modelo de C-03 ya representa la ausencia con `null` y el catálogo ya muestra «Sin clasificar»; agregar un género ficticio contaminaría el array.

### D7 — Autores desde selector múltiple, con lectura tolerante
- **Decisión**: se lee `select.selectedOptions` cuando existe; si no, se recorren `select.options` filtrando `option.selected`. Los ids se parsean a entero, se deduplican y se valida que cada uno exista en `autores`; se exige al menos uno.
- **Alternativas**: checkboxes generados por autor; un `<select multiple>` con validación solo del primer valor.
- **Rationale**: la consigna acepta selector múltiple o controles equivalentes; el HTML de C-01 ya trae `<select multiple>`. La lectura tolerante permite testear con el shim sin depender de `selectedOptions`.

### D8 — Un resumen textual de errores por formulario
- **Decisión**: se reutilizan `#libros-error` y `#clientes-error` como resumen textual (`role="alert"`, `aria-live="polite"`, `hidden` cuando no hay errores). `validarLibro` / `validarCliente` devuelven `{ valido, errores: [{ campo, mensaje }] }`; el handler une los mensajes, los muestra en el nodo, marca los campos con `aria-invalid="true"` y `aria-describedby`, enfoca el primer campo inválido y conserva los valores ingresados. En éxito oculta el error, limpia el formulario y muestra `#libros-exito` / `#clientes-exito`.
- **Alternativas**: un `<p>` de error por campo (más nodos y más código); un `alert()` (no es “cerca del formulario” y rompe la UX).
- **Rationale**: cumple RN-LIB-07 y RN-UI-07 con texto, sin depender del color, y mantiene el HTML mínimo. El resumen es suficiente para el alcance del parcial.

### D9 — Refresco sin recarga, por secciones afectadas
- **Decisión**: tras un alta válida, `libros.js` re-renderiza `#tabla-libros`, repuebla los selectores del formulario (editorial, género, autores) y `#venta-libro`, y llama a `window.catalogo.refrescar()` si está disponible; `clientes.js` re-renderiza `#tabla-clientes` y repuebla `#venta-cliente`. Cada repoblado conserva la selección actual si sigue siendo válida y, si no, vuelve a la opción placeholder.
- **Alternativas**: recargar la página (prohibido por la consigna); re-renderizar todas las vistas siempre (más costoso y con más acoplamiento).
- **Rationale**: RN-LIB-08 / RN-CLI-04 piden actualizar listado y opciones relacionadas sin recargar; el caso manual del Ej. 6 exige que el libro nuevo aparezca también en el catálogo y en la selección de venta. `refrescar()` en `catalogo.js` evita duplicar la lógica de filtro y conserva la búsqueda activa.

### D10 — `refrescar()` en `js/catalogo.js`
- **Decisión**: se agrega una función `refrescar()` que lee `#buscar-titulo`, aplica `filtrarLibros` y llama `renderCatalogo`, reutilizando el estado de filtro actual. Se exporta en `window.catalogo` junto a las funciones existentes.
- **Alternativas**: que `libros.js` replique el filtro; volver a renderizar el catálogo completo (perdería el filtro activo).
- **Rationale**: mantiene una sola implementación del filtro (C-03) y satisface la actualización del catálogo sin recarga.

### D11 — Render de tablas con `textContent` y formato de precio consistente
- **Decisión**: las filas se crean con `document.createElement('tr')` / `'td'` y se rellenan con `textContent`; el `tbody` se vacía con el mismo patrón `while (firstChild) removeChild` de `catalogo.js`. El precio se muestra como `'$' + Number(precio).toFixed(2)`, igual que C-03 (no se introduce `Intl` para no cambiar el formato existente). Los estados vacíos alternan `hidden` en `#libros-vacio` / `#clientes-vacio`.
- **Alternativas**: `innerHTML` con plantillas (prohibido para datos); `Intl.NumberFormat` (cambiaría el formato respecto de C-03).
- **Rationale**: RN-TEC-02 y la regla dura del proyecto exigen insertar datos como texto; la consistencia visual con el catálogo es un criterio de evaluación.

### D12 — Tests Node puros, con extensión mínima del shim
- **Decisión**: se agregan `tests/libros.test.js` y `tests/clientes.test.js` con `node:test` y `node:assert/strict`. Las reglas se prueban contra las funciones puras (sin DOM). Para los tests de integración se extiende `tests/shim.js` con: formularios de libros/clientes en `querySelector`, `select` con `options`/`selectedOptions`/`multiple`, `option.selected`, `form.reset()`, `document.createElement('option')` y `remove()`. No se usa npm ni frameworks.
- **Alternativas**: tests solo manuales; Playwright (no es dependencia del proyecto y la consigna no lo exige).
- **Rationale**: el proyecto ya tiene un harness Node que carga scripts clásicos; extenderlo mantiene el flujo de Strict TDD sin introducir tooling.

### D13 — Integración clásica con `defer`, sin módulos ES
- **Decisión**: en `index.html`, orden `js/datos.js` → `js/catalogo.js` → `js/libros.js` → `js/clientes.js`, todos con `defer` y sin `type="module"`. `libros.js` solo invoca `window.catalogo.refrescar` si existe (guard defensivo).
- **Alternativas**: `type="module"` (puede fallar al abrir con `file://`); un bundle (requiere tooling).
- **Rationale**: RN-TEC-01 y DD-04: la entrega se abre directamente en el navegador, sin servidor ni compilación.

## Risks / Trade-offs

- [El shim actual no modela formularios de libros/clientes ni `selectedOptions`] → Extender `tests/shim.js` antes de escribir los tests nuevos y volver a correr `datos.test.js` / `catalogo.test.js` como red de seguridad.
- [Un resumen único de errores es menos granular que un error por campo] → Se compensa con `aria-invalid`, `aria-describedby` y foco en el primer campo inválido; el texto del resumen indica el campo afectado.
- [Acoplamiento de `libros.js` con `catalogo.js`] → Llamada guardada (`if (window.catalogo && typeof window.catalogo.refrescar === 'function')`); si C-03 no está cargado, el alta sigue funcionando.
- [Mutación de arrays compartidos] → C-06 deberá persistir después de cada alta; se documenta en design y en las tareas de C-06. En C-04 los datos viven en memoria y se pierden al recargar.
- [ISBN con caracteres distintos de espacios/guiones] → Solo se normalizan espacios y guiones, como pide la consigna; no se valida dígito de control.
- [Selectores de venta poblados por C-04] → C-05 deberá reutilizar `poblarSelectorVentaLibros` / `poblarSelectorVentaClientes` o repoblar tras sus propias mutaciones para no perder las opciones.

## Migration Plan

1. Extender `tests/shim.js` y correr la red de seguridad (`datos.test.js`, `catalogo.test.js`).
2. Escribir `tests/libros.test.js` y `tests/clientes.test.js` (RED).
3. Implementar funciones puras en `js/libros.js` y `js/clientes.js` (GREEN).
4. Implementar render de tablas, poblado de selectores y handlers de `submit`.
5. Agregar `refrescar()` a `js/catalogo.js`.
6. Integrar scripts y atributos de accesibilidad en `index.html`.
7. Ejecutar los cuatro archivos de test y verificar manualmente los casos del Ej. 4.
8. Rollback: quitar los dos `<script>` y los atributos agregados en `index.html`, borrar `js/libros.js` / `js/clientes.js` y los tests nuevos, y revertir `refrescar()`; C-03 sigue funcionando.

## Open Questions

- Ninguna bloqueante. Se mantiene la tabla de libros con las cinco columnas existentes (título, ISBN, editorial, género, precio); la consigna no exige autores en el listado y el catálogo ya los muestra.
