'use strict';

// TDD: tests para js/ventas.js (Change C-05).
// RED inicial: js/ventas.js no existe aún; las pruebas deben fallar antes de implementar.

var fs = require('node:fs');
var shim = require('./shim.js');
var test = require('node:test').test;
var assert = require('node:assert').strict;

function cargarVentas() {
    var env = shim.crearSandbox();
    shim.cargarScript(env.context, 'js/datos.js');
    shim.cargarScript(env.context, 'js/ventas.js');
    return env;
}

// --- 2.1 / 2.1b / 2.1c / 2.1d / 2.1e: validarCantidad pura (RN-VTA-02) ---

test('2.1 - validarCantidad acepta enteros mayores que cero', function () {
    var env = cargarVentas();
    var validarCantidad = env.sandbox.window.ventas.validarCantidad;

    assert.strictEqual(validarCantidad('1'), true);
    assert.strictEqual(validarCantidad(2), true);
    assert.strictEqual(validarCantidad('10'), true);
});

test('2.1b - TRIANGULATE: cantidad decimal es rechazada', function () {
    var env = cargarVentas();
    var validarCantidad = env.sandbox.window.ventas.validarCantidad;

    ['1.5', '2,5', '0.1', '10.9'].forEach(function (valor) {
        assert.strictEqual(validarCantidad(valor), false, 'cantidad decimal ' + valor + ' debe rechazarse');
    });
});

test('2.1c - cantidad cero es rechazada', function () {
    var env = cargarVentas();
    var validarCantidad = env.sandbox.window.ventas.validarCantidad;

    assert.strictEqual(validarCantidad('0'), false, 'cantidad 0 debe rechazarse');
    assert.strictEqual(validarCantidad(0), false, 'cantidad 0 numérica debe rechazarse');
});

test('2.1d - cantidad negativa es rechazada', function () {
    var env = cargarVentas();
    var validarCantidad = env.sandbox.window.ventas.validarCantidad;

    ['-1', '-5', '-100', -3].forEach(function (valor) {
        assert.strictEqual(validarCantidad(valor), false, 'cantidad negativa ' + valor + ' debe rechazarse');
    });
});

test('2.1e - cantidad vacía o no numérica es rechazada', function () {
    var env = cargarVentas();
    var validarCantidad = env.sandbox.window.ventas.validarCantidad;

    ['', '   ', 'abc', '12abc', null, undefined].forEach(function (valor) {
        assert.strictEqual(validarCantidad(valor), false, 'cantidad inválida ' + String(valor) + ' debe rechazarse');
    });
});

// --- 2.3 / 2.3b / 2.3c: RN-VTA-01 cliente requerido ---

test('2.3 - RN-VTA-01: cliente requerido, id vacío o nulo se rechaza', function () {
    var env = cargarVentas();
    var validarClienteSeleccionado = env.sandbox.window.ventas.validarClienteSeleccionado;
    var li = env.sandbox.window.libreria;

    ['', null, undefined, '   '].forEach(function (id) {
        var resultado = validarClienteSeleccionado(id, li);
        assert.strictEqual(resultado.valido, false, 'cliente ' + String(id) + ' debe rechazarse');
        assert.ok(/cliente/i.test(resultado.mensaje), 'el mensaje menciona al cliente');
    });
});

test('2.3b - cliente inexistente se rechaza', function () {
    var env = cargarVentas();
    var validarClienteSeleccionado = env.sandbox.window.ventas.validarClienteSeleccionado;
    var li = env.sandbox.window.libreria;

    var resultado = validarClienteSeleccionado('99', li);
    assert.strictEqual(resultado.valido, false);
    assert.ok(/no existe/i.test(resultado.mensaje) || /inexistente/i.test(resultado.mensaje));
});

test('2.3c - cliente existente es válido', function () {
    var env = cargarVentas();
    var validarClienteSeleccionado = env.sandbox.window.ventas.validarClienteSeleccionado;
    var li = env.sandbox.window.libreria;

    var cliente = li.clientes[0];
    var resultado = validarClienteSeleccionado(String(cliente.id), li);
    assert.strictEqual(resultado.valido, true, 'cliente existente ' + cliente.id + ' debe ser válido');
});

// --- 2.5 / 2.5b: RN-VTA-02 cantidad válida e inválida en agregar renglón ---

test('2.5 - RN-VTA-02: cantidad inválida (0, negativo, decimal, vacío) rechaza el renglón', function () {
    var env = cargarVentas();
    var agregarRenglon = env.sandbox.window.ventas.agregarRenglon;

    [[1, 0], [1, -1], [1, 1.5], [1, ''], [1, 'abc']].forEach(function (datos) {
        var renglones = [];
        var resultado = agregarRenglon(datos[0], 'Libro X', 1000, datos[1], renglones);
        assert.strictEqual(resultado.valido, false, 'cantidad ' + String(datos[1]) + ' debe rechazarse');
        assert.strictEqual(renglones.length, 0, 'no se debe agregar renglón con cantidad inválida');
    });
});

test('2.5b - cantidad válida (1, 2, 10) crea un renglón', function () {
    var env = cargarVentas();
    var agregarRenglon = env.sandbox.window.ventas.agregarRenglon;

    [1, 2, 10].forEach(function (cantidad) {
        var renglones = [];
        var resultado = agregarRenglon(1, 'Libro X', 1000, cantidad, renglones);
        assert.strictEqual(resultado.valido, true, 'cantidad ' + cantidad + ' debe aceptarse');
        assert.strictEqual(renglones.length, 1, 'debe crearse exactamente un renglón');
        assert.strictEqual(renglones[0].cantidad, cantidad);
        assert.strictEqual(renglones[0].subtotal, 1000 * cantidad);
    });
});

// --- 2.7 / 2.7b / 2.7c: RN-VTA-03 libro duplicado suma cantidad ---

test('2.7 - RN-VTA-03: libro duplicado suma la cantidad al renglón existente', function () {
    var env = cargarVentas();
    var agregarRenglon = env.sandbox.window.ventas.agregarRenglon;

    var renglones = [];
    var primero = agregarRenglon(1, 'Libro X', 1000, 2, renglones);
    assert.strictEqual(primero.valido, true);
    assert.strictEqual(renglones.length, 1);

    var segundo = agregarRenglon(1, 'Libro X', 1000, 3, renglones);
    assert.strictEqual(segundo.valido, true);
    assert.strictEqual(renglones.length, 1, 'no se debe crear un renglón nuevo');
    assert.strictEqual(renglones[0].cantidad, 5, 'las cantidades deben sumarse');
    assert.strictEqual(renglones[0].subtotal, 5000, 'el subtotal debe actualizarse');
});

test('2.7b - libro nuevo crea un renglón separado', function () {
    var env = cargarVentas();
    var agregarRenglon = env.sandbox.window.ventas.agregarRenglon;

    var renglones = [];
    agregarRenglon(1, 'Libro X', 1000, 2, renglones);
    agregarRenglon(2, 'Libro Y', 2000, 3, renglones);

    assert.strictEqual(renglones.length, 2, 'dos libros distintos crean dos renglones');
    assert.strictEqual(renglones[0].libroId, 1);
    assert.strictEqual(renglones[1].libroId, 2);
});

test('2.7c - mensaje informativo cuando el libro ya está en la venta', function () {
    var env = cargarVentas();
    var agregarRenglon = env.sandbox.window.ventas.agregarRenglon;

    var renglones = [];
    agregarRenglon(1, 'Libro X', 1000, 2, renglones);
    var resultado = agregarRenglon(1, 'Libro X', 1000, 3, renglones);

    assert.strictEqual(resultado.valido, true);
    assert.ok(/ya est/i.test(resultado.mensaje) || /sum/i.test(resultado.mensaje), 'el mensaje informa del duplicado');
});

// --- 3.1 / 3.1b / 3.1c / 3.1d / 3.1e / 3.1f: cálculos y render de renglones ---

test('3.1 - calcularSubtotal multiplica cantidad por precio unitario', function () {
    var env = cargarVentas();
    var calcularSubtotal = env.sandbox.window.ventas.calcularSubtotal;

    assert.strictEqual(calcularSubtotal(2, 1000), 2000);
    assert.strictEqual(calcularSubtotal(3, 12500), 37500);
    assert.strictEqual(calcularSubtotal(1, 9800), 9800);
});

test('3.1b - calcularTotal suma los subtotales de todos los renglones', function () {
    var env = cargarVentas();
    var calcularTotal = env.sandbox.window.ventas.calcularTotal;

    var renglones = [
        { libroId: 1, libroTitulo: 'A', precioUnitario: 1000, cantidad: 2, subtotal: 2000 },
        { libroId: 2, libroTitulo: 'B', precioUnitario: 1500, cantidad: 3, subtotal: 4500 },
        { libroId: 3, libroTitulo: 'C', precioUnitario: 800, cantidad: 1, subtotal: 800 }
    ];
    assert.strictEqual(calcularTotal(renglones), 7300);
    assert.strictEqual(calcularTotal([]), 0);
});

test('3.1c - el total se expresa con 2 decimales', function () {
    var env = cargarVentas();
    var calcularTotal = env.sandbox.window.ventas.calcularTotal;
    var formatoTotal = env.sandbox.window.ventas.formatoTotal;

    var total = calcularTotal([{ subtotal: 1000 }, { subtotal: 2500.5 }]);
    assert.strictEqual(formatoTotal(total), '$3500.50');
});

test('3.1d - renderTablaRenglones crea una fila por renglón con textContent', function () {
    var env = cargarVentas();
    var window = env.sandbox.window;
    var doc = env.sandbox.document;
    var tbody = doc.getElementById('tabla-renglones');

    var renglones = [
        { libroId: 1, libroTitulo: 'Cien años de soledad', precioUnitario: 12500, cantidad: 2, subtotal: 25000 },
        { libroId: 2, libroTitulo: 'El Aleph', precioUnitario: 9800, cantidad: 1, subtotal: 9800 }
    ];

    window.ventas.renderTablaRenglones(renglones);

    assert.strictEqual(tbody.children.length, 2, 'una fila por renglón');
    assert.strictEqual(tbody.children[0].tagName, 'TR');
    assert.strictEqual(tbody.children[0].children[0].textContent, 'Cien años de soledad');
    assert.strictEqual(tbody.children[0].children[1].textContent, '$12500.00');
    assert.strictEqual(tbody.children[0].children[2].textContent, '2');
    assert.strictEqual(tbody.children[0].children[3].textContent, '$25000.00');
    assert.strictEqual(tbody.children[1].children[0].textContent, 'El Aleph');
    assert.strictEqual(doc.getElementById('ventas-vacio').hidden, true, 'con renglones no se muestra el vacío');
});

test('3.1e - las celdas de renglones se rellenan con textContent y sin innerHTML', function () {
    var env = cargarVentas();
    var window = env.sandbox.window;
    var tbody = env.sandbox.document.getElementById('tabla-renglones');

    window.ventas.renderTablaRenglones([{ libroId: 1, libroTitulo: 'Libro X', precioUnitario: 1000, cantidad: 1, subtotal: 1000 }]);

    tbody.children.forEach(function (fila) {
        assert.strictEqual(fila.innerHTML, '', 'la fila no usa innerHTML');
        fila.children.forEach(function (celda) {
            assert.strictEqual(celda.tagName, 'TD');
            assert.strictEqual(celda.innerHTML, '', 'la celda no usa innerHTML');
            assert.ok(celda.textContent.length > 0, 'la celda tiene texto renderizado');
        });
    });
});

test('3.1f - total de venta mostrado con $ y 2 decimales en #ventas-total', function () {
    var env = cargarVentas();
    var window = env.sandbox.window;
    var doc = env.sandbox.document;

    window.ventas.renderTablaRenglones([
        { libroId: 1, libroTitulo: 'A', precioUnitario: 1000, cantidad: 2, subtotal: 2000 },
        { libroId: 2, libroTitulo: 'B', precioUnitario: 1500, cantidad: 1, subtotal: 1500 }
    ]);

    var totalNodo = doc.getElementById('ventas-total');
    assert.ok(/\$3500\.00/.test(totalNodo.textContent), 'el total muestra $ y 2 decimales');
});

// --- helpers para tests de UI de venta ---

function cargarVentasConDOM() {
    var env = shim.crearSandbox();
    shim.cargarScript(env.context, 'js/datos.js');
    shim.cargarScript(env.context, 'js/libros.js');
    shim.cargarScript(env.context, 'js/clientes.js');
    shim.cargarScript(env.context, 'js/ventas.js');
    try {
        shim.cargarScript(env.context, 'js/historial.js');
    } catch (e) {
        // historial.js aún no existe (se crea en la tarea 4)
    }
    return env;
}

function seleccionarOpcion(env, selectId, valor) {
    var select = env.sandbox.document.getElementById(selectId);
    select.value = valor === null || valor === undefined ? '' : String(valor);
}

function establecerCantidad(env, cantidad) {
    var input = env.sandbox.document.getElementById('venta-cantidad');
    input.value = cantidad === undefined ? '1' : String(cantidad);
}

function hacerClique(env, id) {
    var boton = env.sandbox.document.getElementById(id);
    boton.dispatchEvent({ type: 'click' });
}

function enviarFormularioVenta(env) {
    var form = env.sandbox.document._elements._formVentas;
    var llamado = false;
    form.dispatchEvent({ type: 'submit', preventDefault: function () { llamado = true; } });
    return llamado;
}

function cantidadVentas(env) {
    return env.sandbox.window.libreria.ventas ? env.sandbox.window.libreria.ventas.length : 0;
}

function ultimaVenta(env) {
    var ventas = env.sandbox.window.libreria.ventas;
    return ventas ? ventas[ventas.length - 1] : null;
}

// --- 3.3 / 3.3b: quitarRenglon ---

test('3.3 - quitarRenglon elimina el renglón con el libroId dado', function () {
    var env = cargarVentas();
    var quitarRenglon = env.sandbox.window.ventas.quitarRenglon;

    var renglones = [
        { libroId: 1, libroTitulo: 'A', precioUnitario: 1000, cantidad: 2, subtotal: 2000 },
        { libroId: 2, libroTitulo: 'B', precioUnitario: 1500, cantidad: 1, subtotal: 1500 }
    ];
    var resultado = quitarRenglon(1, renglones);

    assert.strictEqual(resultado.valido, true);
    assert.strictEqual(renglones.length, 1);
    assert.strictEqual(renglones[0].libroId, 2);
});

test('3.3b - quitar renglón inexistente no modifica el arreglo', function () {
    var env = cargarVentas();
    var quitarRenglon = env.sandbox.window.ventas.quitarRenglon;

    var renglones = [
        { libroId: 1, libroTitulo: 'A', precioUnitario: 1000, cantidad: 2, subtotal: 2000 }
    ];
    var resultado = quitarRenglon(99, renglones);

    assert.strictEqual(resultado.valido, false);
    assert.strictEqual(renglones.length, 1);
});

// --- 3.4 / 3.5 / 3.5b / 3.6: submit, validación y registro de venta ---

test('3.4 - submit del formulario de ventas llama preventDefault', function () {
    var env = cargarVentasConDOM();
    assert.strictEqual(enviarFormularioVenta(env), true, 'el handler debe llamar preventDefault');
});

test('3.5 - con errores se muestra texto en #ventas-error y no se registra venta', function () {
    var env = cargarVentasConDOM();
    var doc = env.sandbox.document;
    var ventasPrevias = cantidadVentas(env);

    enviarFormularioVenta(env);

    var error = doc.getElementById('ventas-error');
    assert.strictEqual(error.hidden, false, 'el error debe mostrarse');
    assert.ok(error.textContent.length > 0, 'el error debe tener texto');
    assert.strictEqual(cantidadVentas(env), ventasPrevias, 'no se registra venta con error');
    assert.strictEqual(doc.getElementById('ventas-exito').hidden, true, 'no debe mostrarse el éxito');
});

test('3.5b - alta atómica: con cantidad inválida no se registra venta ni se agrega renglón', function () {
    var env = cargarVentasConDOM();
    var doc = env.sandbox.document;
    var ventasPrevias = cantidadVentas(env);

    seleccionarOpcion(env, 'venta-cliente', '1');
    seleccionarOpcion(env, 'venta-libro', '1');
    establecerCantidad(env, 0);
    hacerClique(env, 'agregar-renglon');
    enviarFormularioVenta(env);

    assert.strictEqual(cantidadVentas(env), ventasPrevias, 'no se registra venta');
    var error = doc.getElementById('ventas-error');
    assert.strictEqual(error.hidden, false, 'debe mostrarse error por cantidad inválida');
});

test('3.6 - venta válida registra exactamente una venta con id nuevo, fecha, cliente y renglones con precio histórico', function () {
    var env = cargarVentasConDOM();
    var window = env.sandbox.window;
    var doc = env.sandbox.document;
    var ventasPrevias = cantidadVentas(env);
    var maxIdPrevio = 0;
    if (window.libreria.ventas && window.libreria.ventas.length > 0) {
        maxIdPrevio = Math.max.apply(null, window.libreria.ventas.map(function (v) { return v.id; }));
    }

    seleccionarOpcion(env, 'venta-cliente', '1');
    seleccionarOpcion(env, 'venta-libro', '1');
    establecerCantidad(env, 2);
    hacerClique(env, 'agregar-renglon');
    assert.strictEqual(enviarFormularioVenta(env), true);

    assert.strictEqual(cantidadVentas(env), ventasPrevias + 1, 'se registra exactamente una venta');
    var venta = ultimaVenta(env);
    assert.strictEqual(venta.id, maxIdPrevio + 1, 'id nuevo');
    assert.ok(/^\d{4}-\d{2}-\d{2}T/.test(venta.fecha), 'fecha ISO');
    assert.strictEqual(venta.clienteId, 1);
    assert.strictEqual(venta.clienteNombre, 'Juan Pérez');
    assert.strictEqual(venta.renglones.length, 1);
    assert.strictEqual(venta.renglones[0].libroId, 1);
    assert.strictEqual(venta.renglones[0].cantidad, 2);
    assert.strictEqual(venta.renglones[0].precioUnitario, 12500, 'precio unitario histórico copiado');
    assert.strictEqual(venta.total, 25000);
    assert.strictEqual(doc.getElementById('ventas-exito').hidden, false, 'mensaje de éxito visible');
    assert.strictEqual(doc.getElementById('ventas-error').hidden, true, 'error oculto');
});

// --- 3.7 / 3.7b / 3.7c / 3.7d: refresco tras confirmar ---

test('3.7 - tras confirmar se actualizan #tabla-historial y selectores de venta', function () {
    var env = cargarVentasConDOM();
    var window = env.sandbox.window;
    var doc = env.sandbox.document;

    seleccionarOpcion(env, 'venta-cliente', '1');
    seleccionarOpcion(env, 'venta-libro', '1');
    establecerCantidad(env, 1);
    hacerClique(env, 'agregar-renglon');
    enviarFormularioVenta(env);

    var historial = doc.getElementById('tabla-historial');
    assert.strictEqual(historial.children.length, 1, 'el historial tiene una fila tras confirmar');
    assert.strictEqual(historial.children[0].tagName, 'TR');

    var ventaCliente = doc.getElementById('venta-cliente');
    assert.ok(ventaCliente.options.length >= 2, 'el selector de cliente tiene opciones');
});

test('3.7b - formulario limpio y #ventas-exito visible tras confirmar', function () {
    var env = cargarVentasConDOM();
    var doc = env.sandbox.document;

    seleccionarOpcion(env, 'venta-cliente', '1');
    seleccionarOpcion(env, 'venta-libro', '1');
    establecerCantidad(env, 3);
    hacerClique(env, 'agregar-renglon');
    enviarFormularioVenta(env);

    var cantidad = doc.getElementById('venta-cantidad');
    assert.strictEqual(cantidad.value, '1', 'la cantidad se resetea a 1');
    assert.strictEqual(doc.getElementById('ventas-exito').hidden, false, '#ventas-exito visible');
    assert.strictEqual(doc.getElementById('ventas-error').hidden, true, '#ventas-error oculto');
    var tabla = doc.getElementById('tabla-renglones');
    assert.strictEqual(tabla.children.length, 0, 'los renglones se limpian');
});

test('3.7c - no se recarga la página tras confirmar (preventDefault llamado)', function () {
    var env = cargarVentasConDOM();
    var form = env.sandbox.document._elements._formVentas;
    var prevenido = false;
    form.dispatchEvent({ type: 'submit', preventDefault: function () { prevenido = true; } });

    seleccionarOpcion(env, 'venta-cliente', '1');
    seleccionarOpcion(env, 'venta-libro', '1');
    establecerCantidad(env, 1);
    hacerClique(env, 'agregar-renglon');
    form.dispatchEvent({ type: 'submit', preventDefault: function () { prevenido = true; } });

    assert.strictEqual(prevenido, true, 'preventDefault fue llamado al confirmar');
});

test('3.7d - DD-06: precio unitario histórico se conserva aunque el catálogo cambie', function () {
    var env = cargarVentasConDOM();
    var window = env.sandbox.window;
    var doc = env.sandbox.document;

    // Libro 1 cuesta 12500 en el catálogo
    seleccionarOpcion(env, 'venta-cliente', '1');
    seleccionarOpcion(env, 'venta-libro', '1');
    establecerCantidad(env, 1);
    hacerClique(env, 'agregar-renglon');
    enviarFormularioVenta(env);

    var venta = ultimaVenta(env);
    assert.strictEqual(venta.renglones[0].precioUnitario, 12500, 'precio histórico capturado al confirmar');

    // Simular cambio de precio en el catálogo (el historial no debe cambiar)
    window.libreria.libros[0].precio = 99999;
    assert.strictEqual(venta.renglones[0].precioUnitario, 12500, 'el precio histórico no se altera por cambios en el catálogo');
    assert.strictEqual(venta.total, 12500, 'el total histórico no se altera');
});

// --- 5.1 / 5.1b: integración clásica en index.html ---

test('5.1 - index.html carga storage.js, js/ventas.js y js/historial.js con defer en el orden correcto', function () {
    var html = fs.readFileSync('index.html', 'utf8');
    var storage = html.indexOf('src="js/storage.js"');
    var datos = html.indexOf('src="js/datos.js"');
    var catalogo = html.indexOf('src="js/catalogo.js"');
    var libros = html.indexOf('src="js/libros.js"');
    var clientes = html.indexOf('src="js/clientes.js"');
    var ventas = html.indexOf('src="js/ventas.js"');
    var historial = html.indexOf('src="js/historial.js"');

    assert.ok(storage >= 0 && datos >= 0 && catalogo >= 0 && libros >= 0 && clientes >= 0, 'storage, datos, catálogo, libros y clientes deben estar referenciados');
    assert.ok(ventas >= 0, 'index.html debe cargar js/ventas.js');
    assert.ok(historial >= 0, 'index.html debe cargar js/historial.js');
    assert.ok(storage < datos && datos < catalogo && catalogo < libros && libros < clientes && clientes < ventas && ventas < historial, 'orden storage → datos → catálogo → libros → clientes → ventas → historial');

    assert.ok(/<script src="js\/storage\.js" defer><\/script>/.test(html), 'storage.js con defer');
    assert.ok(/<script src="js\/ventas\.js" defer><\/script>/.test(html), 'ventas.js con defer');
    assert.ok(/<script src="js\/historial\.js" defer><\/script>/.test(html), 'historial.js con defer');
});

test('5.1b - scripts de ventas y historial no usan type=module', function () {
    var html = fs.readFileSync('index.html', 'utf8');
    var etiquetas = html.match(/<script[^>]*js\/(ventas|historial)\.js[^>]*>/g) || [];

    assert.strictEqual(etiquetas.length, 2, 'deben existir las dos etiquetas de script');
    etiquetas.forEach(function (etiqueta) {
        assert.ok(!/type\s*=\s*["']module["']/.test(etiqueta), 'sin type="module" en ' + etiqueta);
    });
});

// --- 4.3: persistencia tras confirmación de venta (Change C-06) ---

test('4.3 - ventas.js guarda en storage tras confirmación de venta', function () {
    var env = shim.crearSandbox();
    shim.cargarScript(env.context, 'js/datos.js');
    shim.cargarScript(env.context, 'js/storage.js');
    shim.cargarScript(env.context, 'js/libros.js');
    shim.cargarScript(env.context, 'js/clientes.js');
    shim.cargarScript(env.context, 'js/ventas.js');
    var storage = env.sandbox.window.storage;
    var libreria = env.sandbox.window.libreria;
    var doc = env.sandbox.document;
    var cantidadPrevia = libreria.ventas ? libreria.ventas.length : 0;

    seleccionarOpcion(env, 'venta-cliente', '1');
    seleccionarOpcion(env, 'venta-libro', '1');
    establecerCantidad(env, 2);
    hacerClique(env, 'agregar-renglon');
    enviarFormularioVenta(env);

    assert.strictEqual(libreria.ventas.length, cantidadPrevia + 1, 'se registra una venta');
    var guardados = storage.loadFromStorage(storage.CLAVE_VENTAS);
    assert.strictEqual(guardados.length, cantidadPrevia + 1, 'la venta se guardó en storage');
    assert.strictEqual(guardados[guardados.length - 1].id, libreria.ventas[libreria.ventas.length - 1].id);
    assert.strictEqual(guardados[guardados.length - 1].total, 25000);
});
