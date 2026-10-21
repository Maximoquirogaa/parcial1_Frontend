# Design

## Context

El shell (C-01) define `index.html` con header/nav/main, 5 secciones `vista-*`, formularios etiquetados, tablas con thead y nodos de mensaje ocultos (`js/navegacion.js` alterna visibilidad). `index.html` ya enlaza `css/styles.css` con defer-equivalent (`<link>` en head) pero el archivo no existe todavía: la página se ve sin estilo. La paleta borgoña + crema es decisión explícita del usuario (DD-01) y la consiga exige CSS externo, Flexbox o Grid, verificación a 320/1280 px, foco visible y errores en texto (Ejercicio 2, RN-UI-04..RN-UI-08).

## Goals / Non-Goals

**Goals:**
- Un solo `css/styles.css` autocontenido con secciones claras (variables, base, layout, componentes, vistas, responsive, accesibilidad).
- Paleta borgoña + crema vía custom properties, tipografía del sistema y espaciado consistente.
- Layout Flexbox (header/nav/main) + Grid (tarjetas de catálogo), mobile-first.
- Clases reutilizables: `.tarjeta`, `.formulario`, `.boton`, `.tabla-contenedor`, `.mensaje-error`, `.mensaje-exito`.
- Foco visible, contraste AA razonable, errores con texto, tablas con scroll propio.

**Non-Goals:**
- Animaciones complejas o transiciones elaboradas (solo feedback sutil si acaso).
- Tema oscuro o modos de apariencia.
- CSS framework, preprocesador o paso de build (prohibidos por consiga).
- Estilizar datos que aún no existen (ventas con renglones se pinta en C-05; se deja el terreno con clases genéricas).

## Decisions

### D1 — Un solo archivo `css/styles.css`
**Elección**: un archivo con secciones separadas por comentarios (`:root`, reset/base, layout, componentes, vistas, responsive, accesibilidad).
**Alternativas**: varios archivos (`variables.css`, `layout.css`...) — descartada: sin bundler implica varios `<link>` y la consiga pide "archivos externos" sin exigir fragmentación; un archivo facilita la revisión del evaluador.

### D2 — Custom properties en `:root`
**Elección**: `--color-primario` (#6B1D2A borgoña), `--color-primario-suave` (#8B2942), `--color-fondo` (#F5EFE6 crema), `--color-superficie` (#FAF6F0), `--color-texto` (neutro oscuro, ej. #2A2118), `--color-error`, `--color-exito`, además de `--espacio-*` y tipografía (`font-family: system-ui, ...`).
**Razón**: una sola fuente de verdad para la identidad; cambiar tonos no toca el resto del archivo. Sistema de fuentes del navegador: sin webfonts (sin CDN, consiga).

### D3 — Flexbox para layout general, Grid para tarjetas
**Elección**: `header`, `nav` y `main` en Flexbox; `.contenedor-catalogo` en CSS Grid `repeat(auto-fill, minmax(...))`.
**Alternativas**: todo Grid — posible, pero Flexbox es más directo para bandas (header/nav/main apiladas en móvil, nav horizontal en desktop). Grid destaca en la grilla de tarjetas.

### D4 — Errores/éxito con clase + texto
**Elección**: `.mensaje-error` y `.mensaje-exito` combinan color, icono textual (p. ej. prefijo "✗"/"✓" o texto fuerte) y contenido de texto; el JS de C-03+ escribe el texto.
**Razón**: RN-UI-07 prohíbe depender solo del color; el nodo en HTML ya tiene la clase y el JS solo setea `textContent`.

### D5 — Tablas dentro de `.tabla-contenedor`
**Elección**: cada `<table>` se envuelve en un `<div class="tabla-contenedor">` con `overflow-x: auto`; en móvil la tabla puede comprimir tipografía/padding.
**Impacto HTML**: C-01 dejó las tablas sin wrapper; esta change agrega los wrappers en `index.html` (ajuste mínimo, no rompe la capability app-shell).

### D6 — Responsive mobile-first con media queries
**Elección**: estilos base pensados para ~320 px; media query en ~768 px (y opcional ~1024 px) para layout de escritorio (nav horizontal, dos columnas en formularios si conviene).
**Razón**: mobile-first evita quitar estilos y cumple el check de 320 px sin scroll horizontal.

### D7 — Foco con `:focus-visible`
**Elección**: `:focus-visible { outline: 2px solid var(--color-primario); outline-offset: 2px; }` sobre todos los controles.
**Alternativas**: `:focus` global — descartada porque remueve el anillo en clic con mouse; `:focus-visible` muestra el anillo solo con teclado/navegación accesible.

## Risks / Trade-offs

- [Contraste insuficiente borgoña/crema en estados sutiles] → Usar borgoña oscura #6B1D2A sobre crema #F5EFE6 (ratio alto); botones borgoña con texto crema; verificar estados hover/focus.
- [Scroll horizontal a 320 px por anchos mínimos de tablas o grid] → `min-width: 0` en hijos flex, grid con `minmax` flexible, tablas solo en `.tabla-contenedor` con `overflow-x: auto`; evitar anchos fijos en px salvo breakpoints.
- [Pérdida de foco visible por reset agresivo] → No usar `outline: none` sin reemplazo; cualquier reset debe conservar `:focus-visible`.
- [Index.html modificado para wrappers de tabla] → Cambio quirúrgico (envolver `<table>`), sin tocar ids ni estructura de vistas; no afecta `js/navegacion.js`.

## Migration Plan

1. Crear `css/styles.css` completo.
2. Ajustar `index.html`: envolver tablas en `.tabla-contenedor` y verificar `alt` de imágenes (si las hay).
3. Verificación manual: abrir a 320 px y 1280 px, recorrer con Tab, provocar un error de validación (input vacío + botón) para ver texto de error.
4. Rollback: borrar `css/styles.css` y quitar wrappers; el HTML de C-01 sigue funcionando sin estilo.

## Open Questions

- Ninguna abierta: la paleta exacta de tonos secundarios (hover, bordes) se decide en implementación dentro de la familia borgoña/crema sin cambiar specs.
