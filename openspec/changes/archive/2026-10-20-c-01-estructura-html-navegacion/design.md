# Design

## Context

El proyecto parte de `docs/base-index.html`, un HTML estático con las 5 secciones `vista-*`, botones `data-target`, formularios de ejemplo y tablas con datos hardcodeados. No hay JS ni CSS implementados aún. La consiga exige HTML semántico, navegación clara y separación de capas (HTML/CSS/JS en archivos distintos, scripts clásicos sin módulos ES por compatibilidad file://). Ver proposal.md — Why.

## Goals / Non-Goals

**Goals:**
- Dejar un `index.html` semántico y pulido como base estable para C-02 a C-06.
- Implementar `js/navegacion.js` mínimo y aislado para alternar vistas.
- Asegurar los contratos de estructura (labels, thead, mensajes de estado) que los siguientes changes consumirán.

**Non-Goals:**
- Estilos visuales, responsive o identidad visual (C-02).
- Render de datos, filtros, validaciones o persistencia (C-03 a C-06).
- Manejo de eventos de formularios más allá de la navegación.

## Decisions

### D1 — Partir del HTML base y pulir, no reescribir de cero
- **Decisión**: copiar la estructura de `docs/base-index.html`, corregir `lang`, unificar «Sin clasificar» (IN-01 KB), quitar datos hardcodeados, agregar nodos de mensajes de estado.
- **Alternativas**: generar un HTML nuevo desde cero; mantener el base tal cual.
- **Rationale**: el usuario pidió no empezar de cero (DD-02 KB); el base ya cubre vistas, formularios y tablas.

### D2 — Navegación por `data-target` + `classList` (sin innerHTML)
- **Decisión**: `js/navegacion.js` escucha clics en `nav [data-target]`, oculta `.vista` y muestra `#<target>`, actualiza `aria-current`/clase activa.
- **Alternativas**: enlaces `<a href="#...">` con hashchange; mostrar/ocultar con `hidden` attribute.
- **Rationale**: el base ya usa `data-target`; `classList`+`hidden` es nativo, accesible y sin dependencias.

### D3 — Scripts clásicos con `defer`, sin `type="module"`
- **Decisión**: `<script src="js/navegacion.js" defer>` en el `<head>` o al final del body.
- **Alternativas**: módulos ES; bundle.
- **Rationale**: apertura vía file:// donde los módulos ES pueden fallar por CORS (DD-04 KB).

### D4 — Mensajes de estado como nodos ocultos por defecto
- **Decisión**: cada vista lleva nodos con clases como `.mensaje-vacio`, `.mensaje-sin-resultados`, `.mensaje-exito`, `.mensaje-error`, ocultos por defecto (listos para JS posterior).
- **Alternativas**: crearlos dinámicamente desde JS; no dejarlos en el HTML.
- **Rationale**: la consiga pide mensajes para estados; dejarlos en HTML simplifica C-03/C-04/C-05.

## Risks / Trade-offs

- [El HTML base tiene `lang="en"] → Se corrige a `lang="es"` en este change.
- [Hardcodear menos puede dejar vistas "vacías" a la vista] → Aceptado: el render es responsabilidad de C-03+; el shell solo ofrece la estructura.
- [Navegación sin hash] → El botón "atrás" del navegador no cambia vista; no es exigido por la consiga (DD-03 KB).

## Migration Plan

No aplica (proyecto estático sin despliegue). Rollback: revertir los archivos `index.html` y `js/navegacion.js` al estado anterior.

## Open Questions

Ninguna bloqueante. El formato de fecha y las claves de `localStorage` se resuelven en C-05/C-06.
