# Design

## Context

C-01 dejó `index.html` con header/nav/main semánticos, 5 secciones `vista-*`, el formulario de búsqueda en `#vista-catalogo` (`#buscar-titulo`, botón Buscar), `#contenedor-catalogo` vacío listo para render dinámico, `#catalogo-estado` y `#catalogo-sin-resultados` (oculto por defecto). C-02 dejó `css/styles.css` con `.tarjeta`, `.contenedor-catalogo` (Grid), `.mensaje-estado`, `.mensaje-sin-resultados`, `.mensaje-error`, `.mensaje-exito` y `:focus-visible`. `js/navegacion.js` alterna vistas con `aria-current`. Todo está listo para que C-03 inyecte datos y filtro sin tocar CSS ni HTML de estructura.

## Goals / Non-Goals

**Goals:**
- `js/datos.js`: arrays seed con ids estables — 2 editoriales, 2 géneros, 3 autores, ≥6 libros (1 sin género), 3 clientes; relaciones válidas (editorial/autores existentes; género opcional).
- `js/catalogo.js`: render del catálogo desde `libros[]` con `textContent` (RN-TEC-02; sin `innerHTML` con datos crudos), cada tarjeta muestra título, ISBN, editorial, género («Sin clasificar» si no tiene), autores y precio (RN-CAT-05).
- Filtro por título: `trim` + case-insensitive + coincidencia parcial (RN-CAT-01); vacío ⇒ catálogo completo (RN-CAT-02); sin coincidencias ⇒ mensaje claro (RN-CAT-03).
- Scripts clásicos con `defer`, sin `type="module"`, compatibles con `file://` (DD-04, RN-TEC-01).
- No se implementa persistencia `localStorage` (C-06); los datos viven en memoria durante esta change.

**Non-Goals:**
- Altas de libros/clientes (C-04), ventas (C-05), persistencia (C-06).
- Estilos nuevos (C-02 ya cubre presentación).
- Editar/eliminar libros, géneros, editoriales o autores (RN-TEC-04).

## Decisions

### D1 — `js/datos.js` como único módulo de datos (C-03)
- **Decisión**: `js/datos.js` expone arrays globales `editoriales`, `generos`, `autores`, `libros`, `clientes` con ids estables y números enteros secuenciales a partir de 1.
- **Alternativas**: un módulo separado por entidad; datos inline en `catalogo.js`.
- **Rationale**: C-04 y C-05 consumen los mismos arrays para selectores y validaciones; un único módulo centraliza el seed y evita duplicados (DD-02, DD-04 KB).

### D2 — Estructura de entidades y seed
- **Decisión**: ids estables enteros; `Libro.id`, `Editorial.id`, `Genero.id`, `Autor.id`, `Cliente.id` secuenciales; `libro.generoId` puede ser `null` (ausencia); `libro.autoresIds` es `number[]` con ≥1 autor; `libro.isbn` único; `libro.precio` numérico > 0. Seed mínimo: 2 editoriales (Sudamericana, Sur), 2 géneros (Realismo Mágico, Ensayo), 3 autores (Gabriel García Márquez, Jorge Luis Borges, Julio Cortázar), ≥6 libros (1 sin género), 3 clientes.
- **Alternativas**: ids UUID; género «Sin clasificar» como entrada del array de géneros.
- **Rationale**: ids enteros estables son simples y trazables; la ausencia de género se modela con `null` y se muestra «Sin clasificar» en UI (KB 04_modelo_de_datos.md §Genero, §Libro; IN-01 KB resuelto a «Sin clasificar» sin corchetes dobles).

### D3 — Render imperativo con `textContent`, sin `innerHTML` con datos crudos
- **Decisión**: `catalogo.js` crea `<article class="tarjeta">` vía `document.createElement`, rellena `<h3>`, `<dl>`/`<dt>`/`<dd>` (o `<p>`) usando `textContent` para todos los campos de datos del libro; nunca `innerHTML` con contenido de usuario o del catálogo.
- **Alternativas**: `innerHTML` con plantilla de strings; `insertAdjacentHTML`.
- **Rationale**: RN-TEC-02 prohíbe interpretar datos crudos como HTML; `textContent` evita XSS aunque los datos sean locales (DD-04 KB).

### D4 — Filtro: `trim` + case-insensitive + coincidencia parcial sobre `libro.titulo`
- **Decisión**: función `filtrarLibros(texto)` aplica `texto.trim()`, luego `titulo.toLowerCase().includes(texto.toLowerCase())`; devuelve el array filtrado (o `libros[]` completo si el texto tras trim está vacío).
- **Alternativas**: coincidencia exacta; expresión regular con boundaries; filtrar sobre campos adicionales (ISBN, autor).
- **Rationale**: RN-CAT-01 exige trim + case-insensitive + parcial; la consiga Ej. 3 pide solo búsqueda por título (RN-TEC-04 no prohíbe más campos pero el alcance de C-03 es título).

### D5 — Estados de búsqueda
- **Decisión**: si el texto de búsqueda está vacío (tras trim) ⇒ render del catálogo completo y mensaje `#catalogo-estado` «Mostrando catálogo completo»; si hay texto y no hay coincidencias ⇒ contenedor vacío y `#catalogo-sin-resultados` visible con mensaje claro («No se encontraron libros que coincidan con la búsqueda»).
- **Alternativas**: mensaje genérico único para vacío y sin resultados; no mostrar mensaje de catálogo completo.
- **Rationale**: RN-CAT-02 (vacío ⇒ completo) y RN-CAT-03 (sin coincidencias ⇒ mensaje claro); los nodos ya existen en `index.html` (C-01), solo se alternan `hidden` y `textContent`.

### D6 — Integración con el formulario existente (`preventDefault`)
- **Decisión**: `catalogo.js` escucha `submit` del formulario de búsqueda, llama `event.preventDefault()`, lee `#buscar-titulo.value`, aplica `trim`, filtra y re-renderiza.
- **Alternativas**: evento `input` para filtrar al escribir; botón separado.
- **Rationale**: Flujo 2 KB especifica submit con `preventDefault`; el formulario ya existe en `index.html`.

### D7 — Scripts clásicos con `defer`, sin módulos ES
- **Decisión**: `<script src="js/datos.js" defer>` y `<script src="js/catalogo.js" defer>` en `index.html` (orden: datos antes que catálogo); IIFE o `var`/`function` para evitar colisiones globales, expuesto bajo un espacio de nombres controlado.
- **Alternativas**: `type="module"`; bundle único.
- **Rationale**: apertura vía `file://` donde los módulos ES pueden fallar por CORS (DD-04 KB); scripts defer son nativos y sin tooling (RN-TEC-01).

## Risks / Trade-offs

- [Datos en memoria se pierden al recargar] → Aceptado para C-03; la persidencia con `localStorage` y seed idempotente llega en C-06 (Flujo 7 KB). No se duplica seed aquí.
- [Un solo archivo `datos.js` con todos los arrays puede crecer] → Aceptado en esta fase; C-04/C-05 lo consumen tal cual; si crece, se fracciona luego sin romper contratos de array.
- [Sin `innerHTML` limita formato rico en tarjetas] → Aceptado: `textContent` es suficiente para título/ISBN/editorial/género/autores/precio; el estilo ya viene de `.tarjeta` (C-02).
- [Filtro solo por título, no por editorial/género/autor] → Alcance de C-03 per CHANGES.md; filtros adicionales quedan para cambios futuros.

## Migration Plan

1. Crear `js/datos.js` con seed y ids estables.
2. Crear `js/catalogo.js` con render + filtro + estados.
3. Agregar `<script src="js/datos.js" defer>` y `<script src="js/catalogo.js" defer>` a `index.html` (datos antes que catálogo).
4. Verificación manual: abrir `index.html`, verificar catálogo completo al cargar, buscar título parcial (case-insensitive), buscar texto sin coincidencias (mensaje claro), buscar vacío (catálogo completo), verificar tarjetas con los 6 campos y «Sin clasificar» en el libro sin género.
5. Rollback: borrar `js/datos.js` y `js/catalogo.js` y quitar los dos `<script>` de `index.html`; el shell de C-01/C-02 sigue funcionando (catálogo vacío).

## Open Questions

- Ninguna bloqueante. El formato de precio (signo `$`, 2 decimales) se asume por SU-03 KB; se confirma en implementación.
- El orden exacto de `defer` scripts (datos antes que catálogo) es relevante y se verifica en la tarea de integración.
