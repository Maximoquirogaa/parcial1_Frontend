# Proposal

## Why

El proyecto no tiene aún la estructura base del frontend: sin un `index.html` semántico con las 5 vistas y navegación operativa, no es posible construir el CSS (C-02), el catálogo con datos (C-03), las altas (C-04), las ventas (C-05) ni la persistencia (C-06). Este cambio sienta el esqueleto sobre el que se apoya todo lo demás.

## What Changes

- Se crea/pule `index.html` a partir de `docs/base-index.html`: `lang="es"`, header/nav/main semánticos, 5 secciones `vista-*` (catálogo, libros, clientes, ventas, historial).
- Se crea `js/navegacion.js`: cambio de vista por `data-target` sin recargar, con estado activo accesible.
- Se asegura semántica de formularios: `<label for>` en cada campo, botones con texto descriptivo, tablas con `<thead>`.
- Se dejan nodos/mensajes base para estados (lista vacía, sin resultados, éxito, error) listos para los módulos JS posteriores.
- Se quitan datos de ejemplo hardcodeados del catálogo y listados (se renderizarán desde JS en C-03).

## Capabilities

### New Capabilities
- `app-shell`: estructura base de la aplicación (HTML semántico con 5 vistas) y navegación entre vistas sin recargar.

### Modified Capabilities

(ninguna — es el primer cambio; no hay specs previos de comportamiento)

## Impact

- **Archivos nuevos**: `index.html` (puliendo el base), `js/navegacion.js`.
- **Archivos existentes afectados**: `docs/base-index.html` (solo como fuente de partida, no se modifica).
- **Dependencias**: ninguna (es el cambio inicial del roadmap `CHANGES.md`).
- **Sistemas/APIs**: ninguno (proyecto estático, sin backend).
- **Consumidores posteriores**: C-02 (CSS se cuelga de esta estructura), C-03 (render del catálogo dentro de `#vista-catalogo`), C-04/C-05 (formularios y tablas ya presentes).
