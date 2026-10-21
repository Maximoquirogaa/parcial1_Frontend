# Proposal

## Why

El shell HTML (C-01) y la identidad visual (C-02) ya están implementados, pero la aplicación no tiene datos: los arrays de libros, editoriales, géneros, autores y clientes no existen, el contenedor `#contenedor-catalogo` está vacío y la búsqueda por título del formulario en `#vista-catalogo` no filtra nada. Sin datos ni filtro de catálogo no se pueden desarrollar las altas (C-04), las ventas (C-05) ni la persistencia (C-06). Este change aporta los datos seed con ids estables y la capacidad de renderizar y filtrar el catálogo, cumpliendo el Ejercicio 3 de la consiga (US-005, US-006).

## What Changes

- Se crea `js/datos.js` con arrays seed de editoriales (2), géneros (2), autores (3), libros (≥6, al menos uno sin género) y clientes (3), todos con ids estables y relaciones válidas.
- Se crea `js/catalogo.js` que renderiza el catálogo desde `libros[]` usando `textContent` (sin `innerHTML` con datos crudos), genera tarjetas `<article>` con título, ISBN, editorial, género («Sin clasificar» si no tiene), autores y precio, y expone una función de filtrado por título.
- Se conecta el formulario de búsqueda existente (`#buscar-titulo`, `preventDefault`, `trim`) al filtro: vacío ⇒ catálogo completo; sin coincidencias ⇒ mensaje claro en `#catalogo-sin-resultados` / `#catalogo-estado`.
- Se integran los scripts `js/datos.js` y `js/catalogo.js` en `index.html` con `defer` (clásicos, sin módulos ES).

## Capabilities

### New Capabilities

- `datos-catalogo`: datos locales estables (editoriales, géneros, autores, libros, clientes), render imperativo del catálogo desde `libros[]` con `textContent`, filtro de búsqueda por título (trim + case-insensitive + parcial) y estados de vacío / sin resultados.

### Modified Capabilities

- `app-shell` (C-01): se agregan los scripts `js/datos.js` y `js/catalogo.js` a `index.html`; no se modifica la estructura de vistas ni la navegación.

## Impact

- **Archivos nuevos**: `js/datos.js`, `js/catalogo.js`.
- **Archivos existentes afectados**: `index.html` (se agregan dos `<script src> defer`; no se tocan ids ni estructura de vistas).
- **Dependencias**: C-01 (está completo ✅; no hay otros blockers).
- **Sistemas/APIs**: ninguno (proyecto estático, sin backend, sin fetch; `localStorage` se deja para C-06).
- **Consumidores posteriores**: C-04 (altas usa `editoriales[]`, `generos[]`, `autores[]`, `libros[]` para selectores y validación), C-05 (ventas usa `libros[]` y `clientes[]`), C-06 (persistencia lee/escribe `libros[]` con claves `libreria_libros`).
