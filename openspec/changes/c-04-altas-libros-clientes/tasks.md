# Tasks

## 1. Red de seguridad y extensión del harness

- [x] 1.1 Ejecutar `node tests/datos.test.js` y registrar la línea base de tests pasando; si algo falla, detenerse y reportarlo como fallo preexistente (no corregirlo en este change)
- [x] 1.2 Ejecutar `node tests/catalogo.test.js` y registrar la línea base de tests pasando; si algo falla, detenerse y reportarlo como fallo preexistente
- [x] 1.3 Extender `tests/shim.js` con soporte para `#vista-libros form` y `#vista-clientes form` en `querySelector`, `select` con `options`/`selectedOptions`/`multiple`, `option.selected`, `option.value`, `form.reset()`, `document.createElement('option')` y `remove()`; verificar que `node tests/datos.test.js` y `node tests/catalogo.test.js` siguen pasando sin cambios en sus casos

## 2. Validación pura de libros (Strict TDD)

- [x] 2.1 RED: agregar a `tests/libros.test.js` los casos `2.1 normalizarIsbn quita espacios/guiones y mayúsculas`, `2.1b normalizarIsbn con ISBN vacío` y `2.2 siguienteId usa max+1`; ejecutar `node tests/libros.test.js` y confirmar que fallan porque `js/libros.js` aún no existe
- [x] 2.2 GREEN: implementar en `js/libros.js` las funciones puras `normalizarIsbn` y `siguienteId` exportadas en `window.libros`; verificar que los casos 2.1, 2.1b y 2.2 pasan con `node tests/libros.test.js`
- [x] 2.3 RED: agregar a `tests/libros.test.js` los casos de RN-LIB-01 (`título vacío`, `solo espacios`, `ISBN vacío`, `ISBN solo guiones`) y RN-LIB-02 (`ISBN exacto duplicado`, `duplicado con guiones/espacios`, `duplicado con distinta capitalización`, `ISBN nuevo`); ejecutar `node tests/libros.test.js` y confirmar que fallan
- [x] 2.4 GREEN: implementar `validarLibro` para RN-LIB-01 y RN-LIB-02; verificar que los casos nuevos pasan y que 2.1/2.2 siguen verdes con `node tests/libros.test.js`
- [x] 2.5 RED: agregar a `tests/libros.test.js` los casos de RN-LIB-03 (`precio 0`, `negativo`, `vacío`, `no numérico`, `positivo`) y RN-LIB-04 (`sin editorial`, `editorial inexistente`, `editorial existente`); ejecutar y confirmar que fallan
- [x] 2.6 GREEN: implementar `parsearPrecio` y las validaciones de precio/editorial; verificar que los casos nuevos pasan con `node tests/libros.test.js`
- [x] 2.7 RED: agregar a `tests/libros.test.js` los casos de RN-LIB-05 (`sin autores`, `autor inexistente`, `varios autores existentes`) y RN-LIB-06 (`sin género ⇒ generoId null`, `género existente`, `género inexistente`); ejecutar y confirmar que fallan
- [x] 2.8 GREEN: implementar las validaciones de autores y género; verificar que todos los casos de validación de libros pasan con `node tests/libros.test.js`

## 3. Formulario, listado y refresco de libros

- [x] 3.1 RED: agregar a `tests/libros.test.js` los casos `3.1 renderTablaLibros una fila por libro`, `3.1b libro sin género muestra «Sin clasificar»`, `3.1c precio con formato $ y dos decimales`, `3.1d celdas por textContent sin innerHTML`, `3.2 estado vacío oculta/muestra #libros-vacio`, `3.3 poblarSelectores genera editoriales/géneros/autores y «Sin clasificar»` y `3.3b select de autores permite múltiples`; ejecutar y confirmar que fallan
- [x] 3.2 GREEN: implementar `renderTablaLibros`, el manejo de `#libros-vacio` y `poblarSelectores` en `js/libros.js`; verificar que los casos 3.1…3.3b pasan con `node tests/libros.test.js`
- [x] 3.3 RED: agregar a `tests/libros.test.js` los casos `3.4 submit llama preventDefault`, `3.5 errores textuales en #libros-error y aria-invalid en el primer campo inválido`, `3.5b alta atómica: con un error no se agrega ningún libro y se conservan los valores`, `3.6 alta válida agrega exactamente un libro con id nuevo`; ejecutar y confirmar que fallan
- [x] 3.4 GREEN: implementar el handler de `submit`, el resumen de errores, `aria-invalid`/`aria-describedby` y el foco del primer campo inválido; verificar que 3.4…3.6 pasan con `node tests/libros.test.js`
- [x] 3.5 RED: agregar a `tests/libros.test.js` los casos `3.7 tras alta se actualizan #tabla-libros, catálogo y #venta-libro`, `3.7b formulario limpio y #libros-exito visible`, `3.7c no se recarga la página`; agregar a `tests/catalogo.test.js` el caso `3.8 refrescar() conserva el filtro activo`; ejecutar ambos archivos y confirmar que fallan
- [x] 3.6 GREEN: implementar el refresco posterior al alta y agregar `refrescar()` a `js/catalogo.js`; verificar que 3.7…3.7c pasan con `node tests/libros.test.js` y que 3.8 y los casos previos pasan con `node tests/catalogo.test.js`

## 4. Validación, listado y formulario de clientes (Strict TDD)

- [x] 4.1 RED: agregar a `tests/clientes.test.js` los casos `4.1 normalizarEmail aplica trim+lowercase`, `4.2 RN-CLI-01 nombre vacío/solo espacios`, `4.2b RN-CLI-01 email vacío/solo espacios`, `4.3 RN-CLI-02 email sin @/sin dominio/sin punto/con espacios internos/email válido`, `4.4 RN-CLI-03 email exacto duplicado/duplicado en mayúsculas/duplicado con espacios exteriores/email nuevo`; ejecutar `node tests/clientes.test.js` y confirmar que fallan
- [x] 4.2 GREEN: implementar en `js/clientes.js` `normalizarEmail` y `validarCliente` con RN-CLI-01…03, exportados en `window.clientes`; verificar que 4.1…4.4 pasan con `node tests/clientes.test.js`
- [x] 4.3 RED: agregar a `tests/clientes.test.js` los casos `4.5 renderTablaClientes una fila por cliente con id/nombre/email`, `4.5b celdas por textContent sin innerHTML`, `4.6 estado vacío muestra #clientes-vacio`, `4.7 #venta-cliente se puebla desde clientes[]`; ejecutar y confirmar que fallan
- [x] 4.4 GREEN: implementar `renderTablaClientes`, el estado vacío y `poblarSelectorVentaClientes`; verificar que 4.5…4.7 pasan con `node tests/clientes.test.js`
- [x] 4.5 RED: agregar a `tests/clientes.test.js` los casos `4.8 submit llama preventDefault`, `4.9 errores textuales en #clientes-error y aria-invalid`, `4.9b alta atómica con un error`, `4.10 alta válida agrega un cliente y actualiza listado y #venta-cliente`, `4.10b formulario limpio y #clientes-exito visible`, `4.10c nombre con <b> se inserta como texto`; ejecutar y confirmar que fallan
- [x] 4.6 GREEN: implementar el handler de `submit`, errores, alta y refresco de clientes; verificar que 4.8…4.10c pasan con `node tests/clientes.test.js`

## 5. Integración en index.html

- [x] 5.1 RED: agregar a `tests/libros.test.js` los casos `5.1 index.html carga libros.js y clientes.js con defer después de datos y catálogo` y `5.1b scripts de libros/clientes sin type=module`; ejecutar y confirmar que fallan
- [x] 5.2 GREEN: agregar `<script src="js/libros.js" defer>` y `<script src="js/clientes.js" defer>` después de `js/datos.js` y `js/catalogo.js`; agregar `role="alert"`, `aria-live="polite"` y `aria-describedby` a `#libros-error` / `#clientes-error`; verificar que 5.1/5.1b pasan con `node tests/libros.test.js` y que `node tests/clientes.test.js` sigue verde
- [x] 5.3 Abrir `index.html` en el navegador y verificar que no hay errores de consola, que las 5 vistas siguen navegando y que los formularios de libros/clientes se muestran sin romper C-01/C-02

## 6. Verificación final de integración

- [x] 6.1 Ejecutar `node tests/datos.test.js`, `node tests/catalogo.test.js`, `node tests/libros.test.js` y `node tests/clientes.test.js`; los cuatro deben pasar sin fallos
- [x] 6.2 Verificar manualmente en el navegador: ISBN duplicado (con y sin guiones) rechazado y ISBN nuevo aceptado; el libro nuevo aparece en catálogo y en `#venta-libro`; email inválido y email existente en mayúsculas rechazados; email nuevo aceptado y visible en listado y `#venta-cliente`; precio 0/negativo/no numérico rechazado; alta sin autores rechazada; género «Sin clasificar» aceptado; alta con solo espacios rechazada; ningún alta recarga la página y los formularios válidos se limpian
- [x] 6.3 Verificar rollback: quitar los dos `<script>` nuevos y revertir `refrescar()` deja C-03 funcionando (catálogo y filtro siguen operativos)
