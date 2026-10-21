'use strict';

// TDD: tests para js/storage.js (Change C-06, tarea 2).
// RED inicial: js/storage.js no existe aún; las pruebas deben fallar antes de implementar.

var shim = require('./shim.js');
var test = require('node:test').test;
var assert = require('node:assert').strict;

function cargarStorage() {
    var env = shim.crearSandbox();
    shim.cargarScript(env.context, 'js/storage.js');
    return env.sandbox.window.storage;
}

// --- 2.1 / 2.1b / 2.1c / 2.1d: loadFromStorage y saveToStorage puras ---

test('2.1 - isStorageAvailable devuelve true cuando localStorage está disponible', function () {
    var storage = cargarStorage();

    assert.strictEqual(storage.isStorageAvailable(), true, 'localStorage disponible debe devolver true');
});

test('2.1b - saveToStorage + loadFromStorage guarda y lee un array', function () {
    var storage = cargarStorage();
    var datos = [
        { id: 1, titulo: 'Cien años de soledad', precio: 12500 },
        { id: 2, titulo: 'El Aleph', precio: 9800 }
    ];

    storage.saveToStorage(storage.CLAVE_LIBROS, datos);
    var leidos = storage.loadFromStorage(storage.CLAVE_LIBROS);

    assert.deepStrictEqual(leidos, datos, 'debe devolver el mismo array guardado');
    assert.strictEqual(leidos.length, 2);
    assert.strictEqual(leidos[0].titulo, 'Cien años de soledad');
});

test('2.1c - loadFromStorage devuelve null para clave inexistente', function () {
    var storage = cargarStorage();

    assert.strictEqual(storage.loadFromStorage('clave_que_no_existe'), null, 'clave inexistente devuelve null');
});

test('2.1d - loadFromStorage devuelve null si el valor almacenado no es un array', function () {
    var storage = cargarStorage();

    storage.saveToStorage(storage.CLAVE_LIBROS, { no: 'es un array' });

    assert.strictEqual(storage.loadFromStorage(storage.CLAVE_LIBROS), null, 'valor no-array devuelve null');
});

// --- 2.3 / 2.3b / 2.3c: seedIfEmpty ---

test('2.3 - seedIfEmpty carga el seed cuando no existen claves', function () {
    var storage = cargarStorage();
    var seed = [
        { id: 1, titulo: 'Libro Semilla', precio: 1000 }
    ];

    var resultado = storage.seedIfEmpty(seed);

    assert.strictEqual(resultado, true, 'seedIfEmpty devuelve true al cargar seed');
    assert.deepStrictEqual(storage.loadFromStorage(storage.CLAVE_LIBROS), seed, 'seed persistido en storage');
});

test('2.3b - seedIfEmpty no duplica cuando ya existen claves', function () {
    var storage = cargarStorage();
    var seed = [
        { id: 1, titulo: 'Libro Semilla', precio: 1000 },
        { id: 2, titulo: 'Otro Libro', precio: 2000 }
    ];
    var existentes = [
        { id: 10, titulo: 'Ya Existente', precio: 5000 }
    ];

    storage.saveToStorage(storage.CLAVE_LIBROS, existentes);
    var resultado = storage.seedIfEmpty(seed);

    assert.strictEqual(resultado, false, 'seedIfEmpty devuelve false cuando ya hay claves');
    assert.deepStrictEqual(storage.loadFromStorage(storage.CLAVE_LIBROS), existentes, 'no se duplica el seed');
});

test('2.3c - seedIfEmpty persiste el seed por primera vez en las tres claves', function () {
    var storage = cargarStorage();
    var libros = [{ id: 1, titulo: 'Libro A', precio: 1000 }];
    var clientes = [{ id: 1, nombreCompleto: 'Cliente A', email: 'a@mail.com' }];
    var ventas = [];

    storage.seedIfEmpty(libros, clientes, ventas);

    assert.deepStrictEqual(storage.loadFromStorage(storage.CLAVE_LIBROS), libros);
    assert.deepStrictEqual(storage.loadFromStorage(storage.CLAVE_CLIENTES), clientes);
    assert.deepStrictEqual(storage.loadFromStorage(storage.CLAVE_VENTAS), ventas);
});

// --- 2.5 / 2.5b: isStorageAvailable cuando localStorage lanza ---

test('2.5 - isStorageAvailable devuelve false cuando localStorage no disponible', function () {
    var env = shim.crearSandbox();
    // Simular localStorage que lanza al usarlo (modo privado/restrictivo)
    env.sandbox.window.localStorage = {
        getItem: function () { throw new Error('cuota excedida'); },
        setItem: function () { throw new Error('cuota excedida'); },
        removeItem: function () { throw new Error('cuota excedida'); },
        clear: function () { throw new Error('cuota excedida'); }
    };
    shim.cargarScript(env.context, 'js/storage.js');
    var storage = env.sandbox.window.storage;

    assert.strictEqual(storage.isStorageAvailable(), false, 'localStorage que lanza debe devolver false');
});

test('2.5b - degradación a memoria sin romper cuando localStorage no disponible', function () {
    var env = shim.crearSandbox();
    env.sandbox.window.localStorage = {
        getItem: function () { throw new Error('no disponible'); },
        setItem: function () { throw new Error('no disponible'); },
        removeItem: function () { throw new Error('no disponible'); },
        clear: function () { throw new Error('no disponible'); }
    };
    shim.cargarScript(env.context, 'js/storage.js');
    var storage = env.sandbox.window.storage;

    assert.strictEqual(storage.isStorageAvailable(), false);

    // saveToStorage y loadFromStorage no deben romper en modo degradado
    storage.saveToStorage(storage.CLAVE_LIBROS, [{ id: 1, titulo: 'X', precio: 10 }]);
    var leidos = storage.loadFromStorage(storage.CLAVE_LIBROS);
    assert.deepStrictEqual(leidos, [{ id: 1, titulo: 'X', precio: 10 }], 'degradación a memoria funciona');
});
