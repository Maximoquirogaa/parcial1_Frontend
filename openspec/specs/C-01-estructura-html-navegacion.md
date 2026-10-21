# SPEC — C-01 estructura-html-navegacion

## 1. Problema, objetivo y resultado esperado

El proyecto no tiene aún la estructura base del frontend. Se necesita un `index.html` semántico con las 5 vistas de la librería (Catálogo, Libros, Clientes, Ventas, Historial) y un `js/navegacion.js` que permita alternar entre ellas sin recargar, partiendo del HTML base provisto (`docs/base-index.html`).

**Resultado esperado**: abrir `index.html` en el navegador muestra el encabezado con navegación; clickear cada botón muestra la vista correspondiente y oculta las demás; la estructura semántica y de formularios está lista para que los siguientes changes (CSS, datos, altas, ventas) la consuman.

## 2. Contexto verificado

- `docs/base-index.html` ya contiene las 5 secciones `vista-*`, botones `data-target`, formularios de ejemplo y tablas.
- La KB (`knowledge-base/`) define los requisitos RN-UI-01/02/03 y la arquitectura (SPA por secciones, scripts clásicos sin módulos ES).
- `CHANGES.md` define C-01 como cambio inicial sin dependencias.

## 3. Alcance

### Incluido
- `index.html` reescrito/puliendo el base: `lang="es"`, header/nav/main semánticos, 5 secciones `vista-*`.
- `js/navegacion.js`: cambio de vista por `data-target`, ocultar/mostrar secciones, estado activo accesible.
- Labels asociados en todos los campos; botones con texto descriptivo; tablas con `<thead>`.
- Mensajes base (estados vacíos, sin resultados, éxito/error) como nodos listos para JS posterior.
- Quitar datos hardcodeados de ejemplo del catálogo/listados (se renderizarán desde JS en C-03); se puede dejar un estado inicial placeholder.

### Excluido
- CSS / identidad visual (C-02).
- Arrays seed, render del catálogo, filtro (C-03).
- Validaciones y altas de libros/clientes (C-04).
- Composición de ventas, historial, cálculos (C-05).
- localStorage / persistencia / README de entrega (C-06).

## 4. Requisitos

| ID | Grupo | Requisito |
|----|-------|-----------|
| R-01 | Estructura | `index.html` usa header, nav, main, section, form, table, label, button semánticos |
| R-02 | Estructura | Existen las 5 vistas identificables: catálogo, libros, clientes, ventas, historial |
| R-03 | Estructura | Navegación con botones `data-target` que alternan la visibilidad de las secciones |
| R-04 | Estructura | Cada campo de formulario tiene `<label for>` asociado |
| R-05 | Estructura | Botones describen su acción (texto explícito, no solo icono) |
| R-06 | Estructura | Tablas incluyen `<thead>` con encabezados |
| R-07 | Estados | Nodos/mensajes para: lista vacía, búsqueda sin resultados, operación correcta, operación rechazada |
| R-08 | Comportamiento | `js/navegacion.js` cambia de vista sin recargar la página |
| R-09 | Comportamiento | Solo una vista visible a la vez |

## 5. Estructura propuesta

```
index.html
js/navegacion.js
```

`index.html` parte de `docs/base-index.html` y se ajusta:
- `lang="es"`, título descriptivo.
- Header con `<h1>` y `<nav>` con 5 botones.
- `<main>` con 5 `<section class="vista" id="vista-*">`, solo la primera visible por defecto.
- Cada sección con su `<h2>`, formularios (labels + inputs) y tablas (`thead` + `tbody` vacío o placeholder).
- Scripts: `<script src="js/navegacion.js" defer>` (o al final del body).

`js/navegacion.js`:
- Escucha clics en los botones `nav [data-target]`.
- Oculta todas las secciones `.vista`, muestra la target (`#<data-target>`).
- Actualiza `aria-current` o clase activa en el botón.

## 6. Estados y errores

- Estado inicial: vista catálogo visible, demás ocultas.
- Clic en botón ya activo: sin cambio (idempotente).
- Target inexistente: no hace nada visible (degradación silenciosa aceptable en este change).

## 7. Restricciones técnicas

- Solo HTML + JS nativo (sin frameworks, CDNs, librerías).
- Scripts clásicos (sin `type="module"`), al final del body o con `defer`.
- Datos de usuario futuros se insertarán con `textContent` (no aplica aún en C-01, pero el HTML no debe depender de innerHTML dinámico).

## 8. Criterios de aceptación

- [ ] CA-01 — Abrir `index.html` muestra la vista catálogo; clic en cada botón de nav muestra su vista y oculta las demás, sin recargar (R-03, R-08, R-09).
- [ ] CA-02 — Inspeccionando el HTML: header/nav/main presentes; 5 secciones con id `vista-*` (R-01, R-02).
- [ ] CA-03 — Todos los inputs/selects/textarea tienen label asociado (R-04).
- [ ] CA-04 — Todos los botones tienen texto que describe la acción (R-05).
- [ ] CA-05 — Todas las tablas tienen thead con th (R-06).
- [ ] CA-06 — Existen nodos de mensaje para estados vacíos/sin resultados/éxito/error en cada vista pertinente (R-07).
- [ ] CA-07 — No hay datos de ejemplo hardcodeados en el catálogo/listados (quedan para render JS de C-03).

## 9. Supuestos y pendientes

- Se parte del HTML base tal cual, puliendo (DD-02 de la KB).
- No se decide aún el formato de fecha ni claves localStorage (corresponden a C-05/C-06).
- El «Sin clasificar» se unifica con comillas latinas «» (IN-01 de la KB).
