# Design

## Context

C-05 dejó `js/datos.js` exponiendo `window.libreria` con `editoriales`, `generos`, `autores`, `libros` y `clientes`; `js/libros.js` y `js/clientes.js` con alta validada, listados y selectores de venta; `js/ventas.js` con composición de venta, cálculo de total, confirmación con precio histórico; `js/historial.js` con lista inmutable de ventas y detalle de renglones; e `index.html` con todas las vistas maquetadas. El harness de tests es Node puro (`node:test` + `tests/shim.js`), sin npm.

Ver `proposal.md` para la motivación. Las reglas de comportamiento están en `knowledge-base/05_reglas_de_negocio.md` §RN-PER-01…03, `knowledge-base/04_modelo_de_datos.md` §Persistencia, `knowledge-base/06_funcionalidades.md` §US-012/§US-013 y `knowledge-base/07_flujos_principales.md` §Flujo 7.

## Goals / Non-Goals

**Goals:**

- `js/storage.js` con `loadFromStorage(clave)`, `saveToStorage(clave, datos)`, `seedIfEmpty()`, `isStorageAvailable()` y claves constantes `CLAVE_LIBROS`, `CLAVE_CLIENTES`, `CLAVE_VENTAS`.
- Claves `libreria_libros`, `libreria_clientes`, `libreria_ventas` documentadas en `knowledge-base/04_modelo_de_datos.md` §Persistencia.
- Seed idempotente: ejemplos solo si no existen claves en `localStorage` (RN-PER-02).
- Degradación a memoria si `localStorage` no disponible, con aviso al usuario (Flujo 7, caso de error).
- Integrar storage en `datos.js` (cargar al inicio), `libros.js` (guardar tras alta), `clientes.js` (guardar tras alta), `ventas.js` (guardar tras confirmación).
- README.md de entrega con todos los requerimientos de US-013 (RN-PER-03).
- Funciones puras de storage testeables con el harness Node sin DOM (con shim de `localStorage`).
- Scripts clásicos con `defer`, sin `type="module"`, orden `storage → datos → catálogo → libros → clientes → ventas → historial`.

**Non-Goals:**

- Edición o baja de ventas (RN-VTA-09).
- Backend, API, fetch, frameworks, librerías, CDNs, npm.
- Cambios de estructura de vistas o identidad visual.

## Decisions

### D1 — Módulo `js/storage.js` con funciones puras de persistencia
- **Decisión**: `js/storage.js` expone `window.storage` con `loadFromStorage`, `saveToStorage`, `seedIfEmpty`, `isStorageAvailable` y claves constantes.
- **Alternativas**: persistir dentro de cada módulo; objeto `localStorage` directo en cada módulo.
- **Rationale**: centraliza la lógica de persistencia, es testeable de forma aislada y respeta el patrón de un módulo por responsabilidad (C-03/C-04/C-05).

### D2 — Claves de `localStorage` documentadas
- **Decisión**: `libreria_libros`, `libreria_clientes`, `libreria_ventas` (según KB §Persistencia).
- **Alternativas**: claves con prefijo diferente; una sola clave con todo el estado.
- **Rationale**: claves explícitas y documentadas facilitan la comprobación guiada del docente y cumplen US-012.

### D3 — Seed idempotente solo en primer inicio
- **Decisión**: `seedIfEmpty()` lee cada clave; si no existe, carga el seed de `datos.js` y lo persiste con `saveToStorage`; si existe, no hace nada (RN-PER-02).
- **Alternativas**: siempre sobrescribir; siempre cargar seed y mezclar.
- **Rationale**: cumple RN-PER-02 (sin duplicar datos iniciales al reabrir).

### D4 — Degradación a memoria si `localStorage` no disponible
- **Decisión**: `isStorageAvailable()` intenta `setItem`/`removeItem` de prueba; si falla, devuelve `false` y los módulos trabajan en memoria con aviso textual (Flujo 7, caso de error).
- **Alternativas**: lanzar excepción; silenciar el error.
- **Rationale**: modo privado/restrictivo del navegador no debe romper la aplicación; el aviso cumple el principio de fallar rápido con información clara.

### D5 — Serialización JSON con validación de array
- **Decisión**: `saveToStorage` usa `JSON.stringify(datos)`; `loadFromStorage` usa `JSON.parse` y verifica que el resultado sea un array (o devuelve `null` si no).
- **Alternativas**: serialización personalizada; confiar ciegamente en `JSON.parse`.
- **Rationale**: `JSON` es nativo, no requiere librerías; la validación evita datos corruptos en `localStorage`.

### D6 — Integración con módulos existentes (guardar tras mutación)
- **Decisión**: `datos.js` llama `seedIfEmpty()` al inicializar; `libros.js` llama `saveToStorage(CLAVE_LIBROS, li.libros)` tras `push`; `clientes.js` llama `saveToStorage(CLAVE_CLIENTES, li.clientes)` tras `push`; `ventas.js` llama `saveToStorage(CLAVE_VENTAS, li.ventas)` tras `registrarVenta`.
- **Alternativas**: persistir en un único punto central; persistir cada cambio individual.
- **Rationale**: mutar en sitio + persistir tras cada mutación evita desincronizaciones y es simple (patrón de C-05 con `ventas`).

### D7 — Orden de carga en `index.html`
- **Decisión**: `js/storage.js` se carga primero (antes de `js/datos.js`), todos con `defer` y sin `type="module"`.
- **Alternativas**: `storage.js` después de `datos.js`; `type="module"`.
- **Rationale**: `datos.js` necesita `loadFromStorage` disponible al inicializar; `file://` compatible con `defer` (RN-TEC-01, DD-04).

### D8 — Tests Node puros con shim de `localStorage`
- **Decisión**: `tests/storage.test.js` con `node:test` + `node:assert/strict`; `tests/shim.js` se extiende con un objeto `localStorage` simulado (`getItem`/`setItem`/`removeItem`/`clear` con almacenamiento en memoria del shim).
- **Alternativas**: tests solo manuales; Playwright.
- **Rationale**: el proyecto ya tiene un harness Node; extenderlo mantiene Strict TDD sin tooling nuevo.

## Risks / Trade-offs

- [`localStorage` no disponible] → Mitigado por D4 (`isStorageAvailable` + degradación a memoria).
- [Seed duplicado] → Mitigado por D3 (`seedIfEmpty` verifica claves existentes).
- [Datos corruptos en `localStorage`] → Mitigado por D5 (validación de array tras `JSON.parse`).
- [Orden de carga] → Mitigado por D7 (`storage.js` antes de `datos.js`).

## Migration Plan

1. Extender `tests/shim.js` con shim de `localStorage` y correr la red de seguridad (`datos.test.js`, `catalogo.test.js`, `libros.test.js`, `clientes.test.js`, `ventas.test.js`, `historial.test.js`).
2. Escribir `tests/storage.test.js` (RED) con casos de `loadFromStorage`, `saveToStorage`, `seedIfEmpty`, `isStorageAvailable`.
3. Implementar `js/storage.js` (GREEN) y verificar que los tests de storage pasan.
4. Modificar `js/datos.js` para cargar desde storage al inicializar (con fallback a seed).
5. Modificar `js/libros.js`, `js/clientes.js`, `js/ventas.js` para persistir tras cada mutación.
6. Integrar `<script src="js/storage.js" defer>` en `index.html` antes de `js/datos.js`.
7. Crear `README.md` con todas las secciones de US-013.
8. Ejecutar los 8 casos manuales de Ej. 6 y registrar resultados reales en el README.
9. Ejecutar toda la suite de tests y verificar que todo pasa.
10. Rollback: quitar `js/storage.js`, revertir modificaciones a módulos, quitar `<script>` de storage, quitar `README.md`; C-05 sigue funcionando sin persistencia.

## Open Questions

- Ninguna bloqueante. El README debe incluir resultados reales de los 8 casos manuales (no fingir aprobaciones) y la ubicación del catálogo guardado para la comprobación guiada de precio histórico.
