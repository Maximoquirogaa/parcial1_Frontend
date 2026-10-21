# Tasks

## 1. Red de seguridad y extensión del harness de tests para storage

- [ ] 1.1 Ejecutar `node tests/datos.test.js`, `node tests/catalogo.test.js`, `node tests/libros.test.js`, `node tests/clientes.test.js`, `node tests/ventas.test.js` y `node tests/historial.test.js` y registrar la línea base de tests pasando; si algo falla, detenerse y reportarlo como fallo preexistente (no corregirlo en este change)
- [ ] 1.2 Extender `tests/shim.js` con un shim de `localStorage` (objeto con `getItem`, `setItem`, `removeItem`, `clear` almacenado en memoria del sandbox) para permitir tests de `js/storage.js` sin DOM real; verificar que los 6 archivos de test existentes siguen pasando sin cambios en sus casos

## 2. Tests de storage — Strict TDD (RED → GREEN)

- [ ] 2.1 RED: agregar a `tests/storage.test.js` los casos `2.1 isStorageAvailable devuelve true cuando localStorage está disponible`, `2.1b saveToStorage + loadFromStorage guarda y lee un array`, `2.1c loadFromStorage devuelve null para clave inexistente`, `2.1d loadFromStorage valida que el valor parseado sea un array`; ejecutar `node tests/storage.test.js` y confirmar que fallan porque `js/storage.js` aún no existe
- [ ] 2.2 GREEN: implementar en `js/storage.js` las funciones puras `isStorageAvailable()`, `saveToStorage(clave, datos)`, `loadFromStorage(clave)` con claves constantes `CLAVE_LIBROS`, `CLAVE_CLIENTES`, `CLAVE_VENTAS`; verificar que los casos 2.1…2.1d pasan con `node tests/storage.test.js`
- [ ] 2.3 RED: agregar a `tests/storage.test.js` los casos `2.3 seedIfEmpty carga seed cuando no existen claves`, `2.3b seedIfEmpty no duplica cuando ya existen claves`, `2.3c seedIfEmpty persiste el seed por primera vez`; ejecutar y confirmar que fallan
- [ ] 2.4 GREEN: implementar `seedIfEmpty()` que usa `loadFromStorage` para verificar existencia y `saveToStorage` para persistir el seed solo si faltan claves; verificar que todos los casos de storage pasan con `node tests/storage.test.js`
- [ ] 2.5 RED: agregar a `tests/storage.test.js` los casos `2.5 isStorageAvailable devuelve false cuando localStorage lanza (modo privado)`, `2.5b degradación a memoria sin romper`; ejecutar y confirmar que fallan
- [ ] 2.6 GREEN: implementar detección de `localStorage` no disponible con try/catch en `isStorageAvailable`; verificar que 2.5…2.5b pasan y que los casos previos siguen verdes con `node tests/storage.test.js`

## 3. Integración de storage en datos.js (carga al inicio)

- [ ] 3.1 RED: agregar casos `3.1 datos.js carga libros/clientes desde storage si existen`, `3.1b datos.js usa seed como fallback si no hay storage`, `3.1c datos.js no duplica seed al reabrir`; ejecutar y confirmar que fallan
- [ ] 3.2 GREEN: modificar `js/datos.js` para llamar `loadFromStorage` al inicializar y usar seed solo si `storage` devuelve null/inexistente; verificar que los casos nuevos pasan y que `node tests/datos.test.js` sigue verde

## 4. Persistencia tras mutaciones en libros.js, clientes.js, ventas.js

- [ ] 4.1 RED: agregar casos `4.1 libros.js guarda en storage tras alta de libro`, `4.2 clientes.js guarda en storage tras alta de cliente`, `4.3 ventas.js guarda en storage tras confirmación de venta`; ejecutar y confirmar que fallan
- [ ] 4.2 GREEN: modificar `js/libros.js` (`saveToStorage(CLAVE_LIBROS, li.libros)` tras push), `js/clientes.js` (`saveToStorage(CLAVE_CLIENTES, li.clientes)` tras push) y `js/ventas.js` (`saveToStorage(CLAVE_VENTAS, li.ventas)` tras registrarVenta); verificar que todos los casos pasan con `node tests/storage.test.js` y que la red de seguridad sigue verde

## 5. Integración en index.html

- [ ] 5.1 RED: agregar caso `5.1 index.html carga js/storage.js con defer antes de js/datos.js` y `5.1b scripts sin type=module`; ejecutar y confirmar que fallan
- [ ] 5.2 GREEN: agregar `<script src="js/storage.js" defer>` antes de `<script src="js/datos.js" defer>`; verificar que 5.1/5.1b pasan y que toda la suite de tests sigue verde

## 6. README.md de entrega

- [ ] 6.1 Crear `README.md` con secciones requeridas por US-013: autores, pasos para abrir sin npm, navegación, funcionalidades, ubicación de datos iniciales (claves de localStorage), límites de localStorage y resultados de los 8 casos manuales de Ej. 6 (resultados reales, no fingidos)
- [ ] 6.2 Verificar que el README identifica la ubicación del catálogo guardado para la comprobación guiada de precio histórico

## 7. Verificación final de integración

- [ ] 7.1 Ejecutar `node tests/datos.test.js`, `node tests/catalogo.test.js`, `node tests/libros.test.js`, `node tests/clientes.test.js`, `node tests/ventas.test.js`, `node tests/historial.test.js` y `node tests/storage.test.js`; los siete deben pasar sin fallos
- [ ] 7.2 Ejecutar los 8 casos manuales de Ej. 6 en el navegador y registrar resultados reales en el README (sin fingir aprobaciones): persistencia al recargar, sin duplicar seed, localStorage disponible/no disponible, precio histórico conservado, etc.
- [ ] 7.3 Verificar rollback: quitar `js/storage.js` y revertir módulos deja C-05 funcionando (altas de libros y clientes, ventas, historial siguen operativos sin persistencia)
