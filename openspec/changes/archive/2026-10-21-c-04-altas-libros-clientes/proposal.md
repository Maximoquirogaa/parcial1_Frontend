# Proposal

## Why

C-03 dejó el catálogo renderizado y filtrable desde `window.libreria`, pero la aplicación todavía no permite incorporar libros ni clientes: los formularios de `#vista-libros` y `#vista-clientes` no tienen manejadores, los selectores de editorial/género/autores están vacíos, las tablas de listado no se renderizan y no existe validación alguna. Sin altas válidas no se pueden componer ventas (C-05) ni persistir datos reales (C-06). Este change cubre el Ejercicio 4 de la consigna (US-007, US-008), que vale 15 puntos y es dependencia directa de C-05.

## What Changes

- Se crea `js/libros.js`: genera las opciones de editorial, género (incluida «Sin clasificar») y autores múltiple desde `window.libreria`; valida el alta con RN-LIB-01…08; renderiza `#tabla-libros`; y tras un alta correcta actualiza listado, catálogo, selectores del formulario y selector de libros de ventas sin recargar.
- Se crea `js/clientes.js`: valida el alta de cliente con RN-CLI-01…04; renderiza `#tabla-clientes`; y tras un alta correcta actualiza listado y selector de clientes de ventas sin recargar.
- Se extraen funciones puras de validación y normalización (ISBN, email, precio, ids de relaciones) exportadas en `window.libros` / `window.clientes` para poder probarlas con el harness de Node existente, sin DOM.
- Se conectan ambos formularios con `submit` + `preventDefault`, se muestran los errores cerca del formulario y solo se agrega el registro si todas las comprobaciones pasan.
- Se agrega `refrescar()` a `js/catalogo.js` para re-renderizar el catálogo conservando el filtro de título activo tras un alta de libro.
- Se integran `js/libros.js` y `js/clientes.js` en `index.html` con `defer`, después de `js/datos.js` y `js/catalogo.js`.
- Se ajustan los nodos de error existentes (`#libros-error`, `#clientes-error`) para que funcionen como resumen textual de errores con `role="alert"`, y se agregan los tests `tests/libros.test.js` y `tests/clientes.test.js`.

## Scope

**Incluido**:
- Formularios de alta de libro y de cliente con opciones generadas desde los datos locales.
- Validaciones RN-LIB-01…08 y RN-CLI-01…04, incluidos los casos límite de espacios, ISBN con guiones, email duplicado con distinta capitalización y precio cero/negativo/no numérico.
- Listados `#tabla-libros` / `#tabla-clientes` renderizados con `textContent` y estados de lista vacía.
- Errores textuales cerca del formulario, `preventDefault` y alta atómica.
- Actualización sin recarga de listados, catálogo y selectores relacionados tras un alta válida.

**Excluido**:
- Edición o baja de libros/clientes (no la pide el Ej. 4).
- Persistencia en `localStorage` y seed idempotente (C-06).
- Composición, cálculo y confirmación de ventas (C-05); en C-04 solo se pueblan las opciones de venta.
- Altas/bajas de editoriales, géneros o autores (RN-TEC-04) y validación del dígito de control del ISBN.
- Backend, API, fetch, frameworks, librerías, CDNs y npm (RN-TEC-01/03).

## Capabilities

### New Capabilities

- `altas-libros-clientes`: alta validada de libros y clientes desde formularios con opciones derivadas de los datos locales, render seguro de los listados con `textContent`, errores textuales cerca del formulario y actualización sin recarga de listados, catálogo y selectores relacionados.

### Modified Capabilities

- Ninguna. El comportamiento existente de `app-shell`, `visual-identity` y `datos-catalogo` se respeta; el refresco del catálogo tras un alta se especifica como comportamiento de la nueva capacidad y se implementa reutilizando `filtrarLibros`/`renderCatalogo` de C-03.

## Impact

- **Archivos nuevos**: `js/libros.js`, `js/clientes.js`, `tests/libros.test.js`, `tests/clientes.test.js`.
- **Archivos existentes afectados**: `index.html` (dos `<script defer>` y atributos `role`/`aria-live` en los nodos de error; no se tocan ids ni la estructura de vistas), `js/catalogo.js` (se expone `refrescar()`), `tests/shim.js` (soporte de formularios de libros/clientes, `options`/`selectedOptions` y `reset()`).
- **Dependencias**: C-03 completo ✅ (`window.libreria` con `editoriales`, `generos`, `autores`, `libros`, `clientes`; catálogo renderizado y filtrable).
- **Sistemas/APIs**: ninguno (sin backend, sin fetch, sin librerías, sin npm). `localStorage` queda para C-06.
- **Consumidores posteriores**: C-05 usa los libros y clientes agregados en sus selectores de venta; C-06 persiste los arrays mutados por estos módulos.

## Risks

- [Los datos viven en memoria y se pierden al recargar] → Aceptado para C-04; C-06 agrega `localStorage` y seed idempotente.
- [Acoplamiento de `libros.js` con `catalogo.js` para refrescar el catálogo] → Llamada guardada a `window.catalogo.refrescar()`; si no está disponible, el alta sigue funcionando.
- [El shim de tests no modela formularios ni selectores múltiples] → Se extiende `tests/shim.js` antes de los tests nuevos y se corre la red de seguridad de C-03.
- [Un resumen textual único de errores es menos granular] → Se marca cada campo inválido con `aria-invalid` y se enfoca el primero; el mensaje nombra el campo.
- [ISBN con caracteres distintos de espacios/guiones] → Fuera de alcance: la consigna solo pide normalizar espacios y guiones y no valida dígito de control.
