# Design

## Context

C-04 dejó `js/datos.js` exponiendo `window.libreria` con `editoriales`, `generos`, `autores`, `libros` y `clientes`; `js/libros.js` y `js/clientes.js` con validación pura, listados, `poblarSelectorVentaLibros`/`poblarSelectorVentaClientes`; `js/catalogo.js` con `filtrarLibros`/`renderCatalogo`/`refrescar`; e `index.html` con las secciones `#vista-ventas` y `#vista-historial` ya maquetadas con todos sus elementos DOM (selectores `venta-cliente`/`venta-libro`, input `venta-cantidad`, botón "Agregar Renglón", tabla `tabla-renglones`, total, tabla `tabla-historial`, `historial-detalle`, `tabla-detalle-venta`, mensajes `ventas-exito`/`ventas-error`/`historial-vacio`). El harness de tests es Node puro (`node:test` + `tests/shim.js`), sin npm.

Ver `proposal.md` para la motivación. Las reglas de comportamiento están en `knowledge-base/05_reglas_de_negocio.md` §RN-VTA-01…09, `knowledge-base/04_modelo_de_datos.md` §Venta/§Renglón, `knowledge-base/07_flujos_principales.md` §Flujo 5/§Flujo 6 y `knowledge-base/09_decisiones_y_supuestos.md` §DD-06/§DD-07.

## Goals / Non-Goals

**Goals:**
- Composición de venta con cliente, libro y cantidad entera > 0; agregar renglón sin duplicados (modifica cantidad existente e informa).
- Cálculos: subtotal = cantidad × precio unitario; total = suma de subtotales; 2 decimales al mostrar.
- Confirmación atómica: valida cliente + ≥1 renglón + cantidades válidas; registra venta con id, fecha, cliente (+nombre), renglones con precioUnitario histórico, total; limpia formulario; mensaje éxito.
- Historial inmutable: lista de ventas (id, fecha, cliente, total); detalle de renglones leído de la venta guardada (precios históricos); sin edición ni eliminación.
- Funciones puras exportadas en `window.ventas` / `window.historial`, testeables con el harness Node sin DOM.
- Render seguro con `textContent` en tablas y mensajes (RN-TEC-02).
- Scripts clásicos con `defer`, sin `type="module"`, orden `datos → catálogo → libros → clientes → ventas → historial`.

**Non-Goals:**
- Persistencia en `localStorage` y seed idempotente (C-06).
- Edición o baja de ventas (RN-VTA-09).
- Validación de dígito de control de ISBN; gestión de editoriales/géneros/autores (RN-TEC-04).
- Cambios de estructura de vistas o identidad visual (C-01/C-02).

## Decisions

### D1 — Un módulo por responsabilidad, IIFE con `'use strict'`
- **Decisión**: `js/ventas.js` expone `window.ventas` y `js/historial.js` expone `window.historial`. Cada módulo es IIFE con `'use strict'`, funciones puras de negocio separadas del DOM, y funciones de UI (`renderTablaRenglones`, `renderTablaHistorial`, `renderDetalleVenta`, `inicializar`).
- **Alternativas**: un único `js/venta-historial.js`; validar dentro del handler; módulos ES.
- **Rationale**: respeta el patrón de C-04 (un módulo por entidad), separa validación de render para tests deterministas y es compatible con `file://` (DD-04).

### D2 — `window.libreria.ventas` como array de ventas confirmadas
- **Decisión**: las ventas confirmadas se agregan a `window.libreria.ventas` (nuevo array en `window.libreria`); no se mantienen copias locales ni se reasignan los arrays existentes.
- **Alternativas**: array separado fuera de `libreria`; reemplazar el array por uno nuevo tras cada venta.
- **Rationale**: C-06 persistirá `libreria.ventas` junto a libros/clientes; mutar en sitio evita desincronizaciones y mantiene referencias.

### D3 — Ids de venta con `siguienteId(coleccion)`
- **Decisión**: `siguienteId(ventas)` devuelve `Math.max(0, ...ids) + 1` como entero; nunca reutiliza ids.
- **Alternativas**: `ventas.length + 1` (colisiona si hay bajas futuras); UUID (inconsistente con ids enteros estables del seed).
- **Rationale**: mantiene la convención de ids enteros estables de C-03/C-04.

### D4 — Fecha ISO al confirmar
- **Decisión**: `fecha` se genera con `new Date().toISOString()` al confirmar la venta.
- **Alternativas**: `toLocaleDateString()`; timestamp numérico.
- **Rationale**: KB §Venta acepta "string ISO o toLocaleDateString"; ISO es más fácil de comparar y ordenar en tests.

### D5 — Renglón con precio unitario histórico copiado (DD-06)
- **Decisión**: cada renglón confirma guarda `libroId`, `libroTitulo`, `precioUnitario` (copiado del libro seleccionado al momento de agregar), `cantidad` y `subtotal`. El historial lee precios de la venta guardada, no del catálogo.
- **Alternativas**: guardar solo `libroId` y leer precio actual del catálogo (INCORRECTO para la consigna y para DD-06).
- **Rationale**: requisito explícito de Ej. 5 y caso manual 6; el docente modifica precio en localStorage y verifica que el historial no cambie.

### D6 — Duplicado de libro: suma cantidad del existente e informa (DD-07)
- **Decisión**: al agregar un libro que ya está en la venta actual, se suma la cantidad al renglón existente y se muestra un mensaje informativo al usuario; no se crea un renglón nuevo.
- **Alternativas**: solo informar y bloquear; crear renglón separado.
- **Rationale**: UX más fluida cumpliendo RN-VTA-03 y DD-07.

### D7 — Validación de cantidad: entero > 0, sin decimales
- **Decisión**: `validarCantidad(valor)` exige `Number.isInteger(Number(valor)) && Number(valor) > 0`. Rechaza decimales, cero, negativos, vacíos y no numéricos.
- **Alternativas**: `parseInt` (acepta "5abc"); confiar en `min="1"` del HTML.
- **Rationale**: RN-VTA-02 exige entero mayor que cero; el atributo HTML es ayuda de UX, no validación.

### D8 — Render de tablas con `textContent` y `while (firstChild) removeChild`
- **Decisión**: filas creadas con `document.createElement('tr')`/`'td'` y rellenas con `textContent`; tbody se vacía con el patrón de C-03/C-04. Precio con `'$' + Number(precio).toFixed(2)`. Estados vacíos alternan `hidden` en `#ventas-vacio` / `#historial-vacio`.
- **Alternativas**: `innerHTML` con plantillas (prohibido para datos); `Intl.NumberFormat` (cambiaría formato respecto de C-03).
- **Rationale**: RN-TEC-02 y regla dura del proyecto: insertar datos como texto; consistencia visual con el catálogo.

### D9 — Confirmación atómica con `preventDefault` y errores cerca del formulario
- **Decisión**: handler de `submit` llama `preventDefault`; valida cliente seleccionado, ≥1 renglón, cantidades válidas; si hay error muestra texto en `#ventas-error` y no registra; si pasa registra, limpia, muestra `#ventas-exito`.
- **Alternativas**: validar dentro de cada control; `alert()` (no está cerca del formulario).
- **Rationale**: RN-VTA-06/RN-VTA-07; texto de error no depende del color (RN-UI-07).

### D10 — Historial sin edición ni eliminación (RN-VTA-09)
- **Decisión**: `#tabla-historial` muestra solo lectura; el botón "Ver Detalle" abre `#historial-detalle` con `#tabla-detalle-venta` inmutable; no hay botones de editar/eliminar.
- **Alternativas**: permitir edición/baja (prohibido por RN-VTA-09).
- **Rationale**: las ventas confirmadas son inmutables desde la interfaz.

### D11 — Integración clásica con `defer`, sin módulos ES
- **Decisión**: en `index.html`, orden `js/datos.js` → `js/catalogo.js` → `js/libros.js` → `js/clientes.js` → `js/ventas.js` → `js/historial.js`, todos con `defer` y sin `type="module"`. `ventas.js` llama `window.libros.poblarSelectorVentaLibros` y `window.clientes.poblarSelectorVentaClientes` si existen (guard defensivo).
- **Alternativas**: `type="module"` (puede fallar con `file://`); bundle (requiere tooling).
- **Rationale**: RN-TEC-01 y DD-04: entrega abierta directamente en el navegador, sin servidor ni compilación.

### D12 — Tests Node puros, con extensión mínima del shim
- **Decisión**: se agregan `tests/ventas.test.js` y `tests/historial.test.js` con `node:test` y `node:assert/strict`. Las reglas puras se prueban contra funciones exportadas (sin DOM). Para tests de integración se extiende `tests/shim.js` con: `#venta-cantidad` input, `#tabla-renglones` tbody, `#tabla-historial` tbody, `#historial-detalle` div, `#tabla-detalle-venta` tbody, `#ventas-exito`/`#ventas-error`/`#historial-vacio` mensajes, botón "Agregar Renglón", botón "Confirmar Venta", botón "Ver Detalle". No se usa npm ni frameworks.
- **Alternativas**: tests solo manuales; Playwright (no es dependencia del proyecto).
- **Rationale**: el proyecto ya tiene un harness Node que carga scripts clásicos; extenderlo mantiene Strict TDD sin tooling nuevo.

## Risks / Trade-offs

- [El shim actual no modela tablas de renglones/historial ni el input de cantidad] → Extender `tests/shim.js` antes de los tests nuevos y correr la red de seguridad (datos, catalogo, libros, clientes).
- [Precio del catálogo modificado tras confirmar una venta] → Mitigado por DD-06 (precioUnitario copiado en el renglón).
- [Mutación de arrays compartidos (`libreria.ventas`)] → C-06 deberá persistir después de cada confirmación; se documenta para C-06.
- [Selectores de venta poblados por C-04] → C-05 los reutiliza sin modificarlos; si C-04 no está cargado, `poblarSelectorVentaLibros`/`poblarSelectorVentaClientes` no existen y se llama con guard defensivo.

## Migration Plan

1. Extender `tests/shim.js` con elementos de venta y correr la red de seguridad (`datos.test.js`, `catalogo.test.js`, `libros.test.js`, `clientes.test.js`).
2. Escribir `tests/ventas.test.js` y `tests/historial.test.js` (RED).
3. Implementar funciones puras en `js/ventas.js` (`validarCantidad`, `agregarRenglon`, `quitarRenglon`, `calcularTotal`, `validarVenta`, `registrarVenta`, `limpiarVenta`) y en `js/historial.js` (`renderTablaHistorial`, `renderDetalleVenta`, `obtenerVenta`) (GREEN).
4. Implementar render de tablas de renglones/historial/detalle, handlers de "Agregar Renglón", "Confirmar Venta" y "Ver Detalle".
5. Integrar scripts y en `index.html`.
6. Ejecutar los seis archivos de test y verificar manualmente los casos del Ej. 5.
7. Rollback: quitar los dos `<script>` nuevos, borrar `js/ventas.js`/`js/historial.js` y los tests nuevos, revertir `tests/shim.js`; C-04 sigue funcionando.

## Open Questions

- Ninguna bloqueante. El detalle de venta muestra precio unitario, cantidad y subtotal históricos; la consigna no exige mostrar el ISBN del libro en el detalle (opcional).
