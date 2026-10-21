'use strict';

// TDD: tests para js/libros.js (Change C-04, tareas 2 a 5).
// RED inicial: js/libros.js no existe aún; las pruebas deben fallar antes de implementar.

var fs = require('node:fs');
var shim = require('./shim.js');
var test = require('node:test').test;
var assert = require('node:assert').strict;

function cargarLibros(opciones) {
    opciones = opciones || {};
    var env = shim.crearSandbox();
    shim.cargarScript(env.context, 'js/datos.js');
    if (opciones.conCatalogo) {
        shim.cargarScript(env.context, 'js/catalogo.js');
    }
    shim.cargarScript(env.context, 'js/libros.js');
    return env;
}

function libroValido(extra) {
    var base = {
        titulo: 'Nuevo libro',
        isbn: '111222333',
        precio: '1500',
        editorialId: '1',
        generoId: '',
        autoresIds: ['1']
    };
    Object.keys(extra || {}).forEach(function (k) { base[k] = extra[k]; });
    return base;
}

function erroresDe(resultado, campo) {
    return resultado.errores.filter(function (e) { return e.campo === campo; });
}

function opcionPorValor(select, valor) {
    return select.options.filter(function (o) { return String(o.value) === String(valor); })[0];
}

function seleccionar(select, valores) {
    valores.forEach(function (valor) {
        var op = opcionPorValor(select, valor);
        assert.ok(op, 'debe existir la opción ' + valor + ' en el selector');
        op.selected = true;
    });
}

function completarFormulario(env, datos) {
    var doc = env.sandbox.document;
    doc.getElementById('libro-titulo').value = datos.titulo;
    doc.getElementById('libro-isbn').value = datos.isbn;
    doc.getElementById('libro-precio').value = datos.precio;
    var editorial = doc.getElementById('libro-editorial');
    editorial.value = datos.editorialId === null ? '' : String(datos.editorialId);
    var genero = doc.getElementById('libro-genero');
    genero.value = datos.generoId === null || datos.generoId === '' ? '' : String(datos.generoId);
    var autores = doc.getElementById('libro-autores');
    autores.options.forEach(function (o) { o.selected = false; });
    seleccionar(autores, datos.autoresIds || []);
}

function enviarLibro(env) {
    var form = env.sandbox.document._elements._formLibros;
    var llamado = false;
    form.dispatchEvent({ type: 'submit', preventDefault: function () { llamado = true; } });
    return llamado;
}

// --- 2.1 / 2.1b / 2.2: funciones puras base ---

test('2.1 - normalizarIsbn quita espacios y guiones y pasa a mayúsculas', function () {
    var env = cargarLibros();
    var normalizar = env.sandbox.window.libros.normalizarIsbn;

    assert.strictEqual(normalizar(' 978-950 0428132 '), '9789500428132');
    assert.strictEqual(normalizar('978-950-042813x'), '978950042813X');
});

test('2.1b - TRIANGULATE: normalizarIsbn de valores sin caracteres válidos queda vacío', function () {
    var env = cargarLibros();
    var normalizar = env.sandbox.window.libros.normalizarIsbn;

    assert.strictEqual(normalizar(''), '');
    assert.strictEqual(normalizar('  ---  '), '');
    assert.strictEqual(normalizar(' - - '), '');
});

test('2.2 - siguienteId devuelve max+1 y 1 sobre colección vacía', function () {
    var env = cargarLibros();
    var siguienteId = env.sandbox.window.libros.siguienteId;

    assert.strictEqual(siguienteId([{ id: 1 }, { id: 5 }, { id: 2 }]), 6);
    assert.strictEqual(siguienteId([]), 1);
});

// --- 2.3 / 2.4: RN-LIB-01 y RN-LIB-02 ---

function libreriaMinima() {
    return {
        editoriales: [{ id: 1, nombre: 'Editorial Uno' }],
        generos: [{ id: 1, nombre: 'Género Uno' }],
        autores: [{ id: 1, nombre: 'Autora Uno' }],
        libros: [{ id: 1, titulo: 'Existente', isbn: 'ABC123X', precio: 10, editorialId: 1, generoId: null, autoresIds: [1] }],
        clientes: []
    };
}

test('2.3 - RN-LIB-01: título vacío o solo espacios se rechaza', function () {
    var env = cargarLibros();
    var validar = env.sandbox.window.libros.validarLibro;
    var li = env.sandbox.window.libreria;

    var vacio = validar(libroValido({ titulo: '' }), li);
    assert.strictEqual(vacio.valido, false, 'título vacío debe invalidar el alta');
    assert.strictEqual(erroresDe(vacio, 'titulo').length, 1, 'debe reportar el campo título');
    assert.ok(/título/i.test(erroresDe(vacio, 'titulo')[0].mensaje), 'el mensaje nombra el título');

    var espacios = validar(libroValido({ titulo: '     ' }), li);
    assert.strictEqual(espacios.valido, false, 'título de solo espacios debe invalidar el alta');
    assert.strictEqual(erroresDe(espacios, 'titulo').length, 1);
});

test('2.3b - TRIANGULATE: RN-LIB-01 rechaza ISBN vacío, solo espacios o solo guiones', function () {
    var env = cargarLibros();
    var validar = env.sandbox.window.libros.validarLibro;
    var li = env.sandbox.window.libreria;

    ['', '   ', ' - - - '].forEach(function (isbn) {
        var resultado = validar(libroValido({ isbn: isbn }), li);
        assert.strictEqual(resultado.valido, false, 'ISBN "' + isbn + '" debe invalidar el alta');
        assert.strictEqual(erroresDe(resultado, 'isbn').length, 1, 'debe reportar el campo ISBN');
    });
});

test('2.3c - RN-LIB-01: título e ISBN con contenido no se rechazan por esta regla', function () {
    var env = cargarLibros();
    var resultado = env.sandbox.window.libros.validarLibro(libroValido(), env.sandbox.window.libreria);

    assert.strictEqual(erroresDe(resultado, 'titulo').length, 0);
    assert.strictEqual(erroresDe(resultado, 'isbn').length, 0);
    assert.strictEqual(resultado.valido, true);
});

test('2.3d - RN-LIB-02: ISBN exactamente duplicado se rechaza', function () {
    var env = cargarLibros();
    var resultado = env.sandbox.window.libros.validarLibro(
        libroValido({ isbn: '9789500428132' }),
        env.sandbox.window.libreria
    );

    assert.strictEqual(resultado.valido, false);
    var errores = erroresDe(resultado, 'isbn');
    assert.strictEqual(errores.length, 1);
    assert.ok(/duplicado/i.test(errores[0].mensaje), 'el mensaje indica duplicado');
});

test('2.3e - TRIANGULATE: ISBN duplicado con guiones o espacios se rechaza', function () {
    var env = cargarLibros();
    var validar = env.sandbox.window.libros.validarLibro;
    var li = env.sandbox.window.libreria;

    ['978-950-0428132', '978 950 0428132', ' 978-9500428132 '].forEach(function (isbn) {
        var resultado = validar(libroValido({ isbn: isbn }), li);
        assert.strictEqual(resultado.valido, false, 'ISBN "' + isbn + '" debe detectarse como duplicado');
        assert.strictEqual(erroresDe(resultado, 'isbn').length, 1);
    });
});

test('2.3f - TRIANGULATE: ISBN duplicado con distinta capitalización se rechaza', function () {
    var env = cargarLibros();
    var resultado = env.sandbox.window.libros.validarLibro(
        libroValido({ isbn: 'abc-123x' }),
        libreriaMinima()
    );

    assert.strictEqual(resultado.valido, false);
    assert.strictEqual(erroresDe(resultado, 'isbn').length, 1, 'ABC123X y abc-123x son el mismo ISBN');
});

test('2.3g - RN-LIB-02: ISBN nuevo no se rechaza por duplicado', function () {
    var env = cargarLibros();
    var resultado = env.sandbox.window.libros.validarLibro(
        libroValido({ isbn: '999-888-777' }),
        env.sandbox.window.libreria
    );

    assert.strictEqual(resultado.valido, true);
    assert.strictEqual(erroresDe(resultado, 'isbn').length, 0);
});

// --- 2.5 / 2.6: RN-LIB-03 y RN-LIB-04 ---

test('2.5 - RN-LIB-03: precio cero o negativo se rechaza por no ser mayor que cero', function () {
    var env = cargarLibros();
    var validar = env.sandbox.window.libros.validarLibro;
    var li = env.sandbox.window.libreria;

    ['0', '-5', -0.01].forEach(function (precio) {
        var resultado = validar(libroValido({ precio: precio }), li);
        assert.strictEqual(resultado.valido, false, 'precio ' + precio + ' debe rechazarse');
        var errores = erroresDe(resultado, 'precio');
        assert.strictEqual(errores.length, 1);
        assert.ok(/mayor que cero/i.test(errores[0].mensaje));
    });
});

test('2.5b - TRIANGULATE: RN-LIB-03 rechaza precio vacío o no numérico con error de número', function () {
    var env = cargarLibros();
    var validar = env.sandbox.window.libros.validarLibro;
    var li = env.sandbox.window.libreria;

    ['', '   ', 'abc', '12abc'].forEach(function (precio) {
        var resultado = validar(libroValido({ precio: precio }), li);
        assert.strictEqual(resultado.valido, false, 'precio "' + precio + '" debe rechazarse');
        var errores = erroresDe(resultado, 'precio');
        assert.strictEqual(errores.length, 1);
        assert.ok(/número/i.test(errores[0].mensaje));
    });
});

test('2.5c - RN-LIB-03: precio positivo válido no se rechaza', function () {
    var env = cargarLibros();
    var resultado = env.sandbox.window.libros.validarLibro(
        libroValido({ precio: '12500.50' }),
        env.sandbox.window.libreria
    );

    assert.strictEqual(erroresDe(resultado, 'precio').length, 0);
    assert.strictEqual(resultado.valido, true);
});

test('2.5d - parsearPrecio distingue vacío (NaN) de cero', function () {
    var env = cargarLibros();
    var parsear = env.sandbox.window.libros.parsearPrecio;

    assert.ok(Number.isNaN(parsear('')));
    assert.ok(Number.isNaN(parsear('   ')));
    assert.strictEqual(parsear('0'), 0);
    assert.strictEqual(parsear(' 12500.50 '), 12500.5);
});

test('2.6 - RN-LIB-04: editorial vacía o inexistente se rechaza', function () {
    var env = cargarLibros();
    var validar = env.sandbox.window.libros.validarLibro;
    var li = env.sandbox.window.libreria;

    var sinEditorial = validar(libroValido({ editorialId: '' }), li);
    assert.strictEqual(sinEditorial.valido, false);
    assert.strictEqual(erroresDe(sinEditorial, 'editorial').length, 1);
    assert.ok(/obligatoria/i.test(erroresDe(sinEditorial, 'editorial')[0].mensaje));

    var inexistente = validar(libroValido({ editorialId: '99' }), li);
    assert.strictEqual(inexistente.valido, false);
    assert.strictEqual(erroresDe(inexistente, 'editorial').length, 1);
});

test('2.6b - TRIANGULATE: RN-LIB-04 acepta una editorial existente', function () {
    var env = cargarLibros();
    var validar = env.sandbox.window.libros.validarLibro;

    [1, '1'].forEach(function (editorialId) {
        var resultado = validar(libroValido({ editorialId: editorialId }), env.sandbox.window.libreria);
        assert.strictEqual(erroresDe(resultado, 'editorial').length, 0);
        assert.strictEqual(resultado.valido, true);
    });
});

// --- 2.7 / 2.8: RN-LIB-05 y RN-LIB-06 ---

test('2.7 - RN-LIB-05: sin autores se rechaza con error de al menos un autor', function () {
    var env = cargarLibros();
    var resultado = env.sandbox.window.libros.validarLibro(
        libroValido({ autoresIds: [] }),
        env.sandbox.window.libreria
    );

    assert.strictEqual(resultado.valido, false);
    var errores = erroresDe(resultado, 'autores');
    assert.strictEqual(errores.length, 1);
    assert.ok(/al menos un autor/i.test(errores[0].mensaje));
});

test('2.7b - TRIANGULATE: autor inexistente invalida el alta', function () {
    var env = cargarLibros();
    var validar = env.sandbox.window.libros.validarLibro;
    var li = env.sandbox.window.libreria;

    var resultado = validar(libroValido({ autoresIds: ['99'] }), li);
    assert.strictEqual(resultado.valido, false);
    assert.strictEqual(erroresDe(resultado, 'autores').length, 1);

    var mixto = validar(libroValido({ autoresIds: ['1', '99'] }), li);
    assert.strictEqual(mixto.valido, false, 'basta un autor inexistente para rechazar');
    assert.strictEqual(erroresDe(mixto, 'autores').length, 1);
});

test('2.7c - RN-LIB-05: varios autores existentes son válidos', function () {
    var env = cargarLibros();
    var resultado = env.sandbox.window.libros.validarLibro(
        libroValido({ autoresIds: ['1', '2', '3'] }),
        env.sandbox.window.libreria
    );

    assert.strictEqual(erroresDe(resultado, 'autores').length, 0);
    assert.strictEqual(resultado.valido, true);
});

test('2.7d - RN-LIB-06: sin género (vacío) es válido; género inexistente no', function () {
    var env = cargarLibros();
    var validar = env.sandbox.window.libros.validarLibro;
    var li = env.sandbox.window.libreria;

    var sinGenero = validar(libroValido({ generoId: '' }), li);
    assert.strictEqual(erroresDe(sinGenero, 'genero').length, 0, 'vacío representa ausencia');
    assert.strictEqual(sinGenero.valido, true);

    var existente = validar(libroValido({ generoId: '1' }), li);
    assert.strictEqual(erroresDe(existente, 'genero').length, 0);
    assert.strictEqual(existente.valido, true);

    ['99', 'abc'].forEach(function (generoId) {
        var invalido = validar(libroValido({ generoId: generoId }), li);
        assert.strictEqual(invalido.valido, false, 'género ' + generoId + ' debe rechazarse');
        assert.strictEqual(erroresDe(invalido, 'genero').length, 1);
    });
});

// --- 3.1 / 3.2: listado y selectores de libros ---

test('3.1 - renderTablaLibros crea una fila por libro con sus cinco campos', function () {
    var env = cargarLibros();
    var window = env.sandbox.window;
    var li = window.libreria;
    var tbody = env.sandbox.document.getElementById('tabla-libros');

    window.libros.renderTablaLibros();

    assert.strictEqual(tbody.children.length, li.libros.length, 'una fila por libro');
    tbody.children.forEach(function (fila, i) {
        var libro = li.libros[i];
        assert.strictEqual(fila.tagName, 'TR');
        assert.strictEqual(fila.children.length, 5, 'cinco columnas');
        assert.strictEqual(fila.children[0].textContent, libro.titulo, 'título');
        assert.strictEqual(fila.children[1].textContent, libro.isbn, 'ISBN');
        var editorial = li.editoriales.filter(function (e) { return e.id === libro.editorialId; })[0];
        assert.strictEqual(fila.children[2].textContent, editorial.nombre, 'editorial');
    });
    assert.strictEqual(env.sandbox.document.getElementById('libros-vacio').hidden, true, 'con libros no se muestra el vacío');
});

test('3.1b - TRIANGULATE: libro sin género muestra «Sin clasificar» en la fila', function () {
    var env = cargarLibros();
    var window = env.sandbox.window;
    var li = window.libreria;
    var tbody = env.sandbox.document.getElementById('tabla-libros');

    window.libros.renderTablaLibros();

    var indice = li.libros.findIndex(function (l) { return l.generoId === null; });
    assert.ok(indice >= 0, 'el seed debe tener un libro sin género');
    assert.strictEqual(tbody.children[indice].children[3].textContent, 'Sin clasificar');

    var conGenero = li.libros.findIndex(function (l) { return l.generoId !== null; });
    var genero = li.generos.filter(function (g) { return g.id === li.libros[conGenero].generoId; })[0];
    assert.strictEqual(tbody.children[conGenero].children[3].textContent, genero.nombre);
});

test('3.1c - precio con formato $ y dos decimales consistente con el catálogo', function () {
    var env = cargarLibros();
    var window = env.sandbox.window;
    var li = window.libreria;
    var tbody = env.sandbox.document.getElementById('tabla-libros');

    window.libros.renderTablaLibros();

    tbody.children.forEach(function (fila, i) {
        var esperado = '$' + Number(li.libros[i].precio).toFixed(2);
        assert.strictEqual(fila.children[4].textContent, esperado);
    });
});

test('3.1d - las celdas se crean con createElement y se rellenan con textContent (sin innerHTML)', function () {
    var env = cargarLibros();
    var tbody = env.sandbox.document.getElementById('tabla-libros');

    env.sandbox.window.libros.renderTablaLibros();

    tbody.children.forEach(function (fila) {
        assert.strictEqual(fila.innerHTML, '', 'la fila no usa innerHTML');
        fila.children.forEach(function (celda) {
            assert.strictEqual(celda.tagName, 'TD');
            assert.strictEqual(celda.innerHTML, '', 'la celda no usa innerHTML');
            assert.ok(celda.textContent.length > 0, 'la celda tiene texto renderizado');
        });
    });
});

test('3.2 - estado vacío: sin libros se muestra #libros-vacio y no hay filas', function () {
    var env = cargarLibros();
    var window = env.sandbox.window;
    var tbody = env.sandbox.document.getElementById('tabla-libros');
    var vacio = env.sandbox.document.getElementById('libros-vacio');

    window.libreria.libros.length = 0;
    window.libros.renderTablaLibros();

    assert.strictEqual(tbody.children.length, 0);
    assert.strictEqual(vacio.hidden, false, '#libros-vacio debe mostrarse');
});

test('3.3 - poblarSelectores genera editoriales, géneros con «Sin clasificar» y autores', function () {
    var env = cargarLibros();
    var window = env.sandbox.window;
    var li = window.libreria;
    var doc = env.sandbox.document;

    window.libros.poblarSelectores();

    var editorial = doc.getElementById('libro-editorial');
    assert.strictEqual(editorial.options.length, li.editoriales.length + 1, 'placeholder + editoriales');
    assert.strictEqual(editorial.options[0].value, '', 'placeholder vacío');
    li.editoriales.forEach(function (e, i) {
        assert.strictEqual(editorial.options[i + 1].value, String(e.id));
        assert.strictEqual(editorial.options[i + 1].textContent, e.nombre);
    });

    var genero = doc.getElementById('libro-genero');
    assert.strictEqual(genero.options.length, li.generos.length + 1);
    assert.ok(/Sin clasificar/.test(genero.options[0].textContent), 'primera opción «Sin clasificar»');
    assert.strictEqual(genero.options[0].value, '');

    var autores = doc.getElementById('libro-autores');
    assert.strictEqual(autores.options.length, li.autores.length);
    li.autores.forEach(function (a, i) {
        assert.strictEqual(autores.options[i].value, String(a.id));
        assert.strictEqual(autores.options[i].textContent, a.nombre);
    });
});

test('3.3b - TRIANGULATE: el selector de autores es múltiple y admite dos autores', function () {
    var env = cargarLibros();
    var window = env.sandbox.window;
    var autores = env.sandbox.document.getElementById('libro-autores');

    window.libros.poblarSelectores();
    assert.strictEqual(autores.multiple, true);

    seleccionar(autores, ['1', '2']);
    assert.strictEqual(autores.selectedOptions.length, 2);
});

test('3.3c - TRIANGULATE: repoblar no duplica opciones y conserva la selección válida', function () {
    var env = cargarLibros();
    var window = env.sandbox.window;
    var doc = env.sandbox.document;
    var editorial = doc.getElementById('libro-editorial');
    var autores = doc.getElementById('libro-autores');

    window.libros.poblarSelectores();
    editorial.value = '2';
    seleccionar(autores, ['2']);
    window.libros.poblarSelectores();

    assert.strictEqual(editorial.options.length, window.libreria.editoriales.length + 1);
    assert.strictEqual(editorial.value, '2');
    assert.strictEqual(autores.options.length, window.libreria.autores.length);
    assert.deepStrictEqual(autores.selectedOptions.map(function (o) { return o.value; }), ['2']);
});

// --- 3.3 / 3.4: submit, errores y alta ---

test('3.4 - submit del formulario de libros llama preventDefault', function () {
    var env = cargarLibros();
    completarFormulario(env, libroValido());
    assert.strictEqual(enviarLibro(env), true, 'el handler debe llamar preventDefault');
});

test('3.5 - con errores se muestra texto en #libros-error y se marca el campo inválido', function () {
    var env = cargarLibros();
    var doc = env.sandbox.document;

    completarFormulario(env, libroValido({ titulo: '   ' }));
    enviarLibro(env);

    var error = doc.getElementById('libros-error');
    var titulo = doc.getElementById('libro-titulo');
    assert.strictEqual(error.hidden, false, 'el resumen de errores debe mostrarse');
    assert.ok(/título/i.test(error.textContent), 'el resumen nombra el campo inválido');
    assert.strictEqual(titulo.getAttribute('aria-invalid'), 'true');
    assert.strictEqual(titulo.getAttribute('aria-describedby'), 'libros-error');
    assert.strictEqual(doc.activeElement, titulo, 'el foco va al primer campo inválido');
    assert.strictEqual(doc.getElementById('libros-exito').hidden, true, 'no debe mostrarse el éxito');
});

test('3.5b - TRIANGULATE: alta atómica, con un error no se agrega ningún libro y se conservan los valores', function () {
    var env = cargarLibros();
    var doc = env.sandbox.document;
    var cantidadInicial = env.sandbox.window.libreria.libros.length;

    completarFormulario(env, libroValido({ titulo: 'Mi libro', isbn: '9789500428132' }));
    enviarLibro(env);

    assert.strictEqual(env.sandbox.window.libreria.libros.length, cantidadInicial, 'no se agrega ningún libro');
    assert.strictEqual(doc.getElementById('libro-titulo').value, 'Mi libro', 'se conserva el título ingresado');
    assert.strictEqual(doc.getElementById('libro-isbn').value, '9789500428132', 'se conserva el ISBN ingresado');
});

test('3.5c - TRIANGULATE: varios errores se listan juntos y marcan todos los campos', function () {
    var env = cargarLibros();
    var doc = env.sandbox.document;

    completarFormulario(env, libroValido({ titulo: '', isbn: '', precio: '0', editorialId: '', autoresIds: [] }));
    enviarLibro(env);

    var error = doc.getElementById('libros-error');
    assert.strictEqual(error.hidden, false);
    assert.ok(/título/i.test(error.textContent) && /ISBN/i.test(error.textContent) &&
        /precio/i.test(error.textContent) && /editorial/i.test(error.textContent) &&
        /autor/i.test(error.textContent), 'el resumen incluye todos los errores');
    ['libro-titulo', 'libro-isbn', 'libro-precio', 'libro-editorial', 'libro-autores'].forEach(function (id) {
        assert.strictEqual(doc.getElementById(id).getAttribute('aria-invalid'), 'true', id + ' marcado');
    });
});

test('3.6 - alta válida agrega exactamente un libro con id nuevo y datos normalizados', function () {
    var env = cargarLibros();
    var window = env.sandbox.window;
    var li = window.libreria;
    var cantidadInicial = li.libros.length;
    var maxId = Math.max.apply(null, li.libros.map(function (l) { return l.id; }));

    completarFormulario(env, libroValido({
        titulo: '  Nuevo libro  ',
        isbn: ' 123-456 ',
        precio: '1500.50',
        editorialId: '1',
        generoId: '',
        autoresIds: ['1', '2']
    }));
    enviarLibro(env);

    assert.strictEqual(li.libros.length, cantidadInicial + 1, 'se agrega exactamente un libro');
    var nuevo = li.libros[li.libros.length - 1];
    assert.strictEqual(nuevo.id, maxId + 1, 'id nuevo max+1');
    assert.strictEqual(nuevo.titulo, 'Nuevo libro', 'título con trim');
    assert.strictEqual(nuevo.isbn, '123-456', 'ISBN con trim conservando guiones');
    assert.strictEqual(nuevo.precio, 1500.5, 'precio numérico');
    assert.strictEqual(nuevo.editorialId, 1, 'editorial como id entero');
    assert.strictEqual(nuevo.generoId, null, 'género vacío se guarda como null');
    assert.strictEqual(nuevo.autoresIds.length, 2, 'conserva todos los autores seleccionados');
    assert.strictEqual(nuevo.autoresIds[0], 1);
    assert.strictEqual(nuevo.autoresIds[1], 2);
});

test('3.6b - TRIANGULATE: alta sin género y con género existente guarda null o el id', function () {
    var env = cargarLibros();
    var l = env.sandbox.window.libreria;

    completarFormulario(env, libroValido({ generoId: '1', isbn: 'AAA-111' }));
    enviarLibro(env);
    var conGenero = l.libros[l.libros.length - 1];
    assert.strictEqual(conGenero.generoId, 1);

    completarFormulario(env, libroValido({ generoId: '', isbn: 'BBB-222' }));
    enviarLibro(env);
    var sinGenero = l.libros[l.libros.length - 1];
    assert.strictEqual(sinGenero.generoId, null);
});


// --- 3.5 / 3.6: refresco sin recarga tras el alta ---

test('3.6c - título con caracteres HTML se inserta como texto literal en listado y catálogo', function () {
    var env = cargarLibros({ conCatalogo: true });
    var doc = env.sandbox.document;
    var titulo = '<i>Rayuela</i> & compañía';

    completarFormulario(env, libroValido({ titulo: titulo, isbn: 'HTML-001' }));
    enviarLibro(env);

    var tbody = doc.getElementById('tabla-libros');
    var ultimaFila = tbody.children[tbody.children.length - 1];
    assert.strictEqual(ultimaFila.children[0].textContent, titulo, 'listado literal');
    assert.strictEqual(ultimaFila.innerHTML, '');

    var contenedor = doc.getElementById('contenedor-catalogo');
    var tarjeta = contenedor.children[contenedor.children.length - 1];
    assert.ok(tarjeta.textContent.indexOf(titulo) !== -1, 'catálogo literal');
    assert.strictEqual(tarjeta.innerHTML, '', 'sin interpretar HTML');
});

test('3.7 - tras un alta válida se actualizan #tabla-libros, el catálogo y #venta-libro', function () {
    var env = cargarLibros({ conCatalogo: true });
    var window = env.sandbox.window;
    var doc = env.sandbox.document;

    completarFormulario(env, libroValido({ titulo: 'Libro recién creado', isbn: 'REC-001' }));
    enviarLibro(env);

    var tbody = doc.getElementById('tabla-libros');
    var titulosListado = tbody.children.map(function (fila) { return fila.children[0].textContent; });
    assert.ok(titulosListado.indexOf('Libro recién creado') !== -1, 'aparece en el listado');

    var contenedor = doc.getElementById('contenedor-catalogo');
    assert.strictEqual(contenedor.children.length, window.libreria.libros.length, 'el catálogo se re-renderiza completo');
    var titulosCatalogo = contenedor.children.map(function (t) { return t.textContent; });
    assert.ok(titulosCatalogo.join(' ').indexOf('Libro recién creado') !== -1, 'aparece en el catálogo');

    var venta = doc.getElementById('venta-libro');
    var opciones = venta.options.map(function (o) { return o.textContent; });
    assert.ok(opciones.indexOf('Libro recién creado') !== -1, 'aparece en el selector de ventas');
});

test('3.7b - formulario limpio y mensaje de éxito tras un alta válida', function () {
    var env = cargarLibros();
    var doc = env.sandbox.document;

    completarFormulario(env, libroValido());
    enviarLibro(env);

    assert.strictEqual(doc.getElementById('libro-titulo').value, '');
    assert.strictEqual(doc.getElementById('libro-isbn').value, '');
    assert.strictEqual(doc.getElementById('libro-precio').value, '');
    assert.strictEqual(doc.getElementById('libro-editorial').value, '');
    assert.strictEqual(doc.getElementById('libro-genero').value, '');
    assert.strictEqual(doc.getElementById('libro-autores').selectedOptions.length, 0);
    assert.strictEqual(doc.getElementById('libros-exito').hidden, false, 'mensaje de éxito visible');
    assert.strictEqual(doc.getElementById('libros-error').hidden, true, 'error oculto');
    assert.strictEqual(doc.getElementById('libro-titulo').getAttribute('aria-invalid'), undefined);
});

test('3.7c - TRIANGULATE: el alta válida no recarga la página (preventDefault) y un error posterior limpia el éxito', function () {
    var env = cargarLibros();
    var doc = env.sandbox.document;

    completarFormulario(env, libroValido());
    assert.strictEqual(enviarLibro(env), true);
    assert.strictEqual(doc.getElementById('libros-exito').hidden, false);

    completarFormulario(env, libroValido({ titulo: '' }));
    enviarLibro(env);
    assert.strictEqual(doc.getElementById('libros-exito').hidden, true, 'el éxito se oculta al volver a fallar');
    assert.strictEqual(doc.getElementById('libros-error').hidden, false);
});

// --- 5.1 / 5.2: integración clásica en index.html ---

test('5.1 - index.html carga storage.js, datos.js, libros.js y clientes.js con defer en el orden correcto', function () {
    var html = fs.readFileSync('index.html', 'utf8');
    var storage = html.indexOf('src="js/storage.js"');
    var datos = html.indexOf('src="js/datos.js"');
    var catalogo = html.indexOf('src="js/catalogo.js"');
    var libros = html.indexOf('src="js/libros.js"');
    var clientes = html.indexOf('src="js/clientes.js"');

    assert.ok(storage >= 0 && datos >= 0 && catalogo >= 0, 'storage, datos y catálogo deben estar referenciados');
    assert.ok(libros >= 0, 'index.html debe cargar js/libros.js');
    assert.ok(clientes >= 0, 'index.html debe cargar js/clientes.js');
    assert.ok(storage < datos && datos < catalogo && catalogo < libros && libros < clientes, 'orden storage → datos → catálogo → libros → clientes');

    assert.ok(/<script src="js\/storage\.js" defer><\/script>/.test(html), 'storage.js con defer');
    assert.ok(/<script src="js\/libros\.js" defer><\/script>/.test(html), 'libros.js con defer');
    assert.ok(/<script src="js\/clientes\.js" defer><\/script>/.test(html), 'clientes.js con defer');
});

test('5.1b - scripts de libros y clientes no usan type=module', function () {
    var html = fs.readFileSync('index.html', 'utf8');
    var etiquetas = html.match(/<script[^>]*js\/(libros|clientes)\.js[^>]*>/g) || [];

    assert.strictEqual(etiquetas.length, 2, 'deben existir las dos etiquetas de script');
    etiquetas.forEach(function (etiqueta) {
        assert.ok(!/type\s*=\s*["']module["']/.test(etiqueta), 'sin type="module" en ' + etiqueta);
    });
});

test('5.1c - TRIANGULATE: nodos de error con role=alert y aria-live=polite', function () {
    var html = fs.readFileSync('index.html', 'utf8');

    ['libros-error', 'clientes-error'].forEach(function (id) {
        var patron = new RegExp('<p[^>]*id="' + id + '"[^>]*>');
        var etiqueta = html.match(patron);
        assert.ok(etiqueta, 'debe existir #' + id);
        assert.ok(/role="alert"/.test(etiqueta[0]), '# ' + id + ' con role=alert');
        assert.ok(/aria-live="polite"/.test(etiqueta[0]), '# ' + id + ' con aria-live=polite');
    });
});

// --- 4.1: persistencia tras alta de libro (Change C-06) ---

test('4.1 - libros.js guarda en storage tras alta de libro', function () {
    var env = shim.crearSandbox();
    shim.cargarScript(env.context, 'js/datos.js');
    shim.cargarScript(env.context, 'js/storage.js');
    shim.cargarScript(env.context, 'js/libros.js');
    var storage = env.sandbox.window.storage;
    var libreria = env.sandbox.window.libreria;
    var cantidadInicial = libreria.libros.length;

    completarFormulario(env, libroValido({ titulo: 'Libro Persistido', isbn: 'PERSIST-1' }));
    enviarLibro(env);

    var guardados = storage.loadFromStorage(storage.CLAVE_LIBROS);
    assert.strictEqual(guardados.length, cantidadInicial + 1, 'el libro se guardó en storage');
    assert.strictEqual(guardados[guardados.length - 1].titulo, 'Libro Persistido');
    assert.strictEqual(guardados[guardados.length - 1].isbn, 'PERSIST-1');
});
