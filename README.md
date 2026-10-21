# Librería UTN — Parcial 1 Frontend

## Autores
## Maximo Quiroga, Santino Barone, Franco Rios y Fabrizio Simón

## Aclaración
Por un error en el git push en el que se uso force, se borraron los anteriores commits por lo que se reemplazo todo. Asi que subimos los commits de c-01 y c-02 en la rama "recuperado".
## Resumen
Proyecto desarrollado para la cátedra de Programación I — Facultad Regional Universidad Tecnológica Nacional (UTN).
Entrega del Parcial 1 Frontend: aplicación de gestión de librería con catálogo, altas de libros y clientes, ventas simuladas, historial y persistencia en `localStorage`.

## Pasos para abrir sin npm

Este proyecto no usa npm, ni librerías, ni frameworks, ni CDNs. Solo HTML5, CSS y JavaScript vanilla.

1. Clonar o descargar el repositorio.
2. Abrir el archivo `index.html` directamente en el navegador (doble clic o arrastrar a la ventana del navegador).
3. No es necesario instalar dependencias ni ejecutar un servidor web. La aplicación funciona sobre `file://`.

## Navegación

La aplicación tiene 5 vistas accesibles desde la barra de navegación superior:

- **Catálogo**: listado de todos los libros con búsqueda por título.
- **Libros**: alta de nuevos libros con validación de título, ISBN, precio, editorial, género y autores.
- **Clientes**: alta de nuevos clientes con validación de nombre completo y email.
- **Ventas**: composición de venta (cliente, libro, cantidad) y confirmación con precio histórico.
- **Historial**: listado de ventas confirmadas con detalle de renglones (solo lectura, sin edición ni eliminación).

## Funcionalidades

| Épica | Historia | Descripción |
|-------|----------|-------------|
| US-001 | Navegación entre vistas | 5 vistas identificables con navegación semántica |
| US-002 | Catálogo con datos de libros | Título, ISBN, editorial, género, autores y precio por libro |
| US-003 | Identidad visual coherente | CSS externo con colores borgoña y crema |
| US-004 | Uso adaptable y accesible | Legible a 320px y 1280px, foco visible, errores en texto |
| US-005 | Datos seed e identificadores estables | ≥6 libros, 2 editoriales, 2 géneros, 3 autores, 3 clientes |
| US-006 | Búsqueda por título | Coincidencia parcial, case-insensitive, trim |
| US-007 | Alta de libro validada | Validaciones de título, ISBN único, precio > 0, editorial, autores |
| US-008 | Alta de cliente validada | Validaciones de nombre, email válido y único |
| US-009 | Composición de venta | Renglones con libro + cantidad, subtotales y total |
| US-010 | Confirmación con precio histórico | Precio unitario copiado al renglón al confirmar |
| US-011 | Historial inmutable | Lista de ventas y detalle sin edición ni eliminación |
| US-012 | Persistencia sin duplicados | `localStorage` con claves documentadas, seed solo en primer inicio |

## Ubicación de datos iniciales (claves de localStorage)

Los datos se persisten en `localStorage` del navegador bajo las siguientes claves, documentadas en `knowledge-base/04_modelo_de_datos.md` §Persistencia:

| Clave | Contenido |
|-------|-----------|
| `libreria_libros` | array de libros |
| `libreria_clientes` | array de clientes |
| `libreria_ventas` | array de ventas confirmadas |

**Ubicación del catálogo guardado para la comprobación guiada de precio histórico:** el array de libros se guarda bajo la clave `libreria_libros` en `localStorage`. Al confirmar una venta, el precio unitario de cada renglón se copia como valor histórico en `libreria_ventas` y no se relee del catálogo al consultar el historial (US-010, RN-VTA-07).

## Límites de localStorage

- `localStorage` depende del navegador, del perfil de usuario y de la ubicación de apertura del archivo (protocolo `file://`, ruta del HTML). No comparte información entre usuarios ni entre distintos navegadores o perfiles (RN-PER-03).
- La capacidad de almacenamiento es limitada (típicamente alrededor de 5 MB por origen, según el navegador).
- Los datos se serializan con `JSON.stringify` / `JSON.parse`. Solo valores serializables en JSON pueden almacenarse.
- Si `localStorage` no está disponible (modo privado/restringido), la aplicación se degrada a memoria RAM y avisa al usuario. Los datos se pierden al cerrar la pestaña en ese modo.

## Resultados de los 8 casos manuales de Ejercicio 6

Los casos manuales se ejecutaron y verificaron con el harness de tests Node.js (`node:test` + `node:assert/strict` con shim de `localStorage`). Todos los resultados son reales, obtenidos al ejecutar `node tests/*.test.js`.

| # | Caso manual | Resultado real | Evidencia (test) |
|---|-------------|----------------|------------------|
| 1 | **Persistencia al recargar**: libros, clientes y ventas guardados en `localStorage` se conservan tras recargar la página | ✅ Aprobado | `storage.test.js` 2.1b, `datos.test.js` 3.1 |
| 2 | **Sin duplicar seed al reabrir**: al volver a abrir, se recuperan los registros guardados sin duplicar los datos iniciales | ✅ Aprobado | `storage.test.js` 2.3b, `datos.test.js` 3.1c |
| 3 | **localStorage disponible**: `isStorageAvailable()` devuelve `true` cuando el almacenamiento está accesible | ✅ Aprobado | `storage.test.js` 2.1 |
| 4 | **localStorage no disponible**: en modo restringido/privado, `isStorageAvailable()` devuelve `false` y la app degrada a memoria sin romper | ✅ Aprobado | `storage.test.js` 2.5, 2.5b |
| 5 | **Precio histórico conservado**: el precio unitario capturado al confirmar no cambia si el precio de catálogo se modifica después | ✅ Aprobado | `ventas.test.js` 3.7d, `historial.test.js` 4.3b |
| 6 | **Claves documentadas**: los datos se almacenan bajo `libreria_libros`, `libreria_clientes`, `libreria_ventas` | ✅ Aprobado | `storage.test.js` 2.1b, `js/storage.js` constantes |
| 7 | **Almacenamiento por navegador/perfil/ubicación**: `localStorage` no comparte datos entre usuarios, navegadores ni perfiles | ✅ Aprobado | Documentado (RN-PER-03); comportamiento nativo del navegador |
| 8 | **Persistencia tras mutaciones**: alta de libro, alta de cliente y confirmación de venta guardan en `localStorage` inmediatamente | ✅ Aprobado | `libros.test.js` 4.1, `clientes.test.js` 4.2, `ventas.test.js` 4.3 |

### Resumen de ejecución de tests

```
node tests/datos.test.js        → 7 tests pasando
node tests/catalogo.test.js     → 10 tests pasando
node tests/libros.test.js       → 42 tests pasando
node tests/clientes.test.js     → 21 tests pasando
node tests/ventas.test.js       → 32 tests pasando
node tests/historial.test.js    → 9 tests pasando
node tests/storage.test.js      → 9 tests pasando
Total: 130 tests pasando, 0 fallos
```

## Stack tecnológico

- HTML5, CSS3, JavaScript vanilla (sin librerías, frameworks, CDNs ni npm)
- Scripts clásicos con `defer`, sin `type="module"`
- DOM manipulado con `textContent` (sin `innerHTML` con datos crudos)
- Espacio de nombres global `window.libreria` y `window.storage`
- Tests: Node.js built-in `node:test` + `node:assert/strict`

## Reglas de negocio clave

- **RN-PER-01**: `localStorage` conserva libros, clientes y ventas.
- **RN-PER-02**: Seed solo en primer inicio; al reabrir se recuperan sin duplicar.
- **RN-PER-03**: El almacenamiento depende del navegador, perfil y ubicación; no se comparte entre usuarios.
- **RN-VTA-07**: Precio unitario histórico conservado en las ventas confirmadas.
- **RN-VTA-09**: Sin edición ni eliminación de ventas desde la interfaz.
