# Proposal

## Why

C-05 dejó `js/ventas.js` y `js/historial.js` funcionando con composición validada de ventas, cálculo de subtotal/total, confirmación con precio histórico e historial inmutable. Pero la aplicación todavía no persiste datos: al recargar la página se pierde todo lo agregado (libros, clientes, ventas). US-012 (persistencia sin duplicados) y US-013 (README de entrega) dependen de este change. C-06 es el último change (Fase 5 — Cierre) y cubre el Flujo 7 (carga inicial y persistencia).

## What Changes

- Se crea `js/storage.js`: `loadFromStorage(clave)`, `saveToStorage(clave, datos)`, `seedIfEmpty()` y `isStorageAvailable()`; claves `libreria_libros`, `libreria_clientes`, `libreria_ventas`; seed idempotente solo en primer inicio; degradación a memoria si `localStorage` no está disponible.
- Se integra `js/storage.js` en `index.html` con `defer`, antes de `js/datos.js` para que el seed esté disponible al inicializar.
- Se modifican `js/datos.js`, `js/libros.js`, `js/clientes.js` y `js/ventas.js` para restaurar al iniciar y persistir tras cada mutación (alta de libro/cliente, confirmación de venta).
- Se crea `README.md` de entrega: autores, pasos para abrir sin npm, navegación, funcionalidades, ubicación de datos iniciales, límites de `localStorage` y resultados de los 8 casos manuales de Ej. 6.
- Se extiende `tests/shim.js` con un shim de `localStorage` para permitir tests de storage sin DOM real.
- Se agregan tests `tests/storage.test.js` con `node:test` + `node:assert/strict`.

## Scope

**Incluido**:

- Persistencia en `localStorage` de libros, clientes y ventas (RN-PER-01).
- Seed idempotente: ejemplos solo en primer inicio, sin duplicar al reabrir (RN-PER-02).
- Degradación a memoria si `localStorage` no disponible (Flujo 7, caso de error).
- Integración con módulos existentes: cargar al inicio, guardar tras cada mutación.
- README.md con todos los requerimientos de US-013 (RN-PER-03).
- Tests puros de storage con shim de `localStorage`; sin DOM real, sin npm.
- 8 casos manuales de Ej. 6 ejecutados y registrados con resultados reales.

**Excluido**:

- Edición o baja de ventas (ya excluido en C-05, RN-VTA-09).
- Backend, API, fetch, frameworks, librerías, CDNs, npm (RN-TEC-01/03).
- Cambios de estructura de vistas o identidad visual (C-01/C-02).

## Capabilities

### New Capabilities

- `persistencia`: `localStorage` con claves documentadas, seed idempotente, restauración sin duplicados, degradación a memoria con aviso.

### Modified Capabilities

- `datos.js`: expone seed y arrays que pueden ser restaurados desde storage; llama `seedIfEmpty()` al inicializar.
- `libros.js`: persiste libros en `localStorage` tras cada alta.
- `clientes.js`: persiste clientes en `localStorage` tras cada alta.
- `ventas.js`: persiste ventas en `localStorage` tras cada confirmación.
- `historial.js`: lee ventas restauradas desde storage (sin cambios de comportamiento, solo fuente de datos).

## Impact

- **Archivos nuevos**: `js/storage.js`, `tests/storage.test.js`, `README.md`.
- **Archivos existentes afectados**: `index.html` (`<script defer>` para `js/storage.js` antes de `js/datos.js`); `js/datos.js`, `js/libros.js`, `js/clientes.js`, `js/ventas.js` (guardar tras mutaciones); `tests/shim.js` (shim de `localStorage`).
- **Dependencias**: C-05 completo ✅ (`window.libreria` con `libros[]`, `clientes[]`, `ventas[]`). C-03/C-04 ✅.
- **Sistemas/APIs**: `localStorage` del navegador (depende del navegador, perfil y ubicación de apertura; no comparte información entre usuarios — RN-PER-03).
- **Consumidores posteriores**: ninguno (C-06 es el último change, Fase 5 — Cierre).

## Risks

- [`localStorage` no disponible en modo privado/restrictivo] → `isStorageAvailable()` detecta y degrada a memoria con aviso (Flujo 7, caso de error).
- [Seed duplicado al reabrir] → `seedIfEmpty()` verifica existencia de claves antes de cargar ejemplos (RN-PER-02).
- [JSON serializable: fechas ISO, precios números] → `saveToStorage` usa `JSON.stringify`, `loadFromStorage` usa `JSON.parse` con validación de array.
- [Tests de storage requieren shim de `localStorage`] → Extender `tests/shim.js` con un objeto `localStorage` simulado (`getItem`/`setItem`/`removeItem`/`clear`).
- [Orden de carga: storage antes de datos] → `js/storage.js` se carga antes de `js/datos.js` en `index.html`; `datos.js` usa `loadFromStorage` con fallback a seed.
