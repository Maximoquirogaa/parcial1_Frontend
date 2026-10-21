'use strict';

// TDD: tests para js/datos.js (Change C-03, tarea 1).
// RED: js/datos.js no existe aún; estas pruebas deben fallar primero.

var shim = require('./shim.js');
var test = require('node:test').test;
var assert = require('node:assert').strict;

function cargarDatos() {
    var env = shim.crearSandbox();
    shim.cargarScript(env.context, 'js/datos.js');
    return env.sandbox.window.libreria;
}

test('1.1 - datos expone editoriales(2), generos(2), autores(3) con ids enteros estables desde 1', function (t) {
    var libreria = cargarDatos();

    assert.ok(Array.isArray(libreria.editoriales), 'editoriales debe ser un array');
    assert.ok(Array.isArray(libreria.generos), 'generos debe ser un array');
    assert.ok(Array.isArray(libreria.autores), 'autores debe ser un array');

    assert.strictEqual(libreria.editoriales.length, 2, 'deben haber 2 editoriales');
    assert.strictEqual(libreria.generos.length, 2, 'deben haber 2 géneros');
    assert.strictEqual(libreria.autores.length, 3, 'deben haber 3 autores');

    // ids estables enteros desde 1, secuenciales
    libreria.editoriales.forEach(function (e, i) {
        assert.strictEqual(e.id, i + 1, 'editorial id debe ser entero estable desde 1');
        assert.strictEqual(Number.isInteger(e.id), true, 'editorial id debe ser integer');
        assert.ok(typeof e.nombre === 'string' && e.nombre.trim().length > 0, 'editorial nombre no vacío');
    });
    libreria.generos.forEach(function (g, i) {
        assert.strictEqual(g.id, i + 1, 'genero id debe ser entero estable desde 1');
        assert.strictEqual(Number.isInteger(g.id), true, 'genero id debe ser integer');
    });
    libreria.autores.forEach(function (a, i) {
        assert.strictEqual(a.id, i + 1, 'autor id debe ser entero estable desde 1');
        assert.strictEqual(Number.isInteger(a.id), true, 'autor id debe ser integer');
    });

    // nombres esperados del seed (KB 04)
    assert.strictEqual(libreria.editoriales[0].nombre, 'Sudamericana');
    assert.strictEqual(libreria.editoriales[1].nombre, 'Sur');
    assert.strictEqual(libreria.generos[0].nombre, 'Realismo Mágico');
    assert.strictEqual(libreria.generos[1].nombre, 'Ensayo');
    assert.strictEqual(libreria.autores[0].nombre, 'Gabriel García Márquez');
    assert.strictEqual(libreria.autores[1].nombre, 'Jorge Luis Borges');
    assert.strictEqual(libreria.autores[2].nombre, 'Julio Cortázar');
});

test('1.2 - libros >=6 con ids estables, campos requeridos y relaciones válidas', function (t) {
    var libreria = cargarDatos();
    var libros = libreria.libros;

    assert.ok(Array.isArray(libros), 'libros debe ser un array');
    assert.ok(libros.length >= 6, 'deben haber al menos 6 libros');

    var idsEditoriales = {};
    libreria.editoriales.forEach(function (e) { idsEditoriales[e.id] = true; });
    var idsGeneros = {};
    libreria.generos.forEach(function (g) { idsGeneros[g.id] = true; });
    var idsAutores = {};
    libreria.autores.forEach(function (a) { idsAutores[a.id] = true; });

    var isbns = [];
    var haySinGenero = false;

    libros.forEach(function (libro, i) {
        assert.strictEqual(Number.isInteger(libro.id), true, 'libro ' + i + ' id debe ser integer estable');
        assert.strictEqual(libro.id, i + 1, 'libro ' + i + ' id secuencial desde 1');

        assert.ok(typeof libro.titulo === 'string' && libro.titulo.trim().length > 0, 'libro ' + i + ' titulo no vacío');
        assert.ok(typeof libro.isbn === 'string' && libro.isbn.trim().length > 0, 'libro ' + i + ' isbn no vacío');
        isbns.push(libro.isbn);

        assert.strictEqual(Number.isFinite(libro.precio) && libro.precio > 0, true, 'libro ' + i + ' precio numérico > 0');

        assert.ok(idsEditoriales[libro.editorialId] === true, 'libro ' + i + ' editorialId debe existir');
        assert.ok(libro.generoId === null || (Number.isInteger(libro.generoId) && idsGeneros[libro.generoId] === true), 'libro ' + i + ' generoId null o existente');
        if (libro.generoId === null) { haySinGenero = true; }

        assert.ok(Array.isArray(libro.autoresIds) && libro.autoresIds.length >= 1, 'libro ' + i + ' autoresIds >= 1');
        libro.autoresIds.forEach(function (aid) {
            assert.ok(idsAutores[aid] === true, 'libro ' + i + ' autorId ' + aid + ' debe existir');
        });
    });

    // ISBNs únicos
    var unicos = new Set(isbns);
    assert.strictEqual(unicos.size, isbns.length, 'los ISBN deben ser únicos');

    // al menos un libro sin género
    assert.strictEqual(haySinGenero, true, 'al menos un libro debe tener generoId null');
});

test('1.3 - clientes: 3 clientes con nombreCompleto y email único', function (t) {
    var libreria = cargarDatos();
    var clientes = libreria.clientes;

    assert.ok(Array.isArray(clientes), 'clientes debe ser un array');
    assert.strictEqual(clientes.length, 3, 'deben haber 3 clientes');

    var emails = [];
    clientes.forEach(function (c, i) {
        assert.ok(typeof c.nombreCompleto === 'string' && c.nombreCompleto.trim().length > 0, 'cliente ' + i + ' nombreCompleto no vacío');
        assert.ok(typeof c.email === 'string' && c.email.trim().length > 0, 'cliente ' + i + ' email no vacío');
        emails.push(c.email);
    });

    var unicos = new Set(emails);
    assert.strictEqual(unicos.size, emails.length, 'los emails de clientes deben ser únicos');
});

test('1.4 - espacio de nombres global window.libreria expone los 5 arrays', function (t) {
    var env = shim.crearSandbox();
    shim.cargarScript(env.context, 'js/datos.js');
    var ns = env.sandbox.window.libreria;

    assert.ok(ns, 'window.libreria debe existir');
    assert.ok(Array.isArray(ns.editoriales), 'editoriales expuesto');
    assert.ok(Array.isArray(ns.generos), 'generos expuesto');
    assert.ok(Array.isArray(ns.autores), 'autores expuesto');
    assert.ok(Array.isArray(ns.libros), 'libros expuesto');
    assert.ok(Array.isArray(ns.clientes), 'clientes expuesto');
});

// --- 3.1 / 3.1b / 3.1c: integración con storage (Change C-06) ---

test('3.1 - datos.js carga libros y clientes desde storage si existen', function () {
    var env = shim.crearSandbox();
    shim.cargarScript(env.context, 'js/storage.js');
    var storage = env.sandbox.window.storage;
    var librosGuardados = [
        { id: 1, titulo: 'Libro Guardado', isbn: 'GUARD-1', precio: 5000, editorialId: 1, generoId: null, autoresIds: [1] }
    ];
    var clientesGuardados = [
        { id: 1, nombreCompleto: 'Cliente Guardado', email: 'guardado@mail.com' }
    ];
    storage.saveToStorage(storage.CLAVE_LIBROS, librosGuardados);
    storage.saveToStorage(storage.CLAVE_CLIENTES, clientesGuardados);

    shim.cargarScript(env.context, 'js/datos.js');
    var libreria = env.sandbox.window.libreria;

    assert.deepStrictEqual(libreria.libros, librosGuardados, 'libros cargados desde storage');
    assert.deepStrictEqual(libreria.clientes, clientesGuardados, 'clientes cargados desde storage');
});

test('3.1b - datos.js usa seed como fallback si storage está vacío', function () {
    var env = shim.crearSandbox();
    shim.cargarScript(env.context, 'js/storage.js');
    shim.cargarScript(env.context, 'js/datos.js');
    var libreria = env.sandbox.window.libreria;

    assert.ok(Array.isArray(libreria.libros) && libreria.libros.length >= 6, 'seed de libros usado como fallback');
    assert.strictEqual(libreria.clientes.length, 3, 'seed de clientes usado como fallback');
    assert.strictEqual(libreria.libros[0].titulo, 'Cien años de soledad', 'primer libro del seed');
});

test('3.1c - datos.js no duplica seed al reabrir (usa datos existentes de storage)', function () {
    var env = shim.crearSandbox();
    shim.cargarScript(env.context, 'js/storage.js');
    var storage = env.sandbox.window.storage;
    var librosExistentes = [
        { id: 99, titulo: 'Ya Existente', isbn: 'EXIST-99', precio: 7777, editorialId: 1, generoId: null, autoresIds: [1] }
    ];
    storage.saveToStorage(storage.CLAVE_LIBROS, librosExistentes);

    shim.cargarScript(env.context, 'js/datos.js');
    var libreria = env.sandbox.window.libreria;

    assert.deepStrictEqual(libreria.libros, librosExistentes, 'no se duplica el seed; se usan los datos existentes');
    assert.strictEqual(libreria.libros.length, 1, 'solo un libro, no seed + existentes');
});

test('3.2 - datos.js carga las ventas desde storage si existen', function () {
    var env = shim.crearSandbox();
    shim.cargarScript(env.context, 'js/storage.js');
    var storage = env.sandbox.window.storage;
    var ventasGuardadas = [
        {
            id: 7,
            fecha: '2026-10-21T10:00:00.000Z',
            clienteId: 1,
            clienteNombre: 'Juan Pérez',
            renglones: [
                { libroId: 1, libroTitulo: 'Cien años de soledad', precioUnitario: 12500, cantidad: 2, subtotal: 25000 }
            ],
            total: 25000
        }
    ];
    storage.saveToStorage(storage.CLAVE_VENTAS, ventasGuardadas);

    shim.cargarScript(env.context, 'js/datos.js');
    var libreria = env.sandbox.window.libreria;

    assert.deepStrictEqual(libreria.ventas, ventasGuardadas, 'ventas cargadas desde storage');
});

test('3.2b - datos.js inicializa ventas como arreglo vacío sin storage', function () {
    var env = shim.crearSandbox();
    shim.cargarScript(env.context, 'js/datos.js');
    var libreria = env.sandbox.window.libreria;

    assert.ok(Array.isArray(libreria.ventas), 'libreria.ventas es un arreglo');
    assert.strictEqual(libreria.ventas.length, 0, 'sin ventas guardadas arranca vacío');
});
