'use strict';

// TDD: tests para js/catalogo.js (Change C-03, tareas 2 y 3).
// RED: js/catalogo.js no existe aún; estas pruebas deben fallar primero.

var shim = require('./shim.js');
var test = require('node:test').test;
var assert = require('node:assert').strict;

function cargarCatalogoConDatos() {
    var env = shim.crearSandbox();
    shim.cargarScript(env.context, 'js/datos.js');
    shim.cargarScript(env.context, 'js/catalogo.js');
    return env;
}

test('2.1 - renderCatalogo crea article.tarjeta por libro con textContent (sin innerHTML con datos crudos)', function (t) {
    var env = cargarCatalogoConDatos();
    var window = env.sandbox.window;
    var libreria = window.libreria;
    var contenedor = env.sandbox.document._elements['contenedor-catalogo'];

    // render catalogo completo (IIFE ya lo hizo al cargar, pero renderizamos de nuevo de forma controlada)
    window.catalogo.renderCatalogo(libreria.libros);

    assert.strictEqual(contenedor.children.length, libreria.libros.length, 'una tarjeta por libro');

    contenedor.children.forEach(function (tarjeta, i) {
        assert.strictEqual(tarjeta.className, 'tarjeta', 'tarjeta ' + i + ' debe tener clase tarjeta');
        assert.strictEqual(tarjeta.tagName, 'ARTICLE', 'tarjeta ' + i + ' debe ser un article');
        // no se usó innerHTML con datos crudos
        assert.strictEqual(tarjeta.innerHTML, '', 'tarjeta ' + i + ' no debe tener innerHTML (solo textContent)');
        var texto = tarjeta.textContent;
        var libro = libreria.libros[i];
        assert.ok(texto.indexOf(libro.titulo) !== -1, 'tarjeta ' + i + ' muestra el título');
        assert.ok(texto.indexOf(libro.isbn) !== -1, 'tarjeta ' + i + ' muestra el ISBN');
        assert.ok(texto.indexOf(libro.precio.toString()) !== -1, 'tarjeta ' + i + ' muestra el precio');
    });
});

test('2.2 - cada tarjeta muestra los 6 campos y el libro sin género muestra «Sin clasificar»', function (t) {
    var env = cargarCatalogoConDatos();
    var window = env.sandbox.window;
    var libreria = window.libreria;
    var contenedor = env.sandbox.document._elements['contenedor-catalogo'];

    window.catalogo.renderCatalogo(libreria.libros);

    var libroSinGenero = libreria.libros.find(function (l) { return l.generoId === null; });
    assert.ok(libroSinGenero, 'debe existir al menos un libro sin género para este test');

    var idx = libreria.libros.indexOf(libroSinGenero);
    var tarjeta = contenedor.children[idx];
    var texto = tarjeta.textContent;

    // 6 campos requeridos
    assert.ok(texto.indexOf(libroSinGenero.titulo) !== -1, 'título');
    assert.ok(texto.indexOf(libroSinGenero.isbn) !== -1, 'ISBN');
    var editorial = libreria.editoriales.find(function (e) { return e.id === libroSinGenero.editorialId; });
    assert.ok(texto.indexOf(editorial.nombre) !== -1, 'editorial');
    assert.ok(texto.indexOf('Sin clasificar') !== -1, 'género muestra «Sin clasificar» cuando generoId es null');
    libroSinGenero.autoresIds.forEach(function (aid) {
        var autor = libreria.autores.find(function (a) { return a.id === aid; });
        assert.ok(texto.indexOf(autor.nombre) !== -1, 'autor ' + autor.nombre);
    });
    assert.ok(texto.indexOf(libroSinGenero.precio.toString()) !== -1, 'precio');
});

test('2.3 - al cargar se renderiza el catálogo completo (≥6 tarjetas) y #catalogo-estado indica catálogo completo', function (t) {
    var env = cargarCatalogoConDatos();
    var window = env.sandbox.window;
    var libreria = window.libreria;
    var doc = env.sandbox.document;
    var contenedor = doc._elements['contenedor-catalogo'];
    var estado = doc._elements['catalogo-estado'];
    var sinResultados = doc._elements['catalogo-sin-resultados'];

    assert.ok(contenedor.children.length >= 6, 'se renderizan al menos 6 tarjetas al cargar');
    assert.strictEqual(estado.hidden, false, '#catalogo-estado debe estar visible');
    assert.ok(estado.textContent.indexOf('catálogo completo') !== -1, '#catalogo-estado indica catálogo completo');
    assert.strictEqual(sinResultados.hidden, true, '#catalogo-sin-resultados debe estar oculto al cargar');
});

test('3.1 - filtrarLibros: trim + case-insensitive + coincidencia parcial; vacío devuelve todo', function (t) {
    var env = cargarCatalogoConDatos();
    var window = env.sandbox.window;
    var libreria = window.libreria;
    var filtrar = window.catalogo.filtrarLibros;

    // texto vacío -> catálogo completo
    assert.strictEqual(filtrar('').length, libreria.libros.length, 'texto vacío devuelve todos los libros');
    assert.strictEqual(filtrar('   ').length, libreria.libros.length, 'solo espacios devuelve todos los libros (trim)');

    // coincidencia parcial
    var parcial = filtrar('aleph');
    assert.ok(parcial.length >= 1, 'búsqueda parcial "aleph" devuelve al menos un resultado');
    assert.ok(parcial.every(function (l) { return l.titulo.toLowerCase().indexOf('aleph') !== -1; }), 'todos contienen "aleph"');

    // case-insensitive
    var mayus = filtrar('ALEPH');
    var minus = filtrar('aleph');
    assert.strictEqual(mayus.length, minus.length, 'case-insensitive: ALEPH == aleph');

    // sin coincidencias
    var ninguno = filtrar('zzzzznoexiste');
    assert.strictEqual(ninguno.length, 0, 'búsqueda sin coincidencias devuelve array vacío');
});

test('3.1b - TRIANGULATE: filtrarLibros con término que coincide con varios libros (distinta entrada)', function (t) {
    var env = cargarCatalogoConDatos();
    var window = env.sandbox.window;
    var filtrar = window.catalogo.filtrarLibros;

    var varios = filtrar('de');
    assert.ok(varios.length >= 2, '"de" debe coincidir con varios títulos (coincidencia parcial múltiple)');
    assert.ok(varios.every(function (l) { return l.titulo.toLowerCase().indexOf('de') !== -1; }), 'todos contienen "de"');
});

test('2.1b - TRIANGULATE: renderCatalogo con subconjunto filtrado renderiza exactamente esa cantidad de tarjetas', function (t) {
    var env = cargarCatalogoConDatos();
    var window = env.sandbox.window;
    var libreria = window.libreria;
    var contenedor = env.sandbox.document._elements['contenedor-catalogo'];

    var filtrados = libreria.libros.filter(function (l) { return l.id <= 3; });
    window.catalogo.renderCatalogo(filtrados);

    assert.strictEqual(contenedor.children.length, 3, 'renderiza exactamente la cantidad de libros filtrados');
    contenedor.children.forEach(function (tarjeta, i) {
        assert.strictEqual(tarjeta.className, 'tarjeta');
        assert.strictEqual(tarjeta.tagName, 'ARTICLE');
        assert.strictEqual(tarjeta.innerHTML, '', 'sin innerHTML con datos crudos');
    });
});

test('3.2 - submit del formulario de búsqueda llama preventDefault (no recarga la página)', function (t) {
    var env = cargarCatalogoConDatos();
    var window = env.sandbox.window;
    var doc = env.sandbox.document;
    var form = doc._form;

    var preventDefaultLlamado = false;
    var eventoFalso = { preventDefault: function () { preventDefaultLlamado = true; }, type: 'submit' };

    // disparar submit capturando el listener registrado
    form.dispatchEvent(eventoFalso);

    assert.strictEqual(preventDefaultLlamado, true, 'el submit del formulario debe llamar preventDefault');
});

test('3.3 - búsqueda con texto y sin coincidencias: muestra #catalogo-sin-resultados y oculta #catalogo-estado', function (t) {
    var env = cargarCatalogoConDatos();
    var window = env.sandbox.window;
    var doc = env.sandbox.document;
    var contenedor = doc._elements['contenedor-catalogo'];
    var estado = doc._elements['catalogo-estado'];
    var sinResultados = doc._elements['catalogo-sin-resultados'];

    window.catalogo.renderCatalogo([], 'texto inexistente');

    assert.strictEqual(contenedor.children.length, 0, 'contenedor vacío sin resultados');
    assert.strictEqual(sinResultados.hidden, false, '#catalogo-sin-resultados visible');
    assert.ok(sinResultados.textContent.length > 0, 'mensaje claro sin resultados');
    assert.strictEqual(estado.hidden, true, '#catalogo-estado oculto');
});

test('3.4 - búsqueda vacía/texto sin contenido: muestra #catalogo-estado "catálogo completo" y oculta #catalogo-sin-resultados', function (t) {
    var env = cargarCatalogoConDatos();
    var window = env.sandbox.window;
    var libreria = window.libreria;
    var doc = env.sandbox.document;
    var contenedor = doc._elements['contenedor-catalogo'];
    var estado = doc._elements['catalogo-estado'];
    var sinResultados = doc._elements['catalogo-sin-resultados'];

    window.catalogo.renderCatalogo(libreria.libros, '');

    assert.strictEqual(contenedor.children.length, libreria.libros.length, 'catálogo completo');
    assert.strictEqual(estado.hidden, false, '#catalogo-estado visible');
    assert.ok(estado.textContent.indexOf('catálogo completo') !== -1, 'estado indica catálogo completo');
    assert.strictEqual(sinResultados.hidden, true, '#catalogo-sin-resultados oculto');
});

test('3.8 - TRIANGULATE: refrescar() re-renderiza conservando el filtro activo', function () {
    var env = cargarCatalogoConDatos();
    var window = env.sandbox.window;
    var doc = env.sandbox.document;
    var input = doc.getElementById('buscar-titulo');
    var contenedor = doc._elements['contenedor-catalogo'];

    input.value = 'aleph';
    doc._form.dispatchEvent({ type: 'submit', preventDefault: function () {} });
    assert.strictEqual(contenedor.children.length, 1, 'filtro "aleph" deja un libro');

    window.libreria.libros.push({
        id: 99,
        titulo: 'Aleph nuevo',
        isbn: 'REF-001',
        precio: 100,
        editorialId: 1,
        generoId: null,
        autoresIds: [1]
    });
    window.catalogo.refrescar();

    assert.strictEqual(input.value, 'aleph', 'conserva el texto de búsqueda');
    assert.strictEqual(contenedor.children.length, 2, 'refresca aplicando el mismo filtro');
    assert.ok(contenedor.children.length < window.libreria.libros.length, 'no renderiza el catálogo completo');
});
