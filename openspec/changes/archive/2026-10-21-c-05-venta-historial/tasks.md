# Tasks

## 1. Red de seguridad y extensión del harness de tests

- [ ] 1.1 Ejecutar `node tests/datos.test.js`, `node tests/catalogo.test.js`, `node tests/libros.test.js` y `node tests/clientes.test.js` y registrar la línea base de tests pasando; si algo falla, detenerse y reportarlo como fallo preexistente (no corregirlo en este change)
- [ ] 1.2 Extender `tests/shim.js` con elementos de venta: input `#venta-cantidad`, tbody `#tabla-renglones`, tbody `#tabla-historial`, div `#historial-detalle`, tbody `#tabla-detalle-venta`, mensajes `#ventas-exito`/`#ventas-error`/`#historial-vacio`, botones "Agregar Renglón", "Confirmar Venta" y "Ver Detalle"; verificar que `node tests/datos.test.js`, `node tests/catalogo.test.js`, `node tests/libros.test.js` y `node tests/clientes.test.js` siguen pasando sin cambios en sus casos

## 2. Validación pura y reglas de negocio de ventas (Strict TDD)

- [ ] 2.1 RED: agregar a `tests/ventas.test.js` los casos `2.1 validarCantidad entero > 0`, `2.1b cantidad decimal rechazada`, `2.1c cantidad cero rechazada`, `2.1d cantidad negativa rechazada`, `2.1e cantidad vacía/no numérica rechazada`; ejecutar `node tests/ventas.test.js` y confirmar que fallan porque `js/ventas.js` aún no existe
- [ ] 2.2 GREEN: implementar en `js/ventas.js` la función pura `validarCantidad(valor)` exportada en `window.ventas`; verificar que los casos 2.1…2.1e pasan con `node tests/ventas.test.js`
- [ ] 2.3 RED: agregar a `tests/ventas.test.js` los casos `2.3 RN-VTA-01 cliente requerido`, `2.3b cliente inexistente`, `2.3c cliente existente válido`; ejecutar y confirmar que fallan
- [ ] 2.4 GREEN: implementar `validarClienteSeleccionado(idCliente, coleccion)` para RN-VTA-01; verificar que los casos nuevos pasan y que 2.1…2.1e siguen verdes con `node tests/ventas.test.js`
- [ ] 2.5 RED: agregar a `tests/ventas.test.js` los casos `2.5 RN-VTA-02 cantidad inválida (0, negativo, decimal, vacío)`, `2.5b cantidad válida (1, 2, 10)`; ejecutar y confirmar que fallan
- [ ] 2.6 GREEN: integrar `validarCantidad` en el flujo de agregar renglón; verificar que los casos nuevos pasan con `node tests/ventas.test.js`
- [ ] 2.7 RED: agregar a `tests/ventas.test.js` los casos `2.7 RN-VTA-03 libro duplicado suma cantidad`, `2.7b libro nuevo crea renglón`, `2.7c mensaje informativo de duplicado`; ejecutar y confirmar que fallan
- [ ] 2.8 GREEN: implementar `agregarRenglon(libroId, libroTitulo, precioUnitario, cantidad, renglones)` con lógica de duplicado (DD-07); verificar que todos los casos de reglas de ventas pasan con `node tests/ventas.test.js`

## 3. Cálculos, render de renglones y confirmación de venta (Strict TDD)

- [ ] 3.1 RED: agregar a `tests/ventas.test.js` los casos `3.1 calcularSubtotal(cantidad, precio)`, `3.1b calcularTotal(renglones)`, `3.1c total con 2 decimales`, `3.1d renderTablaRenglones una fila por renglón con textContent`, `3.1e celdas sin innerHTML`, `3.1f total de venta mostrado con $ y 2 decimales`; ejecutar y confirmar que fallan
- [ ] 3.2 GREEN: implementar `calcularSubtotal`, `calcularTotal`, `renderTablaRenglones` y formateo de precios en `js/ventas.js`; verificar que los casos 3.1…3.1f pasan con `node tests/ventas.test.js`
- [ ] 3.3 RED: agregar a `tests/ventas.test.js` los casos `3.3 quitarRenglon(libroId, renglones) elimina el renglón`, `3.3b quitar renglón inexistente no modifica`, `3.4 submit llama preventDefault`, `3.5 errores textuales en #ventas-error`, `3.5b alta atómica: con error no se registra venta`, `3.6 venta válida registra exactamente una venta con id nuevo`; ejecutar y confirmar que fallan
- [ ] 3.4 GREEN: implementar `quitarRenglon`, `validarVenta` (cliente + renglones + cantidades), `registrarVenta` (id, fecha, cliente, renglones con precioUnitario histórico, total), `limpiarVenta` y handler de `submit`; verificar que 3.3…3.6 pasan con `node tests/ventas.test.js`
- [ ] 3.5 RED: agregar a `tests/ventas.test.js` los casos `3.7 tras confirmar se actualizan #tabla-historial y selectores de venta`, `3.7b formulario limpio y #ventas-exito visible`, `3.7c no se recarga la página`, `3.7d precio unitario histórico copiado (DD-06)`; ejecutar `node tests/ventas.test.js` y confirmar que fallan
- [ ] 3.6 GREEN: implementar el refresco posterior a la confirmación (render historial, limpiar formulario, mostrar éxito); verificar que 3.7…3.7d pasan con `node tests/ventas.test.js`

## 4. Historial de ventas y detalle inmutable (Strict TDD)

- [ ] 4.1 RED: agregar a `tests/historial.test.js` los casos `4.1 renderTablaHistorial una fila por venta con id/fecha/cliente/total`, `4.1b celdas por textContent sin innerHTML`, `4.1c total con $ y 2 decimales`, `4.2 estado vacío muestra #historial-vacio`, `4.3 renderDetalleVenta muestra renglones con libro, precio unitario, cantidad, subtotal`, `4.3b detalle leído de la venta guardada (precio histórico)`, `4.3c sin opciones de edición/eliminación (RN-VTA-09)`; ejecutar `node tests/historial.test.js` y confirmar que fallan
- [ ] 4.2 GREEN: implementar `renderTablaHistorial`, `obtenerVenta(id)`, `renderDetalleVenta` y manejo de `#historial-detalle` en `js/historial.js`; verificar que 4.1…4.3c pasan con `node tests/historial.test.js`
- [ ] 4.3 RED: agregar a `tests/historial.test.js` los casos `4.4 clic Ver Detalle muestra #historial-detalle`, `4.4b detalle inmutable (no hay botones editar/eliminar)`; ejecutar y confirmar que fallan
- [ ] 4.4 GREEN: implementar handler de "Ver Detalle" y verificación de inmutabilidad; verificar que 4.4…4.4b pasan con `node tests/historial.test.js`

## 5. Integración en index.html

- [ ] 5.1 RED: agregar a `tests/ventas.test.js` los casos `5.1 index.html carga js/ventas.js y js/historial.js con defer después de datos/catálogo/libros/clientes` y `5.1b scripts sin type=module`; ejecutar y confirmar que fallan
- [ ] 5.2 GREEN: agregar `<script src="js/ventas.js" defer>` y `<script src="js/historial.js" defer>` después de `js/clientes.js`; verificar que 5.1/5.1b pasan con `node tests/ventas.test.js` y que `node tests/historial.test.js` sigue verde

## 6. Verificación final de integración

- [ ] 6.1 Ejecutar `node tests/datos.test.js`, `node tests/catalogo.test.js`, `node tests/libros.test.js`, `node tests/clientes.test.js`, `node tests/ventas.test.js` y `node tests/historial.test.js`; los seis deben pasar sin fallos
- [ ] 6.2 Verificar manualmente en el navegador: cantidad decimal/0/negativa rechazada; libro duplicado suma cantidad e informa; total = suma de subtotales con 2 decimales; confirmación sin cliente o sin renglones rechazada; venta confirmada registra precio unitario histórico; historial muestra lista y detalle inmutable; sin edición ni eliminación de ventas; formulario se limpia y muestra éxito tras confirmar; ninguna acción recarga la página
- [ ] 6.3 Verificar rollback: quitar los dos `<script>` nuevos y revertir `tests/shim.js` deja C-04 funcionando (altas de libros y clientes, catálogo, selectores de venta siguen operativos)
