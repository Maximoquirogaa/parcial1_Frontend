# Proposal

## Why

C-04 dejó `js/libros.js` y `js/clientes.js` funcionando con alta validada, listados renderizados y selectores de venta poblados (`#venta-libro`, `#venta-cliente`), pero la aplicación todavía no permite componer ventas ni consultar un historial inmutable: no hay renglones, no hay cálculo de subtotal/total, no hay confirmación de venta, no hay persistencia de ventas y no existe lista de ventas pasadas. Sin este change no se pueden ejercitar US-009, US-010 ni US-011 (Ejercicio 5, 20 puntos), que es dependencia directa de C-06 (persistencia). Este change cubre el Flujo 5 (composición y confirmación de venta) y el Flujo 6 (consulta de historial de ventas).

## What Changes

- Se crea `js/ventas.js`: formulario de venta con selector de cliente (`#venta-cliente`), selector de libro (`#venta-libro`), input de cantidad (`#venta-cantidad`), botón "Agregar Renglón", tabla de resumen (`#tabla-renglones`), total de venta, validaciones RN-VTA-01…06, confirmación con `preventDefault`, registro de venta con precio unitario copiado como valor histórico (DD-06), limpieza de formulario y mensaje de éxito (RN-VTA-07, RN-VTA-08).
- Se crea `js/historial.js`: render de lista de ventas confirmadas (`#tabla-historial`) con id, fecha, cliente, total; detalle inmutable de renglones al hacer clic "Ver Detalle" (`#historial-detalle`, `#tabla-detalle-venta`); sin opciones de edición ni eliminación (RN-VTA-09).
- Se crea `window.libreria.ventas` como array de ventas confirmadas, con ids estables generados por `siguienteId(ventas)`.
- Se integran `js/ventas.js` y `js/historial.js` en `index.html` con `defer`, después de `js/datos.js` y `js/catalogo.js` (y después de `js/libros.js`/`js/clientes.js` para reutilizar `poblarSelectorVentaLibros`/`poblarSelectorVentaClientes`).
- Se extiende `tests/shim.js` con elementos de venta (selectores, cantidad, tablas de renglones/historial/detalle, mensajes de éxito/error).
- Se agregan tests `tests/ventas.test.js` y `tests/historial.test.js` con `node:test` + `node:assert/strict`.

## Scope

**Incluido**:
- Composición de venta: cliente, libro, cantidad entera > 0; agregar renglón; sin duplicados (modifica cantidad del existente e informa, DD-07).
- Cálculos: subtotal = cantidad × precio unitario; total = suma de subtotales; 2 decimales (RN-VTA-05).
- Confirmación: valida cliente + ≥1 renglón + cantidades válidas; registra id/fecha/cliente/renglones/total; precio unitario histórico; limpia formulario; mensaje éxito (RN-VTA-06…08).
- Historial: lista inmutable de ventas; detalle de renglones con precios históricos; sin edición ni eliminación (RN-VTA-09).
- Tests puros de reglas de negocio y de integración con shim extendido; sin DOM real, sin npm.
- Actualización de `#venta-libro`/`#venta-cliente` tras alta de libro/cliente (ya poblados por C-04; C-05 los reutiliza).

**Excluido**:
- Persistencia en `localStorage` y seed idempotente (C-06).
- Edición o baja de ventas (RN-VTA-09 lo prohíbe).
- Validación de dígito de control de ISBN, gestión de editoriales/géneros/autores (RN-TEC-04).
- Backend, API, fetch, frameworks, librerías, CDNs, npm (RN-TEC-01/03).

## Capabilities

### New Capabilities

- `venta-historial`: composición validada de ventas con renglones, cálculo de subtotal/total, confirmación con precio histórico, lista inmutable de ventas y detalle de renglones, todo con `textContent` y sin `innerHTML` con datos.

### Modified Capabilities

- Ninguna. El comportamiento existente de `app-shell`, `visual-identity`, `datos-catalogo` y `altas-libros-clientes` se respeta. C-05 reutiliza `poblarSelectorVentaLibros`/`poblarSelectorVentaClientes` de C-04 sin modificarlos.

## Impact

- **Archivos nuevos**: `js/ventas.js`, `js/historial.js`, `tests/ventas.test.js`, `tests/historial.test.js`.
- **Archivos existentes afectados**: `index.html` (dos `<script defer>` agregados para `js/ventas.js` y `js/historial.js`); `tests/shim.js` (elementos de venta: `#venta-cantidad`, `#tabla-renglones`, `#tabla-historial`, `#historial-detalle`, `#tabla-detalle-venta`, `#ventas-exito`, `#ventas-error`, `#historial-vacio`, botones).
- **Dependencias**: C-04 completo ✅ (`window.libreria` con `libros[]`, `clientes[]`; `poblarSelectorVentaLibros`/`poblarSelectorVentaClientes`; `window.libros`/`window.clientes` expuestos). C-03 ✅ (`window.libreria`, catálogo, `refrescar()`).
- **Sistemas/APIs**: ninguno (sin backend, sin fetch, sin librerías, sin npm). `localStorage` queda para C-06.
- **Consumidores posteriores**: C-06 persiste `libreria.ventas` y restaura ventas al abrir.

## Risks

- [El shim actual no modela tablas de renglones/historial ni el input de cantidad] → Extender `tests/shim.js` antes de escribir los tests nuevos y volver a correr `datos.test.js` / `catalogo.test.js` / `libros.test.js` / `clientes.test.js` como red de seguridad.
- [Precio del catálogo modificado después de confirmar una venta] → DD-06: cada renglón copia `precioUnitario` al confirmar; el historial lee de la venta guardada, no del catálogo.
- [Libro repetido en la misma venta] → DD-07: suma/actualiza cantidad del renglón existente e informa al usuario.
- [Cantidad decimal, cero o negativa] → `Number.isInteger(cantidad) && cantidad > 0` como validación estricta (RN-VTA-02).
- [Confirmación sin cliente o sin renglones] → `preventDefault` + validación atómica; mensaje de error cerca del formulario (RN-VTA-06).
