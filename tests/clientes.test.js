'use strict';

// TDD: tests para js/clientes.js (Change C-04, tareas 4 a 5).
// RED inicial: js/clientes.js no existe aún; las pruebas deben fallar antes de implementar.

var shim = require('./shim.js');
var test = require('node:test').test;
var assert = require('node:assert').strict;

function cargarClientes() {
    var env = shim.crearSandbox();
    shim.cargarScript(env.context, 'js/datos.js');
    shim.cargarScript(env.context, 'js/clientes.js');
    return env;
}

function clienteValido(extra) {
    var base = {
        nombreCompleto: 'Ana Torres',
        email: 'ana.torres@mail.com'
    };
    Object.keys(extra || {}).forEach(function (k) { base[k] = extra[k]; });
    return base;
}

function erroresDe(resultado, campo) {
    return resultado.errores.filter(function (e) { return e.campo === campo; });
}

function completarFormulario(env, datos) {
    var doc = env.sandbox.document;
    doc.getElementById('cliente-nombre').value = datos.nombreCompleto;
    doc.getElementById('cliente-email').value = datos.email;
}

function enviarCliente(env) {
    var form = env.sandbox.document._elements._formClientes;
    var llamado = false;
    form.dispatchEvent({ type: 'submit', preventDefault: function () { llamado = true; } });
    return llamado;
}

// --- 4.1 / 4.2 / 4.3 / 4.4: normalización y validación pura ---

test('4.1 - normalizarEmail aplica trim y minúsculas', function () {
    var env = cargarClientes();
    var normalizar = env.sandbox.window.clientes.normalizarEmail;

    assert.strictEqual(normalizar('  Ana.Torres@Mail.COM  '), 'ana.torres@mail.com');
    assert.strictEqual(normalizar(''), '');
});

test('4.2 - RN-CLI-01: nombre vacío o solo espacios se rechaza', function () {
    var env = cargarClientes();
    var validar = env.sandbox.window.clientes.validarCliente;
    var li = env.sandbox.window.libreria;

    ['', '    '].forEach(function (nombre) {
        var resultado = validar(clienteValido({ nombreCompleto: nombre }), li);
        assert.strictEqual(resultado.valido, false, 'nombre "' + nombre + '" debe rechazarse');
        var errores = erroresDe(resultado, 'nombre');
        assert.strictEqual(errores.length, 1);
        assert.ok(/nombre/i.test(errores[0].mensaje));
    });
});

test('4.2b - TRIANGULATE: RN-CLI-01 email vacío o solo espacios se rechaza', function () {
    var env = cargarClientes();
    var validar = env.sandbox.window.clientes.validarCliente;
    var li = env.sandbox.window.libreria;

    ['', '   '].forEach(function (email) {
        var resultado = validar(clienteValido({ email: email }), li);
        assert.strictEqual(resultado.valido, false);
        var errores = erroresDe(resultado, 'email');
        assert.strictEqual(errores.length, 1);
        assert.ok(/email/i.test(errores[0].mensaje));
    });
});

test('4.2c - RN-CLI-01: nombre y email con contenido no se rechazan por esta regla', function () {
    var env = cargarClientes();
    var resultado = env.sandbox.window.clientes.validarCliente(clienteValido(), env.sandbox.window.libreria);

    assert.strictEqual(erroresDe(resultado, 'nombre').length, 0);
    assert.strictEqual(erroresDe(resultado, 'email').length, 0);
    assert.strictEqual(resultado.valido, true);
});

test('4.3 - RN-CLI-02: emails sin arroba, sin dominio, sin punto o con espacios internos se rechazan', function () {
    var env = cargarClientes();
    var validar = env.sandbox.window.clientes.validarCliente;
    var li = env.sandbox.window.libreria;

    ['sinarroba.com', 'a@', 'a@dominio', 'ana torres@mail.com', 'ana@ mail.com', 'ana@mail .com'].forEach(function (email) {
        var resultado = validar(clienteValido({ email: email }), li);
        assert.strictEqual(resultado.valido, false, 'email "' + email + '" debe rechazarse');
        var errores = erroresDe(resultado, 'email');
        assert.strictEqual(errores.length, 1);
        assert.ok(/formato/i.test(errores[0].mensaje), 'el mensaje menciona el formato');
    });
});

test('4.3b - TRIANGULATE: emails con texto antes de @, dominio y punto son válidos', function () {
    var env = cargarClientes();
    var validar = env.sandbox.window.clientes.validarCliente;
    var li = env.sandbox.window.libreria;

    ['ana@mail.com', 'ana.perez@sub.dominio.com', 'a1@b.co'].forEach(function (email) {
        var resultado = validar(clienteValido({ email: email }), li);
        assert.strictEqual(erroresDe(resultado, 'email').length, 0, 'email "' + email + '" debe aceptarse');
        assert.strictEqual(resultado.valido, true);
    });
});

test('4.4 - RN-CLI-03: email exactamente duplicado se rechaza', function () {
    var env = cargarClientes();
    var resultado = env.sandbox.window.clientes.validarCliente(
        clienteValido({ email: 'juan.perez@mail.com' }),
        env.sandbox.window.libreria
    );

    assert.strictEqual(resultado.valido, false);
    var errores = erroresDe(resultado, 'email');
    assert.strictEqual(errores.length, 1);
    assert.ok(/duplicado/i.test(errores[0].mensaje));
});

test('4.4b - TRIANGULATE: email duplicado con mayúsculas o espacios exteriores se rechaza', function () {
    var env = cargarClientes();
    var validar = env.sandbox.window.clientes.validarCliente;
    var li = env.sandbox.window.libreria;

    ['JUAN.PEREZ@MAIL.COM', '  Juan.Perez@Mail.Com  ', '   juan.perez@mail.com'].forEach(function (email) {
        var resultado = validar(clienteValido({ email: email }), li);
        assert.strictEqual(resultado.valido, false, 'email "' + email + '" debe detectarse como duplicado');
        assert.strictEqual(erroresDe(resultado, 'email').length, 1);
    });
});

test('4.4c - RN-CLI-03: email nuevo no se rechaza por duplicado', function () {
    var env = cargarClientes();
    var resultado = env.sandbox.window.clientes.validarCliente(
        clienteValido({ email: 'Nuevo.Cliente@Mail.com' }),
        env.sandbox.window.libreria
    );

    assert.strictEqual(erroresDe(resultado, 'email').length, 0);
    assert.strictEqual(resultado.valido, true);
});

// --- 4.3 / 4.4: listado y selector de clientes ---

test('4.5 - renderTablaClientes crea una fila por cliente con id, nombre y email', function () {
    var env = cargarClientes();
    var window = env.sandbox.window;
    var doc = env.sandbox.document;
    var li = window.libreria;
    var tbody = doc.getElementById('tabla-clientes');

    window.clientes.renderTablaClientes();

    assert.strictEqual(tbody.children.length, li.clientes.length, 'una fila por cliente');
    tbody.children.forEach(function (fila, i) {
        var cliente = li.clientes[i];
        assert.strictEqual(fila.tagName, 'TR');
        assert.strictEqual(fila.children.length, 3);
        assert.strictEqual(fila.children[0].textContent, String(cliente.id));
        assert.strictEqual(fila.children[1].textContent, cliente.nombreCompleto);
        assert.strictEqual(fila.children[2].textContent, cliente.email);
    });
    assert.strictEqual(doc.getElementById('clientes-vacio').hidden, true, 'con clientes no se muestra el vacío');
});

test('4.5b - TRIANGULATE: las celdas se rellenan con textContent y sin innerHTML', function () {
    var env = cargarClientes();
    var tbody = env.sandbox.document.getElementById('tabla-clientes');

    env.sandbox.window.clientes.renderTablaClientes();

    tbody.children.forEach(function (fila) {
        assert.strictEqual(fila.innerHTML, '');
        fila.children.forEach(function (celda) {
            assert.strictEqual(celda.tagName, 'TD');
            assert.strictEqual(celda.innerHTML, '');
            assert.ok(celda.textContent.length > 0);
        });
    });
});

test('4.6 - estado vacío: sin clientes se muestra #clientes-vacio y no hay filas', function () {
    var env = cargarClientes();
    var window = env.sandbox.window;
    var doc = env.sandbox.document;
    var tbody = doc.getElementById('tabla-clientes');

    window.libreria.clientes.length = 0;
    window.clientes.renderTablaClientes();

    assert.strictEqual(tbody.children.length, 0);
    assert.strictEqual(doc.getElementById('clientes-vacio').hidden, false);
});

test('4.7 - #venta-cliente se puebla desde clientes[] sin duplicar al repoblar', function () {
    var env = cargarClientes();
    var window = env.sandbox.window;
    var li = window.libreria;
    var venta = env.sandbox.document.getElementById('venta-cliente');

    window.clientes.poblarSelectorVentaClientes();

    assert.strictEqual(venta.options.length, li.clientes.length + 1, 'placeholder + clientes');
    assert.strictEqual(venta.options[0].value, '', 'placeholder');
    li.clientes.forEach(function (cliente, i) {
        assert.strictEqual(venta.options[i + 1].value, String(cliente.id));
        assert.strictEqual(venta.options[i + 1].textContent, cliente.nombreCompleto);
    });

    window.clientes.poblarSelectorVentaClientes();
    assert.strictEqual(venta.options.length, li.clientes.length + 1, 'no duplica opciones');
});

// --- 4.5 / 4.6: submit, errores, alta y refresco ---

test('4.8 - submit del formulario de clientes llama preventDefault', function () {
    var env = cargarClientes();
    completarFormulario(env, clienteValido());
    assert.strictEqual(enviarCliente(env), true);
});

test('4.9 - con errores se muestra texto en #clientes-error y se marca el campo inválido', function () {
    var env = cargarClientes();
    var doc = env.sandbox.document;

    completarFormulario(env, clienteValido({ email: 'sin-arroba.com' }));
    enviarCliente(env);

    var error = doc.getElementById('clientes-error');
    var email = doc.getElementById('cliente-email');
    assert.strictEqual(error.hidden, false);
    assert.ok(/email/i.test(error.textContent));
    assert.strictEqual(email.getAttribute('aria-invalid'), 'true');
    assert.strictEqual(email.getAttribute('aria-describedby'), 'clientes-error');
    assert.strictEqual(doc.activeElement, email, 'foco en el primer campo inválido');
    assert.strictEqual(doc.getElementById('clientes-exito').hidden, true);
});

test('4.9b - TRIANGULATE: alta atómica, con email duplicado no se agrega y se conservan los valores', function () {
    var env = cargarClientes();
    var window = env.sandbox.window;
    var doc = env.sandbox.document;
    var cantidadInicial = window.libreria.clientes.length;

    completarFormulario(env, clienteValido({ nombreCompleto: 'Ana Torres', email: 'JUAN.PEREZ@MAIL.COM' }));
    enviarCliente(env);

    assert.strictEqual(window.libreria.clientes.length, cantidadInicial);
    assert.strictEqual(doc.getElementById('cliente-nombre').value, 'Ana Torres');
    assert.strictEqual(doc.getElementById('cliente-email').value, 'JUAN.PEREZ@MAIL.COM');
});

test('4.9c - TRIANGULATE: nombre vacío marca el campo nombre y lo enfoca', function () {
    var env = cargarClientes();
    var doc = env.sandbox.document;

    completarFormulario(env, clienteValido({ nombreCompleto: '   ' }));
    enviarCliente(env);

    assert.strictEqual(doc.getElementById('cliente-nombre').getAttribute('aria-invalid'), 'true');
    assert.strictEqual(doc.activeElement, doc.getElementById('cliente-nombre'));
    assert.ok(/nombre/i.test(doc.getElementById('clientes-error').textContent));
});

test('4.10 - alta válida agrega un cliente con id nuevo y actualiza listado y #venta-cliente', function () {
    var env = cargarClientes();
    var window = env.sandbox.window;
    var li = window.libreria;
    var doc = env.sandbox.document;
    var cantidadInicial = li.clientes.length;
    var maxId = Math.max.apply(null, li.clientes.map(function (c) { return c.id; }));

    completarFormulario(env, clienteValido({ nombreCompleto: '  Ana Torres  ', email: '  Ana.Torres@Mail.com  ' }));
    enviarCliente(env);

    assert.strictEqual(li.clientes.length, cantidadInicial + 1);
    var nuevo = li.clientes[li.clientes.length - 1];
    assert.strictEqual(nuevo.id, maxId + 1);
    assert.strictEqual(nuevo.nombreCompleto, 'Ana Torres', 'nombre con trim');
    assert.strictEqual(nuevo.email, 'Ana.Torres@Mail.com', 'email con trim, sin alterar capitalización');

    var tbody = doc.getElementById('tabla-clientes');
    var ultimaFila = tbody.children[tbody.children.length - 1];
    assert.strictEqual(ultimaFila.children[1].textContent, 'Ana Torres');
    assert.strictEqual(ultimaFila.children[2].textContent, 'Ana.Torres@Mail.com');

    var venta = doc.getElementById('venta-cliente');
    var nombres = venta.options.map(function (o) { return o.textContent; });
    assert.ok(nombres.indexOf('Ana Torres') !== -1, 'aparece en el selector de ventas');
});

test('4.10b - formulario limpio y mensaje de éxito tras un alta válida', function () {
    var env = cargarClientes();
    var doc = env.sandbox.document;

    completarFormulario(env, clienteValido());
    enviarCliente(env);

    assert.strictEqual(doc.getElementById('cliente-nombre').value, '');
    assert.strictEqual(doc.getElementById('cliente-email').value, '');
    assert.strictEqual(doc.getElementById('clientes-exito').hidden, false);
    assert.strictEqual(doc.getElementById('clientes-error').hidden, true);
    assert.strictEqual(doc.getElementById('cliente-email').getAttribute('aria-invalid'), undefined);
});

test('4.10c - nombre con caracteres HTML se inserta como texto literal', function () {
    var env = cargarClientes();
    var doc = env.sandbox.document;
    var nombre = '<b>Ana</b> & Cía';

    completarFormulario(env, clienteValido({ nombreCompleto: nombre, email: 'html@mail.com' }));
    enviarCliente(env);

    var tbody = doc.getElementById('tabla-clientes');
    var ultimaFila = tbody.children[tbody.children.length - 1];
    assert.strictEqual(ultimaFila.children[1].textContent, nombre);
    assert.strictEqual(ultimaFila.innerHTML, '');

    var venta = doc.getElementById('venta-cliente');
    var opcion = venta.options[venta.options.length - 1];
    assert.strictEqual(opcion.textContent, nombre);
    assert.strictEqual(opcion.innerHTML, '');
});

// --- 4.2: persistencia tras alta de cliente (Change C-06) ---

test('4.2 - clientes.js guarda en storage tras alta de cliente', function () {
    var env = shim.crearSandbox();
    shim.cargarScript(env.context, 'js/datos.js');
    shim.cargarScript(env.context, 'js/storage.js');
    shim.cargarScript(env.context, 'js/clientes.js');
    var storage = env.sandbox.window.storage;
    var libreria = env.sandbox.window.libreria;
    var cantidadInicial = libreria.clientes.length;

    completarFormulario(env, clienteValido({ nombreCompleto: 'Cliente Persistido', email: 'persistido@mail.com' }));
    enviarCliente(env);

    var guardados = storage.loadFromStorage(storage.CLAVE_CLIENTES);
    assert.strictEqual(guardados.length, cantidadInicial + 1, 'el cliente se guardó en storage');
    assert.strictEqual(guardados[guardados.length - 1].nombreCompleto, 'Cliente Persistido');
    assert.strictEqual(guardados[guardados.length - 1].email, 'persistido@mail.com');
});
