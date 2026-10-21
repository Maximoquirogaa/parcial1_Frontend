'use strict';

// TDD: tests para js/historial.js (Change C-05).
// RED inicial: js/historial.js existe de forma mínima; las pruebas nuevas deben fallar antes de implementar.

var fs = require('node:fs');
var shim = require('./shim.js');
var test = require('node:test').test;
var assert = require('node:assert').strict;

function cargarHistorial() {
    var env = shim.crearSandbox();
    shim.cargarScript(env.context, 'js/datos.js');
    shim.cargarScript(env.context, 'js/ventas.js');
    shim.cargarScript(env.context, 'js/historial.js');
    return env;
}

function obtenerBotones(elemento) {
    var salida = [];
    (elemento.children || []).forEach(function (c) {
        if (c.tagName === 'BUTTON') { salida.push(c); }
        salida = salida.concat(obtenerBotones(c));
    });
    return salida;
}

function registrarVentaEn(env, venta) {
    var li = env.sandbox.window.libreria;
    li.ventas = li.ventas || [];
    li.ventas.push(venta);
    return venta;
}

function ventaEjemplo(extra) {
    var base = {
        id: 1,
        fecha: '2026-10-21T10:00:00.000Z',
        clienteId: 1,
        clienteNombre: 'Juan Pérez',
        renglones: [
            { libroId: 1, libroTitulo: 'Cien años de soledad', precioUnitario: 12500, cantidad: 2, subtotal: 25000 },
            { libroId: 2, libroTitulo: 'El Aleph', precioUnitario: 9800, cantidad: 1, subtotal: 9800 }
        ],
        total: 34800
    };
    Object.keys(extra || {}).forEach(function (k) { base[k] = extra[k]; });
    return base;
}

// --- 4.1 / 4.1b / 4.1c / 4.2: renderTablaHistorial ---

test('4.1 - renderTablaHistorial crea una fila por venta con id/fecha/cliente/total', function () {
    var env = cargarHistorial();
    var window = env.sandbox.window;
    var doc = env.sandbox.document;
    var tbody = doc.getElementById('tabla-historial');

    var ventas = [ventaEjemplo(), ventaEjemplo({ id: 2, clienteNombre: 'María Gómez' })];
    window.historial.renderTablaHistorial(ventas);

    assert.strictEqual(tbody.children.length, 2, 'una fila por venta');
    assert.strictEqual(tbody.children[0].tagName, 'TR');
    assert.strictEqual(tbody.children[0].children[0].textContent, '1');
    assert.strictEqual(tbody.children[0].children[1].textContent, '2026-10-21T10:00:00.000Z');
    assert.strictEqual(tbody.children[0].children[2].textContent, 'Juan Pérez');
    assert.strictEqual(tbody.children[0].children[3].textContent, '$34800.00');
    assert.strictEqual(tbody.children[1].children[2].textContent, 'María Gómez');
    assert.strictEqual(doc.getElementById('historial-vacio').hidden, true, 'con ventas no se muestra el vacío');
});

test('4.1b - las celdas del historial se rellenan con textContent y sin innerHTML', function () {
    var env = cargarHistorial();
    var tbody = env.sandbox.document.getElementById('tabla-historial');

    env.sandbox.window.historial.renderTablaHistorial([ventaEjemplo()]);

    tbody.children.forEach(function (fila) {
        assert.strictEqual(fila.innerHTML, '', 'la fila no usa innerHTML');
        fila.children.forEach(function (celda) {
            assert.strictEqual(celda.tagName, 'TD');
            assert.strictEqual(celda.innerHTML, '', 'la celda no usa innerHTML');
            assert.ok(celda.textContent.length > 0, 'la celda tiene texto renderizado');
        });
    });
});

test('4.1c - el total del historial se muestra con $ y 2 decimales', function () {
    var env = cargarHistorial();
    var tbody = env.sandbox.document.getElementById('tabla-historial');

    env.sandbox.window.historial.renderTablaHistorial([ventaEjemplo({ total: 1234.5 })]);

    assert.strictEqual(tbody.children[0].children[3].textContent, '$1234.50');
});

test('4.2 - estado vacío: sin ventas se muestra #historial-vacio y no hay filas', function () {
    var env = cargarHistorial();
    var window = env.sandbox.window;
    var doc = env.sandbox.document;
    var tbody = doc.getElementById('tabla-historial');
    var vacio = doc.getElementById('historial-vacio');

    window.historial.renderTablaHistorial([]);

    assert.strictEqual(tbody.children.length, 0);
    assert.strictEqual(vacio.hidden, false, '#historial-vacio debe mostrarse');
});

// --- 4.3 / 4.3b / 4.3c: renderDetalleVenta ---

test('4.3 - renderDetalleVenta muestra renglones con libro, precio unitario, cantidad, subtotal', function () {
    var env = cargarHistorial();
    var window = env.sandbox.window;
    var doc = env.sandbox.document;
    var tbody = doc.getElementById('tabla-detalle-venta');

    var venta = ventaEjemplo();
    window.historial.renderDetalleVenta(venta);

    assert.strictEqual(tbody.children.length, 2, 'una fila por renglón');
    assert.strictEqual(tbody.children[0].children[0].textContent, 'Cien años de soledad');
    assert.strictEqual(tbody.children[0].children[1].textContent, '$12500.00');
    assert.strictEqual(tbody.children[0].children[2].textContent, '2');
    assert.strictEqual(tbody.children[0].children[3].textContent, '$25000.00');
    assert.strictEqual(doc.getElementById('historial-detalle').hidden, false, '#historial-detalle se muestra');
});

test('4.3b - el detalle se lee de la venta guardada (precio histórico, no del catálogo)', function () {
    var env = cargarHistorial();
    var window = env.sandbox.window;
    var doc = env.sandbox.document;
    var tbody = doc.getElementById('tabla-detalle-venta');

    var venta = ventaEjemplo({
        renglones: [
            { libroId: 1, libroTitulo: 'Cien años de soledad', precioUnitario: 99999, cantidad: 1, subtotal: 99999 }
        ],
        total: 99999
    });
    // Simular que el catálogo cambió pero la venta guarda el precio histórico
    window.libreria.libros[0].precio = 100;

    window.historial.renderDetalleVenta(venta);

    assert.strictEqual(tbody.children[0].children[1].textContent, '$99999.00', 'se muestra el precio histórico');
    assert.strictEqual(tbody.children[0].children[3].textContent, '$99999.00', 'el subtotal usa el precio histórico');
});

test('4.3c - sin opciones de edición ni eliminación (RN-VTA-09)', function () {
    var env = cargarHistorial();
    var doc = env.sandbox.document;
    var tbody = doc.getElementById('tabla-detalle-venta');

    env.sandbox.window.historial.renderDetalleVenta(ventaEjemplo());

    tbody.children.forEach(function (fila) {
        var botones = obtenerBotones(fila);
        assert.strictEqual(botones.length, 0, 'no hay botones de editar/eliminar en el detalle');
    });
    var detalleHtml = doc.getElementById('historial-detalle');
    assert.strictEqual(obtenerBotones(detalleHtml).length, 0, 'no hay botones de edición en el detalle');
});

// --- 4.4 / 4.4b: clic Ver Detalle ---

test('4.4 - clic Ver Detalle muestra #historial-detalle', function () {
    var env = cargarHistorial();
    var doc = env.sandbox.document;
    var detalle = doc.getElementById('historial-detalle');
    assert.strictEqual(detalle.hidden, true, 'inicialmente oculto');

    var tbody = doc.getElementById('tabla-historial');
    env.sandbox.window.historial.renderTablaHistorial([ventaEjemplo()]);

    var fila = tbody.children[0];
    var ultimaCelda = fila.children[fila.children.length - 1];
    var boton = null;
    (ultimaCelda.children || []).forEach(function (c) { if (c.tagName === 'BUTTON') { boton = c; } });
    assert.ok(boton, 'existe el botón Ver Detalle');
    assert.strictEqual(boton.textContent, 'Ver Detalle');

    boton.dispatchEvent({ type: 'click' });
    assert.strictEqual(detalle.hidden, false, 'tras clic se muestra el detalle');
});

test('4.4b - detalle inmutable: no hay botones editar/eliminar en el historial', function () {
    var env = cargarHistorial();
    var doc = env.sandbox.document;
    var tbody = doc.getElementById('tabla-historial');

    env.sandbox.window.historial.renderTablaHistorial([ventaEjemplo()]);

    tbody.children.forEach(function (fila) {
        var botones = obtenerBotones(fila);
        assert.strictEqual(botones.length, 1, 'solo Ver Detalle');
        assert.strictEqual(botones[0].textContent, 'Ver Detalle');
    });
});
